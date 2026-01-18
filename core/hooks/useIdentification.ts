import { useState, useCallback, useRef, useEffect } from 'react';
import { SongInfo, Language, Region } from '../types';
import { identifySongFromAudio } from '../services/geminiService';

interface UseIdentificationProps {
  language: Language;
  region: Region;
  provider: 'GEMINI' | 'MOCK' | 'OPENAI' | 'CLAUDE' | 'GROK' | 'DEEPSEEK' | 'QWEN';
  showLyrics: boolean;
}

export const useIdentification = ({ language, region, provider, showLyrics }: UseIdentificationProps) => {
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongInfo | null>(null);
  
  const isMounted = useRef(true);
  const latestRequestId = useRef(0);
  const recorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => { 
      isMounted.current = false; 
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop();
      }
    };
  }, []);

  /**
   * 核心修复：根据浏览器支持情况动态获取最佳音频 MIME 类型。
   * 特别是针对 iOS Safari 需要回退到 audio/mp4。
   */
  const getSupportedMimeType = useCallback(() => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4', // Fallback for iOS Safari
      'audio/aac'  // Another common fallback
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    console.warn("[AI] No supported MediaRecorder MIME type found.");
    return '';
  }, []);

  const performIdentification = useCallback(async (stream: MediaStream) => {
    if (!showLyrics || isIdentifying || !stream.active) return;
    
    const requestId = ++latestRequestId.current;
    const mimeType = getSupportedMimeType();
    
    if (!mimeType) {
      console.error("[AI] 没有找到受支持的录音格式。");
      return;
    }

    setIsIdentifying(true);
    
    try {
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        if (!isMounted.current || requestId !== latestRequestId.current || chunks.length === 0) {
          setIsIdentifying(false);
          return;
        }

        try {
          const blob = new Blob(chunks, { type: mimeType });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            if (!isMounted.current || requestId !== latestRequestId.current) return;
            
            const resultStr = reader.result as string;
            const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : '';
            if (!base64Data) {
               setIsIdentifying(false);
               return;
            }

            const info = await identifySongFromAudio(base64Data, mimeType, language, region, provider);
            
            if (isMounted.current && requestId === latestRequestId.current) {
              if (info && info.identified) {
                setCurrentSong(info);
              }
              setIsIdentifying(false);
            }
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          console.error("[AI] 处理错误:", e);
          setIsIdentifying(false);
        }
      };

      recorder.start();
      
      // 录制 6 秒以获取足够的采样
      setTimeout(() => {
        if (recorderRef.current && recorderRef.current.state === 'recording') {
          recorderRef.current.stop();
        }
      }, 6000); 

    } catch (e) {
      console.error("[AI] 录制错误:", e);
      setIsIdentifying(false);
    }
  }, [showLyrics, isIdentifying, language, region, provider, getSupportedMimeType]);

  return { isIdentifying, currentSong, setCurrentSong, performIdentification };
};
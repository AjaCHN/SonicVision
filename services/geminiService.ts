
import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

/**
 * 歌曲识别服务
 * 使用 Gemini 3 Flash 进行多模态音频分析
 */
export const identifySongFromAudio = async (
  base64Audio: string, 
  mimeType: string, 
  language: Language = 'en', 
  region: Region = 'global'
): Promise<SongInfo | null> => {
  
  // 1. 生成指纹并尝试本地匹配 (极速回显)
  let features: number[] = [];
  try {
    features = await generateFingerprint(base64Audio);
    const localMatch = findLocalMatch(features);
    if (localMatch) return localMatch;
  } catch (e) {
    console.warn("[Recognition] Fingerprint failed, using AI.", e);
  }

  // 2. 调用 Gemini API
  const callGemini = async (retryCount = 0): Promise<SongInfo | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const langContext = language === 'zh' 
          ? '中文输出 mood。中文歌必须使用汉字。' 
          : 'Output mood in English.';

        const systemInstruction = `You are a Music Expert.
        Listen to audio (vocals/melody/beat). 
        Identify EXACT Title and Artist. 
        Detect Mood.
        Provide 4 lines of lyrics.
        If no music/low quality, set identified: false.`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: {
            parts: [
              { inlineData: { mimeType, data: base64Audio } },
              { text: `Song info? ${langContext} Region: ${REGION_NAMES[region] || region}` }
            ]
          },
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            // 启用思考模式以提升对嘈杂环境的识别力，设置 1024 token 的思考预算
            thinkingConfig: { thinkingBudget: 1024 },
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                lyricsSnippet: { type: Type.STRING },
                mood: { type: Type.STRING },
                identified: { type: Type.BOOLEAN }
              },
              required: ["title", "artist", "identified"]
            }
          }
        });

        if (!response.text) return null;
        const songInfo: SongInfo = JSON.parse(response.text.trim());
        songInfo.matchSource = 'AI';
        return songInfo;

    } catch (error) {
        if (retryCount < 1) return callGemini(retryCount + 1);
        return null;
    }
  };

  const aiResult = await callGemini();

  if (aiResult && aiResult.identified && features.length > 0) {
      saveToLocalCache(features, aiResult);
  }

  return aiResult;
};

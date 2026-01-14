
import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioDevice, VisualizerSettings, Language } from '../types';
import { TRANSLATIONS } from '../i18n';

interface UseAudioProps {
  settings: VisualizerSettings;
  language: Language;
}

export const useAudio = ({ settings, language }: UseAudioProps) => {
  const [isListening, setIsListening] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (analyser) {
      analyser.smoothingTimeConstant = settings.smoothing;
      if (analyser.fftSize !== settings.fftSize) analyser.fftSize = settings.fftSize;
    }
  }, [settings.smoothing, settings.fftSize, analyser]);

  const updateAudioDevices = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter(d => d.kind === 'audioinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Mic ${d.deviceId.slice(0, 5)}` })));
    } catch (e) {
        console.warn("Could not enumerate audio devices", e);
    }
  }, []);

  const startMicrophone = useCallback(async (deviceId?: string) => {
    setErrorMessage(null);
    try {
      const oldContext = audioContextRef.current;
      if (oldContext && oldContext.state !== 'closed') await oldContext.close();

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
            deviceId: deviceId ? { exact: deviceId } : undefined, 
            echoCancellation: false, 
            noiseSuppression: false, 
            autoGainControl: false 
        } 
      });
      
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Ensure the context is running (fixes auto-play policy issues)
      if (context.state === 'suspended') {
        await context.resume();
      }

      const node = context.createAnalyser();
      node.fftSize = settings.fftSize;
      node.smoothingTimeConstant = settings.smoothing;
      context.createMediaStreamSource(stream).connect(node);

      audioContextRef.current = context;
      setAudioContext(context);
      setAnalyser(node);
      setMediaStream(stream);
      setIsListening(true);
      updateAudioDevices();
    } catch (err: any) {
      const t = TRANSLATIONS[language];
      setErrorMessage(err.name === 'NotAllowedError' ? t.errors.accessDenied : t.errors.general);
      setIsListening(false);
      console.error("[Audio] Access Error:", err);
    }
  }, [settings.fftSize, settings.smoothing, updateAudioDevices, language]);

  const toggleMicrophone = (deviceId: string) => {
    if (isListening) {
      mediaStream?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close();
      setIsListening(false);
    } else {
      startMicrophone(deviceId);
    }
  };

  return { isListening, audioContext, analyser, mediaStream, audioDevices, errorMessage, setErrorMessage, startMicrophone, toggleMicrophone };
};

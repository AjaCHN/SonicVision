
import React, { useState, useEffect, useCallback, useRef } from 'react';
import VisualizerCanvas from './visualizers/VisualizerCanvas';
import ThreeVisualizer from './visualizers/ThreeVisualizer';
import Controls from './controls/Controls';
import SongOverlay from './ui/SongOverlay';
import CustomTextOverlay from './ui/CustomTextOverlay';
import LyricsOverlay from './ui/LyricsOverlay';
import { OnboardingOverlay } from './ui/OnboardingOverlay'; 
import { VisualizerMode, SongInfo, LyricsStyle, Language, VisualizerSettings, Region } from '../core/types';
import { COLOR_THEMES } from '../core/constants';
import { identifySongFromAudio } from '../core/services/geminiService';
import { TRANSLATIONS } from '../core/i18n';
import { useAudio } from '../core/hooks/useAudio';

const STORAGE_PREFIX = 'av_v1_'; 
const ONBOARDING_KEY = 'av_v1_has_onboarded'; 
const DEFAULT_MODE = VisualizerMode.PLASMA; 
const DEFAULT_THEME_INDEX = 1; 
const DEFAULT_SETTINGS: VisualizerSettings = {
  sensitivity: 1.5,
  speed: 1.0,
  glow: true,
  trails: true,
  autoRotate: false,
  rotateInterval: 30,
  cycleColors: false,
  colorInterval: 45,
  hideCursor: false,
  smoothing: 0.8,
  fftSize: 512, 
  quality: 'high',
  monitor: false,
  wakeLock: true,
  customText: 'AURA',
  showCustomText: false,
  textPulse: true,
  customTextRotation: 0,
  customTextSize: 12,
  customTextFont: 'Inter, sans-serif',
  customTextOpacity: 0.35,
  customTextColor: '#ffffff', 
  lyricsPosition: 'center',
  recognitionProvider: 'GEMINI'
};
const DEFAULT_LYRICS_STYLE = LyricsStyle.KARAOKE; 
const DEFAULT_SHOW_LYRICS = false;
const DEFAULT_LANGUAGE: Language = 'en'; 

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(ONBOARDING_KEY);
  });
  
  const wakeLockRef = useRef<any>(null);

  const getStorage = useCallback(<T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    const fullKey = STORAGE_PREFIX + key;
    const saved = localStorage.getItem(fullKey);
    if (saved !== null && saved !== 'undefined') {
      try {
        return JSON.parse(saved) as T;
      } catch (e) {
        console.warn(`Storage load failed for ${fullKey}:`, e);
        return fallback;
      }
    }
    return fallback;
  }, []);

  const detectDefaultRegion = (): Region => {
    const lang = navigator.language.toLowerCase();
    if (lang.includes('zh')) return 'CN';
    if (lang.includes('ja')) return 'JP';
    if (lang.includes('ko')) return 'KR';
    return 'global';
  };

  const [mode, setMode] = useState<VisualizerMode>(() => getStorage('mode', DEFAULT_MODE));
  const [colorTheme, setColorTheme] = useState<string[]>(() => getStorage('theme', COLOR_THEMES[DEFAULT_THEME_INDEX]));
  
  const [settings, setSettings] = useState<VisualizerSettings>(() => {
    const saved = getStorage('settings', DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...saved, showCustomText: saved?.showCustomText ?? false };
  });

  const [lyricsStyle, setLyricsStyle] = useState<LyricsStyle>(() => getStorage('lyricsStyle', DEFAULT_LYRICS_STYLE));
  const [showLyrics, setShowLyrics] = useState<boolean>(() => getStorage('showLyrics', DEFAULT_SHOW_LYRICS));
  const [language, setLanguage] = useState<Language>(() => {
      const saved = getStorage<Language>('language', DEFAULT_LANGUAGE);
      return TRANSLATIONS[saved] ? saved : DEFAULT_LANGUAGE;
  });
  const [region, setRegion] = useState<Region>(() => getStorage('region', detectDefaultRegion()));
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(() => getStorage('deviceId', ''));

  const { 
    isListening, 
    analyser, 
    mediaStream, 
    audioDevices, 
    errorMessage, 
    setErrorMessage,
    startMicrophone, 
    toggleMicrophone 
  } = useAudio({ settings, language });

  const [isIdentifying, setIsIdentifying] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongInfo | null>(null);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && settings.wakeLock && hasStarted) {
      try {
        if (wakeLockRef.current) {
            await wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err: any) {
        console.warn(`[WakeLock] Failed: ${err.message}`);
      }
    }
  }, [settings.wakeLock, hasStarted]);

  useEffect(() => {
    if (settings.wakeLock && hasStarted) {
      requestWakeLock();
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
      });
    }

    const handleVisibilityChange = () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, [settings.wakeLock, hasStarted, requestWakeLock]);

  useEffect(() => {
    const data = { mode, theme: colorTheme, settings, lyricsStyle, showLyrics, language, region, deviceId: selectedDeviceId };
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    });
  }, [mode, colorTheme, settings, lyricsStyle, showLyrics, language, region, selectedDeviceId]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const randomizeSettings = useCallback(() => {
    const randomTheme = COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)];
    setColorTheme(randomTheme);
    const modes = Object.values(VisualizerMode);
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    setMode(randomMode);
    setSettings(prev => ({
      ...prev,
      speed: 0.8 + Math.random() * 0.8,
      sensitivity: 1.2 + Math.random() * 1.0,
      glow: Math.random() > 0.15,
      trails: Math.random() > 0.2,
      smoothing: 0.7 + Math.random() * 0.2
    }));
  }, []);

  const resetAppSettings = useCallback(() => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX) || key === ONBOARDING_KEY) localStorage.removeItem(key);
    });
    window.location.reload(); 
  }, []);

  const resetVisualSettings = useCallback(() => {
    setMode(DEFAULT_MODE);
    setColorTheme(COLOR_THEMES[DEFAULT_THEME_INDEX]);
    setSettings(prev => ({ ...prev, speed: DEFAULT_SETTINGS.speed, sensitivity: DEFAULT_SETTINGS.sensitivity, glow: DEFAULT_SETTINGS.glow, trails: DEFAULT_SETTINGS.trails, autoRotate: DEFAULT_SETTINGS.autoRotate, cycleColors: DEFAULT_SETTINGS.cycleColors, smoothing: DEFAULT_SETTINGS.smoothing, hideCursor: DEFAULT_SETTINGS.hideCursor, quality: DEFAULT_SETTINGS.quality }));
  }, []);

  const performIdentification = useCallback(async (stream: MediaStream) => {
    if (!showLyrics || isIdentifying) return;
    setIsIdentifying(true);
    try {
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          const info = await identifySongFromAudio(base64Data, mimeType, language, region, settings.recognitionProvider);
          if (info && info.identified) setCurrentSong(info);
          setIsIdentifying(false);
        };
      };
      recorder.start();
      setTimeout(() => recorder.state === 'recording' && recorder.stop(), 7000); 
    } catch (e) {
      console.error("Recording error:", e);
      setIsIdentifying(false);
    }
  }, [showLyrics, isIdentifying, language, region, settings.recognitionProvider]);

  useEffect(() => {
    let interval: number;
    if (isListening && mediaStream && showLyrics) {
      performIdentification(mediaStream);
      interval = window.setInterval(() => performIdentification(mediaStream), 45000);
    }
    return () => clearInterval(interval);
  }, [isListening, mediaStream, showLyrics, performIdentification]);

  const isThreeMode = mode === VisualizerMode.SILK || mode === VisualizerMode.LIQUID || mode === VisualizerMode.TERRAIN;
  const t = TRANSLATIONS[language] || TRANSLATIONS[DEFAULT_LANGUAGE];

  if (showOnboarding) return <OnboardingOverlay language={language} setLanguage={setLanguage} onComplete={handleOnboardingComplete} />;

  if (!hasStarted) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-8 animate-fade-in-up">
          <h1 className="text-5xl font-black bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 pb-4 text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t?.welcomeTitle || "Aura Vision"}</h1>
          <p className="text-gray-400 text-sm">{t?.welcomeText || "Translate audio into generative art."}</p>
          <button onClick={() => { setHasStarted(true); startMicrophone(selectedDeviceId); }} className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-all">{t?.startExperience || "Start"}</button>
          {errorMessage && <div className="mt-4 p-3 bg-red-500/20 text-red-200 text-sm rounded-lg border border-red-500/30">{errorMessage}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] bg-black overflow-hidden relative ${settings.hideCursor ? 'cursor-none' : ''}`}>
      {errorMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 text-white px-6 py-4 rounded-xl border border-red-500/50 animate-fade-in-up flex items-center gap-4">
            <div className="flex-1 text-xs">{errorMessage}</div>
            <button onClick={() => setErrorMessage(null)} className="p-2 hover:bg-white/10 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
      )}
      {isThreeMode ? <ThreeVisualizer analyser={analyser} mode={mode} colors={colorTheme} settings={settings} /> : <VisualizerCanvas analyser={analyser} mode={mode} colors={colorTheme} settings={settings} />}
      <CustomTextOverlay settings={settings} analyser={analyser} />
      <LyricsOverlay settings={settings} song={currentSong} showLyrics={showLyrics} lyricsStyle={lyricsStyle} analyser={analyser} />
      <SongOverlay song={currentSong} lyricsStyle={lyricsStyle} showLyrics={showLyrics} language={language} onRetry={() => mediaStream && performIdentification(mediaStream)} onClose={() => setCurrentSong(null)} analyser={analyser} sensitivity={settings.sensitivity} />
      <Controls 
        currentMode={mode} setMode={setMode} colorTheme={colorTheme} setColorTheme={setColorTheme}
        toggleMicrophone={() => toggleMicrophone(selectedDeviceId)} isListening={isListening} isIdentifying={isIdentifying}
        lyricsStyle={lyricsStyle} setLyricsStyle={setLyricsStyle} showLyrics={showLyrics} setShowLyrics={setShowLyrics}
        language={language} setLanguage={setLanguage} region={region} setRegion={setRegion}
        settings={settings} setSettings={setSettings} resetSettings={resetAppSettings}
        resetVisualSettings={resetVisualSettings} resetTextSettings={() => {}} resetAudioSettings={() => {}} resetAiSettings={() => {}} randomizeSettings={randomizeSettings}
        audioDevices={audioDevices} selectedDeviceId={selectedDeviceId} onDeviceChange={setSelectedDeviceId}
      />
    </div>
  );
};

export default App;

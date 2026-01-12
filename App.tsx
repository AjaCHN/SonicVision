import React, { useState, useEffect, useRef } from 'react';
import VisualizerCanvas from './components/VisualizerCanvas';
import ThreeVisualizer from './components/ThreeVisualizer'; // New WebGL Component
import Controls from './components/Controls';
import SongOverlay from './components/SongOverlay';
import { VisualizerMode, SongInfo, LyricsStyle, Language, VisualizerSettings, Region, AudioDevice } from './types';
import { COLOR_THEMES } from './constants';
import { identifySongFromAudio } from './services/geminiService';
import { TRANSLATIONS } from './translations';

// Default Constants
const DEFAULT_MODE = VisualizerMode.PLASMA; 
const DEFAULT_THEME_INDEX = 1; 
const DEFAULT_SETTINGS: VisualizerSettings = {
  sensitivity: 1.5,
  speed: 1.0,
  glow: true,
  trails: true,
  autoRotate: false,
  rotateInterval: 30,
  hideCursor: false
};
const DEFAULT_LYRICS_STYLE = LyricsStyle.KARAOKE; 
const DEFAULT_SHOW_LYRICS = true;
const DEFAULT_LANGUAGE: Language = 'zh';

// Fix: Complete component definition and add default export
const App: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  
  // Audio Input State
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Wake Lock Ref
  const wakeLockRef = useRef<any>(null);

  // Helper for localStorage
  const getStorage = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof fallback === 'object' && fallback !== null) {
            return { ...fallback, ...parsed };
        }
        return parsed;
      } catch (e) {
        return fallback;
      }
    }
    return fallback;
  };

  const detectDefaultRegion = (): Region => {
    const lang = navigator.language.toLowerCase();
    if (lang.includes('zh')) return 'CN';
    if (lang.includes('ja')) return 'JP';
    if (lang.includes('ko')) return 'KR';
    if (lang.includes('es') || lang.includes('pt')) return 'LATAM';
    if (lang.includes('en-us')) return 'US';
    return 'global';
  };

  const [mode, setMode] = useState<VisualizerMode>(() => getStorage('sv_mode_v4', DEFAULT_MODE));
  const [colorTheme, setColorTheme] = useState<string[]>(() => getStorage('sv_theme', COLOR_THEMES[DEFAULT_THEME_INDEX]));
  const [settings, setSettings] = useState<VisualizerSettings>(() => getStorage('sv_settings_v2', DEFAULT_SETTINGS));
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongInfo | null>(null);
  const [lyricsStyle, setLyricsStyle] = useState<LyricsStyle>(() => getStorage('sv_lyrics_style_v3', DEFAULT_LYRICS_STYLE));
  const [showLyrics, setShowLyrics] = useState<boolean>(() => getStorage('sv_show_lyrics', DEFAULT_SHOW_LYRICS));
  const [language, setLanguage] = useState<Language>(() => getStorage('sv_language', DEFAULT_LANGUAGE));
  const [region, setRegion] = useState<Region>(() => getStorage('sv_region', detectDefaultRegion()));

  const languageRef = useRef(language);
  const regionRef = useRef(region);
  const showLyricsRef = useRef(showLyrics);

  useEffect(() => localStorage.setItem('sv_mode_v4', JSON.stringify(mode)), [mode]);
  useEffect(() => localStorage.setItem('sv_theme', JSON.stringify(colorTheme)), [colorTheme]);
  useEffect(() => localStorage.setItem('sv_settings_v2', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('sv_lyrics_style_v3', JSON.stringify(lyricsStyle)), [lyricsStyle]);
  useEffect(() => localStorage.setItem('sv_show_lyrics', JSON.stringify(showLyrics)), [showLyrics]);
  useEffect(() => localStorage.setItem('sv_language', JSON.stringify(language)), [language]);
  useEffect(() => localStorage.setItem('sv_region', JSON.stringify(region)), [region]);

  useEffect(() => {
    languageRef.current = language;
    regionRef.current = region;
    showLyricsRef.current = showLyrics;
  }, [language, region, showLyrics]);

  // Load Audio Devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Need to ask for permission first to get labels
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices
          .filter(d => d.kind === 'audioinput')
          .map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 5)}...` }));
        
        setAudioDevices(inputs);
        // Default to first if none selected, or keep selection if exists
        if (!selectedDeviceId && inputs.length > 0) {
             // Try to find "default" or just take first
             const defaultDevice = inputs.find(d => d.deviceId === 'default') || inputs[0];
             // Fix: Access deviceId property instead of passing object
             setSelectedDeviceId(defaultDevice.deviceId);
        }
      } catch (err) {
        console.error("Failed to detect audio devices:", err);
      }
    };
    getDevices();
  }, [selectedDeviceId]);

  const toggleMicrophone = async () => {
    if (isListening) {
      if (recorder) recorder.stop();
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
      if (audioContext) audioContext.close();
      setAudioContext(null);
      setAnalyser(null);
      setMediaStream(null);
      setRecorder(null);
      setIsListening(false);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true 
        });
        
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const src = context.createMediaStreamSource(stream);
        const node = context.createAnalyser();
        node.fftSize = 2048;
        src.connect(node);
        
        setAudioContext(context);
        setAnalyser(node);
        setMediaStream(stream);
        setIsListening(true);

        if ('wakeLock' in navigator) {
          try {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          } catch (e) {
            console.warn('Wake lock failed');
          }
        }
      } catch (err) {
        console.error('Mic access denied', err);
      }
    }
  };

  // Identification loop
  useEffect(() => {
    let interval: number;
    if (isListening && mediaStream) {
      // Periodic identification every 30 seconds
      interval = window.setInterval(async () => {
        if (isIdentifying) return;
        
        setIsIdentifying(true);
        const audioRecorder = new MediaRecorder(mediaStream);
        const chunks: Blob[] = [];
        
        audioRecorder.ondataavailable = (e) => chunks.push(e.data);
        audioRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            try {
              const info = await identifySongFromAudio(base64Data, 'audio/webm', languageRef.current, regionRef.current);
              if (info) setCurrentSong(info);
            } catch (e) {
              console.error('Identification failed', e);
            } finally {
              setIsIdentifying(false);
            }
          };
        };
        
        audioRecorder.start();
        // Record for 5 seconds
        setTimeout(() => {
          if (audioRecorder.state === 'recording') audioRecorder.stop();
        }, 5000);
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [isListening, mediaStream, isIdentifying]);

  const isThreeMode = mode === VisualizerMode.SILK || mode === VisualizerMode.LIQUID || mode === VisualizerMode.TERRAIN;

  return (
    <div className="min-h-screen bg-black overflow-hidden relative font-sans text-white select-none">
      {isThreeMode ? (
        <ThreeVisualizer analyser={analyser} mode={mode} colors={colorTheme} settings={settings} />
      ) : (
        <VisualizerCanvas 
          analyser={analyser} 
          mode={mode} 
          colors={colorTheme} 
          settings={settings} 
          song={currentSong} 
          showLyrics={showLyrics}
          lyricsStyle={lyricsStyle}
        />
      )}

      <SongOverlay 
        song={currentSong} 
        lyricsStyle={lyricsStyle} 
        showLyrics={showLyrics} 
        language={language}
        onRetry={() => setCurrentSong(null)}
        onClose={() => setCurrentSong(null)}
        analyser={analyser}
        sensitivity={settings.sensitivity}
      />

      <Controls 
        currentMode={mode}
        setMode={setMode}
        colorTheme={colorTheme}
        setColorTheme={setColorTheme}
        toggleMicrophone={toggleMicrophone}
        isListening={isListening}
        isIdentifying={isIdentifying}
        lyricsStyle={lyricsStyle}
        setLyricsStyle={setLyricsStyle}
        showLyrics={showLyrics}
        setShowLyrics={setShowLyrics}
        language={language}
        setLanguage={setLanguage}
        region={region}
        setRegion={setRegion}
        settings={settings}
        setSettings={setSettings}
        resetSettings={() => setSettings(DEFAULT_SETTINGS)}
        randomizeSettings={() => {
            const modes = Object.values(VisualizerMode);
            setMode(modes[Math.floor(Math.random() * modes.length)]);
            setColorTheme(COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)]);
            setSettings({
                ...settings,
                sensitivity: 1.0 + Math.random() * 1.5,
                speed: 0.5 + Math.random() * 1.0,
                glow: Math.random() > 0.3,
                trails: Math.random() > 0.2
            });
        }}
        audioDevices={audioDevices}
        selectedDeviceId={selectedDeviceId}
        onDeviceChange={setSelectedDeviceId}
      />
    </div>
  );
};

export default App;
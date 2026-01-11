import React, { useState, useEffect, useRef } from 'react';
import VisualizerCanvas from './components/VisualizerCanvas';
import Controls from './components/Controls';
import SongOverlay from './components/SongOverlay';
import { VisualizerMode, SongInfo, LyricsStyle, Language, VisualizerSettings, Region } from './types';
import { COLOR_THEMES } from './constants';
import { identifySongFromAudio } from './services/geminiService';
import { TRANSLATIONS } from './translations';

// Default Constants
const DEFAULT_MODE = VisualizerMode.BARS;
const DEFAULT_THEME_INDEX = 1; // Cyberpunk
const DEFAULT_SETTINGS: VisualizerSettings = {
  sensitivity: 1.5,
  speed: 1.0,
  glow: true,
  trails: true
};
const DEFAULT_LYRICS_STYLE = LyricsStyle.STANDARD;
const DEFAULT_SHOW_LYRICS = true;
const DEFAULT_LANGUAGE: Language = 'zh';

const App: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  
  // Helper for localStorage
  const getStorage = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return fallback;
      }
    }
    return fallback;
  };

  // Helper to detect default region based on browser language
  const detectDefaultRegion = (): Region => {
    const lang = navigator.language.toLowerCase();
    if (lang.includes('zh')) return 'CN';
    if (lang.includes('ja')) return 'JP';
    if (lang.includes('ko')) return 'KR';
    if (lang.includes('es') || lang.includes('pt')) return 'LATAM'; // Rough approximation
    if (lang.includes('en-us')) return 'US';
    return 'global';
  };

  // Visualizer State with Persistence
  const [mode, setMode] = useState<VisualizerMode>(() => getStorage('sv_mode', DEFAULT_MODE));
  const [colorTheme, setColorTheme] = useState<string[]>(() => getStorage('sv_theme', COLOR_THEMES[DEFAULT_THEME_INDEX]));
  const [settings, setSettings] = useState<VisualizerSettings>(() => getStorage('sv_settings', DEFAULT_SETTINGS));
  
  // Song/AI State with Persistence where appropriate
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongInfo | null>(null);
  const [lyricsStyle, setLyricsStyle] = useState<LyricsStyle>(() => getStorage('sv_lyrics_style', DEFAULT_LYRICS_STYLE));
  const [showLyrics, setShowLyrics] = useState<boolean>(() => getStorage('sv_show_lyrics', DEFAULT_SHOW_LYRICS));
  
  // Language & Region State with Persistence
  const [language, setLanguage] = useState<Language>(() => getStorage('sv_language', DEFAULT_LANGUAGE));
  const [region, setRegion] = useState<Region>(() => getStorage('sv_region', detectDefaultRegion()));

  const languageRef = useRef(language);
  const regionRef = useRef(region);

  // Persistence Effects
  useEffect(() => localStorage.setItem('sv_mode', JSON.stringify(mode)), [mode]);
  useEffect(() => localStorage.setItem('sv_theme', JSON.stringify(colorTheme)), [colorTheme]);
  useEffect(() => localStorage.setItem('sv_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('sv_lyrics_style', JSON.stringify(lyricsStyle)), [lyricsStyle]);
  useEffect(() => localStorage.setItem('sv_show_lyrics', JSON.stringify(showLyrics)), [showLyrics]);
  useEffect(() => localStorage.setItem('sv_language', JSON.stringify(language)), [language]);
  useEffect(() => localStorage.setItem('sv_region', JSON.stringify(region)), [region]);

  // Update ref when language/region changes to ensure async loops access current value
  useEffect(() => {
    languageRef.current = language;
    regionRef.current = region;
  }, [language, region]);

  const identificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Audio Logic
  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Ensure context is running
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const src = ctx.createMediaStreamSource(stream);
      const ana = ctx.createAnalyser();
      
      ana.fftSize = 2048;
      src.connect(ana);
      
      setAudioContext(ctx);
      setAnalyser(ana);
      setMediaStream(stream);
      setIsListening(true);
      
      // Initialize MediaRecorder for identifying songs
      setupRecorder(stream);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopAudio = () => {
    if (audioContext) audioContext.close();
    if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    if (identificationTimeoutRef.current) clearTimeout(identificationTimeoutRef.current);
    
    setAudioContext(null);
    setAnalyser(null);
    setMediaStream(null);
    setRecorder(null);
    setIsListening(false);
    setIsIdentifying(false);
  };

  const setupRecorder = (stream: MediaStream) => {
    // We need a separate MediaRecorder to capture chunks for Gemini
    const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
      ? { mimeType: 'audio/webm;codecs=opus' } 
      : undefined;
      
    const rec = new MediaRecorder(stream, options);
    setRecorder(rec);

    // Start identification loop with initial delay
    scheduleIdentificationLoop(rec, 2000);
  };

  const scheduleIdentificationLoop = (rec: MediaRecorder, delay: number, isRetry: boolean = false) => {
    if (identificationTimeoutRef.current) clearTimeout(identificationTimeoutRef.current);

    identificationTimeoutRef.current = setTimeout(async () => {
      if (rec.state === 'inactive') return;

      // Smart Duration: 6s for normal check, 12s for retry (Increased for better accuracy)
      const duration = isRetry ? 12000 : 6000;
      
      try {
        const result = await recordAndIdentify(rec, duration);

        if (result && result.identified) {
           setCurrentSong(result);
           // Success! Wait longer (25s) before next check to enjoy the lyrics
           scheduleIdentificationLoop(rec, 25000, false);
        } else {
           if (!isRetry) {
             // Failed? Immediately retry with a longer clip (1s delay)
             scheduleIdentificationLoop(rec, 1000, true);
           } else {
             // Retry failed? Wait standard interval (15s) and reset to normal mode
             scheduleIdentificationLoop(rec, 15000, false);
           }
        }
      } catch (e) {
        console.error("Identification loop error:", e);
        // On error, wait standard interval
        scheduleIdentificationLoop(rec, 15000, false);
      }
    }, delay);
  };

  const recordAndIdentify = (rec: MediaRecorder, duration: number): Promise<SongInfo | null> => {
    return new Promise((resolve) => {
      if (rec.state !== 'inactive') {
         // Should not happen with proper scheduling, but safe guard
         resolve(null);
         return;
      }

      setIsIdentifying(true);
      const chunks: BlobPart[] = [];
      const mimeType = rec.mimeType; // Capture the actual mimeType used by browser (e.g. mp4 in Safari)

      const onDataAvailable = (e: BlobEvent) => {
         if (e.data.size > 0) chunks.push(e.data);
      };

      const onStop = async () => {
         rec.removeEventListener('dataavailable', onDataAvailable);
         rec.removeEventListener('stop', onStop);
         
         try {
           const blob = new Blob(chunks, { type: mimeType });
           const reader = new FileReader();
           reader.onloadend = async () => {
              const base64 = (reader.result as string).split(',')[1];
              // Use refs to get current values
              const result = await identifySongFromAudio(
                base64, 
                mimeType,
                languageRef.current,
                regionRef.current
              );
              setIsIdentifying(false);
              resolve(result);
           };
           reader.readAsDataURL(blob);
         } catch (err) {
           setIsIdentifying(false);
           resolve(null);
         }
      };

      rec.addEventListener('dataavailable', onDataAvailable);
      rec.addEventListener('stop', onStop);

      rec.start();
      setTimeout(() => {
          if (rec.state === 'recording') rec.stop();
      }, duration);
    });
  };

  const toggleMicrophone = () => {
    if (isListening) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const resetSettings = () => {
    setMode(DEFAULT_MODE);
    setColorTheme(COLOR_THEMES[DEFAULT_THEME_INDEX]);
    setSettings(DEFAULT_SETTINGS);
    setLyricsStyle(DEFAULT_LYRICS_STYLE);
    setShowLyrics(DEFAULT_SHOW_LYRICS);
    setLanguage(DEFAULT_LANGUAGE);
    setRegion(detectDefaultRegion());
  };

  const randomizeSettings = () => {
    // 1. Random Mode
    const modes = Object.values(VisualizerMode);
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    
    // 2. Random Theme
    const randomTheme = COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)];
    
    // 3. Random Lyrics Style
    const styles = Object.values(LyricsStyle);
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];

    // 4. Random Settings
    const newSettings: VisualizerSettings = {
       // Bias slightly towards standard sensitivity (1.0 - 2.5)
       sensitivity: parseFloat((Math.random() * 1.5 + 1.0).toFixed(1)), 
       // Speed 0.5 - 1.5
       speed: parseFloat((Math.random() * 1.0 + 0.5).toFixed(1)),
       glow: Math.random() > 0.4, // 60% chance of glow
       trails: Math.random() > 0.3 // 70% chance of trails
    };

    setMode(randomMode);
    setColorTheme(randomTheme);
    setLyricsStyle(randomStyle);
    setSettings(newSettings);
    setShowLyrics(true); // Always ensure lyrics are on for the surprise factor
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const t = TRANSLATIONS[language];

  return (
    <div className="relative w-screen h-screen overflow-hidden text-white select-none">
      
      {/* Background Visualizer */}
      <VisualizerCanvas 
        analyser={analyser} 
        mode={mode} 
        colors={colorTheme}
        settings={settings}
      />

      {/* Main Overlay Content */}
      <SongOverlay 
        song={currentSong} 
        lyricsStyle={lyricsStyle} 
        showLyrics={showLyrics}
      />

      {/* Start Prompt if not listening */}
      {!isListening && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
           <div className="text-center p-8 border border-white/10 rounded-2xl bg-black/40 shadow-2xl max-w-md mx-4">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
                {t.welcomeTitle}
              </h1>
              <p className="text-gray-300 mb-8 leading-relaxed">
                {t.welcomeText}
              </p>
              <button 
                onClick={startAudio}
                className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              >
                {t.startExperience}
              </button>
           </div>
        </div>
      )}

      {/* UI Controls */}
      <Controls
        currentMode={mode}
        setMode={setMode}
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
        resetSettings={resetSettings}
        randomizeSettings={randomizeSettings}
      />
    </div>
  );
};

export default App;
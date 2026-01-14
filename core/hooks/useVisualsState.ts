import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { VisualizerMode, VisualizerSettings } from '../types';
import { COLOR_THEMES } from '../constants';

const DEFAULT_MODE = VisualizerMode.PLASMA;
const DEFAULT_THEME_INDEX = 1;

export const useVisualsState = (hasStarted: boolean, initialSettings: VisualizerSettings) => {
  const { getStorage, setStorage } = useLocalStorage();

  const [mode, setMode] = useState<VisualizerMode>(() => getStorage('mode', DEFAULT_MODE));
  const [colorTheme, setColorTheme] = useState<string[]>(() => getStorage('theme', COLOR_THEMES[DEFAULT_THEME_INDEX]));
  const [settings, setSettings] = useState<VisualizerSettings>(initialSettings);
  
  const rotateIntervalRef = useRef<number | null>(null);
  const colorIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (settings.autoRotate && hasStarted) {
      rotateIntervalRef.current = window.setInterval(() => {
        setMode(currentMode => {
          const modes = Object.values(VisualizerMode);
          const currentIndex = modes.indexOf(currentMode);
          const nextIndex = (currentIndex + 1) % modes.length;
          return modes[nextIndex];
        });
      }, settings.rotateInterval * 1000);
    } else if (rotateIntervalRef.current) {
      clearInterval(rotateIntervalRef.current);
      rotateIntervalRef.current = null;
    }
    return () => { if (rotateIntervalRef.current) clearInterval(rotateIntervalRef.current); };
  }, [settings.autoRotate, settings.rotateInterval, hasStarted]);

  useEffect(() => {
    if (settings.cycleColors && hasStarted) {
      colorIntervalRef.current = window.setInterval(() => {
        const randomIndex = Math.floor(Math.random() * COLOR_THEMES.length);
        setColorTheme(COLOR_THEMES[randomIndex]);
      }, settings.colorInterval * 1000);
    } else if (colorIntervalRef.current) {
      clearInterval(colorIntervalRef.current);
      colorIntervalRef.current = null;
    }
    return () => { if (colorIntervalRef.current) clearInterval(colorIntervalRef.current); };
  }, [settings.cycleColors, settings.colorInterval, hasStarted]);

  useEffect(() => {
    setStorage('mode', mode);
  }, [mode, setStorage]);

  useEffect(() => {
    setStorage('theme', colorTheme);
  }, [colorTheme, setStorage]);

  const randomizeSettings = useCallback(() => {
    setColorTheme(COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)]);
    const modes = Object.values(VisualizerMode);
    setMode(modes[Math.floor(Math.random() * modes.length)]);
    setSettings(p => ({ ...p, speed: 0.8 + Math.random() * 0.8, sensitivity: 1.2 + Math.random() * 1.0, glow: Math.random() > 0.15, trails: Math.random() > 0.2, smoothing: 0.7 + Math.random() * 0.2 }));
  }, [setSettings]);

  const resetVisualSettings = useCallback(() => {
    setMode(DEFAULT_MODE);
    setColorTheme(COLOR_THEMES[DEFAULT_THEME_INDEX]);
    setSettings(p => ({
      ...p,
      speed: initialSettings.speed,
      sensitivity: initialSettings.sensitivity,
      glow: initialSettings.glow,
      trails: initialSettings.trails,
      autoRotate: initialSettings.autoRotate,
      cycleColors: initialSettings.cycleColors,
      smoothing: initialSettings.smoothing,
      hideCursor: initialSettings.hideCursor,
      quality: initialSettings.quality,
    }));
  }, [setSettings, initialSettings]);

  return {
    mode, setMode,
    colorTheme, setColorTheme,
    settings, setSettings,
    randomizeSettings,
    resetVisualSettings
  };
};

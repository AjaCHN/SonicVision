import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Language, Region } from '../types';
import { TRANSLATIONS } from '../i18n';

const ONBOARDING_KEY = 'av_v1_has_onboarded';
const DEFAULT_LANGUAGE: Language = 'en';

const detectDefaultRegion = (): Region => {
  if (typeof navigator === 'undefined') return 'global';
  const lang = navigator.language.toLowerCase();
  if (lang.includes('zh')) return 'CN';
  if (lang.includes('ja')) return 'JP';
  if (lang.includes('ko')) return 'KR';
  return 'global';
};

export const useAppState = () => {
  const { getStorage, setStorage, clearStorage } = useLocalStorage();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof localStorage === 'undefined') return true;
    return !localStorage.getItem(ONBOARDING_KEY);
  });
  const [isUnsupported, setIsUnsupported] = useState(false);
  const wakeLockRef = useRef<any>(null);

  const [language, setLanguage] = useState<Language>(() => { 
    const saved = getStorage<Language>('language', DEFAULT_LANGUAGE); 
    return TRANSLATIONS[saved] ? saved : DEFAULT_LANGUAGE; 
  });
  
  const [region, setRegion] = useState<Region>(() => getStorage('region', detectDefaultRegion()));
  
  const t = TRANSLATIONS[language] || TRANSLATIONS[DEFAULT_LANGUAGE];

  useEffect(() => {
    if (typeof navigator.mediaDevices?.getUserMedia === 'undefined') {
        setIsUnsupported(true);
    }
  }, []);

  const requestWakeLock = useCallback(async (wakeLockEnabled: boolean) => {
    if ('wakeLock' in navigator && wakeLockEnabled && hasStarted) {
      try {
        if (wakeLockRef.current) await wakeLockRef.current.release();
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err: any) { console.warn(`[WakeLock] Failed: ${err.message}`); }
    }
  }, [hasStarted]);
  
  const manageWakeLock = useCallback((wakeLockEnabled: boolean) => {
    if (wakeLockEnabled && hasStarted) {
      requestWakeLock(true);
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => { wakeLockRef.current = null; });
    }
    const handleVisibilityChange = () => { if (wakeLockRef.current !== null && document.visibilityState === 'visible') requestWakeLock(wakeLockEnabled); };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { 
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, [hasStarted, requestWakeLock]);


  useEffect(() => {
    setStorage('language', language);
  }, [language, setStorage]);

  useEffect(() => {
    setStorage('region', region);
  }, [region, setStorage]);

  const handleOnboardingComplete = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    }
    setShowOnboarding(false);
  };
  
  const resetSettings = useCallback(() => {
    clearStorage();
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(ONBOARDING_KEY);
    }
    window.location.reload();
  }, [clearStorage]);

  return {
    hasStarted, setHasStarted,
    showOnboarding,
    isUnsupported,
    language, setLanguage,
    region, setRegion,
    t,
    manageWakeLock,
    handleOnboardingComplete,
    resetSettings
  };
};

/**
 * File: core/hooks/useAppState.ts
 * Version: 0.7.6
 * Author: Aura Vision Team
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Language, Region } from '../types';
import { TRANSLATIONS } from '../i18n';

const ONBOARDING_KEY = 'has_onboarded';
const DEFAULT_LANGUAGE: Language = 'en';

const detectBrowserLanguage = (): Language => {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  const fullLang = navigator.language.toLowerCase();
  const primaryLang = fullLang.split('-')[0] as Language;
  const supported: Language[] = ['en', 'zh', 'tw', 'ja', 'es', 'ko', 'de', 'fr', 'ar', 'ru'];

  if (fullLang.includes('zh-tw') || fullLang.includes('zh-hk') || fullLang.includes('zh-hant')) {
    return 'tw';
  }
  if (supported.includes(primaryLang)) {
    return primaryLang;
  }
  return DEFAULT_LANGUAGE;
};

const detectDefaultRegion = (lang: Language): Region => {
  switch (lang) {
    case 'zh': case 'tw': return 'CN';
    case 'ja': return 'JP';
    case 'ko': return 'KR';
    case 'es': return 'LATAM';
    case 'de': case 'fr': return 'EU';
    default: return 'global';
  }
};

export const useAppState = () => {
  const { getStorage, setStorage, clearStorage } = useLocalStorage();

  const [hasStarted, setHasStarted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !getStorage(ONBOARDING_KEY, false));
  const [isUnsupported, setIsUnsupported] = useState(false);
  
  const [language, setLanguage] = useState<Language>(() => {
    const saved = getStorage<Language | null>('language', null);
    return saved || detectBrowserLanguage();
  });

  const [region, setRegion] = useState<Region>(() => {
    const saved = getStorage<Region | null>('region', null);
    return saved || detectDefaultRegion(language);
  });

  // 同步 HTML 属性以支持 i18n 和 RTL
  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    setStorage('language', language);
  }, [language, setStorage]);

  useEffect(() => {
    setStorage('region', region);
  }, [region, setStorage]);

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS[DEFAULT_LANGUAGE], [language]);

  const wakeLockRef = useRef<any>(null);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    setStorage(ONBOARDING_KEY, true);
  }, [setStorage]);

  const manageWakeLock = useCallback(async (enabled: boolean) => {
    if (!('wakeLock' in navigator)) return;
    try {
      if (enabled && !wakeLockRef.current) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } else if (!enabled && wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch (err) {
      console.warn("WakeLock Error:", err);
    }
  }, []);

  const resetSettings = useCallback(() => {
    clearStorage();
    window.location.reload();
  }, [clearStorage]);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsUnsupported(true);
    }
  }, []);

  return {
    hasStarted, setHasStarted,
    showOnboarding, setShowOnboarding,
    isUnsupported,
    language, setLanguage,
    region, setRegion,
    t,
    manageWakeLock,
    handleOnboardingComplete,
    resetSettings
  };
};
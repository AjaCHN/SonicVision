import { Language } from './types';
import { en } from './locales/en';
import { zh } from './locales/zh';
import { tw } from './locales/tw';
import { ja } from './locales/ja';
import { es } from './locales/es';
import { ko } from './locales/ko';
import { de } from './locales/de';
import { fr } from './locales/fr';

// Translation dictionary for supported languages
// Aggregated from separate files in ./locales/
export const TRANSLATIONS: Record<Language, any> = {
  en,
  zh,
  tw,
  ja,
  es,
  ko,
  de,
  fr
};

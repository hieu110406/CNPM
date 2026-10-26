import { createContext, useContext } from 'react';
import type vi from '@/I18N/vi';

export type MobileLanguage = 'vi' | 'en' | 'zh';
export type TranslationKey = keyof typeof vi;

export type I18nContextValue = {
  language: MobileLanguage;
  setLanguage: (language: MobileLanguage) => void;
  t: (key: TranslationKey) => string;
};

// Keep context identity independent of provider/dictionary Fast Refresh updates.
export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}

import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import en from '@/I18N/en';
import vi from '@/I18N/vi';
import zh from '@/I18N/zh';

export type MobileLanguage = 'vi' | 'en' | 'zh';
export type TranslationKey = keyof typeof vi;
type Dictionary = Record<TranslationKey, string>;

const dictionaries: Record<MobileLanguage, Dictionary> = {
  vi,
  en,
  zh,
};

type I18nContextValue = {
  language: MobileLanguage;
  setLanguage: (language: MobileLanguage) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<MobileLanguage>('vi');
  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t: key => dictionaries[language][key],
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

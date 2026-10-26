import { useMemo, useState, type PropsWithChildren } from 'react';
import { I18nContext, type I18nContextValue, type MobileLanguage, type TranslationKey } from './i18nState';

import en from '@/I18N/en';
import vi from '@/I18N/vi';
import zh from '@/I18N/zh';

export { useI18n, type MobileLanguage, type TranslationKey } from './i18nState';

type Dictionary = Record<TranslationKey, string>;

const dictionaries: Record<MobileLanguage, Dictionary> = {
  vi,
  en,
  zh,
};

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<MobileLanguage>('vi');
  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t: key => dictionaries[language][key],
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

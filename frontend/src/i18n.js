import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import hr from './locales/hr.json';
import en from './locales/en.json';

const LANGUAGE_KEY = 'ai-catalog-language';
const defaultLanguage = 'hr';

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored === 'hr' || stored === 'en') return stored;
  } catch (_) {}
  return defaultLanguage;
}

i18n.use(initReactI18next).init({
  resources: {
    hr: { translation: hr },
    en: { translation: en },
  },
  lng: getStoredLanguage(),
  fallbackLng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LANGUAGE_KEY, lng);
  } catch (_) {}
});

export default i18n;

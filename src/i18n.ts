import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from '@/locales/es.json';
import en from '@/locales/en.json';

const STORAGE_KEY = 'padel-track-lang';

function getStoredLanguage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getInitialLanguage(): string {
  const stored = getStoredLanguage();
  if (stored === 'es' || stored === 'en') return stored;
  const browser = navigator.language?.toLowerCase();
  if (browser?.startsWith('en')) return 'en';
  return 'es';
}

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // ignore
  }
});

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import es from './locales/es.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import ar from './locales/ar.json';
import af from './locales/af.json';
import ko from './locales/ko.json';
import nl from './locales/nl.json';
import uk from './locales/uk.json';
import sv from './locales/sv.json';
import pl from './locales/pl.json';
import sq from './locales/sq.json';

// ─────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────

export type AppLanguage =
  | 'es' | 'en' | 'fr' | 'pt' | 'de' | 'ja'
  | 'ar' | 'af' | 'ko' | 'nl' | 'uk' | 'sv'
  | 'pl' | 'sq';

export type LanguageItem = {
  code:  AppLanguage;
  label: string;
  flag:  string;
};

// ─────────────────────────────────────────────────────────
// LISTA DE IDIOMAS
// ─────────────────────────────────────────────────────────

export const LANGUAGE_LIST: LanguageItem[] = [
  { code: 'es', label: 'Español',            flag: '🇲🇽' },
  { code: 'en', label: 'English (USA)',       flag: '🇺🇸' },
  { code: 'ar', label: 'العربية',             flag: '🇹🇳' },
  { code: 'ja', label: '日本語',               flag: '🇯🇵' },
  { code: 'af', label: 'Afrikaans',           flag: '🇿🇦' },
  { code: 'ko', label: '한국어',               flag: '🇰🇷' },
  { code: 'nl', label: 'Nederlands',          flag: '🇳🇱' },
  { code: 'uk', label: 'Українська',          flag: '🇺🇦' },
  { code: 'sv', label: 'Svenska',             flag: '🇸🇪' },
  { code: 'pl', label: 'Polski',              flag: '🇵🇱' },
  { code: 'sq', label: 'Shqip (Albania)',     flag: '🇦🇱' },
  { code: 'pt', label: 'Português (Brasil)',  flag: '🇧🇷' },
  { code: 'fr', label: 'Français',            flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',             flag: '🇩🇪' },
];

// ─────────────────────────────────────────────────────────
// STORAGE KEY
// ─────────────────────────────────────────────────────────

const LANG_KEY = '@guadalupego:language';

// ─────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────

const instance = i18n;  // referencia a la instancia global

if (!instance.isInitialized) {
  instance
    .use(initReactI18next)
    .init({
      resources: {
        es: { translation: es },
        en: { translation: en },
        fr: { translation: fr },
        pt: { translation: pt },
        de: { translation: de },
        ja: { translation: ja },
        ar: { translation: ar },
        af: { translation: af },
        ko: { translation: ko },
        nl: { translation: nl },
        uk: { translation: uk },
        sv: { translation: sv },
        pl: { translation: pl },
        sq: { translation: sq },
      },
      lng:               'es',
      fallbackLng:       'es',
      interpolation:     { escapeValue: false },
      compatibilityJSON: 'v4',
    })
    .then(async () => {
      try {
        const stored = await AsyncStorage.getItem(LANG_KEY);
        if (stored && stored !== 'es') {
          await instance.changeLanguage(stored);
        }
      } catch {
        // queda en español
      }
    });
}

// ─────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────

export const cambiarIdioma = async (lang: AppLanguage): Promise<void> => {
  try {
    await instance.changeLanguage(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    if (__DEV__) console.warn('[i18n] Error cambiando idioma:', e);
  }
};

export default instance;
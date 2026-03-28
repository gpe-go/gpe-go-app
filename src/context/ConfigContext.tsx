import React, {
  createContext, useContext, useEffect, useState, useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────

export type SupportedLanguage = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'ja';
export type FontSizeLevel     = 'small' | 'medium' | 'large';

export type TranslationDict = {
  // Navegación
  settings:    string;
  inicio:      string;
  noticias:    string;
  eventos:     string;
  directorio:  string;
  explorar:    string;
  favoritos:   string;
  contacto:    string;
  perfil:      string;
  // Ajustes
  dark:        string;
  lang:        string;
  fontSize:    string;
  // Acciones
  save:        string;
  cancel:      string;
  confirm:     string;
  back:        string;
  share:       string;
  seeMore:     string;
  // Estados
  loading:     string;
  noResults:   string;
  error:       string;
  // Lugares
  location:    string;
  schedule:    string;
  price:       string;
  rating:      string;
  category:    string;
  // Noticias
  news:        string;
  latestNews:  string;
  readMore:    string;
};

export type ConfigContextType = {
  // Estado
  darkMode:    boolean;
  fontSize:    FontSizeLevel;
  language:    SupportedLanguage;
  isLoading:   boolean;
  // Acciones
  setDarkMode: (val: boolean)          => void;
  toggleDark:  ()                      => void;
  setFontSize: (val: FontSizeLevel)    => void;
  setLanguage: (val: SupportedLanguage)=> void;
  // Traducciones
  t:           TranslationDict;
  // Escala de fuente
  scale:       number;
};

// ─────────────────────────────────────────────────────────
// TRADUCCIONES
// ─────────────────────────────────────────────────────────

const TRANSLATIONS: Record<SupportedLanguage, TranslationDict> = {
  es: {
    settings:   'Configuración',   inicio:     'Inicio',
    noticias:   'Noticias',        eventos:    'Eventos',
    directorio: 'Directorio',      explorar:   'Explorar',
    favoritos:  'Favoritos',       contacto:   'Contacto',
    perfil:     'Perfil',          dark:       'Modo Oscuro',
    lang:       'Idioma',          fontSize:   'Tamaño de texto',
    save:       'Guardar',         cancel:     'Cancelar',
    confirm:    'Confirmar',       back:       'Volver',
    share:      'Compartir',       seeMore:    'Ver más',
    loading:    'Cargando...',     noResults:  'Sin resultados',
    error:      'Ocurrió un error',location:   'Ubicación',
    schedule:   'Horario',         price:      'Precio',
    rating:     'Valoración',      category:   'Categoría',
    news:       'Noticias',        latestNews: 'Últimas noticias',
    readMore:   'Leer más',
  },
  en: {
    settings:   'Settings',        inicio:     'Home',
    noticias:   'News',            eventos:    'Events',
    directorio: 'Directory',       explorar:   'Explore',
    favoritos:  'Favorites',       contacto:   'Contact',
    perfil:     'Profile',         dark:       'Dark Mode',
    lang:       'Language',        fontSize:   'Text size',
    save:       'Save',            cancel:     'Cancel',
    confirm:    'Confirm',         back:       'Back',
    share:      'Share',           seeMore:    'See more',
    loading:    'Loading...',      noResults:  'No results',
    error:      'An error occurred',location:  'Location',
    schedule:   'Schedule',        price:      'Price',
    rating:     'Rating',          category:   'Category',
    news:       'News',            latestNews: 'Latest news',
    readMore:   'Read more',
  },
  fr: {
    settings:   'Réglages',        inicio:     'Accueil',
    noticias:   'Nouvelles',       eventos:    'Événements',
    directorio: 'Annuaire',        explorar:   'Explorer',
    favoritos:  'Favoris',         contacto:   'Contact',
    perfil:     'Profil',          dark:       'Mode Sombre',
    lang:       'Langue',          fontSize:   'Taille du texte',
    save:       'Sauvegarder',     cancel:     'Annuler',
    confirm:    'Confirmer',       back:       'Retour',
    share:      'Partager',        seeMore:    'Voir plus',
    loading:    'Chargement...',   noResults:  'Aucun résultat',
    error:      'Une erreur est survenue', location: 'Emplacement',
    schedule:   'Horaire',         price:      'Prix',
    rating:     'Note',            category:   'Catégorie',
    news:       'Nouvelles',       latestNews: 'Dernières nouvelles',
    readMore:   'Lire la suite',
  },
  pt: {
    settings:   'Configurações',   inicio:     'Início',
    noticias:   'Notícias',        eventos:    'Eventos',
    directorio: 'Diretório',       explorar:   'Explorar',
    favoritos:  'Favoritos',       contacto:   'Contato',
    perfil:     'Perfil',          dark:       'Modo Escuro',
    lang:       'Idioma',          fontSize:   'Tamanho do texto',
    save:       'Salvar',          cancel:     'Cancelar',
    confirm:    'Confirmar',       back:       'Voltar',
    share:      'Compartilhar',    seeMore:    'Ver mais',
    loading:    'Carregando...',   noResults:  'Sem resultados',
    error:      'Ocorreu um erro', location:   'Localização',
    schedule:   'Horário',         price:      'Preço',
    rating:     'Avaliação',       category:   'Categoria',
    news:       'Notícias',        latestNews: 'Últimas notícias',
    readMore:   'Ler mais',
  },
  de: {
    settings:   'Einstellungen',   inicio:     'Startseite',
    noticias:   'Nachrichten',     eventos:    'Ereignisse',
    directorio: 'Verzeichnis',     explorar:   'Erkunden',
    favoritos:  'Favoriten',       contacto:   'Kontakt',
    perfil:     'Profil',          dark:       'Dunkelmodus',
    lang:       'Sprache',         fontSize:   'Textgröße',
    save:       'Speichern',       cancel:     'Abbrechen',
    confirm:    'Bestätigen',      back:       'Zurück',
    share:      'Teilen',          seeMore:    'Mehr sehen',
    loading:    'Laden...',        noResults:  'Keine Ergebnisse',
    error:      'Ein Fehler ist aufgetreten', location: 'Standort',
    schedule:   'Zeitplan',        price:      'Preis',
    rating:     'Bewertung',       category:   'Kategorie',
    news:       'Nachrichten',     latestNews: 'Neueste Nachrichten',
    readMore:   'Weiterlesen',
  },
  ja: {
    settings:   '設定',            inicio:     'ホーム',
    noticias:   'ニュース',         eventos:    'イベント',
    directorio: 'ディレクトリ',     explorar:   '探索',
    favoritos:  'お気に入り',        contacto:   '連絡先',
    perfil:     'プロフィール',      dark:       'ダークモード',
    lang:       '言語',             fontSize:   'テキストサイズ',
    save:       '保存',             cancel:     'キャンセル',
    confirm:    '確認',             back:       '戻る',
    share:      '共有',             seeMore:    'もっと見る',
    loading:    '読み込み中...',     noResults:  '結果なし',
    error:      'エラーが発生しました', location: '場所',
    schedule:   'スケジュール',      price:      '価格',
    rating:     '評価',             category:   'カテゴリ',
    news:       'ニュース',         latestNews: '最新ニュース',
    readMore:   '続きを読む',
  },
};

// ─── Escala de fuente ─────────────────────────────────────
const FONT_SCALE: Record<FontSizeLevel, number> = {
  small:  0.85,
  medium: 1.0,
  large:  1.2,
};

// ─── Claves de AsyncStorage ───────────────────────────────
const STORAGE_KEYS = {
  darkMode:  '@guadalupego:darkMode',
  fontSize:  '@guadalupego:fontSize',
  language:  '@guadalupego:language',
} as const;

// ─────────────────────────────────────────────────────────
// CONTEXTO
// ─────────────────────────────────────────────────────────

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode,  setDarkModeState]  = useState(false);
  const [fontSize,  setFontSizeState]  = useState<FontSizeLevel>('medium');
  const [language,  setLanguageState]  = useState<SupportedLanguage>('es');
  const [isLoading, setIsLoading]      = useState(true);

  // ── Cargar preferencias persistidas ───────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        const [dark, size, lang] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.darkMode),
          AsyncStorage.getItem(STORAGE_KEYS.fontSize),
          AsyncStorage.getItem(STORAGE_KEYS.language),
        ]);
        if (dark  !== null) setDarkModeState(dark === 'true');
        if (size  !== null) setFontSizeState(size as FontSizeLevel);
        if (lang  !== null) setLanguageState(lang as SupportedLanguage);
      } catch (e) {
        console.warn('[ConfigContext] Error cargando preferencias:', e);
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, []);

  // ── Setters con persistencia ───────────────────────────
  const setDarkMode = useCallback(async (val: boolean) => {
    setDarkModeState(val);
    await AsyncStorage.setItem(STORAGE_KEYS.darkMode, String(val));
  }, []);

  const toggleDark = useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode, setDarkMode]);

  const setFontSize = useCallback(async (val: FontSizeLevel) => {
    setFontSizeState(val);
    await AsyncStorage.setItem(STORAGE_KEYS.fontSize, val);
  }, []);

  const setLanguage = useCallback(async (val: SupportedLanguage) => {
    setLanguageState(val);
    await AsyncStorage.setItem(STORAGE_KEYS.language, val);
  }, []);

  // ── Valores derivados ──────────────────────────────────
  const t     = TRANSLATIONS[language] ?? TRANSLATIONS.es;
  const scale = FONT_SCALE[fontSize];

  const value: ConfigContextType = {
    darkMode, fontSize, language, isLoading,
    setDarkMode, toggleDark, setFontSize, setLanguage,
    t, scale,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────

export const useConfig = (): ConfigContextType => {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useConfig debe usarse dentro de <ConfigProvider>');
  }
  return ctx;
};

export default ConfigContext;
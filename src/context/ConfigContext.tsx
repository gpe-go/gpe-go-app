import React, { createContext, useContext, useState } from 'react';

const ConfigContext = createContext<any>(undefined);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const [language, setLanguage] = useState('es');

  // --- AQUÍ ESTÁ EL DICCIONARIO EXPANDIDO ---
  const translations: any = {
    es: {
      settings: 'Configuración', dark: 'Modo Oscuro', lang: 'Idioma',
      inicio: 'Inicio', noticias: 'Noticias', eventos: 'Eventos',
      directorio: 'Directorio', explorar: 'Explorar', favoritos: 'Favoritos'
    },
    en: {
      settings: 'Settings', dark: 'Dark Mode', lang: 'Language',
      inicio: 'Home', noticias: 'News', eventos: 'Events',
      directorio: 'Directory', explorar: 'Explore', favoritos: 'Favorites'
    },
    fr: {
      settings: 'Réglages', dark: 'Mode Sombre', lang: 'Langue',
      inicio: 'Accueil', noticias: 'Nouvelles', eventos: 'Événements',
      directorio: 'Annuaire', explorar: 'Explorer', favoritos: 'Favoris'
    },
    pt: {
      settings: 'Configurações', dark: 'Modo Escuro', lang: 'Idioma',
      inicio: 'Início', noticias: 'Notícias', eventos: 'Eventos',
      directorio: 'Diretório', explorar: 'Explorar', favoritos: 'Favoritos'
    },
    de: {
      settings: 'Einstellungen', dark: 'Dunkelmodus', lang: 'Sprache',
      inicio: 'Startseite', noticias: 'Nachrichten', eventos: 'Ereignisse',
      directorio: 'Verzeichnis', explorar: 'Erkunden', favoritos: 'Favoriten'
    },
    ja: {
      settings: '設定', dark: 'ダークモード', lang: '言語',
      inicio: 'ホーム', noticias: 'ニュース', eventos: 'イベント',
      directorio: 'ディレクトリ', explorar: '探索', favoritos: 'お気に入り'
    },
  };

  const t = translations[language] || translations['es'];

  return (
    <ConfigContext.Provider value={{ darkMode, setDarkMode, fontSize, setFontSize, language, setLanguage, t }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    return {
      darkMode: false,
      fontSize: 1,
      language: 'es',
      t: {
        settings: 'Configuración', dark: 'Modo Oscuro', lang: 'Idioma',
        inicio: 'Inicio', noticias: 'Noticias', eventos: 'Eventos'
      }
    };
  }
  return context;
};
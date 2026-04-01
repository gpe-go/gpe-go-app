import React, { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cambiarIdioma, AppLanguage } from '../i18n/i18n';

const ConfigContext = createContext<any>(undefined);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const { t: i18nT, i18n } = useTranslation();

  const language = i18n.language as AppLanguage;

  const setLanguage = async (lang: AppLanguage) => {
    await cambiarIdioma(lang);
  };

  // Objeto t compatible con el uso existente en la app
  const t = {
    settings: i18nT('tab_settings'),
    dark:     i18nT('settings_dark_mode'),
    lang:     i18nT('settings_language'),
    inicio:   i18nT('tab_home'),
    noticias: i18nT('tab_news'),
    eventos:  i18nT('tab_events'),
    directorio: i18nT('tab_directory'),
    explorar: i18nT('tab_explore'),
    favoritos: i18nT('tab_favorites'),
  };

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
        inicio: 'Inicio', noticias: 'Noticias', eventos: 'Eventos',
        directorio: 'Directorio', explorar: 'Explorar', favoritos: 'Favoritos',
      }
    };
  }
  return context;
};
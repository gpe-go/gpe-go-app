import React, {
  createContext, useCallback, useContext,
  useEffect, useState,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark';
export type FontSize  = 'small' | 'medium' | 'large';

export interface AppColors {
  // Fondos
  background:      string;
  card:            string;
  cardAlt:         string;
  inputBackground: string;
  // Textos
  text:            string;
  subtext:         string;
  placeholder:     string;
  // Marca
  primary:         string;
  primaryDark:     string;
  primaryLight:    string;
  // UI
  border:          string;
  separator:       string;
  icon:            string;
  tabBar:          string;
  tabBarBorder:    string;
  overlay:         string;
  // Estados
  danger:          string;
  success:         string;
  warning:         string;
  info:            string;
  // Sombras
  shadow:          string;
  shadowOpacity:   number;
}

export type FontScale = {
  xs:    number;
  sm:    number;
  base:  number;
  md:    number;
  lg:    number;
  xl:    number;
  '2xl': number;
  '3xl': number;
};

interface ThemeContextValue {
  mode:        ThemeMode;
  isDark:      boolean;
  colors:      AppColors;
  fontSize:    FontSize;
  fonts:       FontScale;
  isLoading:   boolean;
  toggleTheme: ()                => void;
  setFontSize: (s: FontSize)     => void;
  setMode:     (m: ThemeMode)    => void;
}

// ─────────────────────────────────────────────────────────
// PALETA GUARDALUPEGO
// ─────────────────────────────────────────────────────────

const ORANGE       = '#E96928';
const ORANGE_DARK  = '#c4511a';
const ORANGE_LIGHT = 'rgba(233,105,40,0.1)';

const light: AppColors = {
  background:      '#F8F9FA',
  card:            '#FFFFFF',
  cardAlt:         '#F1F3F5',
  inputBackground: '#F1F3F5',
  text:            '#1A1A1A',
  subtext:         '#6B7280',
  placeholder:     '#9CA3AF',
  primary:         ORANGE,
  primaryDark:     ORANGE_DARK,
  primaryLight:    ORANGE_LIGHT,
  border:          '#E5E7EB',
  separator:       '#F3F4F6',
  icon:            '#374151',
  tabBar:          '#FFFFFF',
  tabBarBorder:    '#E5E7EB',
  overlay:         'rgba(0,0,0,0.45)',
  danger:          '#EF4444',
  success:         '#10B981',
  warning:         '#F5BE41',
  info:            '#4A90E2',
  shadow:          '#000000',
  shadowOpacity:   0.08,
};

const dark: AppColors = {
  background:      '#0D0D0D',
  card:            '#1A1A1A',
  cardAlt:         '#242424',
  inputBackground: '#242424',
  text:            '#F0F0F0',
  subtext:         '#9CA3AF',
  placeholder:     '#6B7280',
  primary:         ORANGE,
  primaryDark:     ORANGE_DARK,
  primaryLight:    'rgba(233,105,40,0.15)',
  border:          '#2A2A2A',
  separator:       '#1F1F1F',
  icon:            '#C9D1D9',
  tabBar:          '#111111',
  tabBarBorder:    '#2A2A2A',
  overlay:         'rgba(0,0,0,0.65)',
  danger:          '#F87171',
  success:         '#34D399',
  warning:         '#FBBF24',
  info:            '#60A5FA',
  shadow:          '#000000',
  shadowOpacity:   0.35,
};

// ─────────────────────────────────────────────────────────
// ESCALA DE FUENTES
// ─────────────────────────────────────────────────────────

// Android (Samsung One UI, etc.) renderiza sp más grandes que iOS pt,
// por eso se usan valores ligeramente menores en Android.
const isAndroid = Platform.OS === 'android';

export const FONT_SCALE: Record<FontSize, FontScale> = {
  small: {
    xs:   isAndroid ? 10 : 11,
    sm:   isAndroid ? 12 : 13,
    base: isAndroid ? 13 : 14,
    md:   isAndroid ? 14 : 15,
    lg:   isAndroid ? 16 : 17,
    xl:   isAndroid ? 18 : 19,
    '2xl': isAndroid ? 20 : 22,
    '3xl': isAndroid ? 24 : 26,
  },
  medium: {
    xs:   isAndroid ? 11 : 12,
    sm:   isAndroid ? 13 : 14,
    base: isAndroid ? 14 : 16,
    md:   isAndroid ? 15 : 17,
    lg:   isAndroid ? 17 : 19,
    xl:   isAndroid ? 19 : 21,
    '2xl': isAndroid ? 22 : 24,
    '3xl': isAndroid ? 26 : 30,
  },
  large: {
    xs:   isAndroid ? 12 : 14,
    sm:   isAndroid ? 14 : 16,
    base: isAndroid ? 16 : 18,
    md:   isAndroid ? 17 : 20,
    lg:   isAndroid ? 19 : 22,
    xl:   isAndroid ? 21 : 24,
    '2xl': isAndroid ? 24 : 28,
    '3xl': isAndroid ? 28 : 34,
  },
};

// ─────────────────────────────────────────────────────────
// STORAGE KEYS
// ─────────────────────────────────────────────────────────

const KEYS = {
  mode:     '@guadalupego:theme_mode',
  fontSize: '@guadalupego:font_size',
} as const;

// ─────────────────────────────────────────────────────────
// CONTEXTO
// ─────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  mode:        'light',
  isDark:      false,
  colors:      light,
  fontSize:    'medium',
  fonts:       FONT_SCALE.medium,
  isLoading:   true,
  toggleTheme: () => {},
  setFontSize: () => {},
  setMode:     () => {},
});

// ─────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode,      setModeState]     = useState<ThemeMode>('light');
  const [fontSize,  setFontSizeState] = useState<FontSize>('medium');
  const [isLoading, setIsLoading]     = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [m, f] = await Promise.all([
          AsyncStorage.getItem(KEYS.mode),
          AsyncStorage.getItem(KEYS.fontSize),
        ]);
        if (m === 'light' || m === 'dark') setModeState(m);
        if (f === 'small' || f === 'medium' || f === 'large') setFontSizeState(f);
      } catch (e) {
        console.warn('[ThemeContext] Error cargando preferencias:', e);
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, []);

  const toggleTheme = useCallback(async () => {
    const next: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setModeState(next);
    try {
      await AsyncStorage.setItem(KEYS.mode, next);
    } catch (e) {
      console.warn('[ThemeContext] Error guardando modo:', e);
    }
  }, [mode]);

  const setMode = useCallback(async (m: ThemeMode) => {
    setModeState(m);
    try {
      await AsyncStorage.setItem(KEYS.mode, m);
    } catch (e) {
      console.warn('[ThemeContext] Error guardando modo:', e);
    }
  }, []);

  const setFontSize = useCallback(async (s: FontSize) => {
    setFontSizeState(s);
    try {
      await AsyncStorage.setItem(KEYS.fontSize, s);
    } catch (e) {
      console.warn('[ThemeContext] Error guardando fontSize:', e);
    }
  }, []);

  const value: ThemeContextValue = {
    mode,
    isDark:      mode === 'dark',
    colors:      mode === 'dark' ? dark : light,
    fontSize,
    fonts:       FONT_SCALE[fontSize],
    isLoading,
    toggleTheme,
    setFontSize,
    setMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  }
  return ctx;
};

export default ThemeContext;

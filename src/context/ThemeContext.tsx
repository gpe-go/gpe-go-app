import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';
export type FontSize  = 'small' | 'medium' | 'large';

export interface AppColors {
  background:      string;
  card:            string;
  cardAlt:         string;
  text:            string;
  subtext:         string;
  border:          string;
  primary:         string;
  primaryLight:    string;
  icon:            string;
  tabBar:          string;
  tabBarBorder:    string;
  inputBackground: string;
  danger:          string;
  success:         string;
  overlay:         string;
}

const light: AppColors = {
  background:      '#F4F6FB',
  card:            '#FFFFFF',
  cardAlt:         '#EEF2FF',
  text:            '#111827',
  subtext:         '#6B7280',
  border:          '#E5E7EB',
  primary:         '#2563EB',
  primaryLight:    '#DBEAFE',
  icon:            '#374151',
  tabBar:          '#FFFFFF',
  tabBarBorder:    '#E5E7EB',
  inputBackground: '#F9FAFB',
  danger:          '#EF4444',
  success:         '#10B981',
  overlay:         'rgba(0,0,0,0.45)',
};

const dark: AppColors = {
  background:      '#0D1117',
  card:            '#161B22',
  cardAlt:         '#1C2333',
  text:            '#E6EDF3',
  subtext:         '#8B949E',
  border:          '#30363D',
  primary:         '#58A6FF',
  primaryLight:    '#1D3557',
  icon:            '#C9D1D9',
  tabBar:          '#161B22',
  tabBarBorder:    '#30363D',
  inputBackground: '#0D1117',
  danger:          '#F85149',
  success:         '#3FB950',
  overlay:         'rgba(0,0,0,0.65)',
};

export const FONT_SCALE = {
  small: {
    xs: 10, sm: 12, base: 14, md: 15, lg: 17, xl: 19, '2xl': 22, '3xl': 26,
  },
  medium: {
    xs: 12, sm: 14, base: 16, md: 17, lg: 19, xl: 21, '2xl': 24, '3xl': 30,
  },
  large: {
    xs: 14, sm: 16, base: 18, md: 20, lg: 22, xl: 24, '2xl': 28, '3xl': 34,
  },
} as const;

// ✅ FIX: acepta cualquier escala (small | medium | large), no solo medium
export type FontScale = {
  xs: number;
  sm: number;
  base: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
};

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: AppColors;
  fontSize: FontSize;
  fonts: FontScale;
  toggleTheme: () => void;
  setFontSize: (s: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light', isDark: false, colors: light,
  fontSize: 'medium', fonts: FONT_SCALE.medium,
  toggleTheme: () => {}, setFontSize: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode]         = useState<ThemeMode>('light');
  const [fontSize, setFontSizeS] = useState<FontSize>('medium');

  useEffect(() => {
    (async () => {
      try {
        const [m, f] = await Promise.all([
          AsyncStorage.getItem('@theme_mode'),
          AsyncStorage.getItem('@font_size'),
        ]);
        if (m === 'dark' || m === 'light') setMode(m);
        if (f === 'small' || f === 'medium' || f === 'large') setFontSizeS(f);
      } catch {}
    })();
  }, []);

  const toggleTheme = async () => {
    const next: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    await AsyncStorage.setItem('@theme_mode', next);
  };

  const setFontSize = async (s: FontSize) => {
    setFontSizeS(s);
    await AsyncStorage.setItem('@font_size', s);
  };

  return (
    <ThemeContext.Provider value={{
      mode, isDark: mode === 'dark',
      colors: mode === 'dark' ? dark : light,
      fontSize, fonts: FONT_SCALE[fontSize],
      toggleTheme, setFontSize,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
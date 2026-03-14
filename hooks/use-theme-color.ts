/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';

type Theme = 'light' | 'dark';
type ColorName = keyof typeof Colors.light;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
) {
  const theme = (useColorScheme() ?? 'light') as Theme;

  if (props[theme]) {
    return props[theme];
  }

  return Colors[theme][colorName];
}

// ============================================================
//  Text y TextInput envueltos con la tipografía Museo.
//
//  RN 0.81 + React 19 ya NO soportan el viejo truco de
//  `Text.render = ...` ni `Text.defaultProps` para function
//  components. La forma soportada de aplicar Museo globalmente
//  es envolver Text/TextInput en estos wrappers y reemplazar los
//  imports en todo el codebase (`react-native` → este archivo).
//
//  Estos wrappers inspeccionan el `fontWeight` que ya viene en el
//  style del componente y eligen la variante Museo correcta:
//
//    100/200            → Museo-100  (ultralight)
//    300/400/normal     → Museo-300  (light, body default)
//    500/600/700/bold   → Museo-700  (bold, énfasis)
//    800/900            → Museo-900  (black, titulares)
//
//  Si el componente ya pasa una `fontFamily` explícita la
//  respetamos (caso raro pero útil para iconos custom).
// ============================================================

import * as React from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  StyleSheet,
  type TextProps as RNTextProps,
  type TextInputProps as RNTextInputProps,
  type TextStyle,
  type StyleProp,
} from 'react-native';

const MUSEO_BY_WEIGHT: Record<string, string> = {
  '100':    'Museo-100',
  '200':    'Museo-100',
  '300':    'Museo-300',
  '400':    'Museo-300',
  'normal': 'Museo-300',
  '500':    'Museo-700',
  '600':    'Museo-700',
  '700':    'Museo-700',
  'bold':   'Museo-700',
  '800':    'Museo-900',
  '900':    'Museo-900',
};
const MUSEO_DEFAULT = 'Museo-300';

function pickMuseo(style: StyleProp<TextStyle> | undefined): StyleProp<TextStyle> {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  if (flat.fontFamily) return style ?? null;
  const weight = flat.fontWeight != null ? String(flat.fontWeight) : '400';
  const fontFamily = MUSEO_BY_WEIGHT[weight] ?? MUSEO_DEFAULT;
  // fontWeight queda en undefined: en custom fonts solo lía al renderer
  // porque la "negrita" la da el archivo Museo elegido, no el sintetizador.
  //
  // letterSpacing: 0 — fix de un bug de iOS con custom fonts: cuando el
  // TextInput tiene autoCapitalize='sentences' (el default) y una
  // fontFamily custom, iOS aplica un tracking extra al placeholder y
  // las letras se ven "Tu  n o m b r e". Forzando 0 lo anulamos. Si el
  // componente ya pasó un letterSpacing explícito, lo respetamos.
  const letterSpacingPatch =
    flat.letterSpacing != null ? {} : { letterSpacing: 0 };
  return [
    style,
    { fontFamily, fontWeight: undefined as TextStyle['fontWeight'], ...letterSpacingPatch },
  ];
}

// Limita el escalado de fuentes del sistema a 1.2x — evita que las
// letras grandes de accesibilidad rompan layouts. Override por prop.
const DEFAULT_MAX_FONT_MULTIPLIER = 1.2;

export const Text = React.forwardRef<RNText, RNTextProps>(
  function Text(props, ref) {
    return (
      <RNText
        maxFontSizeMultiplier={DEFAULT_MAX_FONT_MULTIPLIER}
        {...props}
        ref={ref}
        style={pickMuseo(props.style)}
      />
    );
  },
);

export const TextInput = React.forwardRef<RNTextInput, RNTextInputProps>(
  function TextInput(props, ref) {
    return (
      <RNTextInput
        maxFontSizeMultiplier={DEFAULT_MAX_FONT_MULTIPLIER}
        {...props}
        ref={ref}
        style={pickMuseo(props.style as StyleProp<TextStyle>) as any}
      />
    );
  },
);

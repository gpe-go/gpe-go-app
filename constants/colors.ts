// ─── Paleta base GuadalupeGO ───────────────────────────
const ORANGE        = '#E96928';
const ORANGE_DARK   = '#c4511a';
const ORANGE_DEEPER = '#9c3a10';

// ─── Colors (para expo-router / sistema) ──────────────
export const Colors = {
  light: {
    text:       '#11181C',
    background: '#FFFFFF',
    primary:    ORANGE,
    secondary:  '#6B7280',
    muted:      '#9CA3AF',
    card:       '#F8F9FA',
    tint:       ORANGE,
    icon:       '#687076',
    tabIconDefault:  '#687076',
    tabIconSelected: ORANGE,
  },
  dark: {
    text:       '#ECEDEE',
    background: '#0D0D0D',
    primary:    ORANGE,
    secondary:  '#9CA3AF',
    muted:      '#6B7280',
    card:       '#1A1A1A',
    tint:       ORANGE,
    icon:       '#9BA1A6',
    tabIconDefault:  '#9BA1A6',
    tabIconSelected: ORANGE,
  },
} as const;

// ─── Tema claro ────────────────────────────────────────
export const LightTheme = {
  // Fondos
  background:     '#F8F9FA',       // fondo principal — casi blanco cálido
  card:           '#FFFFFF',       // cards — blanco puro
  cardAlt:        '#F1F3F5',       // cards alternativas / inputs
  inputBackground:'#F1F3F5',       // fondo de inputs

  // Textos
  text:           '#1A1A1A',       // texto principal
  subtext:        '#6B7280',       // texto secundario
  placeholder:    '#9CA3AF',       // placeholders

  // Marca
  primary:        ORANGE,          // naranja GuadalupeGO
  primaryDark:    ORANGE_DARK,     // naranja oscuro (hover/pressed)
  primaryDeeper:  ORANGE_DEEPER,   // naranja más oscuro (gradientes)
  primaryLight:   'rgba(233,105,40,0.1)', // fondo tintado naranja

  // UI
  border:         '#E5E7EB',       // bordes sutiles
  separator:      '#F3F4F6',       // separadores
  overlay:        'rgba(0,0,0,0.45)',

  // Sombras
  shadow:         '#000000',
  shadowOpacity:  0.08,

  // Estados
  success:        '#10B981',
  warning:        '#F5BE41',
  error:          '#EF4444',
  info:           '#4A90E2',
};

// ─── Tema oscuro ───────────────────────────────────────
export const DarkTheme = {
  // Fondos
  background:     '#0D0D0D',       // fondo principal — negro profundo
  card:           '#1A1A1A',       // cards
  cardAlt:        '#242424',       // cards alternativas
  inputBackground:'#242424',       // fondo de inputs

  // Textos
  text:           '#F0F0F0',       // texto principal
  subtext:        '#9CA3AF',       // texto secundario
  placeholder:    '#6B7280',       // placeholders

  // Marca — igual que light, naranja siempre
  primary:        ORANGE,
  primaryDark:    ORANGE_DARK,
  primaryDeeper:  ORANGE_DEEPER,
  primaryLight:   'rgba(233,105,40,0.15)', // más visible en dark

  // UI
  border:         '#2A2A2A',       // bordes sutiles en dark
  separator:      '#1F1F1F',       // separadores
  overlay:        'rgba(0,0,0,0.65)',

  // Sombras
  shadow:         '#000000',
  shadowOpacity:  0.35,

  // Estados
  success:        '#10B981',
  warning:        '#F5BE41',
  error:          '#EF4444',
  info:           '#4A90E2',
};

// ─── Tipo exportado ────────────────────────────────────
export type AppTheme = typeof LightTheme;

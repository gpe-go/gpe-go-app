/**
 * TourGuide — recorrido guiado dentro de la app
 *
 * Pasos: 0=Home · 1=MapaCompleto · 2=Noticias · 3=Directorio
 *        4=Explorar · 5=Eventos · 6=Favoritos · 7=Contacto
 *        8=BarraLateral · 9=Notificaciones · 10=Perfil
 *        11=RegistrarNegocio · 12=Configuracion · →Finish card
 */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../src/context/OnboardingContext';
import { useTheme } from '../src/context/ThemeContext';

// ── Phantom interaction types ────────────────────────────────────────────────
interface PhantomAction {
  type: 'tap' | 'type' | 'swipe-down' | 'swipe-up';
  x: number;
  y: number;
  text?: string;
  delay: number;
}

// ── Definición de pasos ──────────────────────────────────────────────────────
interface TourStep {
  type: 'tab' | 'stack';
  route: string;
  titleKey: string;
  descKey: string;
  arrowX: number;
  arrowY: number;
  arrowDir: 'up' | 'down';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  interactions?: PhantomAction[];
}

const { width: W, height: H } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Coordenadas calibradas para iPhone 14/15 (390×844)
// Header GuadalupeGO termina en ≈ H*0.13
// Tarjeta del tour ocupa la parte baja (≈ H*0.52 hacia abajo)
// Las interacciones se muestran en la "ventana" visible (H*0.13 – H*0.50)
// ─────────────────────────────────────────────────────────────────────────────
const STEPS: TourStep[] = [
  {
    // Step 0 — Inicio: buscador principal
    type: 'tab',
    route: '/(tabs)/',
    titleKey: 'onboarding_tooltip_home_title',
    descKey: 'onboarding_tooltip_home_desc',
    arrowX: 0, arrowY: -16, arrowDir: 'up',
    icon: 'home-outline', color: '#E96928',
    interactions: [
      // TAP en el buscador (centro horizontal, ~27% desde arriba)
      { type: 'tap',  x: W * 0.50, y: H * 0.27, delay: 600 },
      // Overlay de escritura aparece sobre el buscador
      { type: 'type', x: W * 0.50 - 110, y: H * 0.24, text: 'Restaurante...', delay: 1100 },
    ],
  },
  {
    // Step 1 — Mapa completo: scroll + botón ubicación
    type: 'stack',
    route: '/(stack)/mapaCompleto',
    titleKey: 'onboarding_tooltip_mapaCompleto_title',
    descKey: 'onboarding_tooltip_mapaCompleto_desc',
    arrowX: 0, arrowY: 0, arrowDir: 'up',
    icon: 'map-outline', color: '#10B981',
    interactions: [
      // Deslizar el mapa (zona media de la pantalla)
      { type: 'swipe-down', x: W * 0.50, y: H * 0.32, delay: 700 },
      // TAP en botón de centrar ubicación (esquina inferior derecha)
      { type: 'tap', x: W * 0.86, y: H * 0.72, delay: 1400 },
    ],
  },
  {
    // Step 2 — Noticias: scroll lista
    type: 'tab',
    route: '/(tabs)/noticias',
    titleKey: 'onboarding_tooltip_noticias_title',
    descKey: 'onboarding_tooltip_noticias_desc',
    arrowX: 0, arrowY: -18, arrowDir: 'up',
    icon: 'newspaper-outline', color: '#3B82F6',
    interactions: [
      { type: 'swipe-down', x: W * 0.50, y: H * 0.36, delay: 700 },
    ],
  },
  {
    // Step 3 — Directorio: tap categoría + scroll lista
    type: 'tab',
    route: '/(tabs)/directorio',
    titleKey: 'onboarding_tooltip_directorio_title',
    descKey: 'onboarding_tooltip_directorio_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'business-outline', color: '#8B5CF6',
    interactions: [
      // TAP en primer chip de categoría (izquierda, ~41% vertical)
      { type: 'tap',        x: W * 0.13, y: H * 0.41, delay: 700 },
      // Scroll lista de lugares
      { type: 'swipe-down', x: W * 0.50, y: H * 0.50, delay: 1500 },
    ],
  },
  {
    // Step 4 — Explorar: tap categoría + scroll
    type: 'tab',
    route: '/(tabs)/explorar',
    titleKey: 'onboarding_tooltip_explorar_title',
    descKey: 'onboarding_tooltip_explorar_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'compass-outline', color: '#10B981',
    interactions: [
      { type: 'tap',        x: W * 0.13, y: H * 0.41, delay: 700 },
      { type: 'swipe-down', x: W * 0.50, y: H * 0.50, delay: 1500 },
    ],
  },
  {
    // Step 5 — Eventos: tap categoría + scroll
    type: 'tab',
    route: '/(tabs)/eventos',
    titleKey: 'onboarding_tooltip_eventos_title',
    descKey: 'onboarding_tooltip_eventos_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'calendar-outline', color: '#F59E0B',
    interactions: [
      // TAP en chip "Deporte" (segundo botón, ~38% horizontal, ~43% vertical)
      { type: 'tap',        x: W * 0.38, y: H * 0.43, delay: 700 },
      // Scroll eventos
      { type: 'swipe-down', x: W * 0.50, y: H * 0.53, delay: 1500 },
    ],
  },
  {
    // Step 6 — Favoritos: scroll lista
    type: 'tab',
    route: '/(tabs)/favoritos',
    titleKey: 'onboarding_tooltip_favoritos_title',
    descKey: 'onboarding_tooltip_favoritos_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'heart-outline', color: '#EF4444',
    interactions: [
      { type: 'swipe-down', x: W * 0.50, y: H * 0.40, delay: 700 },
    ],
  },
  {
    // Step 7 — Contacto: scroll tarjetas de emergencia
    type: 'tab',
    route: '/(tabs)/contacto',
    titleKey: 'onboarding_tooltip_contacto_title',
    descKey: 'onboarding_tooltip_contacto_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'mail-outline', color: '#0EA5E9',
    interactions: [
      { type: 'swipe-down', x: W * 0.50, y: H * 0.38, delay: 700 },
    ],
  },
  {
    // Step 8 — Barra lateral: TAP en el ☰ (posición exacta del header)
    type: 'tab',
    route: '/(tabs)/',
    titleKey: 'onboarding_tooltip_barraLateral_title',
    descKey: 'onboarding_tooltip_barraLateral_desc',
    arrowX: -41, arrowY: -36, arrowDir: 'up',
    icon: 'menu-outline', color: '#E96928',
    interactions: [
      // El ☰ está aprox en x=33px, y=73px en iPhone (dentro del header)
      { type: 'tap', x: W * 0.085, y: H * 0.073, delay: 700 },
    ],
  },
  {
    // Step 9 — Notificaciones: scroll lista
    type: 'stack',
    route: '/(stack)/notificaciones',
    titleKey: 'onboarding_tooltip_notificaciones_title',
    descKey: 'onboarding_tooltip_notificaciones_desc',
    arrowX: 0, arrowY: -16, arrowDir: 'up',
    icon: 'notifications-outline', color: '#F97316',
    interactions: [
      { type: 'swipe-down', x: W * 0.50, y: H * 0.38, delay: 700 },
    ],
  },
  {
    // Step 10 — Perfil: scroll secciones
    type: 'stack',
    route: '/(stack)/perfil',
    titleKey: 'onboarding_tooltip_perfil_title',
    descKey: 'onboarding_tooltip_perfil_desc',
    arrowX: 0, arrowY: -18, arrowDir: 'up',
    icon: 'person-outline', color: '#6366F1',
    interactions: [
      { type: 'swipe-down', x: W * 0.50, y: H * 0.40, delay: 700 },
    ],
  },
  {
    // Step 11 — Registrar negocio: tap en campo nombre + scroll formulario
    type: 'stack',
    route: '/(stack)/registrar-negocio',
    titleKey: 'onboarding_tooltip_registrarNegocio_title',
    descKey: 'onboarding_tooltip_registrarNegocio_desc',
    arrowX: 0, arrowY: -18, arrowDir: 'up',
    icon: 'storefront-outline', color: '#EC4899',
    interactions: [
      // TAP en el campo input del nombre (no el label, sino el input debajo)
      { type: 'tap',        x: W * 0.50, y: H * 0.39, delay: 700 },
      // Scroll para ver más campos
      { type: 'swipe-down', x: W * 0.50, y: H * 0.52, delay: 1500 },
    ],
  },
  {
    // Step 12 — Configuración: tap toggle modo oscuro + scroll
    type: 'stack',
    route: '/(stack)/configuracion',
    titleKey: 'onboarding_tooltip_configuracion_title',
    descKey: 'onboarding_tooltip_configuracion_desc',
    arrowX: 0, arrowY: -18, arrowDir: 'up',
    icon: 'settings-outline', color: '#64748B',
    interactions: [
      // TAP en el switch de Modo Oscuro (lado derecho, ~24% vertical)
      { type: 'tap',        x: W * 0.82, y: H * 0.24, delay: 700 },
      // Scroll para ver más opciones
      { type: 'swipe-down', x: W * 0.50, y: H * 0.38, delay: 1500 },
    ],
  },
];

const TOTAL = STEPS.length;

// ── Phantom sub-components ───────────────────────────────────────────────────

function TapIndicator({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  const scale         = useRef(new Animated.Value(0.3)).current;
  const opacity       = useRef(new Animated.Value(0)).current;
  const rippleScale   = useRef(new Animated.Value(0.5)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const loopRef       = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.spring(scale,   { toValue: 1.0, tension: 80, friction: 6, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.9, duration: 200, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(rippleScale,   { toValue: 1.8, duration: 600, useNativeDriver: true }),
            Animated.timing(rippleOpacity, { toValue: 0,   duration: 600, useNativeDriver: true }),
            Animated.timing(opacity,       { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale,         { toValue: 0.3, duration: 0, useNativeDriver: true }),
            Animated.timing(opacity,       { toValue: 0,   duration: 0, useNativeDriver: true }),
            Animated.timing(rippleScale,   { toValue: 0.5, duration: 0, useNativeDriver: true }),
            Animated.timing(rippleOpacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          ]),
          Animated.delay(500),
        ])
      );
      loopRef.current = loop;
      loop.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      loopRef.current?.stop();
      scale.setValue(0.3); opacity.setValue(0);
      rippleScale.setValue(0.5); rippleOpacity.setValue(0);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x - 20, top: y - 20, width: 40, height: 40, zIndex: 9997 }}>
      <Animated.View style={{
        position: 'absolute', left: -20, top: -20, width: 80, height: 80,
        borderRadius: 40, borderWidth: 2, borderColor: color,
        transform: [{ scale: rippleScale }], opacity: rippleOpacity,
      }} />
      <Animated.View style={{
        width: 40, height: 40, borderRadius: 20,
        borderWidth: 3, borderColor: color, backgroundColor: color + '22',
        transform: [{ scale }], opacity,
      }} />
    </View>
  );
}

// Dedo animado deslizando (reemplaza los 3 puntitos)
function FingerIndicator({ x, y, delay, direction }: {
  x: number; y: number; delay: number; direction: 'swipe-down' | 'swipe-up';
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const loopRef    = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const targetY = direction === 'swipe-down' ? 56 : -56;
      const loop = Animated.loop(
        Animated.sequence([
          // Aparece en posición inicial
          Animated.timing(opacity,     { toValue: 1,       duration: 180, useNativeDriver: true }),
          // Desliza hacia el destino
          Animated.timing(translateY,  { toValue: targetY, duration: 620, useNativeDriver: true }),
          // Desvanece
          Animated.timing(opacity,     { toValue: 0,       duration: 180, useNativeDriver: true }),
          // Reset instantáneo + pausa
          Animated.parallel([
            Animated.timing(translateY, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
          Animated.delay(450),
        ])
      );
      loopRef.current = loop;
      loop.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      loopRef.current?.stop();
      translateY.setValue(0);
      opacity.setValue(0);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.Text
      // @ts-ignore — pointerEvents on Text works on both platforms
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - 14,
        top: y - 14,
        fontSize: 30,
        zIndex: 9997,
        elevation: Platform.OS === 'android' ? 9997 : 0,
        transform: [{ translateY }],
        opacity,
      }}
    >
      {direction === 'swipe-down' ? '👇' : '👆'}
    </Animated.Text>
  );
}

function TypingIndicator({ x, y, text, delay }: { x: number; y: number; text: string; delay: number }) {
  const [displayText, setDisplayText] = useState('');
  const opacityAnim   = useRef(new Animated.Value(0)).current;
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    let mounted  = true;
    let timerId: ReturnType<typeof setTimeout>;

    const startCycle = () => {
      if (!mounted) return;
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      let i = 0;
      const typeNext = () => {
        if (!mounted) return;
        setDisplayText(text.slice(0, i));
        if (i < text.length) {
          i++;
          timerId = setTimeout(typeNext, 45);
        } else {
          timerId = setTimeout(() => {
            let j = text.length;
            const eraseNext = () => {
              if (!mounted) return;
              setDisplayText(text.slice(0, j));
              if (j > 0) { j--; timerId = setTimeout(eraseNext, 28); }
              else { timerId = setTimeout(startCycle, 700); }
            };
            eraseNext();
          }, 1000);
        }
      };
      typeNext();
    };

    timerId = setTimeout(startCycle, delay);
    const cursorTick = setInterval(() => { if (mounted) setCursorOn(v => !v); }, 530);

    return () => {
      mounted = false;
      clearTimeout(timerId);
      clearInterval(cursorTick);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: x, top: y, width: 220,
        backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 9,
        flexDirection: 'row', alignItems: 'center', gap: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.20, shadowRadius: 12, elevation: 8,
        zIndex: 9997,
        opacity: opacityAnim,
      }}
    >
      <Ionicons name="search-outline" size={15} color="#E96928" />
      <Text style={{ fontSize: 14, color: '#111', fontWeight: '500', flex: 1 }}>
        {displayText}
        <Text style={{ opacity: cursorOn ? 1 : 0, color: '#E96928' }}>|</Text>
      </Text>
    </Animated.View>
  );
}

function PhantomInteraction({ actions, color, active }: { actions: PhantomAction[]; color: string; active: boolean }) {
  if (!active || actions.length === 0) return null;
  return (
    <>
      {actions.map((action, i) => {
        if (action.type === 'tap') {
          return <TapIndicator key={i} x={action.x} y={action.y} color={color} delay={action.delay} />;
        }
        if (action.type === 'swipe-down' || action.type === 'swipe-up') {
          return <FingerIndicator key={i} x={action.x} y={action.y} delay={action.delay} direction={action.type} />;
        }
        if (action.type === 'type') {
          return <TypingIndicator key={i} x={action.x} y={action.y} text={action.text ?? ''} delay={action.delay} />;
        }
        return null;
      })}
    </>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function TourGuide() {
  const { tourReady, tourActive, tourStep, nextTourStep, skipTour } = useOnboarding();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [contentVisible, setContentVisible] = useState(false);
  const [showFinish,     setShowFinish]     = useState(false);

  const currentStepTypeRef = useRef<'tab' | 'stack'>('tab');

  // Animated — tooltip card
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity    = useRef(new Animated.Value(0)).current;
  const cardSlideY     = useRef(new Animated.Value(32)).current;
  const cardScale      = useRef(new Animated.Value(0.93)).current;
  const arrowBounce    = useRef(new Animated.Value(0)).current;
  const bounceRef      = useRef<Animated.CompositeAnimation | null>(null);

  // Animated — finish card
  const finishOpacity = useRef(new Animated.Value(0)).current;
  const finishSlideY  = useRef(new Animated.Value(44)).current;
  const finishScale   = useRef(new Animated.Value(0.88)).current;

  const step   = STEPS[tourStep] ?? STEPS[0];
  const isLast = tourStep === TOTAL - 1;

  // ── Reset finish cuando el tour (re)arranca ──────────────────────────────
  useEffect(() => {
    if (tourActive) {
      setShowFinish(false);
      currentStepTypeRef.current = 'tab';
      finishOpacity.setValue(0);
      finishSlideY.setValue(44);
      finishScale.setValue(0.88);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourActive]);

  // ── Navegar + mostrar tooltip ────────────────────────────────────────────
  useEffect(() => {
    if (!tourReady || !tourActive || showFinish) return;

    const prevStep    = tourStep > 0 ? STEPS[tourStep - 1] : null;
    const needsBack   = prevStep?.type === 'stack';
    const currentStep = STEPS[tourStep] ?? STEPS[0];

    setContentVisible(false);
    cardOpacity.setValue(0);
    cardSlideY.setValue(32);
    cardScale.setValue(0.93);
    bounceRef.current?.stop();
    arrowBounce.setValue(0);

    Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    let backTimer: ReturnType<typeof setTimeout> | undefined;
    let cardTimer: ReturnType<typeof setTimeout> | undefined;

    const doNavigateAndAnimate = () => {
      currentStepTypeRef.current = currentStep.type;

      if (currentStep.type === 'tab') {
        try { router.navigate(currentStep.route as any); } catch { /* ignore */ }
      } else {
        try { router.push(currentStep.route as any); } catch { /* ignore */ }
      }

      const delay = tourStep === 0 ? 1000 : currentStep.type === 'stack' ? 700 : 500;

      cardTimer = setTimeout(() => {
        setContentVisible(true);

        Animated.parallel([
          Animated.timing(cardOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.spring(cardSlideY,  { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
          Animated.spring(cardScale,   { toValue: 1, tension: 65, friction: 9, useNativeDriver: true }),
        ]).start();

        bounceRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(arrowBounce, { toValue: 11, duration: 540, useNativeDriver: true }),
            Animated.timing(arrowBounce, { toValue: 0,  duration: 540, useNativeDriver: true }),
          ])
        );
        bounceRef.current.start();
      }, delay);
    };

    if (needsBack) {
      try { router.back(); } catch { /* ignore */ }
      backTimer = setTimeout(doNavigateAndAnimate, 340);
    } else {
      doNavigateAndAnimate();
    }

    return () => {
      if (backTimer) clearTimeout(backTimer);
      if (cardTimer) clearTimeout(cardTimer);
      bounceRef.current?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStep, tourActive, tourReady]);

  // ── Ocultar overlay y regresar si estamos en stack ───────────────────────
  useEffect(() => {
    if (!tourActive) {
      bounceRef.current?.stop();
      if (currentStepTypeRef.current === 'stack') {
        setTimeout(() => { try { router.back(); } catch { /* ignore */ } }, 200);
      }
      Animated.timing(overlayOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourActive]);

  // ── Finish card transition ───────────────────────────────────────────────
  const handleShowFinish = useCallback(() => {
    bounceRef.current?.stop();
    setContentVisible(false);
    cardOpacity.setValue(0);

    setTimeout(() => {
      setShowFinish(true);
      Animated.parallel([
        Animated.timing(finishOpacity, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.spring(finishSlideY,  { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        Animated.spring(finishScale,   { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }),
      ]).start();
    }, 240);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!tourReady || !tourActive) return null;

  // Posición de la flecha
  const arrowLeft  = W / 2 + (step.arrowX / 100) * W - 20;
  const arrowTop   = H / 2 + (step.arrowY / 100) * H - 20;
  const arrowDelta = step.arrowDir === 'down'
    ? arrowBounce
    : Animated.multiply(arrowBounce, new Animated.Value(-1));

  // Estilos adaptativos
  const glassBg     = isDark ? 'rgba(16,16,16,0.88)' : 'rgba(255,255,255,0.93)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.13)' : 'rgba(200,200,200,0.6)';
  const titleColor  = isDark ? '#ffffff' : '#111111';
  const descColor   = isDark ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.60)';
  const dotInactive = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.16)';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

      {/* Overlay semitransparente */}
      <Animated.View
        style={[s.overlay, { opacity: overlayOpacity }]}
        pointerEvents="auto"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={showFinish ? nextTourStep : skipTour} />
      </Animated.View>

      {/* Flecha animada */}
      {contentVisible && !showFinish && (
        <Animated.View
          pointerEvents="none"
          style={[s.arrowWrap, { left: arrowLeft, top: arrowTop, transform: [{ translateY: arrowDelta }] }]}
        >
          <Ionicons
            name={step.arrowDir === 'down' ? 'chevron-down' : 'chevron-up'}
            size={38}
            color={step.color}
          />
        </Animated.View>
      )}

      {/* Phantom interactions */}
      <PhantomInteraction
        actions={step.interactions ?? []}
        color={step.color}
        active={contentVisible && !showFinish}
      />

      {/* Tarjeta liquid-glass */}
      {contentVisible && !showFinish && (
        <Animated.View
          pointerEvents="auto"
          style={[
            s.card,
            {
              backgroundColor: glassBg,
              borderColor: glassBorder,
              bottom: insets.bottom + 16,
              opacity: cardOpacity,
              transform: [{ translateY: cardSlideY }, { scale: cardScale }],
            },
          ]}
        >
          <View style={s.cardHeader}>
            <View style={[s.iconBadge, { backgroundColor: step.color + '1E', borderColor: step.color + '44' }]}>
              <Ionicons name={step.icon} size={19} color={step.color} />
            </View>
            <Text style={[s.stepLabel, { color: step.color }]}>
              {t('onboarding_step', { current: tourStep + 1, total: TOTAL })}
            </Text>
            <Pressable onPress={skipTour} hitSlop={12}>
              <Text style={[s.skipAllText, { color: descColor }]}>{t('onboarding_skip_all')}</Text>
            </Pressable>
          </View>

          <Text style={[s.cardTitle, { color: titleColor }]}>{t(step.titleKey)}</Text>
          <Text style={[s.cardDesc,  { color: descColor  }]}>{t(step.descKey)}</Text>

          {/* Dots compactos — 13 pasos */}
          <View style={s.dotsRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  s.dot,
                  i === tourStep
                    ? [s.dotActive,   { backgroundColor: step.color }]
                    : [s.dotInactive, { backgroundColor: dotInactive }],
                ]}
              />
            ))}
          </View>

          <View style={s.btnRow}>
            <Pressable
              style={({ pressed }) => [s.skipBtn, { opacity: pressed ? 0.6 : 1 }]}
              onPress={skipTour}
              hitSlop={8}
            >
              <Text style={[s.skipBtnText, { color: descColor }]}>{t('onboarding_skip')}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.nextBtn,
                {
                  backgroundColor: step.color,
                  shadowColor: step.color,
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              onPress={isLast ? handleShowFinish : nextTourStep}
            >
              <Text style={s.nextBtnText}>
                {isLast ? t('onboarding_start') : `${t('onboarding_next')} →`}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Finish card */}
      {showFinish && (
        <Animated.View
          pointerEvents="auto"
          style={[
            s.finishCard,
            {
              backgroundColor: glassBg,
              borderColor: glassBorder,
              bottom: insets.bottom + 16,
              opacity: finishOpacity,
              transform: [{ translateY: finishSlideY }, { scale: finishScale }],
            },
          ]}
        >
          <View style={s.finishLogoArea}>
            <View style={[s.finishRingOuter, { borderColor: 'rgba(233,105,40,0.16)' }]}>
              <View style={[s.finishRingInner, { borderColor: 'rgba(233,105,40,0.30)' }]}>
                <View style={s.finishLogoBg}>
                  <Ionicons name="location" size={30} color="#fff" />
                </View>
              </View>
            </View>
          </View>

          <Text style={[s.finishAppName, { color: titleColor }]}>
            Guadalupe<Text style={{ color: '#E96928' }}>GO</Text>
          </Text>

          <View style={s.finishSloganRow}>
            <View style={[s.finishSloganLine, { backgroundColor: '#E96928' }]} />
            <Text style={[s.finishSlogan, { color: '#E96928' }]}>{t('onboarding_finish_tagline')}</Text>
            <View style={[s.finishSloganLine, { backgroundColor: '#E96928' }]} />
          </View>

          <Text style={[s.finishDesc, { color: descColor }]}>{t('onboarding_finish_desc')}</Text>

          <Pressable
            style={({ pressed }) => [s.finishBtn, { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={nextTourStep}
          >
            <Ionicons name="rocket-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={s.finishBtnText}>{t('onboarding_finish_btn')}</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
    zIndex: 9990,
    elevation: Platform.OS === 'android' ? 9990 : 0,
  },
  arrowWrap: {
    position: 'absolute',
    zIndex: 9996,
    elevation: Platform.OS === 'android' ? 9996 : 0,
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    position: 'absolute', left: 16, right: 16,
    borderWidth: 1.5, borderRadius: 28, padding: 22,
    zIndex: 9995,
    elevation: Platform.OS === 'android' ? 9995 : 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28, shadowRadius: 22,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  iconBadge: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3, flex: 1 },
  skipAllText: { fontSize: 12, fontWeight: '500' },
  cardTitle: { fontSize: 19, fontWeight: '800', marginBottom: 8, letterSpacing: -0.2 },
  cardDesc:  { fontSize: 14, lineHeight: 21, marginBottom: 18 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 18 },
  dot: { borderRadius: 99 },
  dotActive:   { width: 14, height: 6, borderRadius: 3 },
  dotInactive: { width: 5,  height: 5 },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skipBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  skipBtnText: { fontSize: 14, fontWeight: '500' },
  nextBtn: {
    borderRadius: 50, paddingVertical: 13, paddingHorizontal: 28,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.32, shadowRadius: 10, elevation: 6,
  },
  nextBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },

  // Finish card
  finishCard: {
    position: 'absolute', left: 16, right: 16,
    borderWidth: 1.5, borderRadius: 32,
    paddingHorizontal: 28, paddingTop: 32, paddingBottom: 28,
    zIndex: 9995,
    elevation: Platform.OS === 'android' ? 9995 : 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.30, shadowRadius: 26,
    alignItems: 'center',
  },
  finishLogoArea: { marginBottom: 20, alignItems: 'center' },
  finishRingOuter: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  finishRingInner: { width: 76, height: 76, borderRadius: 38, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  finishLogoBg: {
    width: 58, height: 58, borderRadius: 20, backgroundColor: '#E96928',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#E96928', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.50, shadowRadius: 16, elevation: 8,
  },
  finishAppName: { fontSize: 32, fontWeight: '900', letterSpacing: -0.8, marginBottom: 12, textAlign: 'center' },
  finishSloganRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, width: '100%', paddingHorizontal: 4 },
  finishSloganLine: { flex: 1, height: 1.5, borderRadius: 1, opacity: 0.35 },
  finishSlogan: { fontSize: 13, fontWeight: '800', letterSpacing: 1.8, textAlign: 'center', textTransform: 'uppercase' },
  finishDesc: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 26, paddingHorizontal: 4 },
  finishBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#E96928', borderRadius: 50, paddingVertical: 15, width: '100%',
    shadowColor: '#E96928', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 16, elevation: 8,
  },
  finishBtnText: { color: '#ffffff', fontSize: 17, fontWeight: '900', letterSpacing: 0.4 },
});

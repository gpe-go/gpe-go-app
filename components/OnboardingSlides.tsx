/**
 * TourGuide — recorrido guiado dentro de la app
 *
 * Se renderiza como overlay raíz encima del navegador de tabs.
 * En cada paso navega a la pestaña correspondiente y muestra
 * una tarjeta liquid-glass con flecha animada apuntando al feature.
 *
 * Pasos: 0=Home · 1=Directorio · 2=Explorar · 3=Eventos
 */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

// ── Definición de pasos ──────────────────────────────────────────────────────
interface TourStep {
  route: string;
  titleKey: string;
  descKey: string;
  arrowX: number;   // % desde el centro horizontal (-50..50)
  arrowY: number;   // % desde el centro vertical   (-50..50)
  arrowDir: 'up' | 'down';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const STEPS: TourStep[] = [
  {
    route: '/(tabs)/',
    titleKey: 'onboarding_tooltip_home_title',
    descKey: 'onboarding_tooltip_home_desc',
    arrowX: 0, arrowY: -16, arrowDir: 'up',
    icon: 'search-outline', color: '#E96928',
  },
  {
    route: '/(tabs)/directorio',
    titleKey: 'onboarding_tooltip_directorio_title',
    descKey: 'onboarding_tooltip_directorio_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'business-outline', color: '#8B5CF6',
  },
  {
    route: '/(tabs)/explorar',
    titleKey: 'onboarding_tooltip_explorar_title',
    descKey: 'onboarding_tooltip_explorar_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'compass-outline', color: '#10B981',
  },
  {
    route: '/(tabs)/eventos',
    titleKey: 'onboarding_tooltip_eventos_title',
    descKey: 'onboarding_tooltip_eventos_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'calendar-outline', color: '#F59E0B',
  },
];

const { width: W, height: H } = Dimensions.get('window');
const TOTAL = STEPS.length;

// ── Componente principal ─────────────────────────────────────────────────────
export default function TourGuide() {
  const { tourReady, tourActive, tourStep, nextTourStep, skipTour } = useOnboarding();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [contentVisible, setContentVisible] = useState(false);

  // Animated values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity    = useRef(new Animated.Value(0)).current;
  const cardSlideY     = useRef(new Animated.Value(32)).current;
  const cardScale      = useRef(new Animated.Value(0.93)).current;
  const arrowBounce    = useRef(new Animated.Value(0)).current;
  const bounceRef      = useRef<Animated.CompositeAnimation | null>(null);

  const step   = STEPS[tourStep] ?? STEPS[0];
  const isLast = tourStep === TOTAL - 1;

  // ── Navegar + mostrar tooltip al cambiar de paso ─────────────────────────
  useEffect(() => {
    if (!tourReady || !tourActive) return;

    // Reset card
    setContentVisible(false);
    cardOpacity.setValue(0);
    cardSlideY.setValue(32);
    cardScale.setValue(0.93);
    bounceRef.current?.stop();
    arrowBounce.setValue(0);

    // Navegar a la pestaña
    try { router.navigate(step.route as any); } catch { /* ignore */ }

    // Fade in overlay
    Animated.timing(overlayOpacity, {
      toValue: 1, duration: 300, useNativeDriver: true,
    }).start();

    // Mostrar card después de que la navegación se estabilice
    const delay = tourStep === 0 ? 950 : 480;
    const timer = setTimeout(() => {
      setContentVisible(true);

      Animated.parallel([
        Animated.timing(cardOpacity,  { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(cardSlideY,   { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
        Animated.spring(cardScale,    { toValue: 1, tension: 65, friction: 9, useNativeDriver: true }),
      ]).start();

      // Flecha animada (bounce loop)
      bounceRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(arrowBounce, { toValue: 11, duration: 540, useNativeDriver: true }),
          Animated.timing(arrowBounce, { toValue: 0,  duration: 540, useNativeDriver: true }),
        ])
      );
      bounceRef.current.start();
    }, delay);

    return () => { clearTimeout(timer); bounceRef.current?.stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStep, tourActive, tourReady]);

  // ── Ocultar overlay cuando el tour termina ──────────────────────────────
  useEffect(() => {
    if (!tourActive) {
      bounceRef.current?.stop();
      Animated.timing(overlayOpacity, {
        toValue: 0, duration: 220, useNativeDriver: true,
      }).start();
    }
  }, [tourActive, overlayOpacity]);

  if (!tourReady || !tourActive) return null;

  // ── Posición de la flecha ────────────────────────────────────────────────
  const arrowLeft  = W / 2 + (step.arrowX / 100) * W - 20;
  const arrowTop   = H / 2 + (step.arrowY / 100) * H - 20;
  const arrowDelta = step.arrowDir === 'down'
    ? arrowBounce
    : Animated.multiply(arrowBounce, new Animated.Value(-1));

  // ── Estilos adaptativos de la tarjeta glass ──────────────────────────────
  const glassBg     = isDark ? 'rgba(16,16,16,0.84)' : 'rgba(255,255,255,0.90)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.13)' : 'rgba(200,200,200,0.6)';
  const titleColor  = isDark ? '#ffffff' : '#111111';
  const descColor   = isDark ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.60)';
  const dotInactive = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.16)';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

      {/* Overlay semitransparente — el contenido de la app se ve detrás */}
      <Animated.View
        style={[s.overlay, { opacity: overlayOpacity }]}
        pointerEvents="auto"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={skipTour} />
      </Animated.View>

      {/* Flecha animada */}
      {contentVisible && (
        <Animated.View
          pointerEvents="none"
          style={[
            s.arrowWrap,
            { left: arrowLeft, top: arrowTop, transform: [{ translateY: arrowDelta }] },
          ]}
        >
          <Ionicons
            name={step.arrowDir === 'down' ? 'chevron-down' : 'chevron-up'}
            size={38}
            color={step.color}
          />
        </Animated.View>
      )}

      {/* Tarjeta liquid-glass */}
      {contentVisible && (
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
          {/* Cabecera: icono de sección + "Paso X de Y" + "Saltar todo" */}
          <View style={s.cardHeader}>
            <View style={[s.iconBadge, { backgroundColor: step.color + '1E', borderColor: step.color + '44' }]}>
              <Ionicons name={step.icon} size={19} color={step.color} />
            </View>

            <Text style={[s.stepLabel, { color: step.color }]}>
              {t('onboarding_step', { current: tourStep + 1, total: TOTAL })}
            </Text>

            <Pressable onPress={skipTour} hitSlop={12}>
              <Text style={[s.skipAllText, { color: descColor }]}>
                {t('onboarding_skip_all')}
              </Text>
            </Pressable>
          </View>

          {/* Título */}
          <Text style={[s.cardTitle, { color: titleColor }]}>
            {t(step.titleKey)}
          </Text>

          {/* Descripción */}
          <Text style={[s.cardDesc, { color: descColor }]}>
            {t(step.descKey)}
          </Text>

          {/* Puntos de progreso (el activo es una píldora alargada) */}
          <View style={s.dotsRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  s.dot,
                  i === tourStep
                    ? [s.dotActive, { backgroundColor: step.color }]
                    : [s.dotInactive, { backgroundColor: dotInactive }],
                ]}
              />
            ))}
          </View>

          {/* Botones */}
          <View style={s.btnRow}>
            <Pressable
              style={({ pressed }) => [s.skipBtn, { opacity: pressed ? 0.6 : 1 }]}
              onPress={skipTour}
              hitSlop={8}
            >
              <Text style={[s.skipBtnText, { color: descColor }]}>
                {t('onboarding_skip')}
              </Text>
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
              onPress={nextTourStep}
            >
              <Text style={s.nextBtnText}>
                {isLast ? t('onboarding_start') : `${t('onboarding_next')} →`}
              </Text>
            </Pressable>
          </View>
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderWidth: 1.5,
    borderRadius: 28,
    padding: 22,
    zIndex: 9995,
    elevation: Platform.OS === 'android' ? 9995 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },

  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
  },

  skipAllText: {
    fontSize: 12,
    fontWeight: '500',
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.2,
  },

  cardDesc: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 18,
  },

  dot: {
    borderRadius: 99,
  },

  dotActive: {
    width: 22,
    height: 8,
    borderRadius: 4,
  },

  dotInactive: {
    width: 8,
    height: 8,
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  skipBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },

  nextBtn: {
    borderRadius: 50,
    paddingVertical: 13,
    paddingHorizontal: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 6,
  },

  nextBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

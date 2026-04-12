/**
 * TourGuide — recorrido guiado dentro de la app
 *
 * Se renderiza como overlay raíz encima del navegador de tabs.
 * En cada paso navega a la pantalla correspondiente y muestra
 * una tarjeta liquid-glass con flecha animada apuntando al feature.
 * Al terminar, muestra una pantalla de cierre con branding GuadalupeGO.
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

// ── Definición de pasos ──────────────────────────────────────────────────────
interface TourStep {
  type: 'tab' | 'stack';
  route: string;
  titleKey: string;
  descKey: string;
  arrowX: number;   // offset px desde el centro horizontal
  arrowY: number;   // offset % desde el centro vertical
  arrowDir: 'up' | 'down';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const STEPS: TourStep[] = [
  {
    type: 'tab',
    route: '/(tabs)/',
    titleKey: 'onboarding_tooltip_home_title',
    descKey: 'onboarding_tooltip_home_desc',
    arrowX: 0, arrowY: -16, arrowDir: 'up',
    icon: 'home-outline', color: '#E96928',
  },
  {
    type: 'stack',
    route: '/(stack)/mapaCompleto',
    titleKey: 'onboarding_tooltip_mapaCompleto_title',
    descKey: 'onboarding_tooltip_mapaCompleto_desc',
    arrowX: 0, arrowY: 0, arrowDir: 'up',
    icon: 'map-outline', color: '#10B981',
  },
  {
    type: 'tab',
    route: '/(tabs)/noticias',
    titleKey: 'onboarding_tooltip_noticias_title',
    descKey: 'onboarding_tooltip_noticias_desc',
    arrowX: 0, arrowY: -18, arrowDir: 'up',
    icon: 'newspaper-outline', color: '#3B82F6',
  },
  {
    type: 'tab',
    route: '/(tabs)/directorio',
    titleKey: 'onboarding_tooltip_directorio_title',
    descKey: 'onboarding_tooltip_directorio_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'business-outline', color: '#8B5CF6',
  },
  {
    type: 'tab',
    route: '/(tabs)/explorar',
    titleKey: 'onboarding_tooltip_explorar_title',
    descKey: 'onboarding_tooltip_explorar_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'compass-outline', color: '#10B981',
  },
  {
    type: 'tab',
    route: '/(tabs)/eventos',
    titleKey: 'onboarding_tooltip_eventos_title',
    descKey: 'onboarding_tooltip_eventos_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'calendar-outline', color: '#F59E0B',
  },
  {
    type: 'tab',
    route: '/(tabs)/favoritos',
    titleKey: 'onboarding_tooltip_favoritos_title',
    descKey: 'onboarding_tooltip_favoritos_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'heart-outline', color: '#EF4444',
  },
  {
    type: 'tab',
    route: '/(tabs)/contacto',
    titleKey: 'onboarding_tooltip_contacto_title',
    descKey: 'onboarding_tooltip_contacto_desc',
    arrowX: 0, arrowY: -22, arrowDir: 'up',
    icon: 'mail-outline', color: '#0EA5E9',
  },
  {
    type: 'tab',
    route: '/(tabs)/',
    titleKey: 'onboarding_tooltip_barraLateral_title',
    descKey: 'onboarding_tooltip_barraLateral_desc',
    arrowX: -41, arrowY: -36, arrowDir: 'up',
    icon: 'menu-outline', color: '#E96928',
  },
  {
    type: 'stack',
    route: '/(stack)/notificaciones',
    titleKey: 'onboarding_tooltip_notificaciones_title',
    descKey: 'onboarding_tooltip_notificaciones_desc',
    arrowX: 0, arrowY: -16, arrowDir: 'up',
    icon: 'notifications-outline', color: '#F97316',
  },
  {
    type: 'stack',
    route: '/(stack)/perfil',
    titleKey: 'onboarding_tooltip_perfil_title',
    descKey: 'onboarding_tooltip_perfil_desc',
    arrowX: 0, arrowY: -18, arrowDir: 'up',
    icon: 'person-outline', color: '#6366F1',
  },
  {
    type: 'stack',
    route: '/(stack)/registrar-negocio',
    titleKey: 'onboarding_tooltip_registrarNegocio_title',
    descKey: 'onboarding_tooltip_registrarNegocio_desc',
    arrowX: 0, arrowY: -18, arrowDir: 'up',
    icon: 'storefront-outline', color: '#EC4899',
  },
  {
    type: 'stack',
    route: '/(stack)/configuracion',
    titleKey: 'onboarding_tooltip_configuracion_title',
    descKey: 'onboarding_tooltip_configuracion_desc',
    arrowX: 0, arrowY: -18, arrowDir: 'up',
    icon: 'settings-outline', color: '#64748B',
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
  const [showFinish, setShowFinish] = useState(false);

  // Tracks whether the current visible screen is a stack screen
  const currentStepTypeRef = useRef<'tab' | 'stack'>('tab');

  // Animated values — tooltip card
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity    = useRef(new Animated.Value(0)).current;
  const cardSlideY     = useRef(new Animated.Value(32)).current;
  const cardScale      = useRef(new Animated.Value(0.93)).current;
  const arrowBounce    = useRef(new Animated.Value(0)).current;
  const bounceRef      = useRef<Animated.CompositeAnimation | null>(null);

  // Animated values — finish card
  const finishOpacity = useRef(new Animated.Value(0)).current;
  const finishSlideY  = useRef(new Animated.Value(44)).current;
  const finishScale   = useRef(new Animated.Value(0.88)).current;

  const step   = STEPS[tourStep] ?? STEPS[0];
  const isLast = tourStep === TOTAL - 1;

  // ── Reset estado finish cuando el tour se reinicia ───────────────────────
  useEffect(() => {
    if (tourActive) {
      setShowFinish(false);
      currentStepTypeRef.current = 'tab';
      finishOpacity.setValue(0);
      finishSlideY.setValue(44);
      finishScale.setValue(0.88);
    }
  }, [tourActive, finishOpacity, finishSlideY, finishScale]);

  // ── Navegar + mostrar tooltip al cambiar de paso ─────────────────────────
  useEffect(() => {
    if (!tourReady || !tourActive || showFinish) return;

    const prevStep = tourStep > 0 ? STEPS[tourStep - 1] : null;
    const needsBack = prevStep?.type === 'stack';
    const currentStep = STEPS[tourStep] ?? STEPS[0];

    // Reset card
    setContentVisible(false);
    cardOpacity.setValue(0);
    cardSlideY.setValue(32);
    cardScale.setValue(0.93);
    bounceRef.current?.stop();
    arrowBounce.setValue(0);

    // Fade in overlay
    Animated.timing(overlayOpacity, {
      toValue: 1, duration: 300, useNativeDriver: true,
    }).start();

    const doNavigateAndAnimate = () => {
      currentStepTypeRef.current = currentStep.type;
      if (currentStep.type === 'tab') {
        try { router.navigate(currentStep.route as any); } catch { /* ignore */ }
      } else if (currentStep.type === 'stack') {
        try { router.push(currentStep.route as any); } catch { /* ignore */ }
      }

      // Delay: step 0 needs extra time; stack screens need extra time; others 480ms
      const delay = tourStep === 0 ? 950 : currentStep.type === 'stack' ? 680 : 480;

      cardTimer = setTimeout(() => {
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
    };

    let backTimer: ReturnType<typeof setTimeout>;
    let cardTimer: ReturnType<typeof setTimeout>;

    if (needsBack) {
      // Pop the previous stack screen before navigating to the new step
      try { router.back(); } catch { /* ignore */ }
      backTimer = setTimeout(doNavigateAndAnimate, 320);
    } else {
      doNavigateAndAnimate();
    }

    return () => {
      clearTimeout(backTimer!);
      clearTimeout(cardTimer!);
      bounceRef.current?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStep, tourActive, tourReady]);

  // ── Ocultar overlay cuando el tour termina ──────────────────────────────
  useEffect(() => {
    if (!tourActive) {
      bounceRef.current?.stop();
      // If we ended while a stack screen was showing, pop back to tabs
      if (currentStepTypeRef.current === 'stack') {
        setTimeout(() => { try { router.back(); } catch { /* ignore */ } }, 200);
      }
      Animated.timing(overlayOpacity, {
        toValue: 0, duration: 220, useNativeDriver: true,
      }).start();
    }
  }, [tourActive, overlayOpacity]);

  // ── Transición al finish card (último paso → pantalla final) ────────────
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
  }, [cardOpacity, finishOpacity, finishSlideY, finishScale]);

  if (!tourReady || !tourActive) return null;

  // ── Posición de la flecha ────────────────────────────────────────────────
  const arrowLeft  = W / 2 + (step.arrowX / 100) * W - 20;
  const arrowTop   = H / 2 + (step.arrowY / 100) * H - 20;
  const arrowDelta = step.arrowDir === 'down'
    ? arrowBounce
    : Animated.multiply(arrowBounce, new Animated.Value(-1));

  // ── Estilos adaptativos ──────────────────────────────────────────────────
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
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={showFinish ? nextTourStep : skipTour}
        />
      </Animated.View>

      {/* ── Flecha animada (solo en pasos normales) ─────────────────────── */}
      {contentVisible && !showFinish && (
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

      {/* ── Tarjeta liquid-glass (pasos normales) ───────────────────────── */}
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
          {/* Cabecera */}
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

          {/* Puntos de progreso — 13 dots compactos */}
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
              onPress={isLast ? handleShowFinish : nextTourStep}
            >
              <Text style={s.nextBtnText}>
                {isLast ? t('onboarding_start') : `${t('onboarding_next')} →`}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* ── Finish card — pantalla de cierre con branding ───────────────── */}
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
          {/* Logo con anillos decorativos */}
          <View style={s.finishLogoArea}>
            <View style={[s.finishRingOuter, { borderColor: 'rgba(233,105,40,0.16)' }]}>
              <View style={[s.finishRingInner, { borderColor: 'rgba(233,105,40,0.30)' }]}>
                <View style={s.finishLogoBg}>
                  <Ionicons name="location" size={30} color="#fff" />
                </View>
              </View>
            </View>
          </View>

          {/* Nombre app */}
          <Text style={[s.finishAppName, { color: titleColor }]}>
            Guadalupe<Text style={{ color: '#E96928' }}>GO</Text>
          </Text>

          {/* Slogan con líneas decorativas */}
          <View style={s.finishSloganRow}>
            <View style={[s.finishSloganLine, { backgroundColor: '#E96928' }]} />
            <Text style={[s.finishSlogan, { color: '#E96928' }]}>
              {t('onboarding_finish_tagline')}
            </Text>
            <View style={[s.finishSloganLine, { backgroundColor: '#E96928' }]} />
          </View>

          {/* Descripción */}
          <Text style={[s.finishDesc, { color: descColor }]}>
            {t('onboarding_finish_desc')}
          </Text>

          {/* Botón principal */}
          <Pressable
            style={({ pressed }) => [
              s.finishBtn,
              {
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Tooltip card ────────────────────────────────────────────────────────
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

  // 13 dots — smaller to keep row compact
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 18,
  },

  dot: {
    borderRadius: 99,
  },

  dotActive: {
    width: 14,
    height: 6,
    borderRadius: 3,
  },

  dotInactive: {
    width: 5,
    height: 5,
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

  // ── Finish card ──────────────────────────────────────────────────────────
  finishCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderWidth: 1.5,
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    zIndex: 9995,
    elevation: Platform.OS === 'android' ? 9995 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.30,
    shadowRadius: 26,
    alignItems: 'center',
  },

  finishLogoArea: {
    marginBottom: 20,
    alignItems: 'center',
  },

  finishRingOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  finishRingInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  finishLogoBg: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#E96928',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E96928',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.50,
    shadowRadius: 16,
    elevation: 8,
  },

  finishAppName: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: 12,
    textAlign: 'center',
  },

  finishSloganRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    width: '100%',
    paddingHorizontal: 4,
  },

  finishSloganLine: {
    flex: 1,
    height: 1.5,
    borderRadius: 1,
    opacity: 0.35,
  },

  finishSlogan: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  finishDesc: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 26,
    paddingHorizontal: 4,
  },

  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E96928',
    borderRadius: 50,
    paddingVertical: 15,
    width: '100%',
    shadowColor: '#E96928',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },

  finishBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});

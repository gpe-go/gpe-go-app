import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../src/context/OnboardingContext';

// ── Slide data ───────────────────────────────────────────────────────────────
interface SlideData {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  titleKey: string;
  descKey: string;
  isWelcome?: boolean;
  isLast?: boolean;
}

const SLIDES: SlideData[] = [
  {
    key: 'welcome',
    icon: 'location',
    color: '#E96928',
    titleKey: 'onboarding_welcome_title',
    descKey: 'onboarding_welcome_desc',
    isWelcome: true,
  },
  {
    key: 'slide_search',
    icon: 'search-outline',
    color: '#3B82F6',
    titleKey: 'onboarding_search_title',
    descKey: 'onboarding_search_desc',
  },
  {
    key: 'slide_directory',
    icon: 'business-outline',
    color: '#8B5CF6',
    titleKey: 'onboarding_directory_title',
    descKey: 'onboarding_directory_desc',
  },
  {
    key: 'slide_explore',
    icon: 'compass-outline',
    color: '#10B981',
    titleKey: 'onboarding_explore_title',
    descKey: 'onboarding_explore_desc',
  },
  {
    key: 'slide_events',
    icon: 'calendar-outline',
    color: '#F59E0B',
    titleKey: 'onboarding_events_title',
    descKey: 'onboarding_events_desc',
  },
  {
    key: 'slide_map',
    icon: 'map-outline',
    color: '#06B6D4',
    titleKey: 'onboarding_map_title',
    descKey: 'onboarding_map_desc',
  },
  {
    key: 'slide_favorites',
    icon: 'heart-outline',
    color: '#EF4444',
    titleKey: 'onboarding_favorites_title',
    descKey: 'onboarding_favorites_desc',
  },
  {
    key: 'slide_ready',
    icon: 'checkmark-circle-outline',
    color: '#E96928',
    titleKey: 'onboarding_ready_title',
    descKey: 'onboarding_ready_desc',
    isLast: true,
  },
];

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Main component ────────────────────────────────────────────────────────────
export default function OnboardingSlides() {
  const { showSlides, slidesReady, completeSlides } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(0);

  // Transition animation (per slide change)
  const transitionOpacity = useRef(new Animated.Value(1)).current;
  const transitionScale = useRef(new Animated.Value(1)).current;

  // Icon entrance animation
  const iconScale = useRef(new Animated.Value(0)).current;

  // Icon pulse glow (loop)
  const pulseScale = useRef(new Animated.Value(1)).current;

  // Icon float (up/down loop)
  const floatY = useRef(new Animated.Value(0)).current;

  // Decorative glow radials
  const glow1Opacity = useRef(new Animated.Value(0)).current;
  const glow2Opacity = useRef(new Animated.Value(0)).current;

  // Refs for loops so we can stop them when unmounting
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const floatLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const slide = SLIDES[currentIndex];

  // ── Start entrance animations when slide changes ──────────────────────────
  const startEntranceAnims = useCallback(() => {
    // Reset values
    iconScale.setValue(0);
    pulseScale.setValue(1);
    floatY.setValue(0);

    // Icon spring entrance
    Animated.spring(iconScale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Pulse loop
    pulseLoopRef.current?.stop();
    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.18,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoopRef.current.start();

    // Float loop
    floatLoopRef.current?.stop();
    floatLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -10,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    floatLoopRef.current.start();
  }, [iconScale, pulseScale, floatY]);

  // ── Glow radials entrance on first mount ─────────────────────────────────
  useEffect(() => {
    Animated.stagger(300, [
      Animated.timing(glow1Opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(glow2Opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, [glow1Opacity, glow2Opacity]);

  // ── Run entrance when index changes ──────────────────────────────────────
  useEffect(() => {
    startEntranceAnims();
    return () => {
      pulseLoopRef.current?.stop();
      floatLoopRef.current?.stop();
    };
  }, [currentIndex, startEntranceAnims]);

  // ── Slide transition helper ───────────────────────────────────────────────
  const animateTransition = useCallback(
    (callback: () => void) => {
      Animated.parallel([
        Animated.timing(transitionOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(transitionScale, {
          toValue: 0.95,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start(() => {
        callback();
        transitionOpacity.setValue(0);
        transitionScale.setValue(0.95);
        Animated.parallel([
          Animated.timing(transitionOpacity, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(transitionScale, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [transitionOpacity, transitionScale]
  );

  const goNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      animateTransition(() => setCurrentIndex((i) => i + 1));
    } else {
      completeSlides();
    }
  }, [currentIndex, animateTransition, completeSlides]);

  const skipAll = useCallback(() => {
    completeSlides();
  }, [completeSlides]);

  const skipCurrent = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      animateTransition(() => setCurrentIndex((i) => i + 1));
    } else {
      completeSlides();
    }
  }, [currentIndex, animateTransition, completeSlides]);

  // Don't render until storage is loaded, and only when slides should show
  if (!slidesReady || !showSlides) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full screen dark gradient background */}
      <View style={s.bg}>
        {/* Gradient layers simulated with overlapping views */}
        <View style={[s.bgLayer, { backgroundColor: '#1a1a2e' }]} />
        <View style={[s.bgLayer, { backgroundColor: '#16213e', opacity: 0.85 }]} />
        <View style={[s.bgLayer, { backgroundColor: '#0f3460', opacity: 0.45 }]} />

        {/* Decorative animated radial glows */}
        <Animated.View
          style={[
            s.glowCircle,
            s.glowCircle1,
            { opacity: Animated.multiply(glow1Opacity, new Animated.Value(0.18)) },
          ]}
        />
        <Animated.View
          style={[
            s.glowCircle,
            s.glowCircle2,
            { opacity: Animated.multiply(glow2Opacity, new Animated.Value(0.12)) },
          ]}
        />

        {/* Skip all — only on first slide */}
        {currentIndex === 0 && (
          <Pressable
            style={[s.skipAllBtn, { top: insets.top + 16 }]}
            onPress={skipAll}
            hitSlop={12}
          >
            <Text style={s.skipAllText}>{t('onboarding_skip_all')}</Text>
          </Pressable>
        )}

        {/* Content area */}
        <Animated.View
          style={[
            s.contentArea,
            {
              opacity: transitionOpacity,
              transform: [{ scale: transitionScale }],
              paddingTop: insets.top + 60,
            },
          ]}
        >
          {/* Icon area */}
          <View style={s.iconArea}>
            {/* Pulse glow ring */}
            <Animated.View
              style={[
                s.pulseRing,
                {
                  backgroundColor: slide.color + '22',
                  borderColor: slide.color + '55',
                  transform: [{ scale: pulseScale }],
                },
              ]}
            />

            {/* Icon with float + scale entrance */}
            <Animated.View
              style={[
                s.iconWrapper,
                {
                  backgroundColor: slide.color + '20',
                  borderColor: slide.color + '40',
                  transform: [{ scale: iconScale }, { translateY: floatY }],
                },
              ]}
            >
              <Ionicons name={slide.icon} size={72} color={slide.color} />
            </Animated.View>

            {/* Welcome branding text */}
            {slide.isWelcome && (
              <Animated.View style={[s.brandingWrap, { opacity: iconScale }]}>
                <Text style={s.brandingText}>
                  Guadalupe<Text style={{ color: '#E96928' }}>GO</Text>
                </Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Bottom glass card */}
        <Animated.View
          style={[
            s.glassCard,
            { marginBottom: insets.bottom + 12, opacity: transitionOpacity },
          ]}
        >
          <Text style={s.cardTitle}>{t(slide.titleKey)}</Text>
          <Text style={s.cardDesc}>{t(slide.descKey)}</Text>

          {/* Progress dots */}
          <View style={s.dotsRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  s.dot,
                  i === currentIndex ? s.dotActive : s.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Button row */}
          <View style={s.btnRow}>
            {/* Skip button — left */}
            {!slide.isLast && (
              <Pressable
                style={({ pressed }) => [s.skipBtn, { opacity: pressed ? 0.65 : 1 }]}
                onPress={skipCurrent}
                hitSlop={8}
              >
                <Text style={s.skipBtnText}>{t('onboarding_skip')}</Text>
              </Pressable>
            )}

            {slide.isLast ? (
              /* Full-width orange CTA on last slide */
              <Pressable
                style={({ pressed }) => [
                  s.startBtn,
                  { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
                ]}
                onPress={goNext}
              >
                <Text style={s.startBtnText}>{t('onboarding_start')}</Text>
              </Pressable>
            ) : (
              /* Next glass pill button — right */
              <Pressable
                style={({ pressed }) => [
                  s.nextBtn,
                  { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
                onPress={goNext}
              >
                <Text style={s.nextBtnText}>{t('onboarding_next')} →</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  bg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: Platform.OS === 'android' ? 9999 : 0,
  },

  bgLayer: {
    ...StyleSheet.absoluteFillObject,
  },

  glowCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: '#E96928',
  },

  glowCircle1: {
    width: SCREEN_W * 1.2,
    height: SCREEN_W * 1.2,
    top: -SCREEN_W * 0.5,
    left: -SCREEN_W * 0.1,
  },

  glowCircle2: {
    width: SCREEN_W * 0.8,
    height: SCREEN_W * 0.8,
    bottom: SCREEN_H * 0.1,
    right: -SCREEN_W * 0.3,
  },

  skipAllBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  skipAllText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },

  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
  },

  iconWrapper: {
    width: 130,
    height: 130,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 14,
  },

  brandingWrap: {
    marginTop: 24,
    alignItems: 'center',
  },

  brandingText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },

  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 28,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },

  cardTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  cardDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },

  dot: {
    borderRadius: 99,
  },

  dotActive: {
    width: 10,
    height: 10,
    backgroundColor: '#ffffff',
  },

  dotInactive: {
    width: 7,
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  skipBtnText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    fontWeight: '500',
  },

  nextBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },

  nextBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  startBtn: {
    flex: 1,
    backgroundColor: '#E96928',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#E96928',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },

  startBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

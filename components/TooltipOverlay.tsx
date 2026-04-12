import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
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
import { useTheme } from '../src/context/ThemeContext';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface TooltipOverlayProps {
  visible: boolean;
  title: string;
  description: string;
  arrowDirection: 'up' | 'down';
  /** Percentage offset from center: x in [-50,50], y in [-50,50] */
  arrowOffset: { x: number; y: number };
  onNext: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function TooltipOverlay({
  visible,
  title,
  description,
  arrowDirection,
  arrowOffset,
  onNext,
  onSkip,
  currentStep,
  totalSteps,
}: TooltipOverlayProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  // Overlay entrance
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  // Bubble entrance
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(0.88)).current;
  // Arrow bounce loop
  const arrowBounce = useRef(new Animated.Value(0)).current;

  const bounceLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      // Fade in overlay + bubble
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(bubbleScale, {
          toValue: 1,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();

      // Arrow bounce loop
      arrowBounce.setValue(0);
      bounceLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(arrowBounce, {
            toValue: 10,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(arrowBounce, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      bounceLoopRef.current.start();
    } else {
      bounceLoopRef.current?.stop();
      overlayOpacity.setValue(0);
      bubbleOpacity.setValue(0);
      bubbleScale.setValue(0.88);
    }

    return () => {
      bounceLoopRef.current?.stop();
    };
  }, [visible, overlayOpacity, bubbleOpacity, bubbleScale, arrowBounce]);

  if (!visible) return null;

  // Arrow translation: up means arrow points up (chevron-up), so it bounces upward
  const arrowTranslateY = arrowDirection === 'down'
    ? arrowBounce
    : Animated.multiply(arrowBounce, new Animated.Value(-1));

  // Arrow position: offset from screen center
  const arrowLeft = SCREEN_W / 2 + (arrowOffset.x / 100) * SCREEN_W - 16;
  const arrowTop = SCREEN_H / 2 + (arrowOffset.y / 100) * SCREEN_H - 16;

  const glassStyle = isDark
    ? {
        backgroundColor: 'rgba(20,20,20,0.75)',
        borderColor: 'rgba(255,255,255,0.12)',
      }
    : {
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderColor: 'rgba(255,255,255,0.9)',
      };

  const titleColor = isDark ? '#ffffff' : '#1a1a1a';
  const descColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const dotActiveColor = '#E96928';
  const dotInactiveColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Semi-transparent overlay */}
      <Animated.View
        style={[s.overlay, { opacity: overlayOpacity }]}
        pointerEvents="auto"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onSkip} />
      </Animated.View>

      {/* Animated arrow */}
      <Animated.View
        style={[
          s.arrowWrap,
          {
            left: arrowLeft,
            top: arrowTop,
            transform: [{ translateY: arrowTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        <Ionicons
          name={arrowDirection === 'down' ? 'chevron-down' : 'chevron-up'}
          size={32}
          color="#E96928"
        />
      </Animated.View>

      {/* Glass tooltip bubble */}
      <Animated.View
        style={[
          s.bubble,
          glassStyle,
          {
            opacity: bubbleOpacity,
            transform: [{ scale: bubbleScale }],
          },
        ]}
        pointerEvents="auto"
      >
        {/* Title */}
        <Text style={[s.bubbleTitle, { color: titleColor }]}>{title}</Text>

        {/* Description */}
        <Text style={[s.bubbleDesc, { color: descColor }]}>{description}</Text>

        {/* Progress dots */}
        <View style={s.dotsRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                s.dot,
                i === currentStep
                  ? [s.dotActive, { backgroundColor: dotActiveColor }]
                  : [s.dotInactive, { backgroundColor: dotInactiveColor }],
              ]}
            />
          ))}
        </View>

        {/* Button row */}
        <View style={s.btnRow}>
          <Pressable
            style={({ pressed }) => [s.skipBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={onSkip}
            hitSlop={8}
          >
            <Text style={[s.skipBtnText, { color: descColor }]}>
              {t('onboarding_skip')}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              s.gotItBtn,
              { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
            onPress={onNext}
          >
            <Text style={s.gotItBtnText}>{t('onboarding_got_it')} ✓</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 9998,
    elevation: Platform.OS === 'android' ? 9998 : 0,
  },

  arrowWrap: {
    position: 'absolute',
    zIndex: 9999,
    elevation: Platform.OS === 'android' ? 9999 : 0,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bubble: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: '18%',
    borderWidth: 1.5,
    borderRadius: 28,
    padding: 24,
    zIndex: 9999,
    elevation: Platform.OS === 'android' ? 9999 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },

  bubbleTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.2,
  },

  bubbleDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },

  dot: {
    borderRadius: 99,
  },

  dotActive: {
    width: 10,
    height: 10,
  },

  dotInactive: {
    width: 7,
    height: 7,
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  skipBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },

  gotItBtn: {
    backgroundColor: '#E96928',
    borderRadius: 50,
    paddingVertical: 11,
    paddingHorizontal: 24,
    shadowColor: '#E96928',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  gotItBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

export default function Welcome() {
  const router = useRouter();

  // Animaciones
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(0.7)).current;
  const slideAnim   = useRef(new Animated.Value(30)).current;
  const dotAnim1    = useRef(new Animated.Value(0.3)).current;
  const dotAnim2    = useRef(new Animated.Value(0.3)).current;
  const dotAnim3    = useRef(new Animated.Value(0.3)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // ── Secuencia de entrada ──────────────────────────
    Animated.sequence([
      // 1. Logo aparece con scale
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]),
      // 2. Texto sube
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    // ── Pulse del ícono ────────────────────────────────
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // ── Dots de carga ──────────────────────────────────
    const animateDots = () => {
      const dot = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1,   duration: 400, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ])
        );
      Animated.parallel([
        dot(dotAnim1, 0),
        dot(dotAnim2, 200),
        dot(dotAnim3, 400),
      ]).start();
    };
    animateDots();

    // ── Navegar después de 2.8s ────────────────────────
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 2800);

    return () => clearTimeout(timer);
  }, [router, fadeAnim, scaleAnim, slideAnim, pulseAnim, dotAnim1, dotAnim2, dotAnim3]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#E96928', '#c4511a', '#9c3a10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Círculos decorativos de fondo */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />
      <View style={styles.circle4} />

      {/* ── LOGO ── */}
      <Animated.View style={[
        styles.logoWrap,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}>
        <Animated.View style={[styles.logoIconBg, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="location" size={42} color="#E96928" />
        </Animated.View>
      </Animated.View>

      {/* ── TEXTO ── */}
      <Animated.View style={[
        styles.textBlock,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
        <Text style={styles.appName}>
          Guadalupe<Text style={styles.appNameAccent}>GO</Text>
        </Text>
        <Text style={styles.tagline}>Tu guía turística de Guadalupe, NL</Text>
      </Animated.View>

      {/* ── DOTS de carga ── */}
      <Animated.View style={[styles.dotsRow, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.dot, { opacity: dotAnim1 }]} />
        <Animated.View style={[styles.dot, { opacity: dotAnim2 }]} />
        <Animated.View style={[styles.dot, { opacity: dotAnim3 }]} />
      </Animated.View>

      {/* ── Footer ── */}
      <Animated.Text style={[styles.footer, { opacity: fadeAnim }]}>
        v1.0.2 · 2026
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Círculos decorativos ───────────────────────────────
  circle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -80,
  },
  circle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -50, left: -60,
  },
  circle3: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)', top: 100, left: 30,
  },
  circle4: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: 140, right: 40,
  },

  // ── Logo ──────────────────────────────────────────────
  logoWrap: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoIconBg: {
    width: 110, height: 110, borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3, shadowRadius: 20,
    elevation: 16,
  },

  // ── Texto ─────────────────────────────────────────────
  textBlock: { alignItems: 'center', marginBottom: 60 },
  appName: {
    fontSize: 42, fontWeight: '900',
    color: '#fff', letterSpacing: -1.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appNameAccent: { color: 'rgba(255,255,255,0.6)' },
  tagline: {
    fontSize: 15, color: 'rgba(255,255,255,0.75)',
    marginTop: 8, fontWeight: '500', letterSpacing: 0.2,
  },

  // ── Dots ──────────────────────────────────────────────
  dotsRow: {
    flexDirection: 'row', gap: 10,
    position: 'absolute', bottom: 80,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  // ── Footer ────────────────────────────────────────────
  footer: {
    position: 'absolute', bottom: 40,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12, fontWeight: '600', letterSpacing: 0.5,
  },
});

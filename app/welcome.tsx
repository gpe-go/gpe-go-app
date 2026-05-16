import { useEffect, useRef } from "react";
import { Animated, ImageBackground, StyleSheet, View } from 'react-native';
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";

// Imagen oficial del splash (corona + Guadalupe GO sobre naranja).
// Provista por el municipio — no se altera, se usa tal cual.
const SPLASH_BG = require("../assets/images/gpego-splash.png");

export default function Welcome() {
  const router = useRouter();

  // Animaciones — solo dots de carga y fade-in suave de la versión.
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const dotAnim1  = useRef(new Animated.Value(0.3)).current;
  const dotAnim2  = useRef(new Animated.Value(0.3)).current;
  const dotAnim3  = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Ocultar el splash nativo justo cuando welcome.tsx ya está
    // montado. Splash nativo y welcome.tsx comparten el mismo naranja
    // #F97613, así que la transición es imperceptible.
    SplashScreen.hideAsync().catch(() => {});

    // Fade-in de los puntitos y de la versión.
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Loop de los puntitos de carga (parpadean escalonadamente).
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

    // Navegar al home después de 2.8s.
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 2800);

    return () => clearTimeout(timer);
  }, [router, fadeAnim, dotAnim1, dotAnim2, dotAnim3]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Imagen oficial del splash a pantalla completa. */}
      <ImageBackground
        source={SPLASH_BG}
        resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
      />

      {/* Dots de carga */}
      <Animated.View style={[styles.dotsRow, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.dot, { opacity: dotAnim1 }]} />
        <Animated.View style={[styles.dot, { opacity: dotAnim2 }]} />
        <Animated.View style={[styles.dot, { opacity: dotAnim3 }]} />
      </Animated.View>

      {/* Versión */}
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
    // Mismo naranja que el splash nativo para que NO haya frame
    // en blanco al transicionar del splash a esta pantalla.
    backgroundColor: '#F97613',
  },

  // Dots de carga — pegados abajo, encima del footer de versión.
  dotsRow: {
    flexDirection: 'row', gap: 10,
    position: 'absolute', bottom: 80,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },

  // Versión — debajo de los puntitos, color claro sobre el naranja.
  footer: {
    position: 'absolute', bottom: 40,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12, fontWeight: '600', letterSpacing: 0.5,
  },
});

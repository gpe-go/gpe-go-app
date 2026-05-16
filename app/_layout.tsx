import { Stack } from "expo-router";
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { FavoritosProvider } from '../src/context/FavoritosContext';
import { NotificacionesProvider } from '../src/context/NotificacionesContext';
import { OnboardingProvider } from '../src/context/OnboardingContext';
import OnboardingSlides from '../components/OnboardingSlides';
import { AlertHost } from '../components/Alert';
import { useMuseoFonts } from '../src/fonts';
import '../src/i18n/i18n';

// El maxFontSizeMultiplier=1.2 (limitar escalado de accesibilidad)
// ahora vive como default prop dentro del wrapper Text/TextInput en
// components/Text.tsx — defaultProps ya no funciona en function
// components de React 19, así que es la forma correcta de hacerlo.

export default function RootLayout() {
  // Cargamos las 4 variantes de Museo. Mientras cargan (~50ms en cold
  // start) el render usa la fontFamily del sistema como fallback. Para
  // evitar el "flash" de texto sin tipografía, esperamos a `loaded`
  // antes de renderizar el árbol.
  const fontsLoaded = useMuseoFonts();
  if (!fontsLoaded) return null;

  return (
    <OnboardingProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificacionesProvider>
            <FavoritosProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                }}
              >
                <Stack.Screen name="welcome"    options={{ animation: 'fade' }} />
                <Stack.Screen name="(tabs)"     options={{ animation: 'none' }} />
                <Stack.Screen name="login"             options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="categorias/[tipo]" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="lugar/[id]"        options={{ animation: 'slide_from_right' }} />
              </Stack>
              <OnboardingSlides />
              <AlertHost />
            </FavoritosProvider>
          </NotificacionesProvider>
        </AuthProvider>
      </ThemeProvider>
    </OnboardingProvider>
  );
}

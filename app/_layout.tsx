import { Stack } from "expo-router";
import { Text } from 'react-native';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { FavoritosProvider } from '../src/context/FavoritosContext';
import { NotificacionesProvider } from '../src/context/NotificacionesContext';
import { OnboardingProvider } from '../src/context/OnboardingContext';
import OnboardingSlides from '../components/OnboardingSlides';
import '../src/i18n/i18n';

// Limitar el escalado de fuentes del sistema a 1.2x máximo
// para que las letras grandes de accesibilidad no rompan los layouts
// @ts-ignore
if (!Text.defaultProps) Text.defaultProps = {};
// @ts-ignore
Text.defaultProps.maxFontSizeMultiplier = 1.2;

export default function RootLayout() {
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
                <Stack.Screen name="registrar-negocio" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="categorias/[tipo]" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="lugar/[id]"        options={{ animation: 'slide_from_right' }} />
              </Stack>
              <OnboardingSlides />
            </FavoritosProvider>
          </NotificacionesProvider>
        </AuthProvider>
      </ThemeProvider>
    </OnboardingProvider>
  );
}

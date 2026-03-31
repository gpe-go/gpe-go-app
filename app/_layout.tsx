import { Stack } from "expo-router";
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { FavoritosProvider } from '../src/context/FavoritosContext';
import { ReseñasProvider } from '../src/context/ReseñasContext';
import '../src/i18n/i18n';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritosProvider>
          <ReseñasProvider>
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
              <Stack.Screen name="login"      options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="registrar-negocio" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="categorias/[tipo]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="lugar/[id]"        options={{ animation: 'slide_from_right' }} />
              <Stack.Screen
                name="(stack)/perfil"
                options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureDirection: 'vertical' }}
              />
              <Stack.Screen
                name="(stack)/configuracion"
                options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureDirection: 'vertical' }}
              />
            </Stack>
          </ReseñasProvider>
        </FavoritosProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

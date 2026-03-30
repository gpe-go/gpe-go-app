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
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="welcome" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </ReseñasProvider>
        </FavoritosProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

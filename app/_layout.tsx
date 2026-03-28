import { Stack } from "expo-router";
import { ThemeProvider } from '../src/context/ThemeContext';
import { FavoritosProvider } from '../src/context/FavoritosContext';
import '../src/i18n/i18n';

export default function RootLayout() {
  return (
    <ThemeProvider>
      {/* 2. Envuelve el Stack con FavoritosProvider */}
      <FavoritosProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="(tabs)" />
          {/* Aquí es donde viven categorias/[tipo] y lugar/[id] internamente */}
        </Stack>
      </FavoritosProvider>
    </ThemeProvider>
  );
}
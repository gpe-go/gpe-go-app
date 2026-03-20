import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { FavoritosProvider } from '../src/context/FavoritosContext';
import '../src/i18n/i18n';

function RootStack() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <FavoritosProvider>
        <RootStack />
      </FavoritosProvider>
    </ThemeProvider>
  );
}
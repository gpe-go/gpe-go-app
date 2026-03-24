import { Stack } from "expo-router";
// import { useEffect } from "react";
// import * as Notifications from "expo-notifications";
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { FavoritosProvider } from '../src/context/FavoritosContext';
import { ReseñasProvider } from '../src/context/ReseñasContext';
import '../src/i18n/i18n';

// ─── Descomentar cuando se haga el build final ──────────
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

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

  // ─── Descomentar cuando se haga el build final ────────
  // useEffect(() => {
  //   const pedirPermisoNotificaciones = async () => {
  //     const { status: statusActual } = await Notifications.getPermissionsAsync();
  //     if (statusActual === 'undetermined') {
  //       const { status } = await Notifications.requestPermissionsAsync();
  //       if (status !== 'granted') {
  //         console.log('El usuario no permitió notificaciones.');
  //       }
  //     }
  //   };
  //   pedirPermisoNotificaciones();
  // }, []);

  return (
    <ThemeProvider>
      <FavoritosProvider>
        <ReseñasProvider>
          <RootStack />
        </ReseñasProvider>
      </FavoritosProvider>
    </ThemeProvider>
  );
}
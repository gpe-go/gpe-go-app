import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { FavoritosProvider }       from "../src/context/FavoritosContext";
import { ReseñasProvider }         from "../src/context/ReseñasContext";
import { ConfigProvider }          from "../src/context/ConfigContext";
import '../src/i18n/i18n';

function RootStack() {
  const { colors, isDark, isLoading } = useTheme();
  if (isLoading) return null;

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown:       false,
          animation:         "fade",
          animationDuration: 300,
          contentStyle:      { backgroundColor: colors.background },
          gestureEnabled:    true,
        }}
      >
        <Stack.Screen
          name="welcome"
          options={{
            animation:      "fade",
            gestureEnabled: false,
            contentStyle:   { backgroundColor: "#E96928" },
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            animation:      "fade",
            gestureEnabled: false,
            contentStyle:   { backgroundColor: colors.background },
          }}
        />
        {/* Estas rutas existen en la raíz de app/ */}
        <Stack.Screen name="codigo"       options={{ animation: "slide_from_right",  gestureEnabled: true,  contentStyle: { backgroundColor: colors.background } }} />
        <Stack.Screen name="login"        options={{ animation: "slide_from_right",  gestureEnabled: true,  contentStyle: { backgroundColor: colors.background } }} />
        <Stack.Screen name="lugar"        options={{ animation: "slide_from_right",  gestureEnabled: true,  contentStyle: { backgroundColor: colors.background } }} />
        <Stack.Screen name="modal"        options={{ animation: "slide_from_bottom", gestureEnabled: true,  contentStyle: { backgroundColor: colors.background } }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ConfigProvider>
            <FavoritosProvider>
              <ReseñasProvider>
                <RootStack />
              </ReseñasProvider>
            </FavoritosProvider>
          </ConfigProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });

// ─── Descomentar para build final ─────────────────────
// import * as Notifications from "expo-notifications";
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert:  true,
//     shouldPlaySound:  true,
//     shouldSetBadge:   false,
//     shouldShowBanner: true,
//     shouldShowList:   true,
//   }),
// });

  // ── Descomentar para push notifications en build final ─
  // useEffect(() => {
  //   (async () => {
  //     const { status } = await Notifications.getPermissionsAsync();
  //     if (status === "undetermined") {
  //       await Notifications.requestPermissionsAsync();
  //     }
  //   })();
  // }, []);
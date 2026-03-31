import { Stack } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

export default function StackLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown:       false,
        animation:         "slide_from_right",
        contentStyle:      { backgroundColor: colors.background },
        gestureEnabled:    true,
        gestureDirection:  "horizontal",
        animationDuration: 280,
        presentation:      "card",
      }}
    >
      <Stack.Screen
        name="detalleLugar"
        options={{ animation: "slide_from_right", gestureEnabled: true, contentStyle: { backgroundColor: colors.background } }}
      />
      <Stack.Screen
        name="detalleEvento"
        options={{ animation: "slide_from_bottom", gestureEnabled: true, gestureDirection: "vertical", contentStyle: { backgroundColor: colors.background } }}
      />
      <Stack.Screen
        name="detalleNoticia"
        options={{ animation: "slide_from_right", gestureEnabled: true, contentStyle: { backgroundColor: colors.background } }}
      />
      <Stack.Screen
        name="editarPerfil"
        options={{ animation: "slide_from_right", gestureEnabled: true, contentStyle: { backgroundColor: colors.background } }}
      />
    </Stack>
  );
}
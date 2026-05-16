import { Redirect } from "expo-router";

// Ruta raíz: redirige siempre a /welcome para que la animación de
// bienvenida (logo + slogan + puntitos de carga) se muestre tanto
// en Expo Go como en el APK. Sin este archivo, Expo Router no tenía
// una ruta inicial garantizada y el splash nativo podía quedarse
// atorado en Android sin pasar nunca a welcome.tsx.
export default function Index() {
  return <Redirect href="/welcome" />;
}

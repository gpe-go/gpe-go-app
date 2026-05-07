// ============================================================
//  GuadalupeGO — Configuración de la app (Expo)
//
//  ANTES DE PUBLICAR EN TIENDAS, completa las secciones
//  marcadas con  ← PENDIENTE  con los datos del municipio.
// ============================================================

// API Key oficial de Google Maps proporcionada por el municipio.
// Es la misma para iOS y Android (confirmado por el ingeniero).
// La seguridad de esta key se controla en Google Cloud Console
// restringiendo por Bundle ID (iOS) + SHA-1 del firmado (Android).
// Se puede sobreescribir con la variable de entorno GOOGLE_MAPS_API_KEY.
const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ?? "AIzaSyADD8zRXUdokHP_CvyxOtkh50T6DtMVrww";

module.exports = {
  expo: {
    name: "GuadalupeGo",
    slug: "GuadalupeGo",
    owner: "ricky-99",
    version: "1.0.2",
    orientation: "portrait",
    icon: "././assets/images/icon.png",
    scheme: "guadalupego",
    userInterfaceStyle: "automatic",

    // ── iOS ─────────────────────────────────────────────────
    ios: {
      supportsTablet: true,

      // ← PENDIENTE: reemplaza con el Bundle ID que te asigne
      //   Apple Developer (ej. com.municipio.guadalupego)
      bundleIdentifier: "com.guadalupego.app",

      // ← PENDIENTE: incrementa en 1 cada vez que subas una
      //   nueva versión al App Store (formato string)
      buildNumber: "1",

      // Google Maps API Key para iOS (proporcionada por el municipio).
      config: {
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },

      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "GuadalupeGo usa tu ubicación para mostrar restaurantes, lugares turísticos y eventos cercanos.",
      },
    },

    // ── Android ─────────────────────────────────────────────
    android: {
      package: "com.guadalupego.app",
      permissions: ["ACCESS_FINE_LOCATION"],

      // ← PENDIENTE: incrementa en 1 cada vez que subas una
      //   nueva versión a Google Play (número entero)
      versionCode: 1,

      config: {
        googleMaps: {
          // Google Maps API Key para Android (la misma que iOS).
          apiKey: GOOGLE_MAPS_API_KEY,
        },
      },

      // Icono adaptativo (Android 8+). Usamos icon-adaptive.png que es
      // icon.png con 162px de padding naranja por cada lado, así el logo
      // queda en el 66% interior (safe area) y no se corta cuando Android
      // recorta el ícono al shape del dispositivo.
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon-adaptive.png",
        backgroundColor: "#E96928",
      },

      predictiveBackGestureEnabled: false,
    },

    // ── Web (Expo Go / preview) ──────────────────────────────
    web: {
      output: "static",
      favicon: "./assets/images/icon.png",
    },

    // ── Plugins ─────────────────────────────────────────────
    plugins: [
      "expo-router",

      [
        "expo-splash-screen",
        {
          // Splash con imagen 100% naranja sólida (sin contenido visible).
          // El plugin expo-splash-screen REQUIERE una imagen, así que usamos
          // un PNG naranja sólido para que se vea solo el fondo. Después
          // welcome.tsx aparece con sus animaciones (puntitos + logo + slogan).
          image: "./assets/images/splash-blank.png",
          resizeMode: "cover",
          backgroundColor: "#E96928",
        },
      ],

      "expo-video",

      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png",
          color: "#E96928",
          sounds: [],
        },
      ],

      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "GuadalupeGo necesita tu ubicación para mostrarte lugares cercanos.",
        },
      ],

      "expo-web-browser",
    ],

    // ── Experimental ────────────────────────────────────────
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    // ── EAS (Expo Application Services) ─────────────────────
    // ID del proyecto en https://expo.dev/accounts/ricky-99/projects/GuadalupeGo
    // Se usa para builds, credentials, OTA updates, etc.
    extra: {
      eas: {
        projectId: "c02fdccf-04f3-45af-b9ce-e923f379e3a5",
      },
    },
  },
};

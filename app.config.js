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

      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "././assets/images/android-icon-foreground.png",
        backgroundImage: "././assets/images/android-icon-background.png",
        monochromeImage: "././assets/images/android-icon-monochrome.png",
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
          image: "././assets/images/splash-screen1.png",
          resizeMode: "contain",
          backgroundColor: "#F37021",
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
  },
};

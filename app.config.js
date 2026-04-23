// ============================================================
//  GuadalupeGO — Configuración de la app (Expo)
//
//  ANTES DE PUBLICAR EN TIENDAS, completa las secciones
//  marcadas con  ← PENDIENTE  con los datos del municipio.
// ============================================================

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
          // ← PENDIENTE: reemplaza con la API Key de Google Maps
          //   que te proporcione el municipio o que obtengas en
          //   https://console.cloud.google.com
          //   (habilita "Maps SDK for Android" en la consola)
          apiKey: process.env.GOOGLE_MAPS_API_KEY ?? "GOOGLE_MAPS_API_KEY_PENDIENTE",
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
    ],

    // ── Experimental ────────────────────────────────────────
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};

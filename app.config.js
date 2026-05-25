// ============================================================
//  GuadalupeGO — Configuración de la app (Expo)
//
//  ANTES DE PUBLICAR EN TIENDAS, completa las secciones
//  marcadas con  ← PENDIENTE  con los datos del municipio.
// ============================================================

// API Keys de Google Maps proporcionadas por el municipio.
// El ingeniero generó keys SEPARADAS por plataforma para que cada una
// tenga su propia restricción en Google Cloud Console:
//
//   • Android  → restringida por package name + SHA-1 del firmado APK
//   • iOS      → restringida por Bundle Identifier   (⏳ PENDIENTE)
//   • Web      → restringida al subdominio go.guadalupe.gob.mx
//                (NO se usa en esta app — vive del lado del backend)
//
// ⚠️ iOS PENDIENTE: cuando el ingeniero entregue la key específica de
// iOS con restricción por Bundle ID `com.guadalupego.app`, reemplazar
// el string vacío de GOOGLE_MAPS_API_KEY_IOS por la nueva key.
//
// Mientras tanto en iOS:
//   • Expo Go    → los mapas funcionan (Expo usa sus propias credenciales)
//   • Build IPA  → los mapas saldrán en gris hasta tener la key
const GOOGLE_MAPS_API_KEY_ANDROID =
  process.env.GOOGLE_MAPS_API_KEY_ANDROID ?? "AIzaSyDQhdj6DHeFL1lRTpud20uAmvsu6MkVHrk";
const GOOGLE_MAPS_API_KEY_IOS =
  process.env.GOOGLE_MAPS_API_KEY_IOS ?? "";

module.exports = {
  expo: {
    name: "GuadalupeGo",
    slug: "GuadalupeGo",
    owner: "ricky-99",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/images/gpego-icon.png",
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

      // Google Maps API Key para iOS — ⏳ PENDIENTE de que el ingeniero
      // la genere con restricción por Bundle ID `com.guadalupego.app`.
      // Cuando llegue, reemplazar GOOGLE_MAPS_API_KEY_IOS arriba con la
      // nueva key. Mientras esté vacía, los mapas en builds nativos
      // de iOS saldrán en gris (en Expo Go siguen funcionando porque
      // Expo usa sus propias credenciales internas).
      config: {
        googleMapsApiKey: GOOGLE_MAPS_API_KEY_IOS,
      },

      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "GuadalupeGo usa tu ubicación para mostrar restaurantes, lugares turísticos y eventos cercanos.",
        // CRÍTICO: sin estas claves, iOS hace CRASH (no solo deniega) en
        // cuanto la app intenta abrir cámara o galería. La app las usa
        // para la foto de perfil (expo-image-picker). En Expo Go no se
        // notan porque Expo Go declara sus propios permisos, pero en un
        // build nativo (EAS / Xcode) son obligatorias.
        NSCameraUsageDescription:
          "GuadalupeGo usa la cámara para que puedas tomar tu foto de perfil.",
        NSPhotoLibraryUsageDescription:
          "GuadalupeGo accede a tu galería para que elijas tu foto de perfil.",
        NSPhotoLibraryAddUsageDescription:
          "GuadalupeGo puede guardar imágenes en tu galería.",
        // Evita la pregunta de "export compliance / encryption" en cada
        // subida a TestFlight / App Store. La app no usa cifrado no exento.
        ITSAppUsesNonExemptEncryption: false,
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
          // Google Maps API Key para Android — restringida por package
          // name (com.guadalupego.app) + SHA-1 del firmado del APK.
          apiKey: GOOGLE_MAPS_API_KEY_ANDROID,
        },
      },

      // Icono adaptativo (Android 8+). gpego-icon-adaptive.png contiene
      // el icono oficial escalado al 88% del canvas para que todo el
      // contenido caiga dentro de la safe zone que respeta Android.
      // backgroundColor NARANJA para que cuando el launcher recorte al
      // shape, lo que quede alrededor sea el mismo naranja del icono
      // (sin bordes blancos parásitos).
      adaptiveIcon: {
        foregroundImage: "./assets/images/gpego-icon-adaptive.png",
        backgroundColor: "#F97613",
      },

      predictiveBackGestureEnabled: false,
    },

    // ── Web (Expo Go / preview) ──────────────────────────────
    web: {
      output: "static",
      favicon: "./assets/images/gpego-icon.png",
    },

    // ── Plugins ─────────────────────────────────────────────
    plugins: [
      "expo-router",

      [
        "expo-splash-screen",
        {
          // Splash nativo: el icono oficial (gpego-icon.png) centrado
          // sobre el naranja del municipio. Android 12+ obliga a que el
          // splash nativo sea un icono sobre un color sólido (no permite
          // imagen completa); el diseño con la imagen oficial completa
          // (gpego-splash.png) vive en welcome.tsx, que se monta justo
          // después y respeta el mismo naranja → transición invisible.
          image: "./assets/images/gpego-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#F97613",
        },
      ],

      "expo-video",

      [
        "expo-notifications",
        {
          icon: "./assets/images/gpego-icon.png",
          color: "#F97613",
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

      // Almacén seguro cifrado (Android Keystore / iOS Keychain) para el
      // token de sesión. Ver src/auth/tokenStore.ts.
      "expo-secure-store",

      // ── Hardening del build nativo (NO afecta Expo Go) ──────────────
      // Estas opciones SOLO aplican al APK/IPA de producción (EAS/prebuild).
      // En Expo Go la app sigue corriendo igual.
      //
      //   • enableProguardInReleaseBuilds      → ofusca + reduce el código
      //     Java/Kotlin del APK release: dificulta el reversing/tampering.
      //   • enableShrinkResourcesInReleaseBuilds → elimina recursos sin uso
      //     (APK más chico y con menos superficie).
      //   • usesCleartextTraffic: false        → bloquea tráfico HTTP en
      //     claro; la app solo habla con https://go.guadalupe.gob.mx, así
      //     que esto previene fugas/MITM por accidente.
      //
      // ⚠️ IMPORTANTE: ProGuard solo se nota en el build RELEASE. Hay que
      // PROBAR el APK de release una vez (no solo Expo Go) por si alguna
      // librería necesitara una keep-rule extra. Expo ya incluye las reglas
      // de sus módulos, así que el riesgo es bajo, pero conviene validarlo.
      [
        "expo-build-properties",
        {
          android: {
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            usesCleartextTraffic: false,
          },
        },
      ],
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

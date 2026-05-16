/**
 * Configuración de inicio de sesión social.
 *
 * El ingeniero a cargo solo necesita rellenar los campos vacíos de abajo
 * con las credenciales reales y los flujos `signInWithGoogle()` /
 * `signInWithApple()` (en `socialAuth.ts`) se activan automáticamente.
 *
 * Si los campos quedan vacíos / `enabled: false`, los botones del perfil
 * muestran la alerta "Próximamente disponible" tal como ahora.
 *
 * ──────────────────────────────────────────────────────────────────────
 *  GOOGLE
 * ──────────────────────────────────────────────────────────────────────
 *  1. Crea un proyecto en Google Cloud Console:
 *     https://console.cloud.google.com/
 *  2. APIs & Services → Credentials → Create OAuth client ID.
 *     Necesitas TRES OAuth clients:
 *       - Web (para verificar el ID token desde el backend).
 *       - Android (sha-1 del keystore + packageName `com.guadalupego.app`).
 *       - iOS (bundle ID `com.guadalupego.app`).
 *  3. Pega cada client ID en su slot abajo.
 *  4. Para que el flujo nativo funcione hay que instalar la librería:
 *       npx expo install @react-native-google-signin/google-signin
 *     y volver a hacer `expo prebuild` + assembleRelease (módulo nativo).
 *
 * ──────────────────────────────────────────────────────────────────────
 *  APPLE  (solo iOS — requisito de App Store si ofreces otro proveedor)
 * ──────────────────────────────────────────────────────────────────────
 *  1. Cuenta de Apple Developer activa.
 *  2. Habilita "Sign in with Apple" en el App ID `com.guadalupego.app`.
 *  3. Instala la librería oficial de Expo:
 *       npx expo install expo-apple-authentication
 *     y agrega el plugin en `app.json`/`app.config.*`:
 *       "plugins": ["expo-apple-authentication"]
 *  4. Cambia `APPLE_AUTH.enabled` a `true`.
 *
 * ──────────────────────────────────────────────────────────────────────
 *  BACKEND
 * ──────────────────────────────────────────────────────────────────────
 *  Ambos flujos terminan llamando a un endpoint propio que recibe el
 *  ID token y devuelve `{ token, usuario }` (ver `loginSocial()` en
 *  `socialAuth.ts`). Define la URL en `SOCIAL_LOGIN_ENDPOINT`.
 */

export const GOOGLE_AUTH = {
  /** Web client ID — usado por el backend para verificar el ID token. */
  webClientId: '',
  /** OAuth client ID para Android. */
  androidClientId: '',
  /** OAuth client ID para iOS. */
  iosClientId: '',
};

export const APPLE_AUTH = {
  /** Cambia a `true` cuando "Sign in with Apple" esté habilitado en el App ID. */
  enabled: false,
};

/**
 * Endpoint del backend que valida el ID token (Google o Apple) y devuelve
 * `{ success: true, data: { token, usuario } }`. Si queda vacío, el flujo
 * social se considera no configurado.
 */
export const SOCIAL_LOGIN_ENDPOINT = '';

/** ¿Está Google Sign-In listo para usarse? */
export const isGoogleSignInConfigured = (): boolean =>
  !!GOOGLE_AUTH.webClientId &&
  (!!GOOGLE_AUTH.androidClientId || !!GOOGLE_AUTH.iosClientId) &&
  !!SOCIAL_LOGIN_ENDPOINT;

/** ¿Está Apple Sign-In listo para usarse? */
export const isAppleSignInConfigured = (): boolean =>
  APPLE_AUTH.enabled && !!SOCIAL_LOGIN_ENDPOINT;

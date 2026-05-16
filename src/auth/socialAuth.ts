/* eslint-disable @typescript-eslint/no-unused-vars --
 * `GOOGLE_AUTH`, `APPLE_AUTH` y `loginSocial()` aparecen como "sin usar"
 * mientras el bloque REAL FLOW de cada función esté comentado. Es
 * INTENCIONAL: dejamos las importaciones y el helper preparados para
 * que el ingeniero solo tenga que rellenar credenciales y descomentar.
 * Esta directiva mantiene el panel de problemas limpio.
 */
/**
 * Wrappers para inicio de sesión social.
 *
 *   import { signInWithGoogle, signInWithApple, SocialAuthNotConfigured } from '...';
 *
 *   try {
 *     const { token, usuario } = await signInWithGoogle();
 *     await login(token, usuario);
 *   } catch (e) {
 *     if (e instanceof SocialAuthNotConfigured) {
 *       Alert.alert(t('google_signin_title'), t('google_signin_coming_soon'));
 *     } else {
 *       Alert.alert('Error', e.message);
 *     }
 *   }
 *
 * Mientras `socialAuthConfig.ts` tenga campos vacíos, ambas funciones
 * lanzan `SocialAuthNotConfigured` — los botones del perfil ya saben
 * cómo mapear eso a la alerta "Próximamente disponible".
 *
 * Cuando el ingeniero rellene credenciales:
 *   1. Instalar la librería nativa (ver instrucciones en socialAuthConfig.ts).
 *   2. Descomentar el bloque `REAL FLOW` dentro de cada función.
 *   3. Asegurarse que el backend exponga `SOCIAL_LOGIN_ENDPOINT`.
 */

import { Platform } from 'react-native';
import {
  GOOGLE_AUTH,
  APPLE_AUTH,
  SOCIAL_LOGIN_ENDPOINT,
  isGoogleSignInConfigured,
  isAppleSignInConfigured,
} from './socialAuthConfig';

export class SocialAuthNotConfigured extends Error {
  constructor(provider: 'google' | 'apple') {
    super(`Social auth not configured: ${provider}`);
    this.name = 'SocialAuthNotConfigured';
  }
}

export interface SocialLoginResult {
  token: string;
  usuario: any;
}

/**
 * Intercambia un ID token (Google o Apple) por la sesión del backend.
 * El backend debe verificar firma + audiencia del ID token antes de
 * crear/identificar al usuario y devolver el token propio.
 */
async function loginSocial(
  provider: 'google' | 'apple',
  idToken: string,
): Promise<SocialLoginResult> {
  const res = await fetch(SOCIAL_LOGIN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, idToken }),
  });
  if (!res.ok) {
    throw new Error(`Login social falló (HTTP ${res.status})`);
  }
  const json = await res.json();
  if (!json?.success || !json?.data?.token || !json?.data?.usuario) {
    throw new Error(json?.error?.mensaje ?? 'Respuesta inválida del backend.');
  }
  return { token: json.data.token, usuario: json.data.usuario };
}

// ───────────────────────────────────────────────────────────────────────
// GOOGLE
// ───────────────────────────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<SocialLoginResult> {
  if (!isGoogleSignInConfigured()) {
    throw new SocialAuthNotConfigured('google');
  }

  /* ── REAL FLOW (descomentar cuando @react-native-google-signin/google-signin
       esté instalado y los client IDs estén llenos) ─────────────────────

  const { GoogleSignin, statusCodes } = require('@react-native-google-signin/google-signin');

  GoogleSignin.configure({
    webClientId:     GOOGLE_AUTH.webClientId,
    iosClientId:     GOOGLE_AUTH.iosClientId || undefined,
    offlineAccess:   true,
  });

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();
    const idToken: string | null =
      // v13+ devuelve `data.idToken`, versiones anteriores `idToken` directo.
      (result as any)?.data?.idToken ?? (result as any)?.idToken ?? null;
    if (!idToken) throw new Error('Google no devolvió ID token.');
    return await loginSocial('google', idToken);
  } catch (e: any) {
    if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('Inicio de sesión cancelado.');
    }
    throw e;
  }
  ──────────────────────────────────────────────────────────────────── */

  // Mientras el flujo real no esté activado, lanzamos "no configurado".
  // (Llegamos aquí solo si la verificación de arriba fue laxa.)
  throw new SocialAuthNotConfigured('google');
}

// ───────────────────────────────────────────────────────────────────────
// APPLE  (solo iOS — Android cae a "no configurado")
// ───────────────────────────────────────────────────────────────────────
export async function signInWithApple(): Promise<SocialLoginResult> {
  if (Platform.OS !== 'ios' || !isAppleSignInConfigured()) {
    throw new SocialAuthNotConfigured('apple');
  }

  /* ── REAL FLOW (descomentar cuando expo-apple-authentication esté
       instalado y APPLE_AUTH.enabled sea true) ─────────────────────────

  const AppleAuth = require('expo-apple-authentication');

  if (!(await AppleAuth.isAvailableAsync())) {
    throw new Error('Apple Sign-In no está disponible en este dispositivo.');
  }
  const credential = await AppleAuth.signInAsync({
    requestedScopes: [
      AppleAuth.AppleAuthenticationScope.FULL_NAME,
      AppleAuth.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!credential.identityToken) {
    throw new Error('Apple no devolvió identity token.');
  }
  return await loginSocial('apple', credential.identityToken);
  ──────────────────────────────────────────────────────────────────── */

  throw new SocialAuthNotConfigured('apple');
}

export { isGoogleSignInConfigured, isAppleSignInConfigured };

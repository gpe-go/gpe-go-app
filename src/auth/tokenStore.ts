// ============================================================
//  Almacenamiento SEGURO del token de sesión (JWT)
//
//  El token es la credencial que identifica al usuario ante el
//  backend. Antes se guardaba en AsyncStorage, que NO está
//  cifrado: en un dispositivo rooteado/jailbroken o vía backup
//  podía leerse y usarse para suplantar la cuenta.
//
//  Ahora vive en el almacén seguro del sistema operativo
//  (Android Keystore / iOS Keychain) mediante expo-secure-store,
//  que cifra el valor en reposo.
//
//  • Migración: si un usuario ya tenía el token en AsyncStorage
//    (versión anterior), al leerlo lo movemos al almacén seguro
//    y borramos la copia insegura — sin cerrar su sesión.
//  • Fallback: si SecureStore no está disponible (p. ej. web),
//    se usa AsyncStorage para no romper el inicio de sesión.
// ============================================================

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';

/** Lee el token. Migra desde AsyncStorage si quedó de una versión previa. */
export async function getToken(): Promise<string | null> {
  // 1) Intento normal en el almacén seguro.
  try {
    const secure = await SecureStore.getItemAsync(TOKEN_KEY);
    if (secure) return secure;
  } catch {
    /* SecureStore no disponible (ej. web) → seguimos al fallback */
  }

  // 2) Migración / fallback: ¿quedó en AsyncStorage (texto plano)?
  try {
    const legacy = await AsyncStorage.getItem(TOKEN_KEY);
    if (legacy) {
      // Lo movemos al almacén seguro y limpiamos la copia insegura.
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, legacy);
        await AsyncStorage.removeItem(TOKEN_KEY);
      } catch {
        /* si SecureStore falla, lo dejamos en AsyncStorage (web) */
      }
      return legacy;
    }
  } catch {
    /* ignorar */
  }

  return null;
}

/** Guarda el token de forma cifrada y elimina cualquier copia insegura. */
export async function setToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    // Por si existía una copia previa en texto plano.
    await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
  } catch {
    // Si SecureStore no está disponible, no dejamos al usuario sin sesión.
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }
}

/** Borra el token de ambos almacenes (logout). */
export async function removeToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    /* ignorar */
  }
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignorar */
  }
}

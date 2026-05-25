import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subirFotoPerfil } from '../api/api';
import { setToken, removeToken } from '../auth/tokenStore';

export type Usuario = {
  id?: string | number;
  nombre: string;
  email: string;
  rol?: string;
  foto_url?: string | null;
};

interface AuthContextValue {
  usuario: Usuario | null;
  fotoPerfil: string | null;
  isAuthenticated: boolean;
  login: (token: string, u: Usuario) => Promise<void>;
  logout: () => Promise<void>;
  actualizarUsuario: (cambios: Partial<Usuario>) => Promise<void>;
  /**
   * Actualiza la foto de perfil. Si se pasa `base64`, la imagen se sube
   * al backend (S3) y se guarda la URL pública devuelta — así la foto
   * persiste en la cuenta del usuario y se ve en cualquier dispositivo.
   * Si solo se pasa `uri`, se guarda local (modo offline).
   */
  actualizarFoto: (uri: string | null, base64?: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

// Clave de foto por usuario para que sobreviva logout/login
const fotoKey = (id?: string | number | null) =>
  id != null ? `fotoPerfil_${id}` : 'fotoPerfil_guest';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario,    setUsuario]    = useState<Usuario | null>(null);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  // Ref para acceder al usuario actual dentro de callbacks sin recrearlos
  const usuarioRef = useRef<Usuario | null>(null);
  usuarioRef.current = usuario;

  useEffect(() => {
    const cargar = async () => {
      try {
        const uData = await AsyncStorage.getItem('usuario');
        if (!uData) return;

        const parsed: Usuario = JSON.parse(uData);
        setUsuario(parsed);

        // Buscar foto guardada para este usuario específico
        const foto = await AsyncStorage.getItem(fotoKey(parsed.id));
        if (foto) {
          setFotoPerfil(foto);
        } else if (parsed.foto_url) {
          // Fallback: foto que vino del servidor en el login anterior
          setFotoPerfil(parsed.foto_url);
        }
      } catch (e) {
        if (__DEV__) console.warn('[AuthContext] Error cargando sesión:', e);
      }
    };
    cargar();
  }, []);

  const login = useCallback(async (token: string, u: Usuario) => {
    // El token (credencial) va al almacén seguro cifrado; el perfil
    // (datos no secretos que el usuario ya ve) queda en AsyncStorage.
    await setToken(token);
    await AsyncStorage.setItem('usuario', JSON.stringify(u));
    setUsuario(u);

    // 1. Primero intentar foto guardada localmente para este usuario
    const savedFoto = await AsyncStorage.getItem(fotoKey(u.id));

    if (savedFoto) {
      // El usuario ya tenía foto guardada en este dispositivo → mantenerla
      setFotoPerfil(savedFoto);
    } else if (u.foto_url) {
      // El servidor trajo foto_url → guardarla y usarla
      await AsyncStorage.setItem(fotoKey(u.id), u.foto_url);
      setFotoPerfil(u.foto_url);
    } else {
      // Sin foto en ningún lado
      setFotoPerfil(null);
    }
  }, []);

  const logout = useCallback(async () => {
    // Borra el token del almacén seguro y el perfil de AsyncStorage.
    // La foto queda guardada por ID de usuario para el próximo login.
    await removeToken();
    await AsyncStorage.removeItem('usuario');
    setUsuario(null);
    setFotoPerfil(null);
  }, []);

  const actualizarUsuario = useCallback(async (cambios: Partial<Usuario>) => {
    setUsuario(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...cambios };
      AsyncStorage.setItem('usuario', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const actualizarFoto = useCallback(
    async (uri: string | null, base64?: string | null) => {
      const userId = usuarioRef.current?.id;
      const key = fotoKey(userId);

      // 1. Optimistic UI: muestra el URI local inmediatamente para que
      //    el usuario vea la foto sin esperar la subida.
      setFotoPerfil(uri);

      // 2. Si NO hay base64 o NO hay usuario, modo legacy (solo local).
      if (!uri) {
        await AsyncStorage.removeItem(key);
        return;
      }
      if (!base64 || !userId) {
        await AsyncStorage.setItem(key, uri);
        return;
      }

      // 3. Subir a S3 vía backend. El servidor regresa la URL pública.
      //    Si falla la subida, conservamos el URI local — la foto se
      //    seguirá viendo en este dispositivo aunque no en otros.
      try {
        // El backend PHP hace base64_decode() sobre lo que recibe en
        // `imagen`. Si le mandamos el prefijo `data:image/jpeg;base64,`,
        // la decodificación falla y el servidor regresa 500. Por eso
        // enviamos SOLO la parte base64 limpia.
        const limpio = base64.startsWith('data:')
          ? (base64.split(',')[1] ?? base64)
          : base64;

        if (__DEV__) {
          // Aproximado: base64 ~ bytes * 4/3. Útil para verificar que
          // la compresión está dejando el payload en kilobytes y no en MB.
          const kb = Math.round((limpio.length * 0.75) / 1024);
          console.log(`[AuthContext] Subiendo foto (${kb} KB)`);
        }

        const res = await subirFotoPerfil(limpio);
        const remoteUrl: string | undefined =
          res?.data?.url ?? res?.data?.foto_url ?? res?.url;

        if (res?.success && remoteUrl) {
          // Reemplaza el URI local por la URL remota — la foto ya vive
          // en S3 y cualquier dispositivo verá esta misma URL al login.
          setFotoPerfil(remoteUrl);
          await AsyncStorage.setItem(key, remoteUrl);

          // Refleja también en el `usuario` cacheado para que el próximo
          // arranque de la app la muestre sin extra fetch.
          setUsuario((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, foto_url: remoteUrl };
            AsyncStorage.setItem('usuario', JSON.stringify(updated));
            return updated;
          });
          return;
        }

        // Backend no devolvió URL → degradar a guardado local.
        await AsyncStorage.setItem(key, uri);
      } catch (e: any) {
        if (__DEV__) {
          const status = e?.response?.status;
          if (status === 500) {
            console.warn(
              '[AuthContext] Backend devolvió 500 al subir foto. ' +
              'El payload (base64 puro) es chico y válido — esto es un ' +
              'error del servidor (revisar logs PHP de subir_foto / S3).',
            );
          } else {
            console.warn('[AuthContext] Error subiendo foto:', e?.message ?? e);
          }
        }
        // No bloqueamos al usuario: la foto se conserva en el dispositivo.
        await AsyncStorage.setItem(key, uri);
      }
    },
    [],
  );

  return (
    <AuthContext.Provider value={{
      usuario, fotoPerfil, isAuthenticated: !!usuario,
      login, logout, actualizarUsuario, actualizarFoto,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

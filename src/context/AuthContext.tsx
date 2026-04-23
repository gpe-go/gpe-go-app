import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  actualizarFoto: (uri: string | null) => Promise<void>;
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
    await AsyncStorage.multiSet([
      ['token',   token],
      ['usuario', JSON.stringify(u)],
    ]);
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
    // Solo borrar credenciales — la foto queda guardada por ID de usuario
    // para restaurarse en el próximo login
    await AsyncStorage.multiRemove(['token', 'usuario']);
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

  const actualizarFoto = useCallback(async (uri: string | null) => {
    setFotoPerfil(uri);
    const key = fotoKey(usuarioRef.current?.id);
    if (uri) await AsyncStorage.setItem(key, uri);
    else     await AsyncStorage.removeItem(key);
  }, []);

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

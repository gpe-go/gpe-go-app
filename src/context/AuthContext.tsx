import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Usuario = {
  id?: string | number;
  nombre: string;
  email: string;
  rol?: string;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario,    setUsuario]    = useState<Usuario | null>(null);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [uData, foto] = await Promise.all([
          AsyncStorage.getItem('usuario'),
          AsyncStorage.getItem('fotoPerfil'),
        ]);
        if (uData) setUsuario(JSON.parse(uData));
        if (foto)  setFotoPerfil(foto);
      } catch (e) {
        console.warn('[AuthContext] Error cargando sesión:', e);
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
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['token', 'usuario']);
    setUsuario(null);
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
    if (uri) await AsyncStorage.setItem('fotoPerfil', uri);
    else     await AsyncStorage.removeItem('fotoPerfil');
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

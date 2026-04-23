import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Lugar } from '../types/lugar';
import { useAuth } from './AuthContext';
import i18n from '../i18n/i18n';

export type { Lugar };

interface FavoritosContextType {
  favoritos: Lugar[];
  toggleFavorito: (lugar: Lugar) => void;
  esFavorito: (id: string) => boolean;
  limpiarFavoritos: () => void;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

// Clave de favoritos por usuario para no mezclar datos entre cuentas
const storageKey = (userId?: string | number | null) =>
  userId != null ? `@guadalupego:favoritos_${userId}` : '@guadalupego:favoritos_guest';

export const FavoritosProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, usuario } = useAuth();
  const [favoritos, setFavoritos] = useState<Lugar[]>([]);

  // Ref para evitar re-renders innecesarios en guardar
  const usuarioIdRef = useRef(usuario?.id);
  usuarioIdRef.current = usuario?.id;

  // Recargar favoritos cuando cambia el usuario (login/logout)
  useEffect(() => {
    const cargar = async () => {
      try {
        if (!isAuthenticated) {
          setFavoritos([]);
          return;
        }
        const data = await AsyncStorage.getItem(storageKey(usuario?.id));
        setFavoritos(data ? JSON.parse(data) : []);
      } catch (e) {
        if (__DEV__) console.warn('[FavoritosContext] Error cargando favoritos:', e);
      }
    };
    cargar();
  }, [isAuthenticated, usuario?.id]);

  const guardar = async (lista: Lugar[]) => {
    setFavoritos(lista);
    try {
      await AsyncStorage.setItem(
        storageKey(usuarioIdRef.current),
        JSON.stringify(lista),
      );
    } catch (e) {
      if (__DEV__) console.warn('[FavoritosContext] Error guardando favoritos:', e);
    }
  };

  const toggleFavorito = (lugar: Lugar) => {
    if (!isAuthenticated) {
      Alert.alert(
        i18n.t('fav_login_title'),
        i18n.t('fav_login_msg'),
        [{ text: 'OK' }],
      );
      return;
    }
    const lista = favoritos.some(f => f.id === lugar.id)
      ? favoritos.filter(f => f.id !== lugar.id)
      : [...favoritos, lugar];
    guardar(lista);
  };

  // Si no está autenticado, ningún lugar es favorito
  const esFavorito = (id: string) =>
    isAuthenticated ? favoritos.some(f => f.id === id) : false;

  const limpiarFavoritos = () => {
    guardar([]);
  };

  return (
    <FavoritosContext.Provider value={{ favoritos, toggleFavorito, esFavorito, limpiarFavoritos }}>
      {children}
    </FavoritosContext.Provider>
  );
};

export const useFavoritos = () => {
  const context = useContext(FavoritosContext);
  if (!context) {
    throw new Error('useFavoritos debe usarse dentro de un FavoritosProvider');
  }
  return context;
};

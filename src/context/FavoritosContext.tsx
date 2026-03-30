import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lugar } from '../types/lugar';

export type { Lugar };

interface FavoritosContextType {
  favoritos: Lugar[];
  toggleFavorito: (lugar: Lugar) => void;
  esFavorito: (id: string) => boolean;
  limpiarFavoritos: () => void;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

const STORAGE_KEY = '@guadalupego:favoritos';

export const FavoritosProvider = ({ children }: { children: ReactNode }) => {
  const [favoritos, setFavoritos] = useState<Lugar[]>([]);

  // Carga favoritos desde AsyncStorage al iniciar
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) setFavoritos(JSON.parse(data));
      } catch (e) {
        console.warn('[FavoritosContext] Error cargando favoritos:', e);
      }
    };
    cargar();
  }, []);

  const guardar = async (lista: Lugar[]) => {
    setFavoritos(lista);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch (e) {
      console.warn('[FavoritosContext] Error guardando favoritos:', e);
    }
  };

  const toggleFavorito = (lugar: Lugar) => {
    const lista = favoritos.some(f => f.id === lugar.id)
      ? favoritos.filter(f => f.id !== lugar.id)
      : [...favoritos, lugar];
    guardar(lista);
  };

  const esFavorito = (id: string) => favoritos.some(f => f.id === id);

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

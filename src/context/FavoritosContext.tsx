import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFavoritos, agregarFavorito, eliminarFavorito } from '../api/api';

export interface Lugar {
  id: string;
  nombre: string;
  categoria: string;
  imagen: string;
  ubicacion: string;
  rating?: number;
  costo?: string;
  favoritoId?: number; // ID en tb_favoritos para poder quitarlo
}

interface FavoritosContextType {
  favoritos: Lugar[];
  toggleFavorito: (lugar: Lugar) => void;
  esFavorito: (id: string) => boolean;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export const FavoritosProvider = ({ children }: { children: ReactNode }) => {
  const [favoritos, setFavoritos] = useState<Lugar[]>([]);

  useEffect(() => {
    cargarFavoritos();
  }, []);

  const cargarFavoritos = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await getFavoritos();
      if (res.success && res.data?.length > 0) {
        const favs: Lugar[] = res.data.map((f: any) => ({
          id: String(f.id_lugar ?? f.id_evento),
          nombre: f.nombre ?? '',
          categoria: f.categoria_nombre ?? '',
          imagen: f.imagen ?? '',
          ubicacion: f.ubicacion ?? '',
          favoritoId: f.id,
        }));
        setFavoritos(favs);
      }
    } catch {
      // sin conexión
    }
  };

  const toggleFavorito = async (lugar: Lugar) => {
    const existente = favoritos.find((f) => f.id === lugar.id);

    if (existente) {
      // Quitar favorito
      setFavoritos((prev) => prev.filter((f) => f.id !== lugar.id));
      try {
        const token = await AsyncStorage.getItem('token');
        if (token && existente.favoritoId) {
          await eliminarFavorito(existente.favoritoId);
        }
      } catch { /* fallo silencioso */ }
    } else {
      // Agregar favorito
      setFavoritos((prev) => [...prev, lugar]);
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const res = await agregarFavorito(Number(lugar.id));
          if (res.success) {
            // Actualizar con el favoritoId real
            setFavoritos((prev) =>
              prev.map((f) => f.id === lugar.id ? { ...f, favoritoId: res.data?.id } : f)
            );
          }
        }
      } catch { /* fallo silencioso */ }
    }
  };

  const esFavorito = (id: string) => favoritos.some((f) => f.id === id);

  return (
    <FavoritosContext.Provider value={{ favoritos, toggleFavorito, esFavorito }}>
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

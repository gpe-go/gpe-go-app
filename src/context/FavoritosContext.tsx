import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Lugar } from "../types/lugar";

export type { Lugar };

interface FavoritosContextType {
  favoritos: Lugar[];
  toggleFavorito: (lugar: Lugar) => void;
  esFavorito: (id: string) => boolean;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export const FavoritosProvider = ({ children }: { children: ReactNode }) => {
  const [favoritos, setFavoritos] = useState<Lugar[]>([]);

  const toggleFavorito = (lugar: Lugar) => {
    setFavoritos((prev) => {
      const existe = prev.some((f) => f.id === lugar.id);
      return existe
        ? prev.filter((f) => f.id !== lugar.id)
        : [...prev, lugar];
    });
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
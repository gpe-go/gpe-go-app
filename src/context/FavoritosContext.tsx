import React, {
  createContext, useCallback, useContext,
  useEffect, useState, ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────

export interface Lugar {
  id:        string;
  nombre:    string;
  categoria: string;
  imagen:    string;
  ubicacion: string;
  rating?:   number;
  costo?:    string;
  precio?:   string;
  origen?:   'id' | 'detalle';
}

interface FavoritosContextType {
  favoritos:      Lugar[];
  toggleFavorito: (lugar: Lugar)   => void;
  esFavorito:     (id: string)     => boolean;
  limpiarTodos:   ()               => void;
  totalFavoritos: number;
  isLoading:      boolean;
}

// ─────────────────────────────────────────────────────────
// STORAGE KEY
// ─────────────────────────────────────────────────────────

const STORAGE_KEY = '@guadalupego:favoritos';

// ─────────────────────────────────────────────────────────
// CONTEXTO
// ─────────────────────────────────────────────────────────

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────

export const FavoritosProvider = ({ children }: { children: ReactNode }) => {
  const [favoritos,  setFavoritos]  = useState<Lugar[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);

  // ── Cargar favoritos persistidos al iniciar ────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) setFavoritos(JSON.parse(data));
      } catch (e) {
        console.warn('[FavoritosContext] Error cargando favoritos:', e);
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, []);

  // ── Persistir cuando cambian ───────────────────────────
  const persistir = useCallback(async (lista: Lugar[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch (e) {
      console.warn('[FavoritosContext] Error guardando favoritos:', e);
    }
  }, []);

  // ── Toggle — agrega o quita ────────────────────────────
  const toggleFavorito = useCallback((lugar: Lugar) => {
    setFavoritos((prev) => {
      const existe    = prev.some((f) => f.id === lugar.id);
      const siguiente = existe
        ? prev.filter((f) => f.id !== lugar.id)
        : [...prev, lugar];
      persistir(siguiente);
      return siguiente;
    });
  }, [persistir]);

  // ── Verificar si es favorito ───────────────────────────
  const esFavorito = useCallback(
    (id: string) => favoritos.some((f) => f.id === id),
    [favoritos]
  );

  // ── Limpiar todos ──────────────────────────────────────
  const limpiarTodos = useCallback(async () => {
    setFavoritos([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[FavoritosContext] Error limpiando favoritos:', e);
    }
  }, []);

  const value: FavoritosContextType = {
    favoritos,
    toggleFavorito,
    esFavorito,
    limpiarTodos,
    totalFavoritos: favoritos.length,
    isLoading,
  };

  return (
    <FavoritosContext.Provider value={value}>
      {children}
    </FavoritosContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────

export const useFavoritos = (): FavoritosContextType => {
  const ctx = useContext(FavoritosContext);
  if (!ctx) {
    throw new Error('useFavoritos debe usarse dentro de <FavoritosProvider>');
  }
  return ctx;
};

export default FavoritosContext;
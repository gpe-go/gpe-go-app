import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Reseña = {
  id: string;
  lugarId: string;
  autor: string;
  texto: string;
  estrellas: number;
  fecha: string;
  fotos: string[];
};

type ReseñasContextType = {
  reseñas: Reseña[];
  agregarReseña:  (reseña: Omit<Reseña, 'id' | 'fecha'>) => Promise<void>;
  editarReseña:   (id: string, cambios: Partial<Pick<Reseña, 'autor' | 'texto' | 'estrellas' | 'fotos'>>) => Promise<void>;
  eliminarReseña: (id: string) => Promise<void>;
  obtenerReseñas: (lugarId: string) => Reseña[];
};

const ReseñasContext = createContext<ReseñasContextType>({} as ReseñasContextType);

export function ReseñasProvider({ children }: { children: React.ReactNode }) {
  const [reseñas, setReseñas] = useState<Reseña[]>([]);

  useEffect(() => { cargarReseñas(); }, []);

  const cargarReseñas = async () => {
    try {
      const data = await AsyncStorage.getItem('reseñas');
      if (data) setReseñas(JSON.parse(data));
    } catch (e) {
      console.log('Error cargando reseñas:', e);
    }
  };

  const guardar = async (lista: Reseña[]) => {
    setReseñas(lista);
    await AsyncStorage.setItem('reseñas', JSON.stringify(lista));
  };

  const agregarReseña = async (nueva: Omit<Reseña, 'id' | 'fecha'>) => {
    const reseña: Reseña = {
      ...nueva,
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString('es-MX', {
        day: '2-digit', month: 'long', year: 'numeric',
      }),
    };
    await guardar([...reseñas, reseña]);
  };

  // ─── Editar reseña existente ───────────────────────────
  const editarReseña = async (
    id: string,
    cambios: Partial<Pick<Reseña, 'autor' | 'texto' | 'estrellas' | 'fotos'>>
  ) => {
    const actualizadas = reseñas.map(r =>
      r.id === id
        ? {
            ...r,
            ...cambios,
            fecha: new Date().toLocaleDateString('es-MX', {
              day: '2-digit', month: 'long', year: 'numeric',
            }) + ' (editada)',
          }
        : r
    );
    await guardar(actualizadas);
  };

  // ─── Eliminar reseña ───────────────────────────────────
  const eliminarReseña = async (id: string) => {
    await guardar(reseñas.filter(r => r.id !== id));
  };

  const obtenerReseñas = (lugarId: string) =>
    reseñas.filter(r => r.lugarId === lugarId);

  return (
    <ReseñasContext.Provider value={{ reseñas, agregarReseña, editarReseña, eliminarReseña, obtenerReseñas }}>
      {children}
    </ReseñasContext.Provider>
  );
}

export const useReseñas = () => useContext(ReseñasContext);
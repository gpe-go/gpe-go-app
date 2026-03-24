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
  agregarReseña: (reseña: Omit<Reseña, 'id' | 'fecha'>) => Promise<void>;
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

  const agregarReseña = async (nueva: Omit<Reseña, 'id' | 'fecha'>) => {
    const reseña: Reseña = {
      ...nueva,
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString('es-MX', {
        day: '2-digit', month: 'long', year: 'numeric',
      }),
    };
    const actualizadas = [...reseñas, reseña];
    setReseñas(actualizadas);
    await AsyncStorage.setItem('reseñas', JSON.stringify(actualizadas));
  };

  const obtenerReseñas = (lugarId: string) =>
    reseñas.filter(r => r.lugarId === lugarId);

  return (
    <ReseñasContext.Provider value={{ reseñas, agregarReseña, obtenerReseñas }}>
      {children}
    </ReseñasContext.Provider>
  );
}

export const useReseñas = () => useContext(ReseñasContext);
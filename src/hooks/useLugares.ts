import { useState, useEffect } from "react";
import { getLugares } from "../api/api";
import { mapLugares } from "../mappers/lugaresMapper";
import { LUGARES } from "../data/lugares";
import { Lugar } from "../types/lugar";

export const useLugares = (id_categoria?: number, busqueda?: string) => {
  const [data, setData] = useState<Lugar[]>(LUGARES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const params: any = {};
        if (id_categoria) params.id_categoria = id_categoria;
        if (busqueda) params.busqueda = busqueda;

        const res = await getLugares(params);
        if (res.success && res.data?.lugares?.length > 0) {
          setData(mapLugares(res.data.lugares));
        }
      } catch (e) {
        setError("Error cargando lugares");
        console.log("Usando datos locales de lugares");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id_categoria, busqueda]);

  return { data, loading, error };
};

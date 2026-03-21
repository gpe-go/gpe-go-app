import { useState, useEffect } from "react";
import { getEventos } from "../api/api";
import { mapEventos } from "../mappers/eventosMapper";
import { EVENTOS_DATA, Evento } from "../data/eventos";

export const useEventos = (tipo?: string, busqueda?: string) => {
  const [data, setData] = useState<Evento[]>(EVENTOS_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const params: any = {};
        if (tipo) params.tipo = tipo;
        if (busqueda) params.busqueda = busqueda;

        const res = await getEventos(params);
        if (res.success && res.data?.eventos?.length > 0) {
          setData(mapEventos(res.data.eventos));
        }
      } catch (e) {
        setError("Error cargando eventos");
        console.log("Usando datos locales de eventos");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [tipo, busqueda]);

  return { data, loading, error };
};

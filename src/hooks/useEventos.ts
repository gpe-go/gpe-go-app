import { useState, useEffect } from "react";
import { getEventos, getFotosEvento } from "../api/api";
import { mapEvento } from "../mappers/eventosMapper";
import { Evento } from "../data/eventos";

export const useEventos = (tipo?: string, busqueda?: string) => {
  const [data, setData] = useState<Evento[]>([]);
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
          // Fetch photos for each event in parallel
          const eventosConFotos = await Promise.all(
            res.data.eventos.map(async (raw: any) => {
              let imagen: string | undefined;
              try {
                const fotosRes = await getFotosEvento(raw.id);
                if (fotosRes.success && Array.isArray(fotosRes.data) && fotosRes.data.length > 0) {
                  imagen = fotosRes.data[0].url;
                }
              } catch {
                // If photo fetch fails, use placeholder
              }
              return mapEvento(raw, imagen);
            })
          );
          setData(eventosConFotos);
        }
      } catch (e) {
        setError("Error cargando eventos");
        console.log("Error cargando eventos:", e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [tipo, busqueda]);

  return { data, loading, error };
};

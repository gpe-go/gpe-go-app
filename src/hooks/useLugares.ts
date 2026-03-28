import { useState, useEffect } from "react";
import { getLugares, getFotosLugar } from "../api/api";
import { mapLugar } from "../mappers/lugaresMapper";
import { Lugar } from "../types/lugar";

export const useLugares = (id_categoria?: number, busqueda?: string) => {
  const [data, setData] = useState<Lugar[]>([]);
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
          const lugaresConFotos = await Promise.all(
            res.data.lugares.map(async (raw: any) => {
              let imagen: string | undefined;
              try {
                const fotosRes = await getFotosLugar(raw.id);
                if (fotosRes.success && Array.isArray(fotosRes.data) && fotosRes.data.length > 0) {
                  imagen = fotosRes.data[0].url;
                }
              } catch {
                // If photo fetch fails, use placeholder
              }
              return mapLugar(raw, imagen);
            })
          );
          setData(lugaresConFotos);
        }
      } catch (e) {
        setError("Error cargando lugares");
        console.log("Error cargando lugares:", e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id_categoria, busqueda]);

  return { data, loading, error };
};

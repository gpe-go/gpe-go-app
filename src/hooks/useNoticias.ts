import { useState, useEffect } from "react";
import { getNoticias, getFotosEvento } from "../api/api";
import { mapNoticia, Noticia } from "../mappers/noticiasMapper";

export const useNoticias = (busqueda?: string) => {
  const [data, setData] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const params: any = {};
        if (busqueda) params.busqueda = busqueda;

        const res = await getNoticias(params);
        if (res.success && res.data?.eventos?.length > 0) {
          const noticiasConFotos = await Promise.all(
            res.data.eventos.map(async (raw: any) => {
              let imagenes: string[] = [];
              try {
                const fotosRes = await getFotosEvento(raw.id);
                if (fotosRes.success && Array.isArray(fotosRes.data)) {
                  imagenes = fotosRes.data
                    .map((f: any) => f?.url)
                    .filter((u: any): u is string => typeof u === 'string' && u.length > 0);
                }
              } catch {
                // Sin conexión → seguimos con array vacío y el fallback al
                // logo GPE GO entra al renderizar.
              }
              return mapNoticia(raw, imagenes[0], imagenes);
            })
          );
          setData(noticiasConFotos);
        }
      } catch (e) {
        setError("Error cargando noticias");
        if (__DEV__) console.warn('[useNoticias] Error cargando noticias:', e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [busqueda]);

  return { data, loading, error };
};

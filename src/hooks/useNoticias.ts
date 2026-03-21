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
              let imagen: string | undefined;
              try {
                const fotosRes = await getFotosEvento(raw.id);
                if (fotosRes.success && Array.isArray(fotosRes.data) && fotosRes.data.length > 0) {
                  imagen = fotosRes.data[0].url;
                }
              } catch {
                // If photo fetch fails, use placeholder
              }
              return mapNoticia(raw, imagen);
            })
          );
          setData(noticiasConFotos);
        }
      } catch (e) {
        setError("Error cargando noticias");
        console.log("No se pudieron cargar noticias");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [busqueda]);

  return { data, loading, error };
};

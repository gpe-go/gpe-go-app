import { useState, useEffect } from "react";
import { getNoticias } from "../api/api";
import { mapNoticias, Noticia } from "../mappers/noticiasMapper";

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
          setData(mapNoticias(res.data.eventos));
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

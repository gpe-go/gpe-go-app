import { useState, useEffect } from "react";
import { getLugar } from "../api/api";
import { mapLugar } from "../mappers/lugaresMapper";
import { LUGARES } from "../data/lugares";
import { Lugar } from "../types/lugar";

export const useLugar = (id: string) => {
  const fallback = LUGARES.find((l) => l.id === id) ?? null;
  const [data, setData] = useState<Lugar | null>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getLugar(Number(id));
        if (res.success && res.data) {
          setData(mapLugar(res.data));
        }
      } catch {
        setError("Error cargando lugar");
        if (__DEV__) console.warn('[useLugar] Error cargando lugar, usando datos locales:', id);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  return { data, loading, error };
};

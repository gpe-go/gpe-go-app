import { useState, useEffect, useCallback } from 'react';
import { getLugares, getFotosLugar } from '../api/api';
import { mapLugar } from '../mappers/lugaresMapper';
import { Lugar } from '../types/lugar';
import { useUbicacion } from './useUbicacion';

export interface LugaresConfig {
  /** Radio en km para traer lugares cercanos (ej. 5 = Explorar, 15 = Directorio) */
  radio_km?: number;
  /** Máximo de resultados en modo proximidad (default 40) */
  limite?: number;
}

/**
 * Hook principal de lugares.
 *
 * Comportamiento:
 * - Sin búsqueda: pide al backend los `limite` (40) lugares más cercanos al usuario
 *   dentro de `radio_km` kilómetros. Los params lat/lng/radio_km/por_pagina van
 *   directo a la API para que el backend filtre en BD (no en cliente).
 * - Con búsqueda: manda el texto al backend SIN restricción de radio para que
 *   devuelva cualquier coincidencia de toda la BD.
 * - Sin radio configurado (ej. pantalla de categoría sin restricción extra): trae
 *   los primeros `limite` resultados sin filtro geográfico.
 */
export const useLugares = (
  id_categoria?: number,
  busqueda?: string,
  config?: LugaresConfig,
) => {
  const radio_km = config?.radio_km;
  const limite   = config?.limite ?? 40;

  const { coords } = useUbicacion();

  const [data,    setData]    = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Debounce de 500 ms para no disparar una petición por cada tecla
  const [debouncedBusqueda, setDebouncedBusqueda] = useState(busqueda ?? '');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBusqueda(busqueda ?? ''), 500);
    return () => clearTimeout(t);
  }, [busqueda]);

  const cargar = useCallback(async () => {
    const buscando = debouncedBusqueda.trim();

    // Si se requiere ubicación y aún no tenemos coords (y no hay búsqueda), esperar
    if (radio_km && !coords && !buscando) return;

    setLoading(true);
    try {
      const params: Record<string, any> = {};

      if (id_categoria) params.id_categoria = id_categoria;

      if (buscando) {
        // ── Modo búsqueda: toda la BD, sin restricción geográfica ──
        params.busqueda   = buscando;
        params.por_pagina = 100;
      } else if (radio_km && coords) {
        // ── Modo proximidad: el backend filtra por distancia ──
        params.lat       = coords.lat;
        params.lng       = coords.lng;
        params.radio_km  = radio_km;
        params.por_pagina = limite;
      } else {
        // ── Fallback (sin GPS o sin radio configurado) ──
        params.por_pagina = limite;
      }

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
              // Foto no disponible — se usará placeholder
            }
            return mapLugar(raw, imagen);
          })
        );
        setData(lugaresConFotos);
      } else {
        setData([]);
      }
    } catch (e) {
      setError('Error cargando lugares');
      if (__DEV__) console.warn('[useLugares]', e);
    } finally {
      setLoading(false);
    }
  }, [id_categoria, debouncedBusqueda, radio_km, coords, limite]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { data, loading, error, refresh: cargar };
};

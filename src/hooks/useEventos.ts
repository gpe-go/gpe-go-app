import { useState, useEffect, useCallback } from 'react';
import { getEventos, getFotosEvento } from '../api/api';
import { mapEvento } from '../mappers/eventosMapper';
import { Evento } from '../data/eventos';
import { useUbicacion } from './useUbicacion';

export interface EventosConfig {
  /** Radio en km para traer eventos cercanos (ej. 10 = Eventos) */
  radio_km?: number;
  /** Máximo de resultados en modo proximidad (default 40) */
  limite?: number;
  /**
   * Si true, NO se piden las fotos de cada evento (ahorra hasta `limite`
   * peticiones). Úsalo donde los resultados se muestran SIN imagen
   * (ej. el dropdown de búsqueda del Home).
   */
  sinFotos?: boolean;
}

/**
 * Hook principal de eventos.
 *
 * Comportamiento:
 * - Sin búsqueda: pide al backend los `limite` (40) eventos más cercanos
 *   dentro de `radio_km` kilómetros.
 * - Con búsqueda: manda el texto al backend SIN restricción de radio.
 * - Sin radio configurado: trae los primeros `limite` resultados.
 */
export const useEventos = (
  tipo?: string,
  busqueda?: string,
  config?: EventosConfig,
) => {
  const radio_km = config?.radio_km;
  const limite   = config?.limite ?? 40;
  const sinFotos = config?.sinFotos ?? false;

  const { coords } = useUbicacion();

  const [data,    setData]    = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Debounce 500 ms
  const [debouncedBusqueda, setDebouncedBusqueda] = useState(busqueda ?? '');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBusqueda(busqueda ?? ''), 500);
    return () => clearTimeout(t);
  }, [busqueda]);

  const cargar = useCallback(async () => {
    const buscando = debouncedBusqueda.trim();

    if (radio_km && !coords && !buscando) return;

    setLoading(true);
    try {
      const params: Record<string, any> = {};

      if (tipo) params.tipo = tipo;

      if (buscando) {
        // ── Modo búsqueda: toda la BD ──
        // por_pagina = `limite` (no 100) para no traer ni enriquecer con
        // fotos cientos de eventos por tecla (evita lags/crashes).
        params.busqueda   = buscando;
        params.por_pagina = limite;
      } else if (radio_km && coords) {
        // ── Modo proximidad ──
        params.lat        = coords.lat;
        params.lng        = coords.lng;
        params.radio_km   = radio_km;
        params.por_pagina = limite;
      } else {
        params.por_pagina = limite;
      }

      const res = await getEventos(params);

      if (res.success && res.data?.eventos?.length > 0) {
        if (sinFotos) {
          // Modo sin fotos: mapeo directo sin pedir imágenes (ahorra hasta
          // `limite` peticiones). Para resultados que se muestran sin
          // imagen (dropdown de búsqueda del Home).
          setData(res.data.eventos.map((raw: any) => mapEvento(raw)));
        } else {
          const eventosConFotos = await Promise.all(
            res.data.eventos.map(async (raw: any) => {
              let imagen: string | undefined;
              try {
                const fotosRes = await getFotosEvento(raw.id);
                if (fotosRes.success && Array.isArray(fotosRes.data) && fotosRes.data.length > 0) {
                  imagen = fotosRes.data[0].url;
                }
              } catch {
                // Foto no disponible
              }
              return mapEvento(raw, imagen);
            })
          );
          setData(eventosConFotos);
        }
      } else {
        setData([]);
      }
    } catch (e) {
      setError('Error cargando eventos');
      if (__DEV__) console.warn('[useEventos]', e);
    } finally {
      setLoading(false);
    }
  }, [tipo, debouncedBusqueda, radio_km, coords, limite, sinFotos]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const refresh = useCallback(() => cargar(), [cargar]);

  return { data, loading, error, refresh };
};

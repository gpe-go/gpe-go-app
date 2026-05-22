import { useState, useEffect, useCallback, useRef } from 'react';
import { getLugares } from '../api/api';
import { mapLugar } from '../mappers/lugaresMapper';
import { Lugar } from '../types/lugar';
import { useUbicacion } from './useUbicacion';
import { getFotoLugarCached } from './fotosCache';

export interface LugaresConfig {
  /** Radio en km para traer lugares cercanos (ej. 5 = Explorar, 15 = Directorio) */
  radio_km?: number;
  /** Máximo de resultados (default 40). Con `rotarPagina` actúa como tamaño de página. */
  limite?: number;
  /**
   * Si true, cada carga trae una PÁGINA ALEATORIA del total (rotación de
   * lugares nuevos en categorías grandes, sin cargar cientos a la vez).
   * Solo aplica al modo categoría (sin búsqueda ni proximidad). Mantiene
   * el tope en `limite` para evitar bugs/crashes por listas enormes.
   */
  rotarPagina?: boolean;
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
  const radio_km    = config?.radio_km;
  const limite      = config?.limite ?? 40;
  const rotarPagina = config?.rotarPagina ?? false;

  const { coords } = useUbicacion();

  const [data,    setData]    = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Total de lugares de la categoría actual (lo reporta el backend).
  // Sirve para elegir una página aleatoria válida en modo `rotarPagina`.
  const totalRef = useRef<number | null>(null);
  // Al cambiar de categoría reseteamos el total → la primera carga de la
  // nueva categoría usa página 1 y de ahí ya conoce su total para rotar.
  useEffect(() => {
    totalRef.current = null;
  }, [id_categoria]);

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
        // ── Modo categoría / fallback (sin GPS ni radio) ──
        params.por_pagina = limite;
        // Rotación: si ya conocemos el total y hay más de una página,
        // pedimos una página ALEATORIA → cada refresh trae lugares nuevos
        // sin pasar del tope `limite`. La primera carga (total desconocido)
        // usa página 1 y de ahí aprende cuántas páginas hay.
        if (rotarPagina) {
          const total = totalRef.current;
          if (total && total > limite) {
            const totalPaginas = Math.ceil(total / limite);
            params.pagina = 1 + Math.floor(Math.random() * totalPaginas);
          }
        }
      }

      const res = await getLugares(params);

      // Guardamos el total reportado para las siguientes rotaciones.
      if (res?.data?.total != null) {
        totalRef.current = res.data.total;
      }

      if (res.success && res.data?.lugares?.length > 0) {
        // getFotoLugarCached deduplica peticiones del mismo id_lugar y
        // mantiene un cache en memoria por 30 min. Esto reduce de ~40
        // requests por carga a ~0 en re-entradas a la misma pantalla.
        const lugaresConFotos = await Promise.all(
          res.data.lugares.map(async (raw: any) => {
            const url = await getFotoLugarCached(raw.id);
            return mapLugar(raw, url ?? undefined);
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
  }, [id_categoria, debouncedBusqueda, radio_km, coords, limite, rotarPagina]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { data, loading, error, refresh: cargar };
};

// Hooks de categorías dinámicas — el dashboard del municipio puede
// agregar, editar o eliminar categorías y la app las refleja sin
// requerir un nuevo build.
//
//   const { data, loading, error, refresh } = useCategorias();
//   const { data: eventCats } = useCategoriasEventos();
//
// `data` es un array de `{ id, nombre, descripcion }`. El hook cachea
// la lista en memoria por toda la sesión: la primera llamada hace
// fetch, las siguientes devuelven al instante. `refresh()` invalida
// el cache y vuelve a pedir (útil en pull-to-refresh).

import { useCallback, useEffect, useState } from 'react';
import { getCategoriasAPI, getCategoriasEventos } from '../api/api';

export type CategoriaAPI = {
  id: number;
  nombre: string;
  descripcion?: string;
};

type CacheEntry = {
  promise: Promise<CategoriaAPI[]> | null;
  data: CategoriaAPI[] | null;
};

const cache: Record<'lugares' | 'eventos', CacheEntry> = {
  lugares: { promise: null, data: null },
  eventos: { promise: null, data: null },
};

const fetchers = {
  lugares: getCategoriasAPI,
  eventos: getCategoriasEventos,
};

async function loadCategorias(scope: 'lugares' | 'eventos'): Promise<CategoriaAPI[]> {
  const entry = cache[scope];
  if (entry.data) return entry.data;
  if (entry.promise) return entry.promise;

  entry.promise = (async () => {
    const res = await fetchers[scope]();
    const list: CategoriaAPI[] = Array.isArray(res?.data) ? res.data : [];
    entry.data = list;
    return list;
  })();

  try {
    return await entry.promise;
  } catch (e) {
    entry.promise = null; // permite reintento en el próximo render
    throw e;
  }
}

function invalidate(scope: 'lugares' | 'eventos') {
  cache[scope].data = null;
  cache[scope].promise = null;
}

function useCategoriasScope(scope: 'lugares' | 'eventos') {
  const [data, setData] = useState<CategoriaAPI[]>(cache[scope].data ?? []);
  const [loading, setLoading] = useState<boolean>(!cache[scope].data);
  const [error, setError] = useState<string | null>(null);

  const fetchNow = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await loadCategorias(scope);
      setData(list);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando categorías');
      if (__DEV__) console.warn(`[useCategorias:${scope}]`, e);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    if (cache[scope].data) {
      setData(cache[scope].data!);
      setLoading(false);
    } else {
      fetchNow();
    }
  }, [scope, fetchNow]);

  const refresh = useCallback(async () => {
    invalidate(scope);
    await fetchNow();
  }, [scope, fetchNow]);

  return { data, loading, error, refresh };
}

export const useCategorias = () => useCategoriasScope('lugares');
export const useCategoriasEventos = () => useCategoriasScope('eventos');

// ============================================================
//  Cache en memoria para getFotosLugar.
//
//  Cada vez que se cargan listas de lugares (directorio, explorar,
//  categorias, home) se llama getFotosLugar(id) UNA vez por lugar
//  para resolver la URL de la primera foto. Con 40 lugares por
//  pantalla y al cambiar entre tabs se hacían cientos de requests
//  redundantes. Este cache vive durante la sesión y guarda:
//    id_lugar → url de la primera foto (o null si no hay foto)
//
//  Se invalida al cerrar la app. Si el municipio sube fotos nuevas
//  el usuario las verá en la siguiente sesión.
// ============================================================

import { getFotosLugar } from '../api/api';

type FotoEntry = {
  url: string | null;
  expiresAt: number;
};

const TTL_MS = 1000 * 60 * 30; // 30 min — suficiente para sesiones largas
const cache = new Map<number, FotoEntry>();
// Promesas en vuelo para deduplicar peticiones concurrentes al mismo id
const inflight = new Map<number, Promise<string | null>>();

export async function getFotoLugarCached(idLugar: number): Promise<string | null> {
  const now = Date.now();
  const cached = cache.get(idLugar);
  if (cached && cached.expiresAt > now) {
    return cached.url;
  }

  const inflightPromise = inflight.get(idLugar);
  if (inflightPromise) return inflightPromise;

  const promise = (async () => {
    try {
      const res = await getFotosLugar(idLugar);
      const url = res?.success && Array.isArray(res.data) && res.data.length > 0
        ? (res.data[0].url as string)
        : null;
      cache.set(idLugar, { url, expiresAt: Date.now() + TTL_MS });
      return url;
    } catch {
      // No bloquear si falla — el placeholder cubre.
      cache.set(idLugar, { url: null, expiresAt: Date.now() + TTL_MS });
      return null;
    } finally {
      inflight.delete(idLugar);
    }
  })();

  inflight.set(idLugar, promise);
  return promise;
}

/** Invalida el cache (ej. al hacer pull-to-refresh forzado). */
export function clearFotosCache() {
  cache.clear();
  inflight.clear();
}

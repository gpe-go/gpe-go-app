/**
 * mundialService.ts
 * Datos estáticos del Mundial 2026 para el Estadio BBVA.
 *
 * Los partidos están hardcodeados en mundial2026.ts.
 * No se realizan llamadas a ninguna API externa.
 *
 * 🗑️  CLEANUP — después del 1 Jul 2026
 * Archivos a borrar: MundialWidget.tsx, mundial2026.ts, mundialService.ts
 */

import { Partido, PARTIDOS_BBVA } from '../data/mundial2026';

/**
 * Devuelve los partidos del BBVA desde los datos estáticos.
 * La firma es compatible con el uso anterior (fromCache / lastUpdated)
 * para no tener que cambiar nada en MundialWidget.tsx.
 */
export function getBBVAPartidos(): {
  partidos: Partido[];
  fromCache: boolean;
  lastUpdated: number | null;
} {
  return {
    partidos:    PARTIDOS_BBVA,
    fromCache:   true,
    lastUpdated: null,
  };
}

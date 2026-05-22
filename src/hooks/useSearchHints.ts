// Hook de "pistas" animadas para las barras de búsqueda.
//
// Genera la lista de textos grises que rotan dentro del input
// (ej. "Buscar Hoteles...", "Buscar Cinemex Lindavista...") de forma
// 100 % DINÁMICA:
//   • Categorías → vienen del backend vía `useCategorias()` /
//     `useCategoriasEventos()`. Si el municipio agrega una categoría
//     nueva en el dashboard, aparece sola en las pistas.
//   • Nombres de lugares / comercios / eventos → los pasa la pantalla
//     desde los datos que ya cargó (no hay lista hardcodeada).
//
// El `scope` decide qué categorías de LUGARES entran:
//   • 'all'        → todas (Home)
//   • 'directorio' → todo lo NO turístico (Directorio)
//   • 'explorar'   → solo lo turístico (Explorar)
//
// Devuelve strings ya formateados como `${t('search')} <sujeto>...`.

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategorias, useCategoriasEventos } from './useCategorias';
import { resolverPresentacion } from '../utils/categoriaPresentacion';

const normalizar = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Misma definición que filtrosLugares.CATEGORIAS_TURISTICAS, normalizada.
const TURISTICAS = new Set(['sitios turisticos']);

export type HintScope = 'all' | 'directorio' | 'explorar';

export interface SearchHintsOptions {
  /** Nombres de lugares/comercios/eventos para intercalar (dinámicos). */
  nombres?: string[];
  /** Incluir también las categorías de eventos (solo Home). */
  incluirEventos?: boolean;
  /** Qué categorías de lugares incluir según la pantalla. */
  scope?: HintScope;
  /** Máximo de pistas en la rotación (default 10). */
  max?: number;
}

export function useSearchHints({
  nombres = [],
  incluirEventos = false,
  scope = 'all',
  max = 10,
}: SearchHintsOptions = {}): string[] {
  const { t } = useTranslation();
  const { data: cats } = useCategorias();
  const { data: eventCats } = useCategoriasEventos();

  return useMemo(() => {
    // 1) Etiquetas de categorías de lugares según el scope.
    const catLabels = cats
      .filter((c) => {
        const n = normalizar(c.nombre);
        if (scope === 'explorar') return TURISTICAS.has(n);
        if (scope === 'directorio') return !TURISTICAS.has(n);
        return true;
      })
      .map((c) => {
        const p = resolverPresentacion(c.nombre);
        return p.labelKey ? t(p.labelKey) : c.nombre;
      });

    // 2) Categorías de eventos (solo Home).
    if (incluirEventos) {
      for (const c of eventCats) {
        if (c?.nombre) catLabels.push(c.nombre);
      }
    }

    // 3) Intercalar nombres (lugares/eventos) con categorías para que la
    //    rotación no muestre puras categorías ni puros nombres seguidos.
    const subjects: string[] = [];
    const maxLen = Math.max(catLabels.length, nombres.length);
    for (let i = 0; i < maxLen; i++) {
      if (nombres[i]) subjects.push(nombres[i]);
      if (catLabels[i]) subjects.push(catLabels[i]);
    }

    // 4) Dedup + recortar + formatear.
    const seen = new Set<string>();
    const hints: string[] = [];
    for (const sub of subjects) {
      const key = normalizar(sub);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      hints.push(`${t('search')} ${sub}...`);
      if (hints.length >= max) break;
    }

    return hints.length > 0 ? hints : [`${t('search')}...`];
  }, [cats, eventCats, nombres, incluirEventos, scope, max, t]);
}

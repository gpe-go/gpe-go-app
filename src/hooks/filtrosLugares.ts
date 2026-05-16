// ============================================================
//  Filtros y rotación de lugares por pantalla.
//
//  Cada pantalla principal muestra un SUBCONJUNTO específico de
//  categorías. Antes el frontend traía todos los lugares mezclados
//  y mostraba lo mismo en directorio, explorar y todas las cards
//  del home. Aquí centralizamos qué categorías corresponden a cada
//  vista para que los lugares no se repitan entre secciones.
//
//  Además, exponemos `rotarLugares()` que mezcla la lista con un
//  seed que cambia cada vez que el usuario abre la pantalla o hace
//  pull-to-refresh — así la rotación es perceptible.
// ============================================================

import type { Lugar } from '../types/lugar';

/**
 * Categorías estrictamente "turísticas" — se muestran SOLO en Explorar.
 * Es una lista de EXCLUSIÓN: cualquier categoría nueva que agregue el
 * municipio en el dashboard aparece automáticamente en Directorio
 * (porque no está en esta lista), y solo lo turístico queda apartado.
 */
export const CATEGORIAS_TURISTICAS = [
  'Sitios turísticos',
  'Cerros',
  'Parques',
  'Pueblos Mágicos',
  'Museos',
] as const;

/**
 * @deprecated Conservada por compatibilidad. Las pantallas ahora filtran
 * por exclusión (lo no-turístico → Directorio). Para listas dinámicas
 * usa `useCategorias()` + `excluirTuristicas()`.
 */
export const CATEGORIAS_DIRECTORIO = [
  'Restaurantes y bares',
  'Hoteles',
  'Tiendas',
  'Servicios',
  'Plazas',
  'Hospitales',
  'Farmacias',
  'Supermercados',
  'Gasolineras',
  'Belleza y cuidado personal',
  'Educación',
  'Automotriz',
  'Entretenimiento y recreación',
] as const;

/** @deprecated usar `CATEGORIAS_TURISTICAS` o filtros dinámicos. */
export const CATEGORIAS_EXPLORAR = [
  'Cerros',
  'Parques',
  'Pueblos Mágicos',
  'Museos',
] as const;

/** Devuelve solo los lugares cuya categoría NO es turística. */
export function excluirTuristicas<T extends { categoria?: string }>(lugares: T[]): T[] {
  const ban = new Set(CATEGORIAS_TURISTICAS.map(normalizar));
  return lugares.filter((l) => !l.categoria || !ban.has(normalizar(l.categoria)));
}

/** Devuelve solo los lugares cuya categoría SÍ es turística. */
export function soloTuristicas<T extends { categoria?: string }>(lugares: T[]): T[] {
  const ok = new Set(CATEGORIAS_TURISTICAS.map(normalizar));
  return lugares.filter((l) => l.categoria && ok.has(normalizar(l.categoria)));
}

/**
 * Mapeo de las cards del home (slug → categorías que entran).
 *
 * REGLA: si el array está vacío `[]`, `filtrarPorCategorias` NO filtra
 * y la card muestra TODOS los lugares disponibles. Esto convierte la
 * card en un catch-all dinámico: cualquier categoría nueva que agregue
 * el municipio en el dashboard sale automáticamente en esa card.
 *
 * Las cards temáticas (Fin de semana, Naturaleza, etc.) sí siguen
 * curadas a mano — son una experiencia visual editorial y deben elegir
 * a propósito qué entra. Si el municipio crea una categoría turística
 * nueva y se quiere meter en la card "Naturaleza", basta con agregar
 * el nombre aquí.
 */
export const CARD_CATEGORIAS: Record<string, readonly string[]> = {
  // "Explorar Guadalupe & NL" — catch-all: NO filtra, muestra todo lo
  // que la BD tenga. Los lugares se rotan al entrar para dar sensación
  // de contenido fresco. Nuevas categorías del dashboard caen aquí
  // automáticamente.
  explorar: [],
  // Cards temáticas curadas: lista explícita de categorías permitidas.
  'Fin de semana': ['Parques', 'Restaurantes y bares', 'Pueblos Mágicos', 'Museos'],
  'Naturaleza & Aventura': ['Parques', 'Cerros', 'Sitios turísticos'],
  'pueblos Magicos': ['Pueblos Mágicos'],
  'Pueblos Mágicos': ['Pueblos Mágicos'],
  tours: ['Pueblos Mágicos', 'Museos', 'Sitios turísticos'],
  cultura: ['Museos'],
  compras: ['Tiendas', 'Supermercados'],
  servicios: ['Servicios'],
};

/**
 * Filtra lugares dejando solo los que pertenecen a las categorías
 * permitidas. Comparación case-insensitive y sin tildes para ser
 * resistente a cómo venga la categoría desde la BD.
 */
export function filtrarPorCategorias(
  lugares: Lugar[],
  categorias: readonly string[],
): Lugar[] {
  if (!categorias || categorias.length === 0) return lugares;
  const set = new Set(categorias.map(normalizar));
  return lugares.filter((l) => l.categoria && set.has(normalizar(l.categoria)));
}

function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Mezcla los lugares con un seed estable durante la sesión actual
 * pero distinto en cada llamada — perfecto para rotar lo que se
 * muestra cada vez que el usuario entra a la pantalla o hace refresh.
 *
 * Usamos Fisher-Yates shuffle. NO mutamos el array original.
 */
export function rotarLugares<T>(lugares: T[]): T[] {
  const arr = lugares.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

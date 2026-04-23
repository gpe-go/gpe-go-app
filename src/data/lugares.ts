/**
 * Datos de lugares.
 * Todos los datos reales vienen de la API (gpe-go-api).
 * Este archivo solo re-exporta el tipo Lugar y expone LUGARES como array
 * vacío — useLugar.ts lo usa como fallback offline sin datos hardcodeados.
 */

import type { Lugar } from '../types/lugar';

export type { Lugar } from '../types/lugar';

/**
 * Array vacío: los datos se cargan desde la API.
 * Al poblar tb_lugares en el backend, aparecerán automáticamente en la app.
 */
export const LUGARES: Lugar[] = [];

export default LUGARES;

import { Lugar } from "../types/lugar";

// Cuando el lugar no tiene foto en la BD, dejamos `imagen = ""` y los
// consumidores resuelven el fallback al logo oficial vía
// `getImagenLugarSource()` (src/utils/imagenLugar.ts). Mantener el
// campo como string vacío (no null) preserva la compatibilidad con
// código que aún hace `{ uri: lugar.imagen }`.
export const mapLugar = (raw: any, imagenOverride?: string): Lugar => ({
  id: String(raw.id),
  nombre: raw.nombre ?? "",
  ubicacion: raw.direccion ?? "",
  imagen: imagenOverride ?? "",
  categoria: raw.categoria_nombre ?? "",
  subcategoria: raw.subcategoria ?? undefined,
  costo: "Consultar",
  rating: 0,
  lat: raw.latitud != null ? parseFloat(raw.latitud) : undefined,
  lng: raw.longitud != null ? parseFloat(raw.longitud) : undefined,
  // El teléfono puede venir null/"" desde el dashboard → lo normalizamos a
  // undefined para que la UI lo oculte cuando no exista.
  telefono:
    raw.telefono != null && String(raw.telefono).trim() !== ""
      ? String(raw.telefono).trim()
      : undefined,
});

export const mapLugares = (rawList: any[]): Lugar[] =>
  rawList.map((raw) => mapLugar(raw));

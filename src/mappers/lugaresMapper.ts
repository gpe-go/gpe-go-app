import { Lugar } from "../types/lugar";

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=Sin+Imagen";

export const mapLugar = (raw: any, imagenOverride?: string): Lugar => ({
  id: String(raw.id),
  nombre: raw.nombre ?? "",
  ubicacion: raw.direccion ?? "",
  imagen: imagenOverride ?? PLACEHOLDER_IMG,
  categoria: raw.categoria_nombre ?? "",
  subcategoria: raw.subcategoria ?? undefined,
  costo: "Consultar",
  rating: 0,
  lat: raw.latitud != null ? parseFloat(raw.latitud) : undefined,
  lng: raw.longitud != null ? parseFloat(raw.longitud) : undefined,
});

export const mapLugares = (rawList: any[]): Lugar[] =>
  rawList.map((raw) => mapLugar(raw));

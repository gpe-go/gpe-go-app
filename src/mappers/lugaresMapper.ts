import { Lugar } from "../types/lugar";

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=Sin+Imagen";

export const mapLugar = (raw: any, imagenOverride?: string): Lugar => ({
  id: String(raw.id),
  nombre: raw.nombre ?? "",
  ubicacion: raw.direccion ?? "",
  imagen: imagenOverride ?? PLACEHOLDER_IMG,
  categoria: raw.categoria_nombre ?? "",
  costo: "Consultar",
  rating: 0,
});

export const mapLugares = (rawList: any[]): Lugar[] =>
  rawList.map((raw) => mapLugar(raw));

import { Evento } from "../data/eventos";

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=Sin+Imagen";

const formatearFecha = (inicio?: string, fin?: string): string => {
  if (!inicio) return "";
  if (!fin || inicio === fin) return inicio;
  return `${inicio} - ${fin}`;
};

export const mapEvento = (raw: any, imagenOverride?: string): Evento => ({
  id: String(raw.id),
  titulo: raw.titulo ?? "",
  fecha: formatearFecha(raw.fecha_inicio, raw.fecha_fin),
  lugar: raw.lugar_nombre ?? "",
  imagen: imagenOverride ?? PLACEHOLDER_IMG,
  categoria: "General",
  sub: raw.tipo === "noticia" ? "Noticia" : "Evento",
  costo: "Consultar",
  especial: false,
});

export const mapEventos = (rawList: any[]): Evento[] =>
  rawList.map((raw) => mapEvento(raw));

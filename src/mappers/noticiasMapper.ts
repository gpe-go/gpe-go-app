const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=Sin+Imagen";

export type Noticia = {
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  content: string;
};

export const mapNoticia = (raw: any, imagenOverride?: string): Noticia => ({
  title: raw.titulo ?? "",
  description: raw.descripcion ?? "",
  image: imagenOverride ?? PLACEHOLDER_IMG,
  publishedAt: raw.fecha_inicio ?? "",
  content: raw.descripcion ?? "",
});

export const mapNoticias = (rawList: any[]): Noticia[] =>
  rawList.map((raw) => mapNoticia(raw));

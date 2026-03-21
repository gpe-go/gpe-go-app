const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=Sin+Imagen";

export type Noticia = {
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  content: string;
};

export const mapNoticia = (raw: any): Noticia => ({
  title: raw.titulo ?? "",
  description: raw.descripcion ?? "",
  image: PLACEHOLDER_IMG,
  publishedAt: raw.fecha_inicio ?? "",
  content: raw.descripcion ?? "",
});

export const mapNoticias = (rawList: any[]): Noticia[] =>
  rawList.map(mapNoticia);

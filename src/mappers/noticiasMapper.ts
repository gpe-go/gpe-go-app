// Sin placeholder externo: si no hay foto, dejamos `image = ""` y los
// consumidores (detalleNoticia, tarjetas, etc.) resuelven el fallback
// localmente con el logo GPE GO.
export type Noticia = {
  id: string;
  title: string;
  description: string;
  /** Primera foto. Vacío si la noticia no trae imagen. */
  image: string;
  /** Todas las fotos disponibles (incluye la principal en [0]). */
  images: string[];
  publishedAt: string;
  content: string;
};

export const mapNoticia = (
  raw: any,
  imagenOverride?: string,
  imagenesOverride?: string[],
): Noticia => {
  const imagenes = imagenesOverride && imagenesOverride.length > 0
    ? imagenesOverride
    : (imagenOverride ? [imagenOverride] : []);
  return {
    id: String(raw.id ?? ''),
    title: raw.titulo ?? "",
    description: raw.descripcion ?? "",
    image: imagenes[0] ?? "",
    images: imagenes,
    publishedAt: raw.fecha_inicio ?? "",
    content: raw.descripcion ?? "",
  };
};

export const mapNoticias = (rawList: any[]): Noticia[] =>
  rawList.map((raw) => mapNoticia(raw));

export type FavoritoAPI = {
  id: string;
  id_lugar: string | null;
  id_evento: string | null;
  nombre: string;
};

export const mapFavorito = (raw: any): FavoritoAPI => ({
  id: String(raw.id),
  id_lugar: raw.id_lugar ? String(raw.id_lugar) : null,
  id_evento: raw.id_evento ? String(raw.id_evento) : null,
  nombre: raw.nombre_lugar ?? raw.nombre_evento ?? "",
});

export const mapFavoritos = (rawList: any[]): FavoritoAPI[] =>
  rawList.map(mapFavorito);

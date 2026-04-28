export type Lugar = {
  id: string;
  nombre: string;
  ubicacion?: string;
  imagen: string;
  categoria: string;
  subcategoria?: string;
  costo?: string;
  rating?: number;
  descripcion?: string;
  origen?: string;
  /** Coordenadas GPS del lugar (vienen de tb_lugares.latitud / .longitud) */
  lat?: number;
  lng?: number;
};

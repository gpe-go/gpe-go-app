/**
 * Tipo de Evento.
 * Los datos reales vienen de la API (gpe-go-api) a través del hook useEventos.
 */
export type Evento = {
  id: string;
  titulo: string;
  fecha: string;
  lugar: string;
  imagen: string;
  categoria: string;
  sub: string;
  costo: string;
  especial?: boolean;
};

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
  videoSource?: any;
};

/* ================= DATA ================= */
export const EVENTOS_DATA = [
  {
    id: 'm1',
    titulo: 'FIFA Fan Fest Guadalupe',
    fecha: '15 Junio - 15 Julio 2026',
    lugar: 'Estadio BBVA (Gigante de Acero)',
    imagen:
      'https://cdn.forbes.com.mx/2025/10/fad1fab784a384e167d98804139a10414dc89088w.jpg',
    categoria: 'Deporte',
    sub: 'Mundial 2026',
    costo: 'Gratis',
    especial: true,
    videoSource: require('../../assets/images/intro.mp4'),
  },

  /* DEPORTE */
  { id: 'd1', titulo: 'Clásico Regio Femenil', fecha: '20 Abril 2026', lugar: 'Estadio BBVA', imagen: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974', categoria: 'Deporte', sub: 'Fútbol', costo: '$250 MXN' },
  { id: 'd2', titulo: 'Maratón Guadalupe 10K', fecha: '05 Mayo 2026', lugar: 'Plaza Principal', imagen: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca', categoria: 'Deporte', sub: 'Atletismo', costo: '$300 MXN' },

  /* CULTURAL */
  { id: 'c1', titulo: 'Festival del Cerro de la Silla', fecha: '10 Mayo 2026', lugar: 'Teatro del Pueblo', imagen: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3', categoria: 'Cultural', sub: 'Festivales', costo: 'Gratis' },
  { id: 'c2', titulo: 'Expo Arte Nuevo León', fecha: '12-15 Mayo 2026', lugar: 'Centro Cultural', imagen: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b', categoria: 'Cultural', sub: 'Exposiciones', costo: '$50 MXN' },

  /* GASTRONOMÍA */
  { id: 'g1', titulo: 'Feria del Cabrito', fecha: '22 Mayo 2026', lugar: 'Expo Guadalupe', imagen: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', categoria: 'Gastronomía', sub: 'Ferias', costo: 'Entrada Libre' },
  { id: 'g2', titulo: 'Degustación de Vinos', fecha: '28 Mayo 2026', lugar: 'Hacienda El Rosario', imagen: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3', categoria: 'Gastronomía', sub: 'Degustaciones', costo: '$650 MXN' },

  /* SOCIALES */
  { id: 's1', titulo: 'Boda Comunitaria 2026', fecha: '14 Febrero 2026', lugar: 'Plaza Principal', imagen: 'https://catholicnewsherald.com/images/stories/Espanol24/07202024-_Community_wedding3.jpeg', categoria: 'Sociales', sub: 'Comunitario', costo: 'Gratis' },
  { id: 's2', titulo: 'Carnaval Guadalupe', fecha: '20 Marzo 2026', lugar: 'Centro Histórico', imagen: 'https://images.unsplash.com/photo-1506157786151-b8491531f063', categoria: 'Sociales', sub: 'Festival', costo: 'Gratis' },
];

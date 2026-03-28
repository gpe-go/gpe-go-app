// ─────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────

export type CategoriaEvento = 'Deporte' | 'Cultural' | 'Gastronomía' | 'Sociales';

export type Evento = {
  id:          string;
  titulo:      string;
  fecha:       string;
  lugar:       string;
  imagen:      string;
  categoria:   CategoriaEvento;
  sub:         string;
  costo:       string;
  descripcion?: string;
  especial?:   boolean;
  videoSource?: any;
};

// ─────────────────────────────────────────────────────────
// META POR CATEGORÍA — color e ícono
// ─────────────────────────────────────────────────────────

export const CATEGORIA_META: Record<CategoriaEvento, { color: string; icon: string }> = {
  Deporte:     { color: '#E96928', icon: 'soccer'        },
  Cultural:    { color: '#9C27B0', icon: 'palette'       },
  Gastronomía: { color: '#10B981', icon: 'food'          },
  Sociales:    { color: '#4A90E2', icon: 'account-group' },
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

/** Devuelve solo el evento especial (hero de la pantalla) */
export const getEventoEspecial = (): Evento | undefined =>
  EVENTOS_DATA.find((e) => e.especial);

/** Devuelve eventos normales opcionalmente filtrados por categoría */
export const getEventosFiltrados = (
  categoria?: CategoriaEvento | 'Todas',
  busqueda?:  string
): Evento[] =>
  EVENTOS_DATA.filter((e) => {
    if (e.especial) return false;
    const matchCat = !categoria || categoria === 'Todas' || e.categoria === categoria;
    const matchBus = !busqueda  || e.titulo.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBus;
  });

/** Devuelve las categorías únicas presentes en los datos */
export const getCategorias = (): CategoriaEvento[] =>
  [...new Set(EVENTOS_DATA.filter((e) => !e.especial).map((e) => e.categoria))];

// ─────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────

export const EVENTOS_DATA: Evento[] = [

  // ── EVENTO ESPECIAL (hero) ────────────────────────────
  {
    id:          'm1',
    titulo:      'FIFA Fan Fest Guadalupe',
    fecha:       '15 Junio – 15 Julio 2026',
    lugar:       'Estadio BBVA · Gigante de Acero',
    imagen:      'https://cdn.forbes.com.mx/2025/10/fad1fab784a384e167d98804139a10414dc89088w.jpg',
    categoria:   'Deporte',
    sub:         'Mundial 2026',
    costo:       'Gratis',
    descripcion: 'Vive la magia del Mundial 2026 en Guadalupe. Fan Fest oficial con pantallas gigantes, activaciones, comida y más.',
    especial:    true,
    videoSource: require('../../assets/images/intro.mp4'),
  },

  // ── DEPORTE ───────────────────────────────────────────
  {
    id:          'd1',
    titulo:      'Clásico Regio Femenil',
    fecha:       '20 Abril 2026',
    lugar:       'Estadio BBVA, Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1517466787929-bc90951d0974',
    categoria:   'Deporte',
    sub:         'Fútbol',
    costo:       '$250 MXN',
    descripcion: 'El partido más esperado del fútbol femenil regio. Tigres vs Rayadas en el coloso de Guadalupe.',
  },
  {
    id:          'd2',
    titulo:      'Maratón Guadalupe 10K',
    fecha:       '05 Mayo 2026',
    lugar:       'Plaza Principal, Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca',
    categoria:   'Deporte',
    sub:         'Atletismo',
    costo:       '$300 MXN',
    descripcion: 'Corre por las calles de Guadalupe en el maratón más popular del municipio. 10K y 5K disponibles.',
  },
  {
    id:          'd3',
    titulo:      'Torneo de Básquet 3x3',
    fecha:       '18 Mayo 2026',
    lugar:       'Parque Pipo, Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1546519638-68e109498ffc',
    categoria:   'Deporte',
    sub:         'Básquetbol',
    costo:       'Gratis',
    descripcion: 'Torneo abierto de básquet 3x3 en el Parque Pipo. Inscripciones en línea.',
  },

  // ── CULTURAL ──────────────────────────────────────────
  {
    id:          'c1',
    titulo:      'Festival del Cerro de la Silla',
    fecha:       '10 Mayo 2026',
    lugar:       'Teatro del Pueblo, Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
    categoria:   'Cultural',
    sub:         'Festivales',
    costo:       'Gratis',
    descripcion: 'Música, danza y arte en honor al ícono natural de Nuevo León. Artistas locales y nacionales.',
  },
  {
    id:          'c2',
    titulo:      'Expo Arte Nuevo León',
    fecha:       '12–15 Mayo 2026',
    lugar:       'Centro Cultural Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
    categoria:   'Cultural',
    sub:         'Exposiciones',
    costo:       '$50 MXN',
    descripcion: 'Exposición de artistas emergentes y consagrados de Nuevo León. Pinturas, esculturas y arte digital.',
  },
  {
    id:          'c3',
    titulo:      'Noche de Museos Guadalupe',
    fecha:       '06 Junio 2026',
    lugar:       'Museos del Municipio',
    imagen:      'https://images.unsplash.com/photo-1575783970733-1aaedde1db74',
    categoria:   'Cultural',
    sub:         'Museos',
    costo:       'Gratis',
    descripcion: 'Acceso gratuito a todos los museos del municipio por una noche. Visitas guiadas y actividades.',
  },

  // ── GASTRONOMÍA ───────────────────────────────────────
  {
    id:          'g1',
    titulo:      'Feria del Cabrito',
    fecha:       '22 Mayo 2026',
    lugar:       'Expo Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
    categoria:   'Gastronomía',
    sub:         'Ferias',
    costo:       'Entrada Libre',
    descripcion: 'La feria más carnívora de NL. Cabrito al pastor, machacado, gorditas y mucho más.',
  },
  {
    id:          'g2',
    titulo:      'Degustación de Vinos',
    fecha:       '28 Mayo 2026',
    lugar:       'Hacienda El Rosario, Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
    categoria:   'Gastronomía',
    sub:         'Degustaciones',
    costo:       '$650 MXN',
    descripcion: 'Cata de vinos de la región con maridaje de quesos artesanales. Cupo limitado.',
  },
  {
    id:          'g3',
    titulo:      'Festival de la Gordita',
    fecha:       '14 Junio 2026',
    lugar:       'Plaza Las Américas, Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
    categoria:   'Gastronomía',
    sub:         'Festivales',
    costo:       'Gratis',
    descripcion: 'El platillo más querido de Guadalupe tiene su propio festival. 30+ puestos de gorditas artesanales.',
  },

  // ── SOCIALES ──────────────────────────────────────────
  {
    id:          's1',
    titulo:      'Boda Comunitaria 2026',
    fecha:       '14 Febrero 2026',
    lugar:       'Plaza Principal, Guadalupe',
    imagen:      'https://catholicnewsherald.com/images/stories/Espanol24/07202024-_Community_wedding3.jpeg',
    categoria:   'Sociales',
    sub:         'Comunitario',
    costo:       'Gratis',
    descripcion: 'El municipio une corazones. Ceremonia civil gratuita para parejas de Guadalupe.',
  },
  {
    id:          's2',
    titulo:      'Carnaval Guadalupe',
    fecha:       '20 Marzo 2026',
    lugar:       'Centro Histórico, Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1506157786151-b8491531f063',
    categoria:   'Sociales',
    sub:         'Festival',
    costo:       'Gratis',
    descripcion: 'Desfile de carrozas, comparsas, música en vivo y fuegos artificiales. La fiesta más grande del año.',
  },
  {
    id:          's3',
    titulo:      'Feria del Empleo Guadalupe',
    fecha:       '10 Abril 2026',
    lugar:       'Palacio Municipal, Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1521791136064-7986c2920216',
    categoria:   'Sociales',
    sub:         'Comunitario',
    costo:       'Gratis',
    descripcion: 'Más de 50 empresas locales y nacionales buscan talento. Lleva tu CV y prepárate para entrevistas.',
  },

];
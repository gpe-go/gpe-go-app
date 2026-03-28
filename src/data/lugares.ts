// TODO: Cuando exista backend reemplazar LUGARES por:
// import { getLugares } from "@/src/api/api";
// ─────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────

export type CategoriaLugar =
  | 'Naturaleza & Aventura'
  | 'cultura'
  | 'pueblos Magicos'
  | 'explorar'
  | 'compras'
  | 'servicios'
  | 'Fin de semana'
  | 'tours';

export type Lugar = {
  id:          string;
  nombre:      string;
  ubicacion:   string;
  imagen:      string;
  categoria:   CategoriaLugar;
  costo:       string;
  rating?:     number;
  descripcion?: string;
  horario?:    string;
  precio?:     string; // alias de costo para compatibilidad
};

// ─────────────────────────────────────────────────────────
// META POR CATEGORÍA — color, ícono y etiqueta visual
// ─────────────────────────────────────────────────────────

export const CATEGORIA_LUGAR_META: Record<CategoriaLugar, {
  color:   string;
  icon:    string;
  label:   string;
}> = {
  'Naturaleza & Aventura': { color: '#4CAF50', icon: 'leaf-outline',         label: 'Naturaleza'     },
  'cultura':               { color: '#9C27B0', icon: 'library-outline',      label: 'Cultura'        },
  'pueblos Magicos':       { color: '#F5BE41', icon: 'sparkles-outline',     label: 'Pueblos Mágicos'},
  'explorar':              { color: '#E96928', icon: 'compass-outline',      label: 'Explorar'       },
  'compras':               { color: '#10B981', icon: 'bag-handle-outline',   label: 'Compras'        },
  'servicios':             { color: '#64748B', icon: 'construct-outline',    label: 'Servicios'      },
  'Fin de semana':         { color: '#4A90E2', icon: 'sunny-outline',        label: 'Fin de semana'  },
  'tours':                 { color: '#EF4444', icon: 'bus-outline',          label: 'Tours'          },
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

/** Buscar lugar por ID */
export const getLugarById = (id: string): Lugar | undefined =>
  LUGARES.find((l) => l.id === id);

/** Filtrar por categoría */
export const getLugaresPorCategoria = (cat: CategoriaLugar): Lugar[] =>
  LUGARES.filter((l) => l.categoria === cat);

/** Buscar por texto en nombre o ubicación */
export const buscarLugares = (query: string): Lugar[] => {
  const q = query.toLowerCase().trim();
  if (!q) return LUGARES;
  return LUGARES.filter(
    (l) =>
      l.nombre.toLowerCase().includes(q) ||
      l.ubicacion.toLowerCase().includes(q) ||
      l.categoria.toLowerCase().includes(q)
  );
};

/** Lugares mejor valorados (rating >= umbral) */
export const getLugaresPorRating = (minRating = 4): Lugar[] =>
  LUGARES.filter((l) => (l.rating ?? 0) >= minRating)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

/** Categorías únicas presentes en los datos */
export const getCategorias = (): CategoriaLugar[] =>
  [...new Set(LUGARES.map((l) => l.categoria))];

// ─────────────────────────────────────────────────────────
// DATA
// TODO: Reemplazar por getLugares() de api.ts cuando
//       exista el backend.
// ─────────────────────────────────────────────────────────

export const LUGARES: Lugar[] = [

  // ── NATURALEZA & AVENTURA ─────────────────────────────
  {
    id:          '1',
    nombre:      'Cerro de la Silla',
    ubicacion:   'Guadalupe, Nuevo León',
    imagen:      'https://mvsnoticias.com/u/fotografias/m/2023/9/27/f768x400-565219_609122_7.jpg',
    categoria:   'Naturaleza & Aventura',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Ícono natural de Nuevo León. Senderismo con vistas panorámicas de la zona metropolitana.',
    horario:     'Lun–Dom 6:00 – 18:00',
  },
  {
    id:          '3',
    nombre:      'Parque Fundidora',
    ubicacion:   'Monterrey, Nuevo León',
    imagen:      'https://tse4.mm.bing.net/th/id/OIP.LSo-DdPCU1kKKMGv9yBkkwHaFj',
    categoria:   'Naturaleza & Aventura',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Parque urbano dentro de las antiguas instalaciones de la Fundidora de Monterrey.',
    horario:     'Lun–Dom 6:00 – 22:00',
  },
  {
    id:          '5',
    nombre:      'Parque Pipo',
    ubicacion:   'Guadalupe, Nuevo León',
    imagen:      'https://media-cdn.tripadvisor.com/media/photo-s/12/74/d3/4e/rio-la-silla.jpg',
    categoria:   'Naturaleza & Aventura',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Parque recreativo a orillas del Río La Silla. Ideal para familias y corredores.',
    horario:     'Lun–Dom 6:00 – 21:00',
  },
  {
    id:          '6',
    nombre:      'Parque Ecológico Chipinque',
    ubicacion:   'San Pedro Garza García, Nuevo León',
    imagen:      'https://tse1.mm.bing.net/th/id/OIP.Vd67Wv_2mjiLc_0FQIsLJAHaFj?rs=1&pid=ImgDetMain&o=7&rm=3',
    categoria:   'Naturaleza & Aventura',
    costo:       '$150 MXN',
    rating:      5,
    descripcion: 'Reserva ecológica en la Sierra Madre Oriental. Senderismo, ciclismo y avistamiento de fauna.',
    horario:     'Lun–Dom 6:00 – 18:00',
  },

  // ── CULTURA ───────────────────────────────────────────
  {
    id:          '2',
    nombre:      'Cerro del Obispado',
    ubicacion:   'Monterrey, Nuevo León',
    imagen:      'https://mvsnoticias.com/u/fotografias/m/2023/9/27/f768x400-565213_609116_0.jpg',
    categoria:   'cultura',
    costo:       '$65 MXN',
    rating:      4,
    descripcion: 'Museo regional en el Palacio del Obispado, testigo de la historia de Monterrey.',
    horario:     'Mar–Dom 10:00 – 17:00',
  },
  {
    id:          '4',
    nombre:      'MARCO',
    ubicacion:   'Centro Monterrey, Nuevo León',
    imagen:      'https://www.turimexico.com/wp-content/uploads/2015/06/marco.jpg',
    categoria:   'cultura',
    costo:       '$85 MXN',
    rating:      5,
    descripcion: 'Museo de Arte Contemporáneo de Monterrey. Exposiciones nacionales e internacionales.',
    horario:     'Mar–Dom 11:00 – 18:00',
  },

  // ── PUEBLOS MÁGICOS ───────────────────────────────────
  {
    id:          '7',
    nombre:      'Santiago',
    ubicacion:   'Santiago, Nuevo León',
    imagen:      'https://tse1.mm.bing.net/th/id/OIP.j6MPb2t1znNLuUxVB0-y8QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
    categoria:   'pueblos Magicos',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Pueblo Mágico rodeado de sierras y cascadas. Punto de partida para Cola de Caballo.',
    horario:     'Todo el día',
  },
  {
    id:          '8',
    nombre:      'Bustamante',
    ubicacion:   'Bustamante, Nuevo León',
    imagen:      'https://tse1.mm.bing.net/th/id/OIP.xLA8540BS1kQo85-77Z5vwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
    categoria:   'pueblos Magicos',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Pueblo colonial con grutas naturales y arquitectura virreinal bien conservada.',
    horario:     'Todo el día',
  },
  {
    id:          '9',
    nombre:      'Linares',
    ubicacion:   'Linares, Nuevo León',
    imagen:      'https://mexicodesconocidoviajes.mx/wp-content/uploads/2018/10/Catedral-San-Felipe-Apostol_cortesia-secturNL-ok.jpg',
    categoria:   'pueblos Magicos',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Ciudad histórica con la Catedral de San Felipe Apóstol y el famoso dulce de Glorias.',
    horario:     'Todo el día',
  },

  // ── EXPLORAR ──────────────────────────────────────────
  {
    id:          '10',
    nombre:      'Hotel Real Guadalupe',
    ubicacion:   'Av. Benito Juárez 123, Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    categoria:   'explorar',
    costo:       '$1,800 MXN / noche',
    rating:      5,
    descripcion: 'Hotel boutique en el corazón de Guadalupe. Alberca, restaurante y spa.',
    horario:     '24 horas',
  },
  {
    id:          '17',
    nombre:      'Cerro de la Silla (Mirador)',
    ubicacion:   'Guadalupe, Nuevo León',
    imagen:      'https://th.bing.com/th/id/R.b42743b674566dfe75ff36f62196007a?rik=3F6L52tuE6LlAg&pid=ImgRaw&r=0',
    categoria:   'explorar',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Mirador con la mejor vista del Cerro de la Silla y la zona metropolitana.',
    horario:     'Lun–Dom 6:00 – 18:00',
  },
  {
    id:          '18',
    nombre:      'Parque La Pastora',
    ubicacion:   'Guadalupe, Nuevo León',
    imagen:      'https://tse2.mm.bing.net/th/id/OIP.NLr3EiUYmAgysWr4a2SDDQHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
    categoria:   'explorar',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Zoológico y parque recreativo en Guadalupe. Ideal para toda la familia.',
    horario:     'Mar–Dom 9:00 – 17:00',
  },
  {
    id:          '19',
    nombre:      'Estadio BBVA',
    ubicacion:   'Guadalupe, Nuevo León',
    imagen:      'https://blog.laminasyaceros.com/hubfs/estadio%202%20laminas%20y%20aceros.jpg',
    categoria:   'explorar',
    costo:       '$450 MXN por evento',
    rating:      5,
    descripcion: 'El Gigante de Acero. Estadio de los Rayados de Monterrey con capacidad para 53,000 personas.',
    horario:     'Días de partido',
  },
  {
    id:          '20',
    nombre:      'Parque Fundidora',
    ubicacion:   'Monterrey, Nuevo León',
    imagen:      'https://tse4.mm.bing.net/th/id/OIP.LSo-DdPCU1kKKMGv9yBkkwHaFj',
    categoria:   'explorar',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Espacio cultural y de entretenimiento en las antiguas instalaciones de la Fundidora.',
    horario:     'Lun–Dom 6:00 – 22:00',
  },
  {
    id:          '21',
    nombre:      'Paseo Santa Lucía',
    ubicacion:   'Monterrey, Nuevo León',
    imagen:      'https://monterreydigital.com/wp-content/uploads/2023/02/monterreyfeatured.jpg',
    categoria:   'explorar',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Canal peatonal de 2.5 km con paseos en lancha, fuentes y arte urbano.',
    horario:     'Lun–Dom 8:00 – 22:00',
  },

  // ── COMPRAS ───────────────────────────────────────────
  {
    id:          '11',
    nombre:      'La Terraza Gourmet',
    ubicacion:   'Blvd. Central 789, Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400',
    categoria:   'compras',
    costo:       'Variable según platillo',
    rating:      5,
    descripcion: 'Restaurante gourmet con vista panorámica. Especialidades de la cocina nuevoleonesa.',
    horario:     'Mar–Dom 13:00 – 23:00',
  },
  {
    id:          '12',
    nombre:      'Fonda Doña Mari',
    ubicacion:   'Calle Hidalgo 456, Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    categoria:   'compras',
    costo:       'Variable según platillo',
    rating:      5,
    descripcion: 'Cocina tradicional nuevoleonesa. Cabrito, machacado y gorditas artesanales.',
    horario:     'Lun–Sáb 8:00 – 18:00',
  },
  {
    id:          '13',
    nombre:      'Plaza Multiplaza',
    ubicacion:   'Carretera Reynosa 789, Guadalupe',
    imagen:      'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400',
    categoria:   'compras',
    costo:       'Gratis (entrada)',
    rating:      5,
    descripcion: 'Centro comercial con más de 150 tiendas, cines, restaurantes y área de juegos.',
    horario:     'Lun–Dom 10:00 – 21:00',
  },
  {
    id:          '14',
    nombre:      'Abarrotes El Güero',
    ubicacion:   'Av. Pablo Livas 101, Guadalupe',
    imagen:      'https://tse4.mm.bing.net/th/id/OIP.sfUhrvsTMibSw41Y_px8-gHaEK',
    categoria:   'compras',
    costo:       'Variable según producto',
    rating:      5,
    descripcion: 'Tienda tradicional con productos locales, botanas artesanales y antojitos.',
    horario:     'Lun–Sáb 7:00 – 21:00',
  },

  // ── SERVICIOS ─────────────────────────────────────────
  {
    id:          '15',
    nombre:      'CFE Guadalupe',
    ubicacion:   'Centro de Guadalupe, Nuevo León',
    imagen:      'https://recibodeluzmexico.com.mx/wp-content/uploads/2025/03/oficina-cfe-zona-metropolitana-oriente-768x427.jpg',
    categoria:   'servicios',
    costo:       'Gratis',
    rating:      2,
    descripcion: 'Oficina de la Comisión Federal de Electricidad para trámites y pagos de luz.',
    horario:     'Lun–Vie 8:00 – 15:00',
  },
  {
    id:          '16',
    nombre:      'Agua y Drenaje',
    ubicacion:   'Av. Eloy Cavazos, Guadalupe',
    imagen:      'https://tse1.mm.bing.net/th/id/OIP._P5sJ3inFzgJi9oz6YcaxQHaEw',
    categoria:   'servicios',
    costo:       'Gratis',
    rating:      1,
    descripcion: 'Oficina de SADM para trámites de agua potable, drenaje y alcantarillado.',
    horario:     'Lun–Vie 8:00 – 15:00',
  },

  // ── FIN DE SEMANA ─────────────────────────────────────
  {
    id:          '22',
    nombre:      'Santiago Pueblo Mágico',
    ubicacion:   'Santiago, Nuevo León',
    imagen:      'https://www.lugaresturisticosenmexico.com/wp-content/uploads/2022/04/Santiago-Nuevo-Leon-Pueblo-Magico-2-768x384.jpg',
    categoria:   'Fin de semana',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Pueblo Mágico con cascadas, sierras y gastronomía local. Escapada perfecta de fin de semana.',
    horario:     'Todo el día',
  },
  {
    id:          '23',
    nombre:      'Cola de Caballo',
    ubicacion:   'Santiago, Nuevo León',
    imagen:      'https://i.pinimg.com/originals/f4/07/f4/f407f499a568d2a65abbe258274d43ae.jpg',
    categoria:   'Fin de semana',
    costo:       '$180 MXN por tour',
    rating:      5,
    descripcion: 'Cascada de 25 metros en las faldas de la Sierra Madre. Tirolesa y senderismo.',
    horario:     'Lun–Dom 9:00 – 17:00',
  },
  {
    id:          '24',
    nombre:      'Grutas de García',
    ubicacion:   'García, Nuevo León',
    imagen:      'https://www.atractivosturisticos.com.mx/wp-content/uploads/2017/05/Grutas.jpg',
    categoria:   'Fin de semana',
    costo:       '$250 MXN por tour',
    rating:      5,
    descripcion: 'Sistema de cuevas con formaciones de más de 50 millones de años. Acceso en teleférico.',
    horario:     'Lun–Dom 9:00 – 17:00',
  },
  {
    id:          '25',
    nombre:      'Parque Chipinque',
    ubicacion:   'San Pedro Garza García, Nuevo León',
    imagen:      'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/10/23/5f/15.jpg',
    categoria:   'Fin de semana',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Reserva natural en la Sierra Madre. Ciclismo, senderismo y picnic con vistas al valle.',
    horario:     'Lun–Dom 6:00 – 18:00',
  },
  {
    id:          '26',
    nombre:      'Presa La Boca',
    ubicacion:   'Santiago, Nuevo León',
    imagen:      'https://th.bing.com/th/id/R.fa41a94ecaaa5b9daebb25be382ad3d9?rik=wORqAQuZcvRMKw&pid=ImgRaw&r=0',
    categoria:   'Fin de semana',
    costo:       'Gratis',
    rating:      5,
    descripcion: 'Presa rodeada de montañas. Kayak, pesca deportiva y paseos en lancha.',
    horario:     'Lun–Dom 7:00 – 19:00',
  },

  // ── TOURS ─────────────────────────────────────────────
  {
    id:          '27',
    nombre:      'Serengeti Safari (Tour en Camión)',
    ubicacion:   'Bioparque Estrella, Montemorelos, NL',
    imagen:      'https://www.overlandtour.de/wp-content/uploads/2015/08/CitySightsseing_Cape_Town_2015-1536x1023.jpg',
    categoria:   'tours',
    costo:       'Incluido en entrada',
    rating:      5,
    descripcion: 'Recorre la sabana africana en camión. Jirafas, rinocerontes y cebras a metros de distancia.',
    horario:     'Lun–Dom 9:00 – 17:00',
  },
  {
    id:          '28',
    nombre:      'AutoSafari (Tour en tu vehículo)',
    ubicacion:   'Bioparque Estrella, Montemorelos, NL',
    imagen:      'https://tse1.mm.bing.net/th/id/OIP.ZwXvS382X6FTRMVxM6jZJgHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    categoria:   'tours',
    costo:       'Incluido en entrada',
    rating:      5,
    descripcion: 'Vive el safari desde la comodidad de tu propio vehículo. Animales en libertad.',
    horario:     'Lun–Dom 9:00 – 17:00',
  },
  {
    id:          '29',
    nombre:      'Tour Caminando entre Leones',
    ubicacion:   'Bioparque Estrella, Montemorelos, NL',
    imagen:      'https://redballoon.com.au/dw/image/v2/BCRD_PRD/on/demandware.static/-/Sites-rb-au-catalog/default/images/products/SAZ026-M/f6qhqfjlzfo1pzz4l4pf.jpg?sw=732&sh=410&q=70',
    categoria:   'tours',
    costo:       'Incluido en entrada',
    rating:      5,
    descripcion: 'Experiencia única: camina junto a leones jóvenes con guía especializado.',
    horario:     'Lun–Dom 10:00 – 16:00',
  },
  {
    id:          '30',
    nombre:      'Tour Mirador de Jirafas',
    ubicacion:   'Bioparque Estrella, Montemorelos, NL',
    imagen:      'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/09/f7/75/b0.jpg',
    categoria:   'tours',
    costo:       'Incluido en entrada',
    rating:      5,
    descripcion: 'Alimenta jirafas desde una plataforma elevada con vista panorámica al bioparque.',
    horario:     'Lun–Dom 10:00 – 16:00',
  },
  {
    id:          '31',
    nombre:      'Transporte Turístico al Bioparque',
    ubicacion:   'Salida desde Monterrey, Nuevo León',
    imagen:      'https://blob.posta.com.mx/images/2025/01/21/transporte_en_nuevo_leon_como_llegar_a_bioparque_estrella-focus-0-0-1479-828.webp',
    categoria:   'tours',
    costo:       'Incluido en paquete',
    rating:      5,
    descripcion: 'Traslado redondo desde Monterrey al Bioparque Estrella. Sale desde el centro.',
    horario:     'Sáb–Dom 8:00 AM salida',
  },

];
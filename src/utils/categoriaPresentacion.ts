// Presentación visual de las categorías que devuelve el backend.
//
// La API devuelve `{ id, nombre, descripcion }` pero la UI necesita
// además un icono, un color y una clave de traducción. Mantener ese
// mapeo aquí (no en la respuesta del API) tiene dos ventajas:
//   1. Si el municipio agrega una categoría nueva desde el dashboard,
//      automáticamente cae al estilo por defecto — la app sigue
//      funcionando sin código nuevo.
//   2. El backend no necesita exponer assets/iconos.
//
// `resolverPresentacion(nombre)` busca primero por nombre normalizado
// (sin tildes, minúsculas). Si no encuentra match, devuelve un default
// que mantiene la categoría usable visualmente.

export type CategoriaPresentacion = {
  icon: string;          // nombre MaterialCommunityIcons
  color: string;         // hex
  labelKey: string | null; // clave i18n; si null se usa el nombre crudo del backend
};

const norm = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const TABLA: Record<string, CategoriaPresentacion> = {
  'automotriz':                    { icon: 'car-wrench',           color: '#475569', labelKey: 'cat_automotriz' },
  'belleza y cuidado personal':    { icon: 'face-woman-shimmer',   color: '#EC4899', labelKey: 'cat_belleza' },
  'educacion':                     { icon: 'school',               color: '#3B82F6', labelKey: 'cat_educacion' },
  'entretenimiento y recreacion':  { icon: 'party-popper',         color: '#A855F7', labelKey: 'cat_entretenimiento' },
  'gobierno e instituciones':      { icon: 'bank',                 color: '#6B7280', labelKey: 'cat_gobierno' },
  'hoteles y alojamiento':         { icon: 'office-building',      color: '#4A90E2', labelKey: 'cat_hoteles' },
  'hoteles':                       { icon: 'office-building',      color: '#4A90E2', labelKey: 'cat_hoteles' },
  'industria y manufactura':       { icon: 'factory',              color: '#92400E', labelKey: 'cat_industria' },
  'restaurantes y bares':          { icon: 'silverware-fork-knife', color: '#FF6B35', labelKey: 'cat_restaurantes' },
  'salud y farmacias':             { icon: 'pill',                 color: '#528968', labelKey: 'cat_salud' },
  'farmacias':                     { icon: 'pill',                 color: '#528968', labelKey: 'cat_farmacias' },
  'hospitales':                    { icon: 'hospital-box',         color: '#A2A6A6', labelKey: 'cat_hospitales' },
  'servicios':                     { icon: 'hammer-wrench',        color: '#F97613', labelKey: 'cat_servicios' },
  'sitios turisticos':             { icon: 'camera-iris',          color: '#10B981', labelKey: 'cat_turisticos' },
  'tiendas':                       { icon: 'shopping',             color: '#F5BE41', labelKey: 'cat_tiendas' },
  'supermercados':                 { icon: 'cart',                 color: '#87479C', labelKey: 'cat_supermercados' },
  'transporte y logistica':        { icon: 'truck',                color: '#0EA5E9', labelKey: 'cat_transporte' },
  'plazas':                        { icon: 'storefront',           color: '#10B981', labelKey: 'cat_plazas' },
  'gasolineras':                   { icon: 'gas-station',          color: '#EF4444', labelKey: 'cat_gasolineras' },
  // Subcategorías turísticas usadas en filtrosLugares / cards.
  'cerros':                        { icon: 'image-filter-hdr',     color: '#16A34A', labelKey: 'cat_cerros' },
  'parques':                       { icon: 'tree',                 color: '#22C55E', labelKey: 'cat_parques' },
  'pueblos magicos':               { icon: 'castle',               color: '#A855F7', labelKey: 'cat_magic' },
  'museos':                        { icon: 'palette',              color: '#0EA5E9', labelKey: 'cat_culture' },
  // Categorías de EVENTOS (?modulo=categorias_eventos). Se mantienen en
  // naranja para conservar el look unificado de la pantalla de Eventos.
  // Si el dashboard agrega una categoría de evento nueva sin mapeo aquí,
  // cae al default y se muestra con su nombre del dashboard (sin romper).
  'cultural':                      { icon: 'palette',              color: '#F97613', labelKey: 'cat_cultural' },
  'deporte':                       { icon: 'soccer',               color: '#F97613', labelKey: 'cat_deporte' },
  'gastronomia':                   { icon: 'food',                 color: '#F97613', labelKey: 'cat_gastronomia' },
  'sociales':                      { icon: 'account-group',        color: '#F97613', labelKey: 'cat_sociales' },
};

const DEFAULT_PRESENTACION: CategoriaPresentacion = {
  icon: 'tag-outline',
  color: '#64748B',
  labelKey: null,
};

export function resolverPresentacion(nombre: string): CategoriaPresentacion {
  return TABLA[norm(nombre)] ?? DEFAULT_PRESENTACION;
}

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// ─────────────────────────────────────────────────────────
// CONFIGURACIÓN BASE
// ─────────────────────────────────────────────────────────

const BASE_URL    = 'https://tu-servidor.com/api';
const TIMEOUT_MS  = 8000;

// ── Instancia principal ───────────────────────────────────
const API = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

// ── Interceptor de request (ej: agregar token) ────────────
API.interceptors.request.use(
  (config) => {
    // Aquí puedes leer el token de AsyncStorage y agregarlo:
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor de response (manejo global de errores) ────
API.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('[API] No autorizado — sesión expirada');
    }
    if (error.response?.status === 500) {
      console.warn('[API] Error interno del servidor');
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────
// HELPER — wrapper genérico con tipado
// ─────────────────────────────────────────────────────────

async function apiCall<T>(
  config: AxiosRequestConfig,
  fallback: T,
  label: string
): Promise<T> {
  try {
    const res = await API.request<T>(config);
    return res.data;
  } catch (err) {
    const msg = err instanceof AxiosError
      ? `[${err.response?.status ?? 'NET'}] ${err.message}`
      : String(err);
    console.error(`[API] ${label} — ${msg}`);
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────

export type Noticia = {
  title:       string;
  description: string;
  content:     string;
  url:         string;
  image:       string;
  publishedAt: string;
  source: {
    name: string;
    url:  string;
  };
};

export type Evento = {
  id:          string;
  titulo:      string;
  fecha:       string;
  lugar:       string;
  categoria:   string;
  imagen:      string;
  descripcion: string;
};

export type Lugar = {
  id:        string;
  nombre:    string;
  categoria: string;
  rating:    number;
  imagen:    string;
  ubicacion: string;
  costo:     string;
};

export type Usuario = {
  id:     string;
  nombre: string;
  email:  string;
  foto:   string | null;
};

// ─────────────────────────────────────────────────────────
// NOTICIAS — GNews API
// ─────────────────────────────────────────────────────────

const GNEWS_KEY      = 'd1f76e48278d8951b1ecacf64f8366c3';
const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

// Queries específicas para Guadalupe NL y zona metropolitana
const QUERIES_LOCALES = [
  'guadalupe nuevo leon municipio',
  'monterrey nuevo leon noticias',
  'zona metropolitana monterrey',
];

export const getNoticias = async (): Promise<Noticia[]> => {
  try {
    // Hacemos una búsqueda por query principal
    const query = QUERIES_LOCALES[0];

    const res = await axios.get<{ articles: Noticia[] }>(
      `${GNEWS_BASE_URL}/search`,
      {
        params: {
          q:      query,
          lang:   'es',
          country:'mx',
          max:    20,           // máximo permitido por plan free
          apikey: GNEWS_KEY,
          sortby: 'publishedAt',
        },
        timeout: 10_000,
      }
    );

    const articles = res.data?.articles ?? [];

    // Filtrar artículos sin imagen o sin descripción
    return articles.filter(
      (a) => a.title && a.description && a.image
    );
  } catch (err) {
    const msg = err instanceof AxiosError
      ? `[${err.response?.status ?? 'NET'}] ${err.message}`
      : String(err);
    console.error(`[API] getNoticias — ${msg}`);
    return [];
  }
};

// Noticias por tema específico (deportes, turismo, etc.)
export const getNoticiasPorTema = async (tema: string): Promise<Noticia[]> => {
  try {
    const res = await axios.get<{ articles: Noticia[] }>(
      `${GNEWS_BASE_URL}/search`,
      {
        params: {
          q:      `${tema} guadalupe monterrey nuevo leon`,
          lang:   'es',
          country:'mx',
          max:    10,
          apikey: GNEWS_KEY,
          sortby: 'publishedAt',
        },
        timeout: 10_000,
      }
    );
    return res.data?.articles?.filter((a) => a.title && a.image) ?? [];
  } catch {
    return [];
  }
};

// ─────────────────────────────────────────────────────────
// EVENTOS
// ─────────────────────────────────────────────────────────

export const getEventos = (): Promise<Evento[]> =>
  apiCall<Evento[]>(
    { method: 'GET', url: '/eventos' },
    [],
    'getEventos'
  );

export const getEventoPorId = (id: string): Promise<Evento | null> =>
  apiCall<Evento | null>(
    { method: 'GET', url: `/eventos/${id}` },
    null,
    `getEventoPorId(${id})`
  );

// ─────────────────────────────────────────────────────────
// LUGARES
// ─────────────────────────────────────────────────────────

export const getLugares = (): Promise<Lugar[]> =>
  apiCall<Lugar[]>(
    { method: 'GET', url: '/lugares' },
    [],
    'getLugares'
  );

export const getLugarPorId = (id: string): Promise<Lugar | null> =>
  apiCall<Lugar | null>(
    { method: 'GET', url: `/lugares/${id}` },
    null,
    `getLugarPorId(${id})`
  );

export const getLugaresPorCategoria = (categoria: string): Promise<Lugar[]> =>
  apiCall<Lugar[]>(
    { method: 'GET', url: '/lugares', params: { categoria } },
    [],
    `getLugaresPorCategoria(${categoria})`
  );

// ─────────────────────────────────────────────────────────
// AUTENTICACIÓN
// ─────────────────────────────────────────────────────────

type LoginResponse = {
  token:   string;
  usuario: Usuario;
};

export const loginUser = (
  email: string,
  password: string
): Promise<LoginResponse | null> =>
  apiCall<LoginResponse | null>(
    { method: 'POST', url: '/login', data: { email, password } },
    null,
    'loginUser'
  );

export const registrarUsuario = (
  nombre: string,
  email: string,
  password: string
): Promise<LoginResponse | null> =>
  apiCall<LoginResponse | null>(
    { method: 'POST', url: '/register', data: { nombre, email, password } },
    null,
    'registrarUsuario'
  );

export const logoutUser = (): Promise<void> =>
  apiCall<void>(
    { method: 'POST', url: '/logout' },
    undefined as any,
    'logoutUser'
  );

// ─────────────────────────────────────────────────────────
// USUARIO
// ─────────────────────────────────────────────────────────

export const getUsuario = (): Promise<Usuario | null> =>
  apiCall<Usuario | null>(
    { method: 'GET', url: '/usuario' },
    null,
    'getUsuario'
  );

export const actualizarUsuario = (
  data: Partial<Pick<Usuario, 'nombre' | 'foto'>>
): Promise<Usuario | null> =>
  apiCall<Usuario | null>(
    { method: 'PUT', url: '/usuario', data },
    null,
    'actualizarUsuario'
  );

// ─────────────────────────────────────────────────────────
// FAVORITOS
// ─────────────────────────────────────────────────────────

export const getFavoritos = (): Promise<Lugar[]> =>
  apiCall<Lugar[]>(
    { method: 'GET', url: '/favoritos' },
    [],
    'getFavoritos'
  );

export const agregarFavorito = (lugarId: string): Promise<boolean> =>
  apiCall<boolean>(
    { method: 'POST', url: '/favoritos', data: { lugarId } },
    false,
    `agregarFavorito(${lugarId})`
  );

export const eliminarFavorito = (lugarId: string): Promise<boolean> =>
  apiCall<boolean>(
    { method: 'DELETE', url: `/favoritos/${lugarId}` },
    false,
    `eliminarFavorito(${lugarId})`
  );

// ─────────────────────────────────────────────────────────
// RESEÑAS
// ─────────────────────────────────────────────────────────

export type ReseñaAPI = {
  id:        string;
  lugarId:   string;
  autor:     string;
  texto:     string;
  estrellas: number;
  fecha:     string;
};

export const getReseñas = (lugarId: string): Promise<ReseñaAPI[]> =>
  apiCall<ReseñaAPI[]>(
    { method: 'GET', url: `/resenas/${lugarId}` },
    [],
    `getReseñas(${lugarId})`
  );

export const crearReseña = (
  data: Omit<ReseñaAPI, 'id' | 'fecha'>
): Promise<ReseñaAPI | null> =>
  apiCall<ReseñaAPI | null>(
    { method: 'POST', url: '/resenas', data },
    null,
    'crearReseña'
  );

export default API;
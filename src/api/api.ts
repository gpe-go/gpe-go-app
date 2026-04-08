import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

/* ================= CONFIGURACIÓN API ================= */

const getBaseURL = () => {
  const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    return `http://${ip}/gpe_go_api/inputs.php`;
  }
  return "http://192.168.100.157/gpe_go_api/inputs.php";
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 8000,
});

// Interceptor: agrega JWT automáticamente si existe
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ================= AUTH (FLUJO EMAIL + CÓDIGO) ================= */

export const solicitarCodigo = async (email: string) => {
  const response = await API.post("", { email }, {
    params: { modulo: "usuarios", action: "solicitar_codigo" },
  });
  return response.data;
};

export const verificarCodigo = async (email: string, codigo: string) => {
  const response = await API.post("", { email, codigo }, {
    params: { modulo: "usuarios", action: "verificar_codigo" },
  });
  return response.data;
};

export const registrarUsuario = async (nombre: string, email: string) => {
  const response = await API.post("", { nombre, email }, {
    params: { modulo: "usuarios", action: "registro" },
  });
  return response.data;
};

/* ================= LUGARES ================= */

export const getLugares = async (params?: {
  id_categoria?: number;
  busqueda?: string;
  pagina?: number;
  por_pagina?: number;
}) => {
  const response = await API.get("", {
    params: { modulo: "lugares", action: "listar", por_pagina: 100, ...params },
  });
  return response.data;
};

export const getLugar = async (id: number) => {
  const response = await API.get("", {
    params: { modulo: "lugares", action: "ver", id },
  });
  return response.data;
};

/* ================= EVENTOS ================= */

export const getEventos = async (params?: {
  tipo?: string;
  busqueda?: string;
  pagina?: number;
  por_pagina?: number;
}) => {
  const response = await API.get("", {
    params: { modulo: "eventos", action: "listar", por_pagina: 100, ...params },
  });
  return response.data;
};

/* ================= NOTICIAS ================= */

export const getNoticias = async (params?: {
  busqueda?: string;
  pagina?: number;
}) => {
  const response = await API.get("", {
    params: { modulo: "eventos", action: "listar", tipo: "noticia", por_pagina: 100, ...params },
  });
  return response.data;
};

/* ================= FAVORITOS ================= */

export const getFavoritos = async () => {
  const response = await API.get("", {
    params: { modulo: "favoritos", action: "listar" },
  });
  return response.data;
};

export const agregarFavorito = async (payload: {
  id_lugar?: number;
  id_evento?: number;
}) => {
  const response = await API.post("", payload, {
    params: { modulo: "favoritos", action: "agregar" },
  });
  return response.data;
};

export const quitarFavorito = async (id: number) => {
  const response = await API.delete("", {
    params: { modulo: "favoritos", action: "quitar", id },
  });
  return response.data;
};

/* ================= USUARIO ================= */

export const getUsuario = async () => {
  const response = await API.get("", {
    params: { modulo: "usuarios", action: "perfil" },
  });
  return response.data;
};

export const editarPerfil = async (nombre: string) => {
  const response = await API.put("", { nombre }, {
    params: { modulo: "usuarios", action: "editar" },
  });
  return response.data;
};

export const eliminarCuenta = async () => {
  const response = await API.post("", {}, {
    params: { modulo: "usuarios", action: "eliminar_cuenta" },
  });
  return response.data;
};

/**
 * Sube la foto de perfil a S3 via backend.
 * @param base64 - Imagen en base64 con prefijo data:image/...;base64,
 */
export const subirFotoPerfil = async (base64: string) => {
  const response = await API.post("", { imagen: base64 }, {
    params:  { modulo: "usuarios", action: "subir_foto" },
    timeout: 30000, // S3 puede tardar más
  });
  return response.data;
};

/* ================= COMERCIO (LOCATARIO) ================= */

export const registrarComercio = async (data: {
  nombre: string;
  id_categoria: number;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
}) => {
  const response = await API.post("", data, {
    params: { modulo: "lugares", action: "registrar" },
  });
  return response.data;
};

export const getMisLugares = async () => {
  const response = await API.get("", {
    params: { modulo: "lugares", action: "mis_lugares" },
  });
  return response.data;
};

export const subirFotoLugar = async (id_lugar: number, base64: string, orden: number) => {
  const response = await API.post("", { id_lugar, imagen: base64, orden }, {
    params: { modulo: "fotos_lugares", action: "subir" },
    timeout: 30000,
  });
  return response.data;
};

/* ================= CATEGORIAS ================= */

export const getCategoriasAPI = async () => {
  const response = await API.get("", {
    params: { modulo: "categorias", action: "listar" },
  });
  return response.data;
};

/* ================= CONTACTO / EMERGENCIAS ================= */

/** Devuelve los contactos de emergencia desde la BD */
export const getEmergencias = async () => {
  const response = await API.get("", {
    params: { modulo: "emergencias", action: "listar" },
  });
  return response.data;
};

/** Info institucional del municipio (emails, teléfono, dirección) */
export const getContactoInfo = async () => {
  const response = await API.get("", {
    params: { modulo: "contactos", action: "info" },
  });
  return response.data;
};

/** Envía un mensaje de soporte que se guarda en la BD */
export const enviarMensajeSoporte = async (data: {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
}) => {
  const response = await API.post("", data, {
    params: { modulo: "contactos", action: "mensaje" },
  });
  return response.data;
};

/* ================= CATEGORIAS EVENTOS ================= */

export const getCategoriasEventos = async () => {
  const response = await API.get("", {
    params: { modulo: "categorias_eventos", action: "listar" },
  });
  return response.data;
};

/* ================= FOTOS ================= */

export const getFotosLugar = async (id_lugar: number) => {
  const response = await API.get("", {
    params: { modulo: "fotos_lugares", action: "listar", id_lugar },
  });
  return response.data;
};

export const getFotosEvento = async (id_evento: number) => {
  const response = await API.get("", {
    params: { modulo: "fotos_eventos", action: "listar", id_evento },
  });
  return response.data;
};

/* ================= RESEÑAS ================= */

export const getResenas = async (id_lugar: number, pagina = 1) => {
  const response = await API.get("", {
    params: { modulo: "resenas", action: "listar", id_lugar, pagina, por_pagina: 50 },
  });
  return response.data;
};

export const crearResena = async (data: {
  id_lugar: number;
  calificacion: number;
  comentario?: string;
}) => {
  const response = await API.post("", data, {
    params: { modulo: "resenas", action: "crear" },
  });
  return response.data;
};

export const editarResena = async (id: number, data: {
  calificacion?: number;
  comentario?: string;
}) => {
  const response = await API.put("", data, {
    params: { modulo: "resenas", action: "editar", id },
  });
  return response.data;
};

export const eliminarResena = async (id: number) => {
  const response = await API.delete("", {
    params: { modulo: "resenas", action: "eliminar", id },
  });
  return response.data;
};

/* ================= FOTOS DE RESEÑAS ================= */

/**
 * Sube una foto de reseña a S3 via backend.
 * @param id_resena - ID de la reseña a la que pertenece
 * @param base64    - Imagen en base64 con prefijo data:image/...;base64,
 */
export const subirFotoResena = async (id_resena: number, base64: string) => {
  const response = await API.post("", { id_resena, imagen: base64 }, {
    params:  { modulo: "fotos_resenas", action: "subir" },
    timeout: 30000,
  });
  return response.data;
};

export const getFotosResena = async (id_resena: number) => {
  const response = await API.get("", {
    params: { modulo: "fotos_resenas", action: "listar", id_resena },
  });
  return response.data;
};

/* ================= REPORTES ================= */

export const crearReporte = async (data: {
  tipo_entidad: "foto_lugar" | "foto_evento" | "foto_resena" | "resena";
  id_entidad: number;
  motivo: string;
}) => {
  const response = await API.post("", data, {
    params: { modulo: "reportes", action: "crear" },
  });
  return response.data;
};

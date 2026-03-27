import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

/* ================= CONFIGURACIÓN API ================= */

// En desarrollo, obtiene la IP del servidor Expo automáticamente.
// En producción, usa la URL de tu servidor real.
const getBaseURL = () => {
  const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    return `http://${ip}/gpe_go_api/inputs.php`;
  }
  // Fallback: URL de producción o IP manual
  return "http://192.168.100.157/gpe_go_api/inputs.php";
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 5000,
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

/* ================= CATEGORIAS ================= */

export const getCategoriasAPI = async () => {
  const response = await API.get("", {
    params: { modulo: "categorias", action: "listar" },
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
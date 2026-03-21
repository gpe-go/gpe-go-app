import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= CONFIGURACIÓN API ================= */

const API = axios.create({
  baseURL: "http://192.168.100.138/gpe_go_api/inputs.php",
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

/* ================= FOTOS ================= */

export const getFotosLugar = async (id_lugar: number) => {
  const response = await API.get("", {
    params: { modulo: "fotos_lugares", action: "listar", id_lugar },
  });
  return response.data;
};
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= CONFIGURACIÓN ================= */

const BASE_URL = "http://192.168.0.11/gpe-go-api/inputs.php"; // Expo Go (misma red WiFi)

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Agregar token JWT a cada petición si existe
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ================= USUARIOS ================= */

// Registro con código 2FA
export const registrarUsuario = async (nombre: string, email: string) => {
  const response = await API.post("?modulo=usuarios&action=registro", { nombre, email });
  return response.data;
};

// Registro con contraseña (directo, sin código)
export const registrarConPassword = async (nombre: string, email: string, password: string) => {
  const response = await API.post("?modulo=usuarios&action=registro_password", { nombre, email, password });
  return response.data;
};

// Login con contraseña
export const loginConPassword = async (email: string, password: string) => {
  const response = await API.post("?modulo=usuarios&action=login_password", { email, password });
  return response.data;
};

export const solicitarCodigo = async (email: string) => {
  const response = await API.post("?modulo=usuarios&action=solicitar_codigo", { email });
  return response.data;
};

export const verificarCodigo = async (email: string, codigo: string) => {
  const response = await API.post("?modulo=usuarios&action=verificar_codigo", { email, codigo });
  return response.data;
};

export const getPerfil = async () => {
  const response = await API.get("?modulo=usuarios&action=perfil");
  return response.data;
};

export const editarPerfil = async (nombre: string) => {
  const response = await API.post("?modulo=usuarios&action=editar", { nombre });
  return response.data;
};

/* ================= LUGARES ================= */

export const getLugares = async (params?: {
  id_categoria?: number;
  busqueda?: string;
  pagina?: number;
  por_pagina?: number;
}) => {
  const response = await API.get("?modulo=lugares&action=listar", { params });
  return response.data;
};

export const getLugar = async (id: number) => {
  const response = await API.get("?modulo=lugares&action=ver", { params: { id } });
  return response.data;
};

/* ================= CATEGORÍAS ================= */

export const getCategorias = async () => {
  const response = await API.get("?modulo=categorias&action=listar");
  return response.data;
};

/* ================= EVENTOS ================= */

export const getEventos = async (params?: {
  id_categoria?: number;
  tipo?: string;
  busqueda?: string;
  pagina?: number;
  por_pagina?: number;
}) => {
  const response = await API.get("?modulo=eventos&action=listar", { params });
  return response.data;
};

export const getEvento = async (id: number) => {
  const response = await API.get("?modulo=eventos&action=ver", { params: { id } });
  return response.data;
};

/* ================= FAVORITOS ================= */

export const getFavoritos = async () => {
  const response = await API.get("?modulo=favoritos&action=listar");
  return response.data;
};

export const agregarFavorito = async (id_lugar: number) => {
  const response = await API.post("?modulo=favoritos&action=agregar", { id_lugar });
  return response.data;
};

export const eliminarFavorito = async (id: number) => {
  const response = await API.get(`?modulo=favoritos&action=quitar`, { params: { id } });
  return response.data;
};

/* ================= RESEÑAS ================= */

export const getResenas = async (id_lugar: number) => {
  const response = await API.get("?modulo=resenas&action=listar", { params: { id_lugar } });
  return response.data;
};

export const crearResena = async (id_lugar: number, comentario: string, calificacion: number) => {
  const response = await API.post("?modulo=resenas&action=crear", { id_lugar, comentario, calificacion });
  return response.data;
};

/* ================= NOTICIAS (GNews) ================= */

export const getNoticias = async () => {
  try {
    const response = await axios.get("https://gnews.io/api/v4/search", {
      params: {
        q: "guadalupe nuevo leon OR monterrey nuevo leon",
        lang: "es",
        max: 10,
        apikey: "d1f76e48278d8951b1ecacf64f8366c3",
      },
    });
    return response.data.articles;
  } catch (error) {
    console.log("Error cargando noticias", error);
    return [];
  }
};

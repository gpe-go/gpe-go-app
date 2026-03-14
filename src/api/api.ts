import axios from "axios";

/* ================= CONFIGURACIÓN API ================= */

const API = axios.create({
  baseURL: "https://tu-servidor.com/api",
  timeout: 5000,
});

/* ================= EVENTOS ================= */

export const getEventos = async () => {
  try {
    const response = await API.get("/eventos");
    return response.data;
  } catch (error) {
    console.log("Error cargando eventos", error);
    return [];
  }
};

/* ================= LUGARES ================= */

export const getLugares = async () => {
  try {
    const response = await API.get("/lugares");
    return response.data;
  } catch (error) {
    console.log("Error cargando lugares", error);
    return [];
  }
};

/* ================= LOGIN ================= */

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await API.post("/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.log("Error login", error);
    return null;
  }
};

/* ================= FAVORITOS ================= */

export const getFavoritos = async () => {
  try {
    const response = await API.get("/favoritos");
    return response.data;
  } catch (error) {
    console.log("Error cargando favoritos", error);
    return [];
  }
};

/* ================= USUARIO ================= */

export const getUsuario = async () => {
  try {
    const response = await API.get("/usuario");
    return response.data;
  } catch (error) {
    console.log("Error cargando usuario", error);
    return null;
  }
};

/* ================= NOTICIAS ================= */

export const getNoticias = async () => {
  try {

    const response = await API.get(
      "https://gnews.io/api/v4/search",
      {
        params: {
          q: "guadalupe nuevo leon OR monterrey nuevo leon",
          lang: "es",
          max: 10,
          apikey: "d1f76e48278d8951b1ecacf64f8366c3"
        }
      }
    );

    return response.data.articles;

  } catch (error) {
    console.log("Error cargando noticias", error);
    return [];
  }
};
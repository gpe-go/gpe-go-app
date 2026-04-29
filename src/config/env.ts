// ============================================================
//  GuadalupeGO — Configuración central de entorno
//
//  Este es el único archivo que debes editar para cambiar
//  la URL del servidor.
//
//  ANTES DE PUBLICAR EN TIENDAS:
//  Reemplaza PRODUCTION_API_URL con la URL real del servidor
//  que te proporcione el municipio.
// ============================================================

// ── URL de PRODUCCIÓN ────────────────────────────────────────
//
//  ← PENDIENTE: reemplaza con la URL del servidor de producción
//  que te entregue el municipio. Ejemplo:
//    "https://api.guadalupe.gob.mx/gpe_go_api/inputs.php"
//    "https://tudominio.com/gpe_go_api/inputs.php"
//
export const PRODUCTION_API_URL =
  "https://SERVIDOR_DEL_MUNICIPIO/gpe_go_api/inputs.php";

// ── URL de DESARROLLO LOCAL ──────────────────────────────────
//
//  IP de tu computadora en la red local (donde corre XAMPP).
//  Solo se usa cuando la app corre en modo desarrollo (Expo Go).
//  Si cambias de red WiFi, actualiza esta IP.
//
export const DEV_API_URL =
  "http://192.168.100.7/gpe_go_api/inputs.php";

// ── Ruta del backend dentro del servidor ────────────────────
//
//  La ruta relativa al archivo PHP principal. No cambiar
//  a menos que se mueva el backend en el servidor.
//
export const API_PATH = "gpe_go_api/inputs.php";

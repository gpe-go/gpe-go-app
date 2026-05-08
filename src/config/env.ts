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
  "https://go.guadalupe.gob.mx";

// ── URL de DESARROLLO LOCAL ──────────────────────────────────
//
//  Se usa cuando la app corre en modo desarrollo (Expo Go).
//  Para pruebas locales con XAMPP, cambia a:
//    "http://TU_IP_LOCAL/gpe_go_api/inputs.php"
//
export const DEV_API_URL =
  "https://go.guadalupe.gob.mx";

// ── Ruta del backend dentro del servidor ────────────────────
//
//  En el servidor remoto la API está en la raíz (sin ruta).
//  Para XAMPP local sería "gpe_go_api/inputs.php".
//
export const API_PATH = "";

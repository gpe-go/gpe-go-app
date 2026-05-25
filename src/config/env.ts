// ============================================================
//  GuadalupeGO — Configuración central de entorno
//
//  Único archivo a editar si algún día cambia la URL del
//  servidor. Hoy la app apunta al servidor de PRODUCCIÓN del
//  municipio (https://go.guadalupe.gob.mx) tanto en builds de
//  tienda como en desarrollo.
// ============================================================

// ── URL de PRODUCCIÓN ────────────────────────────────────────
//
//  Servidor de producción del municipio. La API vive en la RAÍZ
//  del dominio (HTTPS). Si el municipio migra de dominio, basta
//  con cambiar esta línea.
//
export const PRODUCTION_API_URL =
  "https://go.guadalupe.gob.mx";

// ── URL de DESARROLLO ────────────────────────────────────────
//
//  Se usa cuando la app corre en modo desarrollo (Expo Go).
//  Ya NO se usa un backend local (XAMPP): apunta al mismo
//  servidor de producción para que desarrollo y release
//  consuman exactamente los mismos datos.
//
export const DEV_API_URL =
  "https://go.guadalupe.gob.mx";

// ── Ruta del backend dentro del servidor ────────────────────
//
//  La API está en la RAÍZ del dominio (sin sub-ruta), por eso
//  queda vacío. Las peticiones van directo a
//  https://go.guadalupe.gob.mx con sus parámetros (?modulo=...).
//
export const API_PATH = "";

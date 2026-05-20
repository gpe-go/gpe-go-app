// Convierte un URI local (`file://`, `content://`) o remoto a un
// dataURL base64 (`data:image/...;base64,XXXX`). Útil para subir
// imágenes a un endpoint que las espera como string.
//
// React Native soporta `fetch()` con URIs locales nativamente, así
// que no necesitamos `expo-file-system` ni otra dependencia.
//
// Antes intentábamos obtener el base64 vía la opción `base64: true`
// del ImagePicker — pero esa opción puede hacer que el picker se
// cuelgue o tarde demasiado con fotos grandes (la codificación se
// hace en el hilo del picker). Hacerlo aquí, después, es seguro.

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export async function uriToDataUrl(uri: string): Promise<string | null> {
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        resolve(typeof result === 'string' ? result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Comprime una imagen ANTES de convertirla a base64 — evita el
 * error 500 del backend cuando la foto original pesa varios MB.
 *
 * Estrategia:
 *  • Reescala a máximo 800 px de ancho (aspect ratio se preserva).
 *  • Re-encodifica como JPEG calidad 0.6 → ~60-150 KB típicos.
 *  • Devuelve dataURL listo para mandar al endpoint.
 *
 * Si la compresión falla por cualquier razón, hace fallback a la
 * conversión sin comprimir para no perder la foto.
 */
export async function comprimirYDataUrl(
  uri: string,
  maxWidth = 600,
  quality = 0.55,
): Promise<string | null> {
  try {
    const comprimida = await manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: SaveFormat.JPEG, base64: true },
    );
    if (comprimida.base64) {
      return `data:image/jpeg;base64,${comprimida.base64}`;
    }
    // Si la lib no devolvió base64 por alguna razón, usar el URI nuevo.
    return await uriToDataUrl(comprimida.uri);
  } catch {
    // Compresión falló — intentamos al menos enviarla sin comprimir.
    return await uriToDataUrl(uri);
  }
}

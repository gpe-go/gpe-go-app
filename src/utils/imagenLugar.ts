// Helper para resolver la imagen de un lugar con fallback al logo oficial.
//
// Cuando el backend regresa un lugar sin foto, mostramos el logo GPE GO
// (assets/images/GPE GO.png) en lugar de un placeholder externo —
// así la app NO depende de via.placeholder.com ni de Internet para
// mostrar tarjetas, y la experiencia visual queda uniforme.
//
//   import { getImagenLugarSource } from '../utils/imagenLugar';
//   <Image source={getImagenLugarSource(lugar.imagen)} ... />

import type { ImageSourcePropType } from 'react-native';

// Misma referencia para todos los lugares sin foto — React Native cachea
// el require() y reusa el bitmap decodificado.
const FALLBACK: ImageSourcePropType = require('../../assets/images/GPE GO.png');

const PLACEHOLDER_HOSTS = ['via.placeholder.com', 'placehold.it', 'placehold.co'];

function esPlaceholder(uri: string): boolean {
  return PLACEHOLDER_HOSTS.some((host) => uri.includes(host));
}

export function getImagenLugarSource(imagen?: string | null): ImageSourcePropType {
  if (!imagen) return FALLBACK;
  const trimmed = imagen.trim();
  if (!trimmed || esPlaceholder(trimmed)) return FALLBACK;
  return { uri: trimmed };
}

export const IMAGEN_FALLBACK_LUGAR = FALLBACK;

// ============================================================
//  Tipografía institucional Museo (Municipio de Guadalupe).
//
//  Variantes cargadas:
//    Museo-100  — ExtraLight
//    Museo-300  — Light  (body por defecto)
//    Museo-700  — Bold
//    Museo-900  — Black
//
//  Este módulo SOLO carga los archivos. La aplicación automática
//  de la fontFamily según el fontWeight la hacen los wrappers
//  Text/TextInput en `components/Text.tsx`.
// ============================================================

import { useFonts } from 'expo-font';

/** Hook que carga las 4 variantes de Museo. Devuelve `true` cuando están listas. */
export function useMuseoFonts(): boolean {
  const [loaded] = useFonts({
    'Museo-100': require('../assets/fonts/Museo-100.otf'),
    'Museo-300': require('../assets/fonts/Museo-300.otf'),
    'Museo-700': require('../assets/fonts/Museo-700.ttf'),
    'Museo-900': require('../assets/fonts/Museo-900.ttf'),
  });
  return loaded;
}

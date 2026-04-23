import { Linking, Platform } from 'react-native';

/**
 * Abre la aplicación de mapas con la ubicación indicada.
 *
 * Android → intenta `geo:0,0?q=<query>` (selector nativo).
 *            Si falla, cae en la URL web de Google Maps.
 * iOS     → intenta Google Maps app (`comgooglemaps://`).
 *            Si no está instalada, abre Apple Maps.
 *
 * Siempre atrapa excepciones para evitar "Uncaught promise" en la consola.
 */
export async function abrirEnMapa(query: string): Promise<void> {
  const q = encodeURIComponent(query.trim());

  if (Platform.OS === 'android') {
    // Scheme geo: abre el selector nativo de Android (Google Maps, Waze, etc.)
    try {
      await Linking.openURL(`geo:0,0?q=${q}`);
      return;
    } catch {
      /* continúa al fallback */
    }

    // Fallback: URL web de Google Maps (se abre en Chrome / navegador predeterminado)
    try {
      await Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${q}`
      );
    } catch {
      /* ignorar — si nada funciona, no hacemos nada */
    }
  } else {
    // iOS: intenta Google Maps nativo primero
    const gmUrl = `comgooglemaps://?q=${q}`;
    try {
      const puedoAbrir = await Linking.canOpenURL(gmUrl);
      if (puedoAbrir) {
        await Linking.openURL(gmUrl);
        return;
      }
    } catch {
      /* continúa */
    }

    // Apple Maps (siempre disponible en iOS)
    try {
      await Linking.openURL(`https://maps.apple.com/?q=${q}`);
    } catch {
      /* ignorar */
    }
  }
}

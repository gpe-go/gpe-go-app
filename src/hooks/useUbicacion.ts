import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export type Coordenadas = { lat: number; lng: number } | null;

/**
 * Obtiene la ubicación actual del usuario una sola vez.
 * Devuelve null si el permiso fue denegado o hubo error.
 */
export function useUbicacion() {
  const [coords, setCoords]   = useState<Coordenadas>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (activo) {
          setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } catch {
        // Permiso denegado o GPS apagado — coords queda null
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  return { coords, loading };
}

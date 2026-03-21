import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFavoritos, agregarFavorito, quitarFavorito, getLugar } from "../api/api";
import { mapLugar } from "../mappers/lugaresMapper";
import { mapFavoritos } from "../mappers/favoritosMapper";
import { Lugar } from "../types/lugar";

export const useFavoritosAPI = () => {
  const [favoritos, setFavoritos] = useState<Lugar[]>([]);
  const [favIdMap, setFavIdMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (token) {
          setIsAuth(true);
          const res = await getFavoritos();

          if (res.success && Array.isArray(res.data)) {
            const mapped = mapFavoritos(res.data);

            const idMap: Record<string, number> = {};
            mapped.forEach((fav) => {
              if (fav.id_lugar) idMap[fav.id_lugar] = Number(fav.id);
            });
            setFavIdMap(idMap);

            const promises = mapped
              .filter((fav) => fav.id_lugar)
              .map(async (fav) => {
                try {
                  const lugarRes = await getLugar(Number(fav.id_lugar));
                  if (lugarRes.success && lugarRes.data) {
                    return mapLugar(lugarRes.data);
                  }
                } catch {
                  // If individual lugar fetch fails, return minimal data
                }
                return {
                  id: fav.id_lugar!,
                  nombre: fav.nombre,
                  ubicacion: "",
                  imagen: "https://via.placeholder.com/400x300?text=Sin+Imagen",
                  categoria: "",
                  costo: "Consultar",
                } as Lugar;
              });

            const lugaresCompletos = await Promise.all(promises);
            setFavoritos(lugaresCompletos);
          }
        }
      } catch (e) {
        console.log("Error cargando favoritos desde API");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const toggleFavorito = useCallback(async (lugar: Lugar) => {
    if (!isAuth) return;

    const existe = favoritos.some((f) => f.id === lugar.id);

    if (existe) {
      try {
        const favAPIId = favIdMap[lugar.id];
        if (favAPIId) {
          await quitarFavorito(favAPIId);
        }
        setFavoritos((prev) => prev.filter((f) => f.id !== lugar.id));
        setFavIdMap((prev) => {
          const next = { ...prev };
          delete next[lugar.id];
          return next;
        });
      } catch (e) {
        console.log("Error quitando favorito");
      }
    } else {
      try {
        const res = await agregarFavorito({ id_lugar: Number(lugar.id) });
        setFavoritos((prev) => [...prev, lugar]);
        if (res.success && res.data?.id) {
          setFavIdMap((prev) => ({ ...prev, [lugar.id]: res.data.id }));
        }
      } catch (e) {
        console.log("Error agregando favorito");
      }
    }
  }, [isAuth, favoritos, favIdMap]);

  const esFavorito = useCallback(
    (id: string) => favoritos.some((f) => f.id === id),
    [favoritos]
  );

  return { favoritos, toggleFavorito, esFavorito, loading, isAuth };
};

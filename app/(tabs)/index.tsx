import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Pressable,
  TextInput,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useConfig } from "../../src/context/ConfigContext";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

import { useLugares } from "../../src/hooks/useLugares";
import { getCategoriasAPI } from "../../src/api/api";

type Categoria = { id: number; nombre: string; descripcion: string };

const CATEGORIA_ICONOS: Record<string, string> = {
  'Restaurantes': 'restaurant-outline',
  'Hoteles': 'bed-outline',
  'Salones de belleza': 'cut-outline',
  'Tiendas': 'cart-outline',
  'Entretenimiento': 'musical-notes-outline',
  'Servicios': 'construct-outline',
  'Sitios turísticos': 'camera-outline',
};

export default function HomeScreen() {
  const router = useRouter();
  useConfig();
  const mapRef = useRef<MapView>(null);

  const { data: lugares } = useLugares();
  const [search, setSearch] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    getCategoriasAPI().then((res) => {
      if (res.success) setCategorias(res.data);
    }).catch(() => {});
  }, []);
  const [region, setRegion] = useState<any>(null);

  const titleAnim = useRef(new Animated.Value(0)).current;

  /* ================= GEO ================= */
  useEffect(() => {
    let sub: Location.LocationSubscription;

    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const initialRegion = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(initialRegion);

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (loc) => {
          setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      );
    })();

    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    return () => sub && sub.remove();
  }, [titleAnim]);

  const centerMap = () => {
    if (!region || !mapRef.current) return;
    mapRef.current.animateToRegion(region, 600);
  };

  /* ================= BUSCADOR ================= */

  const searchResults =
    search.length > 0
      ? lugares.filter((item: any) =>
        item.nombre.toLowerCase().includes(search.toLowerCase())
      )
      : [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <Text style={styles.searchTitle}>
            ¿Qué quieres descubrir?
          </Text>

          <View style={styles.searchWrapper}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#94A3B8" />
              <TextInput
                placeholder="Naturaleza, cultura, tours..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* 🔽 RESULTADOS FLOTANTES */}
            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                {searchResults.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.searchItem}
                    onPress={() => {
                      setSearch(item.nombre);
                      router.push("/explorar");
                    }}
                  >
                    <Image
                      source={{ uri: item.imagen }}
                      style={styles.searchImg}
                    />
                    <View>
                      <Text style={styles.searchItemTitle}>
                        {item.nombre}
                      </Text>
                      <Text style={styles.searchSub}>
                        {item.ubicacion}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ================= CATEGORÍAS DESDE API ================= */}
        {categorias.length > 0 ? (
          <View style={styles.categoriasGrid}>
            {categorias.map((cat) => (
              <Pressable
                key={cat.id}
                style={styles.categoriaCard}
                onPress={() => router.push(`/categorias/${cat.id}?nombre=${encodeURIComponent(cat.nombre)}`)}
              >
                <View style={styles.categoriaIconBg}>
                  <Ionicons
                    name={(CATEGORIA_ICONOS[cat.nombre] || 'grid-outline') as any}
                    size={28}
                    color="#E96928"
                  />
                </View>
                <Text style={styles.categoriaNombre}>{cat.nombre}</Text>
                <Text style={styles.categoriaDesc} numberOfLines={2}>{cat.descripcion}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ alignItems: 'center', marginVertical: 40 }}>
            <Ionicons name="grid-outline" size={48} color="#cbd5e1" />
            <Text style={{ color: '#94a3b8', fontSize: 16, marginTop: 12 }}>
              Cargando categorías...
            </Text>
          </View>
        )}

        {/* ================= MAPA ================= */}
        <Animated.View
          style={[
            styles.mapHeader,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.mapTitle}>Explora el Mapa</Text>
          <Text style={styles.mapSubtitle}>
            Descubre qué hay cerca de ti
          </Text>
        </Animated.View>

        {/* 🔹 MARCO DEL MAPA */}
        <View style={styles.mapFrame}>
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFillObject}
              initialRegion={
                region ?? {
                  latitude: 25.676,
                  longitude: -100.256,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }
              }
            >
              {region && (
                <Marker coordinate={region}>
                  <View style={styles.userMarker} />
                </Marker>
              )}
            </MapView>
          </View>
        </View>

        <Pressable
          style={styles.locationBtnOutside}
          onPress={centerMap}
        >
          <Ionicons name="locate-outline" size={22} color="#fff" />
          <Text style={styles.btnText}>Mi ubicación</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 140 },

  header: { paddingHorizontal: 20, paddingBottom: 18, marginTop: 10, },

  searchTitle: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 12,
    textAlign: "center",
  },

  searchWrapper: { position: "relative", zIndex: 999 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 55,
    // 🔹 CAMBIO: borde gris suave
    borderWidth: 1,
    borderColor: "#E2E8F0",

    // 🔹 CAMBIO: sombra para que destaque sobre blanco
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },

  searchResults: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    elevation: 10,
    zIndex: 999,
  },

  searchItem: { flexDirection: "row", gap: 10, marginBottom: 10 },
  searchImg: { width: 40, height: 40, borderRadius: 8 },
  searchItemTitle: { fontWeight: "bold" },
  searchSub: { fontSize: 12, color: "#64748B" },

  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  card: { borderRadius: 20, overflow: "hidden" },
  cardBg: { flex: 1, justifyContent: "flex-end" },
  rounded: { borderRadius: 20 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 15,
    justifyContent: "flex-end",
  },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cardSub: { color: "#fff", fontSize: 12 },

  mapHeader: { marginTop: 25, marginBottom: 10 },
  mapTitle: { fontSize: 22, fontWeight: "900" },
  mapSubtitle: { fontSize: 13, color: "#94A3B8" },
  mapFrame: {
    padding: 6,                 // grosor del marco
    borderRadius: 26,
    backgroundColor: "#E5E7EB", // gris suave como la imagen
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },

  mapContainer: {
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
  },

  locationBtnOutside: {
    marginTop: 14,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#F36A21",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 30,
  },

  btnText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },

  userMarker: {
    width: 16,
    height: 16,
    backgroundColor: "#F36A21",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#fff",
  },

  categoriasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  categoriaCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  categoriaIconBg: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFF3ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoriaNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  categoriaDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
  },
});
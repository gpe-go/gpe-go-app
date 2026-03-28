import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useFavoritos, Lugar } from "../../src/context/FavoritosContext";
import { useLugares } from "../../src/hooks/useLugares";

const CATEGORIAS = [
  { id: "1", nombre: "Restaurantes", icon: "silverware-fork-knife", color: "#FF6B35" },
  { id: "2", nombre: "Hoteles", icon: "office-building", color: "#4A90E2" },
  { id: "3", nombre: "Tiendas", icon: "shopping", color: "#F5BE41" },
  { id: "4", nombre: "Servicios", icon: "hammer-wrench", color: "#E96928" },
  { id: "5", nombre: "Plazas", icon: "storefront", color: "#10B981" },
];

export default function DirectorioScreen() {
  const mapRef = useRef<MapView>(null);
  const { toggleFavorito, esFavorito } = useFavoritos();
  const { data: lugares } = useLugares();

  const [search, setSearch] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<Lugar[]>(lugares);
  const [region, setRegion] = useState<any>(null);

  // Sync filteredData when hook data loads
  useEffect(() => {
    setFilteredData(lugares);
  }, [lugares]);

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  const obtenerUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    const nuevaRegion = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(nuevaRegion);
    mapRef.current?.animateToRegion(nuevaRegion, 1000);
  };

  const filtrar = (texto: string, categoria: string | null) => {
    let data = lugares;

    if (categoria) data = data.filter((l) => l.categoria === categoria);
    if (texto)
      data = data.filter(
        (l) =>
          l.nombre.toLowerCase().includes(texto.toLowerCase()) ||
          l.categoria.toLowerCase().includes(texto.toLowerCase())
      );

    setFilteredData(data);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    filtrar(text, categoriaActiva);
  };

  const seleccionarCategoria = (cat: string) => {
    const nueva = cat === categoriaActiva ? null : cat;
    setCategoriaActiva(nueva);
    filtrar(search, nueva);
  };

  const Header = () => (
    <View>
      <View style={styles.orangeBanner}>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Directorio de Negocios</Text>
          <Text style={styles.bannerSub}>Encuentra restaurantes, hoteles y servicios</Text>
        </View>

        {/* BUSCADOR */}
        <View style={{ position: "relative", zIndex: 100 }}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              placeholder="¿Qué buscas hoy?"
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={(text) => {
                handleSearch(text);
              }}
              style={styles.searchInput}
            />
          </View>

          {/* RESULTADOS DE BÚSQUEDA */}
          {search.length > 0 && (
            <View style={styles.searchResults}>
              <Text style={styles.searchTitle}>Resultados de búsqueda</Text>

              {filteredData.length === 0 ? (
                <Text style={styles.noResults}>No se encontraron negocios</Text>
              ) : (
                filteredData.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.searchItem}
                    onPress={() => {
                      setSearch(item.nombre);
                      filtrar(item.nombre, categoriaActiva);
                    }}
                  >
                    <Ionicons name="location-outline" size={18} color="#E96928" />
                    <Text style={styles.searchItemText}>{item.nombre}</Text>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>Mapa del Estado</Text>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapWrapper}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: 25.676,
              longitude: -100.256,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {region && <Marker coordinate={region} />}
          </MapView>

          <Pressable style={styles.locationBtn} onPress={obtenerUbicacion}>
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#E96928" />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIAS.map((cat) => {
            const activa = categoriaActiva === cat.nombre;

            return (
              <Pressable
                key={cat.id}
                onPress={() => seleccionarCategoria(cat.nombre)}
                style={[styles.categoryCard, activa && styles.categoryCardActive]}
              >
                <View style={[styles.iconCircle, { backgroundColor: cat.color + "20" }]}>
                  <MaterialCommunityIcons name={cat.icon as any} size={24} color={cat.color} />
                </View>
                <Text style={styles.catName}>{cat.nombre}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Text style={styles.listTitle}>
        {categoriaActiva ? `Resultados de ${categoriaActiva}` : "Todos los negocios"}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={filteredData}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={Header}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Ionicons name="business-outline" size={48} color="#cbd5e1" />
          <Text style={{ color: '#94a3b8', fontSize: 16, marginTop: 12, textAlign: 'center' }}>
            Todavía no hay negocios disponibles
          </Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
      style={{ backgroundColor: "#F8FAFC" }}
      renderItem={({ item }) => {
        const isFav = esFavorito(item.id);

        return (
          <View style={styles.placeCard}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item.imagen }} style={styles.placeImage} />
              <Pressable style={styles.heartBtn} onPress={() => toggleFavorito(item)}>
                <Ionicons
                  name={isFav ? "heart" : "heart-outline"}
                  size={20}
                  color={isFav ? "#E11D48" : "#fff"}
                />
              </Pressable>
            </View>

            <View style={styles.placeInfo}>
              <Text style={styles.placeTag}>{item.categoria}</Text>
              <Text style={styles.placeName}>{item.nombre}</Text>
              <Text style={styles.placeAddress}>{item.ubicacion}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  /* NUEVOS ESTILOS RESULTADOS */

  resultsBox: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 14,
    elevation: 12,
    paddingVertical: 6,
  },

  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  resultText: {
    marginLeft: 8,
  },

  orangeBanner: {
    backgroundColor: "#E96928",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 36 : 28,
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  bannerTextContainer: {
    marginBottom: 8,
  },

  bannerTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  bannerSub: { color: "#fff", fontSize: 14, opacity: 0.9 },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 15,
    alignItems: "center",
    height: 46,
  },

  searchInput: { flex: 1, marginLeft: 10, color: "#1E293B" },

  sectionHeaderContainer: {
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 15,
  },

  mapContainer: { paddingHorizontal: 20, height: 180, marginBottom: 18 },

  mapWrapper: {
    flex: 1,
    borderRadius: 25,
    overflow: "hidden",
    borderLeftWidth: 8,
    borderLeftColor: "#E96928",
  },

  locationBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "#fff",
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  section: { paddingHorizontal: 20 },

  categoryCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 18,
    marginRight: 12,
    alignItems: "center",
    width: 105,
  },

  categoryCardActive: {
    borderWidth: 2,
    borderColor: "#E96928",
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  catName: { fontWeight: "bold", fontSize: 12 },

  listTitle: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "bold",
  },

  placeCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
  },

  searchResults: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 10,
    paddingVertical: 8,
  },

  searchTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1E293B",
    paddingHorizontal: 12,
    marginBottom: 4,
  },

  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  searchItemText: {
    color: "#1E293B",
    fontSize: 13,
  },

  noResults: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#64748B",
    fontSize: 13,
  },

  imageWrapper: { width: 110, height: 120 },

  placeImage: { width: "100%", height: "100%" },

  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 15,
    padding: 6,
  },

  placeInfo: { flex: 1, padding: 12, justifyContent: "center" },

  placeTag: { color: "#E96928", fontSize: 10, fontWeight: "bold" },

  placeName: { fontSize: 16, fontWeight: "bold" },

  placeAddress: { fontSize: 12, color: "#64748B" },
});

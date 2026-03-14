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

import { LUGARES } from "../../src/data/lugares";

export default function HomeScreen() {
  const router = useRouter();
  useConfig();
  const mapRef = useRef<MapView>(null);

  const [search, setSearch] = useState("");
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
      ? LUGARES.filter((item: any) =>
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

        {/* ================= BENTO GRID – 4 FILAS ================= */}

        {/* FILA 1 */}
        <View style={styles.gridRow}>
          <Pressable
            style={[styles.card, { width: "48%", height: 220 }]}
            onPress={() => router.push("/categorias/explorar")}

          >
            <ImageBackground
              source={{
                uri: "https://i.pinimg.com/originals/33/b5/22/33b522650f28ec33a20eea361c08beb9.jpg",
              }}
              style={styles.cardBg}
              imageStyle={styles.rounded}
            >
              <View style={styles.overlay}>
                <Ionicons name="map-outline" size={28} color="#fff" />
                <Text style={styles.cardTitle}>Explorar</Text>
                <Text style={styles.cardSub}>Guadalupe & NL</Text>
              </View>
            </ImageBackground>
          </Pressable>

          <Pressable
            style={[styles.card, { width: "48%", height: 220 }]}
            onPress={() => router.push("/categorias/Fin de semana")}
          >
            <ImageBackground
              source={{
                uri: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
              }}
              style={styles.cardBg}
              imageStyle={styles.rounded}
            >
              <View style={styles.overlay}>
                <Text style={styles.cardTitle}>Fin de Semana</Text>
              </View>
            </ImageBackground>
          </Pressable>
        </View>

        {/* FILA 2 */}
        <View style={styles.gridRow}>
          <Pressable style={[styles.card, { width: "58%", height: 160 }]}
            onPress={() => router.push("/categorias/Naturaleza & Aventura")}>

            <ImageBackground
              source={{
                uri: "https://mvsnoticias.com/u/fotografias/m/2023/9/27/f768x400-565219_609122_7.jpg",
              }}
              style={styles.cardBg}
              imageStyle={styles.rounded}
            >
              <View style={styles.overlay}>
                <Text style={styles.cardTitle}>
                  Naturaleza & Aventura
                </Text>
              </View>
            </ImageBackground>
          </Pressable>

          <Pressable style={[styles.card, { width: "38%", height: 160 }]}
            onPress={() => router.push("/categorias/pueblos Magicos")}>

            <ImageBackground
              source={{
                uri: "https://wallpapers.com/images/hd/monterrey-photo-collage-7ilxq3egqhow9gdw.jpg",
              }}
              style={styles.cardBg}
              imageStyle={styles.rounded}
            >
              <View style={styles.overlay}>
                <Text style={styles.cardTitle}>
                  Pueblos Mágicos
                </Text>
              </View>
            </ImageBackground>
          </Pressable>
        </View>

        {/* FILA 3 */}
        <View style={styles.gridRow}>
          <Pressable style={[styles.card, { width: "48%", height: 150 }]}
            onPress={() => router.push("/categorias/tours")}
          >

            <ImageBackground
              source={{
                uri: "https://tse1.mm.bing.net/th/id/OIP.SJuomIXnlZ7o0_RQ7XO18AHaDf",
              }}
              style={styles.cardBg}
              imageStyle={styles.rounded}
            >
              <View style={styles.overlay}>
                <Text style={styles.cardTitle}>Tours</Text>
              </View>
            </ImageBackground>
          </Pressable>

          <Pressable style={[styles.card, { width: "48%", height: 150 }]}
            onPress={() => router.push("/categorias/cultura")}
          >
            <ImageBackground
              source={{
                uri: "https://i1.wp.com/www.turimexico.com/wp-content/uploads/2015/06/marco.jpg",
              }}
              style={styles.cardBg}
              imageStyle={styles.rounded}
            >
              <View style={styles.overlay}>
                <Text style={styles.cardTitle}>Cultura</Text>
              </View>
            </ImageBackground>
          </Pressable>
        </View>

        {/* FILA 4 */}
        <View style={styles.gridRow}>
          <Pressable style={[styles.card, { width: "43%", height: 180 }]}
            onPress={() => router.push("/categorias/compras")}
          >
            <ImageBackground
              source={{
                uri: "https://statics-cuidateplus.marca.com/cms/2022-11/compras-compulsivas_0.jpg",
              }}
              style={styles.cardBg}
              imageStyle={styles.rounded}
            >
              <View style={styles.overlay}>
                <Text style={styles.cardTitle}>Compras</Text>
              </View>
            </ImageBackground>
          </Pressable>

          <Pressable style={[styles.card, { width: "53%", height: 180 }]}
            onPress={() => router.push("/categorias/servicios")}
          >
            <ImageBackground
              source={{
                uri: "https://tse2.mm.bing.net/th/id/OIP.8oc6ncJneaAOQzUfbgh46wHaHa",
              }}
              style={styles.cardBg}
              imageStyle={styles.rounded}
            >
              <View style={styles.overlay}>
                <Text style={styles.cardTitle}>
                  Servicios Turísticos
                </Text>
              </View>
            </ImageBackground>
          </Pressable>
        </View>

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
});
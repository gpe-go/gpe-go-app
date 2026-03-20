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
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/context/ThemeContext";

import { LUGARES } from "../../src/data/lugares";

export default function HomeScreen() {
  const router = useRouter();

  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts);

  const mapRef = useRef<MapView>(null);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<any>(null);
  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let sub: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
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
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
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

  const searchResults =
    search.length > 0
      ? LUGARES.filter((item: any) =>
          item.nombre.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  return (
    <View style={s.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={s.header}>
          <Text style={s.searchTitle}>{t("welcome1")} 👋</Text>

          <View style={s.searchWrapper}>
            <View style={s.searchBox}>
              <Ionicons name="search" size={20} color={colors.subtext} />
              <TextInput
                placeholder={t("search")}
                placeholderTextColor={colors.subtext}
                style={s.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {searchResults.length > 0 && (
              <View style={s.searchResults}>
                {searchResults.map((item) => (
                  <Pressable
                    key={item.id}
                    style={s.searchItem}
                    onPress={() => {
                      setSearch(item.nombre);
                      router.push("/explorar");
                    }}
                  >
                    <Image source={{ uri: item.imagen }} style={s.searchImg} />
                    <View>
                      <Text style={s.searchItemTitle}>{item.nombre}</Text>
                      <Text style={s.searchSub}>{item.ubicacion}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ================= BENTO GRID – 4 FILAS ================= */}

        {/* FILA 1 — igual ancho, altura uniforme */}
        <View style={s.gridRow}>
          <Pressable
            style={[s.card, { width: "48%", height: 220 }]}
            onPress={() => router.push("/categorias/explorar")}
          >
            <ImageBackground
              source={{ uri: "https://i.pinimg.com/originals/33/b5/22/33b522650f28ec33a20eea361c08beb9.jpg" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]} style={s.gradient}>
                <Ionicons name="map-outline" size={28} color="#fff" />
                <Text style={s.cardTitle}>{t("cat_explore")}</Text>
                <Text style={s.cardSub}>Guadalupe & NL</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>

          <Pressable
            style={[s.card, { width: "48%", height: 220 }]}
            onPress={() => router.push("/categorias/Fin de semana")}
          >
            <ImageBackground
              source={{ uri: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]} style={s.gradient}>
                <Text style={s.cardTitle}>{t("cat_weekend")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        </View>

        {/* FILA 2 — izq más ancha */}
        <View style={s.gridRow}>
          <Pressable
            style={[s.card, { width: "58%", height: 160 }]}
            onPress={() => router.push("/categorias/Naturaleza & Aventura")}
          >
            <ImageBackground
              source={{ uri: "https://mvsnoticias.com/u/fotografias/m/2023/9/27/f768x400-565219_609122_7.jpg" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={s.cardTitle}>{t("cat_nature")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>

          <Pressable
            style={[s.card, { width: "38%", height: 160 }]}
            onPress={() => router.push("/categorias/pueblos Magicos")}
          >
            <ImageBackground
              source={{ uri: "https://wallpapers.com/images/hd/monterrey-photo-collage-7ilxq3egqhow9gdw.jpg" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={s.cardTitle}>{t("cat_magic")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        </View>

        {/* FILA 3 — igual ancho */}
        <View style={s.gridRow}>
          <Pressable
            style={[s.card, { width: "48%", height: 150 }]}
            onPress={() => router.push("/categorias/tours")}
          >
            <ImageBackground
              source={{ uri: "https://tse1.mm.bing.net/th/id/OIP.SJuomIXnlZ7o0_RQ7XO18AHaDf" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={s.cardTitle}>{t("cat_tours")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>

          <Pressable
            style={[s.card, { width: "48%", height: 150 }]}
            onPress={() => router.push("/categorias/cultura")}
          >
            <ImageBackground
              source={{ uri: "https://i1.wp.com/www.turimexico.com/wp-content/uploads/2015/06/marco.jpg" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={s.cardTitle}>{t("cat_culture")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        </View>

        {/* FILA 4 — der más ancha */}
        <View style={s.gridRow}>
          <Pressable
            style={[s.card, { width: "43%", height: 180 }]}
            onPress={() => router.push("/categorias/compras")}
          >
            <ImageBackground
              source={{ uri: "https://statics-cuidateplus.marca.com/cms/2022-11/compras-compulsivas_0.jpg" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={s.cardTitle}>{t("cat_shopping")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>

          <Pressable
            style={[s.card, { width: "53%", height: 180 }]}
            onPress={() => router.push("/categorias/servicios")}
          >
            <ImageBackground
              source={{ uri: "https://tse2.mm.bing.net/th/id/OIP.8oc6ncJneaAOQzUfbgh46wHaHa" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={s.cardTitle}>{t("cat_services")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        </View>

        {/* ── MAPA ── */}
        <Animated.View
          style={[
            s.mapHeader,
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
          <Text style={s.mapTitle}>{t("cat_map")}</Text>
          <Text style={s.mapSubtitle}>{t("cat_map_sub")}</Text>
        </Animated.View>

        <View style={s.mapFrame}>
          <View style={s.mapContainer}>
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
                  <View style={s.userMarker} />
                </Marker>
              )}
            </MapView>
          </View>
        </View>

        <Pressable style={s.locationBtn} onPress={centerMap}>
          <Ionicons name="locate-outline" size={22} color="#fff" />
          <Text style={s.btnText}>{t("cat_my_location")}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: any, f: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scrollContent: { paddingHorizontal: 12, paddingBottom: 140 },

    header: { paddingHorizontal: 20, paddingBottom: 18, marginTop: 10 },

    searchTitle: {
      fontSize: f["2xl"],
      fontWeight: "900",
      marginBottom: 12,
      textAlign: "center",
      color: c.text,
    },

    searchWrapper: { position: "relative", zIndex: 999 },

    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.inputBackground,
      borderRadius: 20,
      paddingHorizontal: 15,
      height: 55,
      borderWidth: 1,
      borderColor: c.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },

    searchInput: { flex: 1, marginLeft: 10, fontSize: f.base, color: c.text },

    searchResults: {
      position: "absolute",
      top: 60,
      left: 0,
      right: 0,
      backgroundColor: c.card,
      borderRadius: 15,
      padding: 10,
      elevation: 10,
      zIndex: 999,
      borderWidth: 1,
      borderColor: c.border,
    },

    searchItem: { flexDirection: "row", gap: 10, marginBottom: 10 },
    searchImg: { width: 40, height: 40, borderRadius: 8 },
    searchItemTitle: { fontWeight: "bold", color: c.text, fontSize: f.sm },
    searchSub: { fontSize: f.xs, color: c.subtext },

    gridRow: {
      flexDirection: "row",
      alignItems: "flex-start",   // alinea al fondo para que se vean las alturas distintas
      justifyContent: "space-between",
      marginBottom: 10,
      gap: 10,
    },

    card: {
      borderRadius: 18,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 10,
      elevation: 8,
    },

    cardBg:  { flex: 1, justifyContent: "flex-end" },
    rounded: { borderRadius: 18 },

    gradient: {
      paddingHorizontal: 14,
      paddingBottom: 16,
      paddingTop: 60,
      justifyContent: "flex-end",
      borderRadius: 18,
    },

    cardTitle: {
      color: "#fff",
      fontSize: f.lg,
      fontWeight: "800",
      textShadowColor: "rgba(0,0,0,0.6)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 6,
      lineHeight: f.lg * 1.25,
    },
    cardSub: {
      color: "rgba(255,255,255,0.85)",
      fontSize: f.xs,
      marginTop: 2,
      textShadowColor: "rgba(0,0,0,0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },

    mapHeader: { marginTop: 25, marginBottom: 10 },
    mapTitle: { fontSize: f.xl, fontWeight: "900", color: c.text },
    mapSubtitle: { fontSize: f.sm, color: c.subtext },

    mapFrame: {
      padding: 6,
      borderRadius: 26,
      backgroundColor: c.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 6,
    },

    mapContainer: { height: 280, borderRadius: 20, overflow: "hidden" },

    locationBtn: {
      marginTop: 14,
      alignSelf: "center",
      flexDirection: "row",
      backgroundColor: "#F36A21",
      paddingHorizontal: 22,
      paddingVertical: 12,
      borderRadius: 30,
    },

    btnText: { color: "#fff", marginLeft: 8, fontWeight: "bold", fontSize: f.sm },

    userMarker: {
      width: 16,
      height: 16,
      backgroundColor: "#F36A21",
      borderRadius: 8,
      borderWidth: 3,
      borderColor: "#fff",
    },
  });
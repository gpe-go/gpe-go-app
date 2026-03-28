import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated, Image, ImageBackground, Pressable,
  RefreshControl, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/context/ThemeContext";
import { LUGARES } from "../../src/data/lugares";

function RefreshLogo({ refreshing }: { refreshing: boolean }) {
  const spinAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (refreshing) {
      const spin = Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 900, useNativeDriver: true })
      );
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 450, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 450, useNativeDriver: true }),
        ])
      );
      spin.start(); pulse.start();
      return () => {
        spin.stop(); pulse.stop();
        spinAnim.setValue(0); pulseAnim.setValue(1);
      };
    }
  }, [refreshing, spinAnim, pulseAnim]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  if (!refreshing) return null;

  return (
    <View style={rl.container}>
      <Animated.View style={[rl.iconWrap, { transform: [{ rotate: spin }, { scale: pulseAnim }] }]}>
        <View style={rl.iconBg}>
          <Ionicons name="location" size={18} color="#bbb" />
        </View>
      </Animated.View>
      <Text style={rl.label}>GuadalupeGO</Text>
    </View>
  );
}

const rl = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: 14, gap: 8 },
  iconWrap:  { alignItems: "center", justifyContent: "center" },
  iconBg:    { width: 42, height: 42, borderRadius: 13, backgroundColor: "#e0e0e0", alignItems: "center", justifyContent: "center" },
  label:     { fontSize: 13, fontWeight: "700", color: "#aaa", letterSpacing: 0.3 },
});

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);

  const mapRef = useRef<MapView>(null);
  const [search, setSearch]         = useState("");
  const [region, setRegion]         = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const titleAnim = useRef(new Animated.Value(0)).current;

  const fetchData = useCallback(async () => {
    await new Promise((res) => setTimeout(res, 1500));
  }, []);

  useEffect(() => {
    let sub: Location.LocationSubscription;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const initialRegion = {
        latitude: current.coords.latitude, longitude: current.coords.longitude,
        latitudeDelta: 0.01, longitudeDelta: 0.01,
      };
      setRegion(initialRegion);
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
        (loc) => setRegion({
          latitude: loc.coords.latitude, longitude: loc.coords.longitude,
          latitudeDelta: 0.01, longitudeDelta: 0.01,
        })
      );
    })();
    Animated.timing(titleAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    return () => sub && sub.remove();
  }, [titleAnim]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const centerMap = () => {
    if (!region || !mapRef.current) return;
    mapRef.current.animateToRegion(region, 600);
  };

  const searchResults = search.length > 0
    ? LUGARES.filter((item: any) => item.nombre.toLowerCase().includes(search.toLowerCase()))
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={["transparent"]}
            progressBackgroundColor="transparent"
          />
        }
      >
        <RefreshLogo refreshing={refreshing} />

        {/* ══ HEADER / BUSCADOR ═══════════════════════════ */}
        <View style={s.header}>
          <Text style={[s.searchTitle, { fontSize: fonts["2xl"] }]}>
            {t("welcome1")} 👋
          </Text>

          <View style={s.searchWrapper}>
            <View style={s.searchBox}>
              <Ionicons name="search" size={20} color={colors.subtext} />
              <TextInput
                placeholder={t("search")}
                placeholderTextColor={colors.subtext}
                style={[s.searchInput, { fontSize: fonts.base }]}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={20} color={colors.subtext} />
                </Pressable>
              )}
            </View>

            {searchResults.length > 0 && (
              <View style={s.searchResults}>
                {searchResults.map((item: any) => (
                  <Pressable
                    key={item.id}
                    style={s.searchItem}
                    onPress={() => { setSearch(item.nombre); router.push("/explorar"); }}
                  >
                    <Image source={{ uri: item.imagen }} style={s.searchImg} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.searchItemTitle, { fontSize: fonts.sm }]} numberOfLines={1}>
                        {item.nombre}
                      </Text>
                      <Text style={[s.searchSub, { fontSize: fonts.xs }]}>{item.ubicacion}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ══ BENTO GRID – FILA 1 ═════════════════════════ */}
        <View style={[s.gridRow, { height: 220 }]}>
          <Pressable style={[s.card, { width: "48%" }]} onPress={() => router.push("/categorias/explorar")}>
            <ImageBackground
              source={{ uri: "https://i.pinimg.com/originals/33/b5/22/33b522650f28ec33a20eea361c08beb9.jpg" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <View style={s.cardIconWrap}>
                  <Ionicons name="map-outline" size={18} color="#fff" />
                </View>
                <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>{t("cat_explore")}</Text>
                <Text style={[s.cardSub, { fontSize: fonts.xs }]}>Guadalupe & NL</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>

          <Pressable style={[s.card, { width: "48%" }]} onPress={() => router.push("/categorias/Fin de semana")}>
            <ImageBackground
              source={{ uri: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>{t("cat_weekend")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        </View>

        {/* FILA 2 */}
        <View style={[s.gridRow, { height: 160 }]}>
          <Pressable style={[s.card, { width: "58%" }]} onPress={() => router.push("/categorias/Naturaleza & Aventura")}>
            <ImageBackground
              source={{ uri: "https://mvsnoticias.com/u/fotografias/m/2023/9/27/f768x400-565219_609122_7.jpg" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>{t("cat_nature")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>

          <Pressable style={[s.card, { width: "38%" }]} onPress={() => router.push("/categorias/pueblos Magicos")}>
            <ImageBackground
              source={{ uri: "https://wallpapers.com/images/hd/monterrey-photo-collage-7ilxq3egqhow9gdw.jpg" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>{t("cat_magic")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        </View>

        {/* FILA 3 */}
        <View style={[s.gridRow, { height: 150 }]}>
          <Pressable style={[s.card, { width: "48%" }]} onPress={() => router.push("/categorias/tours")}>
            <ImageBackground
              source={{ uri: "https://tse1.mm.bing.net/th/id/OIP.SJuomIXnlZ7o0_RQ7XO18AHaDf" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>{t("cat_tours")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>

          <Pressable style={[s.card, { width: "48%" }]} onPress={() => router.push("/categorias/cultura")}>
            <ImageBackground
              source={{ uri: "https://i1.wp.com/www.turimexico.com/wp-content/uploads/2015/06/marco.jpg" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>{t("cat_culture")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        </View>

        {/* FILA 4 */}
        <View style={[s.gridRow, { height: 180 }]}>
          <Pressable style={[s.card, { width: "43%" }]} onPress={() => router.push("/categorias/compras")}>
            <ImageBackground
              source={{ uri: "https://statics-cuidateplus.marca.com/cms/2022-11/compras-compulsivas_0.jpg" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>{t("cat_shopping")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>

          <Pressable style={[s.card, { width: "53%" }]} onPress={() => router.push("/categorias/servicios")}>
            <ImageBackground
              source={{ uri: "https://i0.wp.com/www.cuponerapp.com/mexiconoce/wp-content/uploads/2021/05/Captura-de-pantalla-2021-05-31-222254.jpg?resize=600%2C332&ssl=1" }}
              style={s.cardBg} imageStyle={s.rounded}
            >
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={s.gradient}>
                <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>{t("cat_services")}</Text>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        </View>

        {/* ══ MAPA ════════════════════════════════════════ */}
        <Animated.View
          style={[
            s.mapHeaderBlock,
            {
              opacity: titleAnim,
              transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }],
            },
          ]}
        >
          <View style={s.mapHeader}>
            <View style={s.sectionDot} />
            <View>
              <Text style={[s.mapTitle, { fontSize: fonts.xl }]}>{t("cat_map")}</Text>
              <Text style={[s.mapSubtitle, { fontSize: fonts.xs }]}>{t("cat_map_sub")}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={s.mapFrame}>
          <View style={s.mapContainer}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFillObject}
              initialRegion={region ?? { latitude: 25.676, longitude: -100.256, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
            >
              {region && (
                <Marker coordinate={region}>
                  <View style={s.userMarker} />
                </Marker>
              )}
            </MapView>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            s.locationBtn,
            { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          onPress={centerMap}
        >
          <LinearGradient colors={["#E96928", "#c4511a"]} style={s.locationBtnGradient}>
            <Ionicons name="locate-outline" size={20} color="#fff" />
            <Text style={[s.btnText, { fontSize: fonts.sm }]}>{t("cat_my_location")}</Text>
          </LinearGradient>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) =>
  StyleSheet.create({
    container:     { flex: 1, backgroundColor: c.background },
    scrollContent: { paddingBottom: 140 },

    // ── Header / buscador ──────────────────────────────────
    header: { paddingHorizontal: 20, paddingBottom: 18, marginTop: 10 },
    searchTitle: {
      fontWeight: "900", marginBottom: 14,
      textAlign: "center", color: c.text,
    },
    searchWrapper: { position: "relative", zIndex: 999 },
    searchBox: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: c.inputBackground,
      borderRadius: 20, paddingHorizontal: 16, height: 55,
      borderWidth: 1, borderColor: c.border,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
    },
    searchInput:  { flex: 1, marginLeft: 10, color: c.text },
    searchResults: {
      position: "absolute", top: 62, left: 0, right: 0,
      backgroundColor: c.card,
      borderRadius: 18, padding: 10,
      elevation: 12, zIndex: 999,
      borderWidth: 1, borderColor: c.border,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12, shadowRadius: 10,
    },
    searchItem:      { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    searchImg:       { width: 44, height: 44, borderRadius: 10 },
    searchItemTitle: { fontWeight: "700", color: c.text },
    searchSub:       { color: c.subtext, marginTop: 1 },

    // ── Bento grid ─────────────────────────────────────────
    gridRow: {
      flexDirection: "row", alignItems: "stretch",
      justifyContent: "space-between",
      marginBottom: 10, gap: 10,
      paddingHorizontal: 12,
    },
    card: {
      flex: 1, borderRadius: 22, overflow: "hidden",
      shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28, shadowRadius: 10, elevation: 8,
    },
    cardBg:  { flex: 1, width: "100%", height: "100%", justifyContent: "flex-end" },
    rounded: { borderRadius: 22 },
    gradient: {
      paddingHorizontal: 14, paddingBottom: 16, paddingTop: 60,
      justifyContent: "flex-end", borderRadius: 22,
    },
    cardIconWrap: {
      width: 32, height: 32, borderRadius: 9,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center", alignItems: "center",
      marginBottom: 6,
    },
    cardTitle: {
      color: "#fff", fontWeight: "800",
      textShadowColor: "rgba(0,0,0,0.6)",
      textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
    },
    cardSub: {
      color: "rgba(255,255,255,0.85)", marginTop: 2,
      textShadowColor: "rgba(0,0,0,0.5)",
      textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
    },

    // ── Mapa ───────────────────────────────────────────────
    mapHeaderBlock: { paddingHorizontal: 4 },
    mapHeader: {
      flexDirection: "row", alignItems: "center", gap: 8,
      paddingHorizontal: 16, marginTop: 22, marginBottom: 12,
    },
    sectionDot:  { width: 4, height: 18, borderRadius: 2, backgroundColor: "#E96928" },
    mapTitle:    { fontWeight: "900", color: c.text },
    mapSubtitle: { color: c.subtext, marginTop: 2 },
    mapFrame: {
      marginHorizontal: 12, borderRadius: 26, overflow: "hidden",
      elevation: 6,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15, shadowRadius: 8,
      borderWidth: 1, borderColor: c.border,
    },
    mapContainer: { height: 280, borderRadius: 26, overflow: "hidden" },
    userMarker: {
      width: 16, height: 16, backgroundColor: "#E96928",
      borderRadius: 8, borderWidth: 3, borderColor: "#fff",
    },

    locationBtn: {
      marginTop: 14, alignSelf: "center",
      borderRadius: 30, overflow: "hidden",
      elevation: 5,
      shadowColor: "#E96928", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4, shadowRadius: 8,
    },
    locationBtnGradient: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 24, paddingVertical: 13, gap: 8,
    },
    btnText: { color: "#fff", fontWeight: "800" },
  });
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Reseñas from "../../components/Reseñas";
import { useAuth } from "../../src/context/AuthContext";
import { useFavoritos } from "../../src/context/FavoritosContext";
import { useTheme } from "../../src/context/ThemeContext";

const CATEGORIA_KEYS: Record<string, string> = {
  "Naturaleza & Aventura": "cat_nature",
  cultura: "cat_culture",
  "pueblos Magicos": "cat_pueblos_magicos",
  explorar: "cat_explore",
  compras: "cat_shopping",
  servicios: "cat_services",
  "Fin de semana": "cat_weekend",
  tours: "cat_tours",
  Cerros: "cat_cerros",
  Parques: "cat_parques",
  "Pueblos Mágicos": "cat_pueblos_magicos",
  Museos: "cat_museos",
  Restaurantes: "cat_restaurantes",
  Hoteles: "cat_hoteles",
  Tiendas: "cat_tiendas",
  Servicios: "cat_services",
  Plazas: "cat_plazas",
  Hospitales: "cat_hospitales",
  Farmacias: "cat_farmacias",
  Supermercados: "cat_supermercados",
  Gasolineras: "cat_gasolineras",
};

const COSTOS_GRATIS = ["Gratis", "Gratis (entrada)"];
const HORARIOS_ABIERTO = ["Todo el día", "Abierto todo el año", "24 horas"];

export default function DetalleLugar() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  const { lugar: lugarParam } = useLocalSearchParams();

  const lugar = useMemo(() => {
    if (!lugarParam) return {};
    try {
      return JSON.parse(lugarParam as string);
    } catch {
      return {};
    }
  }, [lugarParam]);

  const { toggleFavorito, esFavorito } = useFavoritos();
  const { isAuthenticated } = useAuth();
  const isFav = esFavorito(lugar.id);

  const [activeTab, setActiveTab] = useState<"info" | "reseñas">("info");
  const [loginModal, setLoginModal] = useState(false);

  const heroAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const tabsAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(tabsAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroAnim, cardAnim, tabsAnim, contentAnim]);

  useEffect(() => {
    contentAnim.setValue(0);
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [activeTab, contentAnim]);

  const handleToggleFavorito = () => {
    if (!isAuthenticated) {
      setLoginModal(true);
      return;
    }
    toggleFavorito({ ...lugar, origen: "detalle" });
  };

  const abrirMapa = () => {
    const query = encodeURIComponent(
      `${lugar.nombre || ""} ${lugar.ubicacion || ""}`.trim()
    );
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${query}`
    );
  };

  const compartir = async () => {
    try {
      await Share.share({
        title: lugar.nombre,
        message: `¡Visita ${lugar.nombre}!\n📍 ${lugar.ubicacion}\n\nDescúbrelo en GuadalupeGO`,
      });
    } catch {}
  };

  const getCostoTexto = (costo: string) =>
    !costo || COSTOS_GRATIS.includes(costo) ? t("detail_free") : costo;

  const getHorarioTexto = (horario: string) =>
    !horario || HORARIOS_ABIERTO.includes(horario)
      ? t("detail_open_year")
      : horario;

  const getCategoriaTexto = (categoria: string) =>
    CATEGORIA_KEYS[categoria] ? t(CATEGORIA_KEYS[categoria]) : categoria;

  const heroAnimatedStyle = {
    opacity: heroAnim,
    transform: [
      {
        translateY: heroAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  const cardAnimatedStyle = {
    opacity: cardAnim,
    transform: [
      {
        translateY: cardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  const tabsAnimatedStyle = {
    opacity: tabsAnim,
    transform: [
      {
        translateY: tabsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const contentAnimatedStyle = {
    opacity: contentAnim,
    transform: [
      {
        translateY: contentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
      {
        scale: contentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.97, 1],
        }),
      },
    ],
  };

  const renderInfoTab = () => (
    <Animated.View style={contentAnimatedStyle}>
      <View style={s.detailsCard}>
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { fontSize: fonts.base }]}>
            {t("detail_info")}
          </Text>
          <Text style={[s.sectionSubtitle, { fontSize: fonts.xs }]}>
            {t("detail_place_information", {
              defaultValue: "Información general del lugar",
            })}
          </Text>
        </View>

        <View style={s.detailRow}>
          <View
            style={[
              s.detailIconWrap,
              { backgroundColor: "rgba(233,105,40,0.12)" },
            ]}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color="#E96928"
            />
          </View>
          <View style={s.detailInfo}>
            <Text style={[s.detailLabel, { fontSize: fonts.xs }]}>
              {t("detail_location")}
            </Text>
            <Text style={[s.detailValue, { fontSize: fonts.sm }]}>
              {lugar.ubicacion || t("location")}
            </Text>
          </View>
          <Pressable
            onPress={abrirMapa}
            style={({ pressed }) => [
              s.detailAction,
              {
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <Ionicons name="open-outline" size={16} color="#E96928" />
          </Pressable>
        </View>

        <View style={s.detailDivider} />

        <View style={s.detailRow}>
          <View
            style={[
              s.detailIconWrap,
              { backgroundColor: "rgba(74,144,226,0.12)" },
            ]}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color="#4A90E2"
            />
          </View>
          <View style={s.detailInfo}>
            <Text style={[s.detailLabel, { fontSize: fonts.xs }]}>
              {t("detail_schedule")}
            </Text>
            <Text style={[s.detailValue, { fontSize: fonts.sm }]}>
              {getHorarioTexto(lugar.horario)}
            </Text>
          </View>
        </View>

        {!!lugar.categoria && (
          <>
            <View style={s.detailDivider} />
            <View style={s.detailRow}>
              <View
                style={[
                  s.detailIconWrap,
                  { backgroundColor: "rgba(16,185,129,0.12)" },
                ]}
              >
                <MaterialCommunityIcons
                  name="shape-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <View style={s.detailInfo}>
                <Text style={[s.detailLabel, { fontSize: fonts.xs }]}>
                  {t("detail_category", { defaultValue: "Categoría" })}
                </Text>
                <Text style={[s.detailValue, { fontSize: fonts.sm }]}>
                  {getCategoriaTexto(lugar.categoria)}
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={s.detailDivider} />

        <View style={s.detailRow}>
          <View
            style={[
              s.detailIconWrap,
              { backgroundColor: "rgba(245,190,65,0.12)" },
            ]}
          >
            <MaterialCommunityIcons
              name="currency-usd"
              size={20}
              color="#F5BE41"
            />
          </View>
          <View style={s.detailInfo}>
            <Text style={[s.detailLabel, { fontSize: fonts.xs }]}>
              {t("detail_cost")}
            </Text>
            <Text style={[s.detailValue, { fontSize: fonts.sm }]}>
              {getCostoTexto(lugar.costo)}
            </Text>
          </View>
        </View>

        {!!lugar.rating && (
          <>
            <View style={s.detailDivider} />
            <View style={s.detailRow}>
              <View
                style={[
                  s.detailIconWrap,
                  { backgroundColor: "rgba(255,215,0,0.12)" },
                ]}
              >
                <Ionicons name="star" size={18} color="#FFD700" />
              </View>
              <View style={s.detailInfo}>
                <Text style={[s.detailLabel, { fontSize: fonts.xs }]}>
                  {t("detail_rating", { defaultValue: "Calificación" })}
                </Text>
                <View style={s.inlineRatingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={
                        star <= Math.round(lugar.rating ?? 0)
                          ? "star"
                          : "star-outline"
                      }
                      size={14}
                      color="#FFD700"
                    />
                  ))}
                  <Text style={[s.inlineRatingText, { fontSize: fonts.sm }]}>
                    {lugar.rating}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      {!!lugar.descripcion && (
        <View style={s.descriptionCard}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { fontSize: fonts.base }]}>
              {t("detail_about", { defaultValue: "Sobre este lugar" })}
            </Text>
            <Text style={[s.sectionSubtitle, { fontSize: fonts.xs }]}>
              {t("detail_about_subtitle", {
                defaultValue: "Conoce un poco más antes de visitarlo",
              })}
            </Text>
          </View>
          <Text style={[s.descriptionText, { fontSize: fonts.sm }]}>
            {lugar.descripcion}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Modal visible={loginModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <View style={s.modalIconWrap}>
              <Ionicons name="heart" size={30} color="#E96928" />
            </View>

            <Text style={[s.modalTitle, { fontSize: fonts.xl }]}>
              {t("favorites_save_place_title")}
            </Text>
            <Text style={[s.modalSubtitle, { fontSize: fonts.sm }]}>
              {t("favorites_save_place_sub")}
            </Text>

            <Pressable
              style={({ pressed }) => [
                s.modalPrimaryBtn,
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              onPress={() => {
                setLoginModal(false);
                router.push("/(stack)/perfil");
              }}
            >
              <Text style={[s.modalPrimaryText, { fontSize: fonts.base }]}>
                {t("profile_login")}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.modalSecondaryBtn,
                {
                  opacity: pressed ? 0.75 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              onPress={() => setLoginModal(false)}
            >
              <Text style={[s.modalSecondaryText, { fontSize: fonts.sm }]}>
                {t("profile_cancel")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        <Animated.View style={heroAnimatedStyle}>
          <View style={s.hero}>
            <Image source={{ uri: lugar.imagen }} style={s.heroImage} />
            <LinearGradient
              colors={[
                "rgba(0,0,0,0.22)",
                "rgba(0,0,0,0.10)",
                "rgba(0,0,0,0.76)",
              ]}
              style={StyleSheet.absoluteFillObject}
            />

            <Pressable
              style={({ pressed }) => [
                s.backBtn,
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.favBtn,
                isFav && s.favBtnActive,
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
              onPress={handleToggleFavorito}
            >
              <Ionicons
                name={isFav ? "heart" : "heart-outline"}
                size={20}
                color="#fff"
              />
            </Pressable>

            <View style={s.heroInfo}>
              {lugar.categoria && (
                <View style={s.heroCatBadge}>
                  <Text style={[s.heroCatText, { fontSize: fonts.xs }]}>
                    {getCategoriaTexto(lugar.categoria).toUpperCase()}
                  </Text>
                </View>
              )}

              <Text
                style={[s.heroTitle, { fontSize: fonts["2xl"] }]}
                numberOfLines={2}
              >
                {lugar.nombre || t("places")}
              </Text>

              <View style={s.heroMeta}>
                <View style={s.heroMetaItem}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text style={[s.heroLocation, { fontSize: fonts.xs }]}>
                    {lugar.ubicacion || "Nuevo León"}
                  </Text>
                </View>

                {!!lugar.rating && (
                  <View style={s.heroMetaItem}>
                    <Ionicons
                      name="star"
                      size={13}
                      color="#FFD700"
                    />
                    <Text style={[s.heroLocation, { fontSize: fonts.xs }]}>
                      {lugar.rating}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={cardAnimatedStyle}>
          <View style={s.mainCard}>
            <View style={s.metaRow}>
              <View style={s.ratingWrap}>
                <View style={s.starsWrap}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={
                        star <= Math.round(lugar.rating ?? 4.9)
                          ? "star"
                          : "star-outline"
                      }
                      size={16}
                      color="#FFD700"
                    />
                  ))}
                </View>
                <Text style={[s.ratingVal, { fontSize: fonts.sm }]}>
                  {lugar.rating ?? "4.9"}
                </Text>
              </View>

              <View style={s.priceBadge}>
                <Text style={[s.priceText, { fontSize: fonts.sm }]}>
                  {getCostoTexto(lugar.costo)}
                </Text>
              </View>
            </View>

            <View style={s.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  s.actionBtn,
                  {
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
                onPress={abrirMapa}
              >
                <LinearGradient
                  colors={["#E96928", "#C4511A"]}
                  style={s.actionBtnGradient}
                >
                  <Ionicons name="navigate" size={17} color="#fff" />
                  <Text style={[s.actionText, { fontSize: fonts.sm }]}>
                    {t("location")}
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  s.actionBtnSecondary,
                  {
                    opacity: pressed ? 0.88 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
                onPress={compartir}
              >
                <Ionicons
                  name="share-social-outline"
                  size={17}
                  color="#E96928"
                />
                <Text
                  style={[s.actionTextSecondary, { fontSize: fonts.sm }]}
                >
                  {t("share")}
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={tabsAnimatedStyle}>
          <View style={s.tabs}>
            <Pressable
              style={({ pressed }) => [
                s.tab,
                activeTab === "info" && s.tabActive,
                {
                  opacity: pressed ? 0.92 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={() => setActiveTab("info")}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={activeTab === "info" ? "#E96928" : colors.subtext}
              />
              <Text
                style={[
                  s.tabText,
                  { fontSize: fonts.sm },
                  activeTab === "info" && s.tabTextActive,
                ]}
              >
                {t("detail_info")}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.tab,
                activeTab === "reseñas" && s.tabActive,
                {
                  opacity: pressed ? 0.92 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={() => setActiveTab("reseñas")}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={16}
                color={activeTab === "reseñas" ? "#E96928" : colors.subtext}
              />
              <Text
                style={[
                  s.tabText,
                  { fontSize: fonts.sm },
                  activeTab === "reseñas" && s.tabTextActive,
                ]}
              >
                {t("detail_reviews")}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {activeTab === "info" ? (
          renderInfoTab()
        ) : (
          <Animated.View style={contentAnimatedStyle}>
            <View style={s.reviewsWrap}>
              <Reseñas lugarId={lugar.id} />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },

    scrollContent: {
      paddingBottom: 30,
    },

    hero: {
      width: "100%",
      height: 328,
      backgroundColor: c.inputBackground,
    },

    heroImage: {
      width: "100%",
      height: "100%",
    },

    backBtn: {
      position: "absolute",
      top: Platform.OS === "ios" ? 56 : 40,
      left: 18,
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: "rgba(0,0,0,0.42)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.16)",
    },

    favBtn: {
      position: "absolute",
      top: Platform.OS === "ios" ? 56 : 40,
      right: 18,
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: "rgba(0,0,0,0.42)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.16)",
    },

    favBtnActive: {
      backgroundColor: "rgba(225,29,72,0.88)",
      borderColor: "rgba(255,255,255,0.18)",
    },

    heroInfo: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 30,
    },

    heroCatBadge: {
      alignSelf: "flex-start",
      backgroundColor: "#E96928",
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: 999,
      marginBottom: 10,
    },

    heroCatText: {
      color: "#fff",
      fontWeight: "800",
      letterSpacing: 0.5,
    },

    heroTitle: {
      color: "#fff",
      fontWeight: "900",
      letterSpacing: -0.6,
      marginBottom: 10,
    },

    heroMeta: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
    },

    heroMetaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      maxWidth: "100%",
    },

    heroLocation: {
      color: "rgba(255,255,255,0.88)",
      fontWeight: "500",
      flexShrink: 1,
    },

    mainCard: {
      marginTop: -24,
      backgroundColor: c.card,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 20,
      borderWidth: 1,
      borderColor: c.border,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },

    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
      gap: 12,
    },

    ratingWrap: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    starsWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },

    ratingVal: {
      color: c.subtext,
      marginLeft: 7,
      fontWeight: "700",
    },

    priceBadge: {
      backgroundColor: isDark
        ? "rgba(233,105,40,0.18)"
        : "rgba(233,105,40,0.1)",
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "rgba(233,105,40,0.45)",
    },

    priceText: {
      color: "#E96928",
      fontWeight: "800",
    },

    actionRow: {
      flexDirection: "row",
      gap: 10,
    },

    actionBtn: {
      flex: 1,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 4,
      shadowColor: "#E96928",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 8,
    },

    actionBtnGradient: {
      height: 52,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
    },

    actionBtnSecondary: {
      flex: 1,
      height: 52,
      borderWidth: 1.5,
      borderColor: "#E96928",
      borderRadius: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      backgroundColor: isDark ? "rgba(233,105,40,0.08)" : c.card,
    },

    actionText: {
      color: "#fff",
      fontWeight: "800",
    },

    actionTextSecondary: {
      color: "#E96928",
      fontWeight: "800",
    },

    tabs: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 6,
      backgroundColor: c.inputBackground,
      borderRadius: 18,
      padding: 4,
      borderWidth: 1,
      borderColor: c.border,
    },

    tab: {
      flex: 1,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 14,
    },

    tabActive: {
      backgroundColor: c.card,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },

    tabText: {
      color: c.subtext,
      fontWeight: "700",
    },

    tabTextActive: {
      color: "#E96928",
    },

    detailsCard: {
      backgroundColor: c.card,
      marginHorizontal: 20,
      marginTop: 12,
      borderRadius: 24,
      paddingTop: 8,
      paddingBottom: 6,
      borderWidth: 1,
      borderColor: c.border,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.28 : 0.07,
      shadowRadius: 6,
    },

    sectionHeader: {
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 8,
    },

    sectionTitle: {
      color: c.text,
      fontWeight: "800",
      marginBottom: 4,
    },

    sectionSubtitle: {
      color: c.subtext,
      fontWeight: "500",
      lineHeight: 18,
    },

    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 14,
    },

    detailIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },

    detailInfo: {
      flex: 1,
    },

    detailLabel: {
      color: c.subtext,
      fontWeight: "600",
      marginBottom: 3,
    },

    detailValue: {
      color: c.text,
      fontWeight: "800",
      lineHeight: 20,
    },

    inlineRatingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      marginTop: 1,
    },

    inlineRatingText: {
      color: c.text,
      fontWeight: "800",
      marginLeft: 6,
    },

    detailAction: {
      width: 34,
      height: 34,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark
        ? "rgba(233,105,40,0.1)"
        : "rgba(233,105,40,0.08)",
    },

    detailDivider: {
      height: 1,
      backgroundColor: c.border,
      marginHorizontal: 16,
    },

    descriptionCard: {
      backgroundColor: c.card,
      marginHorizontal: 20,
      marginTop: 14,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 18,
      borderWidth: 1,
      borderColor: c.border,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.28 : 0.06,
      shadowRadius: 6,
    },

    descriptionText: {
      color: c.text,
      lineHeight: 24,
      fontWeight: "500",
    },

    reviewsWrap: {
      marginTop: 12,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "flex-end",
    },

    modalSheet: {
      backgroundColor: c.card,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 28,
      paddingTop: 14,
      paddingBottom: Platform.OS === "ios" ? 34 : 26,
      alignItems: "center",
    },

    modalHandle: {
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.18)"
        : "rgba(0,0,0,0.12)",
      marginBottom: 18,
    },

    modalIconWrap: {
      width: 66,
      height: 66,
      borderRadius: 20,
      backgroundColor: "rgba(233,105,40,0.12)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 14,
    },

    modalTitle: {
      color: c.text,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 8,
    },

    modalSubtitle: {
      color: c.subtext,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 22,
    },

    modalPrimaryBtn: {
      width: "100%",
      height: 52,
      borderRadius: 16,
      backgroundColor: "#E96928",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },

    modalPrimaryText: {
      color: "#fff",
      fontWeight: "800",
    },

    modalSecondaryBtn: {
      width: "100%",
      height: 44,
      justifyContent: "center",
      alignItems: "center",
    },

    modalSecondaryText: {
      color: c.subtext,
      fontWeight: "700",
    },
  });
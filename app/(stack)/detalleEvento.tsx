import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { abrirEnMapa } from "../../src/utils/abrirMapa";

const CAT_KEYS: Record<string, string> = {
  Deporte: "cat_deporte",
  Cultural: "cat_cultural",
  Gastronomía: "cat_gastronomia",
  Sociales: "cat_sociales",
  General: "cat_general",
};

const SUB_KEYS: Record<string, string> = {
  Fútbol: "sub_futbol",
  Atletismo: "sub_atletismo",
  Básquetbol: "sub_basquetbol",
  Festivales: "sub_festivales",
  Exposiciones: "sub_exposiciones",
  Museos: "cat_museos",
  Ferias: "sub_ferias",
  Degustaciones: "sub_degustaciones",
  Comunitario: "sub_comunitario",
  Festival: "sub_festival",
  "Mundial 2026": "sub_mundial",
  General: "cat_general",
  Evento: "event_badge",
  Noticia: "news_latest",
};

const COSTOS_GRATIS = ["Gratis", "Entrada Libre", "Gratis (entrada)"];
const COSTOS_CONSULTAR = ["Consultar", "Consultar precio", "A consultar"];

const formatSingleDate = (raw: string): string => {
  try {
    const clean = String(raw || "").trim();
    if (!clean) return "";
    const d = new Date(`${clean}T12:00:00`);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return raw;
  }
};

const formatFecha = (fecha: string): string => {
  if (!fecha) return "";
  if (fecha.includes(" - ")) {
    const [a, b] = fecha.split(" - ");
    return `${formatSingleDate(a)} – ${formatSingleDate(b)}`;
  }
  return formatSingleDate(fecha);
};

export default function DetalleEvento() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();
  const { evento: eventoParam } = useLocalSearchParams();

  const evento = useMemo(() => {
    if (!eventoParam) return {};
    try {
      return JSON.parse(eventoParam as string);
    } catch {
      return {};
    }
  }, [eventoParam]);

  const heroAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const detailsAnim = useRef(new Animated.Value(0)).current;
  const extraAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(detailsAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(extraAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroAnim, cardAnim, detailsAnim, extraAnim]);

  const getCategoriaTexto = (cat: string) =>
    CAT_KEYS[cat] ? t(CAT_KEYS[cat]) : cat;

  const getSubTexto = (sub: string) =>
    SUB_KEYS[sub] ? t(SUB_KEYS[sub]) : sub;

  const getCostoTexto = (costo: string) => {
    if (!costo || COSTOS_GRATIS.includes(costo)) return t("detail_free");
    if (COSTOS_CONSULTAR.includes(costo)) return t("event_cost_consultar");
    return costo;
  };

  const abrirMapa = () => {
    abrirEnMapa(`${evento.titulo || ""} ${evento.lugar || ""}`);
  };

  const compartir = async () => {
    try {
      await Share.share({
        title: evento.titulo,
        message: `¡Mira este evento!\n🎉 ${evento.titulo}\n📅 ${formatFecha(
          evento.fecha
        )}\n📍 ${evento.lugar}\n\nDescúbrelo en GuadalupeGO`,
      });
    } catch {}
  };

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

  const detailsAnimatedStyle = {
    opacity: detailsAnim,
    transform: [
      {
        translateY: detailsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const extraAnimatedStyle = {
    opacity: extraAnim,
    transform: [
      {
        translateY: extraAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
      {
        scale: extraAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.97, 1],
        }),
      },
    ],
  };

  return (
    <View style={s.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        <Animated.View style={heroAnimatedStyle}>
          <View style={s.hero}>
            <Image source={{ uri: evento.imagen }} style={s.heroImage} />
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

            <View style={s.heroTopRight}>
              {!!evento.sub && (
                <View style={s.categoryBadge}>
                  <Text style={[s.categoryBadgeText, { fontSize: fonts.xs }]}>
                    {getSubTexto(evento.sub)}
                  </Text>
                </View>
              )}
            </View>

            <View style={s.heroInfo}>
              <Text
                style={[s.heroTitle, { fontSize: fonts["2xl"] }]}
                numberOfLines={2}
              >
                {evento.titulo || t("tab_events")}
              </Text>

              <View style={s.heroMeta}>
                <View style={s.heroMetaItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text style={[s.heroMetaText, { fontSize: fonts.xs }]}>
                    {formatFecha(evento.fecha)}
                  </Text>
                </View>

                <View style={s.heroMetaItem}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text
                    style={[s.heroMetaText, { fontSize: fonts.xs }]}
                    numberOfLines={1}
                  >
                    {evento.lugar || t("location")}
                  </Text>
                </View>

                {!!evento.costo && (
                  <View style={s.heroMetaItem}>
                    <Ionicons
                      name="ticket-outline"
                      size={14}
                      color="rgba(255,255,255,0.9)"
                    />
                    <Text style={[s.heroMetaText, { fontSize: fonts.xs }]}>
                      {getCostoTexto(evento.costo)}
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
              <View style={s.tagRow}>
                <View style={s.tagChip}>
                  <MaterialCommunityIcons
                    name="tag-outline"
                    size={15}
                    color="#E96928"
                  />
                  <Text style={[s.tagText, { fontSize: fonts.sm }]}>
                    {getCategoriaTexto(evento.categoria)}
                  </Text>
                </View>
              </View>

              <View style={s.priceBadge}>
                <Text style={[s.priceText, { fontSize: fonts.sm }]}>
                  {getCostoTexto(evento.costo)}
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

        <Animated.View style={detailsAnimatedStyle}>
          <View style={s.detailsCard}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { fontSize: fonts.base }]}>
                {t("detail_info")}
              </Text>
              <Text style={[s.sectionSubtitle, { fontSize: fonts.xs }]}>
                {t("event_detail_summary", {
                  defaultValue: "Consulta la información principal del evento",
                })}
              </Text>
            </View>

            <View style={s.infoRow}>
              <View
                style={[
                  s.infoIconWrap,
                  { backgroundColor: "rgba(233,105,40,0.12)" },
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-month"
                  size={20}
                  color="#E96928"
                />
              </View>
              <View style={s.infoTextWrapper}>
                <Text style={[s.infoLabel, { fontSize: fonts.xs }]}>
                  {t("event_detail_date")}
                </Text>
                <Text style={[s.infoText, { fontSize: fonts.sm }]}>
                  {formatFecha(evento.fecha)}
                </Text>
              </View>
            </View>

            <View style={s.separator} />

            <View style={s.infoRow}>
              <View
                style={[
                  s.infoIconWrap,
                  { backgroundColor: "rgba(74,144,226,0.12)" },
                ]}
              >
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color="#4A90E2"
                />
              </View>
              <View style={s.infoTextWrapper}>
                <Text style={[s.infoLabel, { fontSize: fonts.xs }]}>
                  {t("event_detail_place")}
                </Text>
                <Text style={[s.infoText, { fontSize: fonts.sm }]}>
                  {evento.lugar || t("location")}
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

            <View style={s.separator} />

            <View style={s.infoRow}>
              <View
                style={[
                  s.infoIconWrap,
                  { backgroundColor: "rgba(16,185,129,0.12)" },
                ]}
              >
                <MaterialCommunityIcons
                  name="ticket-confirmation-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <View style={s.infoTextWrapper}>
                <Text style={[s.infoLabel, { fontSize: fonts.xs }]}>
                  {t("event_detail_cost")}
                </Text>
                <Text style={[s.infoText, { fontSize: fonts.sm }]}>
                  {getCostoTexto(evento.costo)}
                </Text>
              </View>
            </View>

            <View style={s.separator} />

            <View style={s.infoRow}>
              <View
                style={[
                  s.infoIconWrap,
                  { backgroundColor: "rgba(156,39,176,0.12)" },
                ]}
              >
                <MaterialCommunityIcons
                  name="shape-outline"
                  size={20}
                  color="#9C27B0"
                />
              </View>
              <View style={s.infoTextWrapper}>
                <Text style={[s.infoLabel, { fontSize: fonts.xs }]}>
                  {t("event_detail_cat")}
                </Text>
                <Text style={[s.infoText, { fontSize: fonts.sm }]}>
                  {getCategoriaTexto(evento.categoria)}
                </Text>
              </View>
            </View>

            {!!evento.sub && (
              <>
                <View style={s.separator} />
                <View style={s.infoRow}>
                  <View
                    style={[
                      s.infoIconWrap,
                      { backgroundColor: "rgba(245,190,65,0.14)" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="star-four-points-outline"
                      size={20}
                      color="#F5BE41"
                    />
                  </View>
                  <View style={s.infoTextWrapper}>
                    <Text style={[s.infoLabel, { fontSize: fonts.xs }]}>
                      {t("event_detail_type", { defaultValue: "Tipo" })}
                    </Text>
                    <Text style={[s.infoText, { fontSize: fonts.sm }]}>
                      {getSubTexto(evento.sub)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </Animated.View>

        {!!evento.descripcion && (
          <Animated.View style={extraAnimatedStyle}>
            <View style={s.descriptionCard}>
              <View style={s.sectionHeader}>
                <Text style={[s.sectionTitle, { fontSize: fonts.base }]}>
                  {t("detail_about", { defaultValue: "Sobre este evento" })}
                </Text>
                <Text style={[s.sectionSubtitle, { fontSize: fonts.xs }]}>
                  {t("event_about_subtitle", {
                    defaultValue:
                      "Información adicional para conocer mejor el evento",
                  })}
                </Text>
              </View>

              <Text style={[s.descriptionText, { fontSize: fonts.sm }]}>
                {evento.descripcion}
              </Text>
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

    heroTopRight: {
      position: "absolute",
      top: Platform.OS === "ios" ? 56 : 40,
      right: 18,
      alignItems: "flex-end",
    },

    categoryBadge: {
      backgroundColor: "#E96928",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },

    categoryBadgeText: {
      color: "#fff",
      fontWeight: "800",
    },

    heroInfo: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 28,
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
      gap: 6,
      maxWidth: "100%",
    },

    heroMetaText: {
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
      gap: 12,
      marginBottom: 18,
    },

    tagRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    tagChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: isDark
        ? "rgba(233,105,40,0.12)"
        : "rgba(233,105,40,0.08)",
      borderWidth: 1,
      borderColor: "rgba(233,105,40,0.24)",
    },

    tagText: {
      color: "#E96928",
      fontWeight: "800",
    },

    priceBadge: {
      backgroundColor: isDark
        ? "rgba(233,105,40,0.18)"
        : "rgba(233,105,40,0.1)",
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "rgba(233,105,40,0.42)",
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

    detailsCard: {
      backgroundColor: c.card,
      marginHorizontal: 20,
      marginTop: 14,
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

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 14,
    },

    infoIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },

    infoTextWrapper: {
      flex: 1,
    },

    infoLabel: {
      color: c.subtext,
      fontWeight: "600",
      marginBottom: 3,
    },

    infoText: {
      color: c.text,
      fontWeight: "800",
      lineHeight: 20,
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

    separator: {
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
  });
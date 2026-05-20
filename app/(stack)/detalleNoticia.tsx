import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "../../components/Text";
import { useTheme } from "../../src/context/ThemeContext";

const HERO_HEIGHT = 320;
const SCREEN_W = Dimensions.get("window").width;
const FALLBACK_IMG = require("../../assets/images/GPE GO.png");

function formatearFechaSeguro(fecha?: string | string[]) {
  const valor = Array.isArray(fecha) ? fecha[0] : fecha;
  const limpio = String(valor ?? "").replace(/\s+/g, " ").trim();
  if (!limpio || limpio.toLowerCase() === "invalid date") return "Fecha no disponible";
  const parsed = new Date(limpio);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return limpio;
}

function hostnameDe(url?: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Cuenta caracteres no-whitespace para mostrar un metadato útil
// ("≈ X min de lectura") sin necesidad de full HTML parsing.
function minutosDeLectura(...textos: string[]): number {
  const total = textos.join(" ").replace(/\s+/g, " ").trim();
  const palabras = total ? total.split(" ").length : 0;
  // ~220 palabras por minuto lectura promedio
  return Math.max(1, Math.round(palabras / 220));
}

export default function DetalleNoticiaScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle("light-content", true);
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("transparent");
        StatusBar.setTranslucent(true);
      }
      return () => {
        StatusBar.setBarStyle(isDark ? "light-content" : "dark-content", true);
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor(colors.background);
          StatusBar.setTranslucent(false);
        }
      };
    }, [isDark, colors.background])
  );

  const params = useLocalSearchParams();
  const title = String(params.title ?? "");
  const description = String(params.description ?? "");
  const content = String(params.content ?? "");
  const url = String(params.url ?? "");
  const date = params.date;
  const source = String(params.source ?? "");

  // El array de imágenes llega serializado por router (params solo aceptan
  // strings). Si está vacío o no se pudo parsear, caemos a `image` único.
  const imagenes: string[] = useMemo(() => {
    const raw = params.images;
    if (typeof raw === "string" && raw.length > 0) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter((u) => typeof u === "string" && u.length > 0);
      } catch {}
    }
    const single = String(params.image ?? "").trim();
    return single ? [single] : [];
  }, [params.images, params.image]);

  const tieneMultiples = imagenes.length > 1;

  const fechaFormateada = formatearFechaSeguro(date as string);
  const lectura = minutosDeLectura(title, description, content);
  const dominio = hostnameDe(url);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(26)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, translateYAnim]);

  const [paginaActual, setPaginaActual] = useState(0);
  const onScrollHero = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SCREEN_W);
    if (idx !== paginaActual) setPaginaActual(idx);
  };

  const compartir = async () => {
    try {
      await Share.share({
        message: `${title}\n\n${description}\n\nVía GuadalupeGO: ${url}`,
        title,
      });
    } catch {}
  };

  const abrirFuente = async () => {
    if (!url.trim()) return;
    await Linking.openURL(url.trim());
  };

  // `description` y `content` actualmente vienen del mismo campo del
  // backend; mostramos `content` solo si aporta texto adicional, no como
  // duplicado.
  const hayContenidoExtra =
    !!content && content.trim().length > 0 && content.trim() !== description.trim();

  if (!title) {
    return <SkeletonNoticia s={s} />;
  }

  return (
    <View style={s.wrapper}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero / Carrusel ─────────────────────────────────── */}
        <View style={s.hero}>
          {imagenes.length === 0 ? (
            <LinearGradient colors={["#F97613", "#d85f0e"]} style={s.heroSlide}>
              <Image source={FALLBACK_IMG} style={s.heroFallback} resizeMode="contain" />
            </LinearGradient>
          ) : (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={tieneMultiples}
              onScroll={onScrollHero}
              scrollEventThrottle={16}
            >
              {imagenes.map((uri, i) => (
                <Image
                  key={`${i}-${uri}`}
                  source={{ uri }}
                  style={[s.heroSlide, { width: SCREEN_W }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          )}

          <LinearGradient
            colors={["rgba(0,0,0,0.55)", "transparent", "rgba(0,0,0,0.65)"]}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          <Pressable
            style={({ pressed }) => [
              s.backBtn,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
            ]}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              s.shareHeroBtn,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
            ]}
            onPress={compartir}
            hitSlop={8}
          >
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </Pressable>

          <View style={s.heroBadgeRow}>
            <View style={s.newsBadge}>
              <View style={s.newsDot} />
              <Text style={[s.newsBadgeText, { fontSize: fonts.xs }]}>{t("news_badge")}</Text>
            </View>
            {tieneMultiples && (
              <View style={s.counterBadge}>
                <Ionicons name="images-outline" size={11} color="#fff" />
                <Text style={[s.counterBadgeText, { fontSize: fonts.xs }]}>
                  {paginaActual + 1}/{imagenes.length}
                </Text>
              </View>
            )}
          </View>

          {tieneMultiples && (
            <View style={s.dotsRow} pointerEvents="none">
              {imagenes.map((_, i) => (
                <View
                  key={i}
                  style={[s.dot, i === paginaActual && s.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Contenido ──────────────────────────────────────── */}
        <Animated.View
          style={[s.animated, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}
        >
          <View style={s.mainCard}>
            {/* meta row: fecha + tiempo de lectura + fuente */}
            <View style={s.metaRow}>
              <View style={s.metaPill}>
                <Ionicons name="calendar-outline" size={12} color="#F97613" />
                <Text style={[s.metaPillText, { fontSize: fonts.xs }]} numberOfLines={1}>
                  {fechaFormateada}
                </Text>
              </View>
              <View style={s.metaPill}>
                <Ionicons name="time-outline" size={12} color="#F97613" />
                <Text style={[s.metaPillText, { fontSize: fonts.xs }]}>
                  {lectura} {t("news_read_min", { defaultValue: "min" })}
                </Text>
              </View>
              {!!(source || dominio) && (
                <View style={s.metaPill}>
                  <Ionicons name="link-outline" size={12} color="#F97613" />
                  <Text style={[s.metaPillText, { fontSize: fonts.xs }]} numberOfLines={1}>
                    {source || dominio}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[s.title, { fontSize: fonts["2xl"] }]}>{title}</Text>

            {!!description && (
              <Text style={[s.lead, { fontSize: fonts.base }]}>
                {description}
              </Text>
            )}

            {hayContenidoExtra && (
              <>
                <View style={s.softDivider} />
                <Text style={[s.body, { fontSize: fonts.sm }]}>{content}</Text>
              </>
            )}
          </View>

          {/* ── CTA único: leer la nota completa en su fuente ──── */}
          <View style={s.ctaWrap}>
            <Pressable
              style={({ pressed }) => [
                s.ctaPrimary,
                { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
              ]}
              onPress={abrirFuente}
            >
              <LinearGradient colors={["#F97613", "#d85f0e"]} style={s.ctaPrimaryInner}>
                <Ionicons name="globe-outline" size={18} color="#fff" />
                <Text style={[s.ctaPrimaryText, { fontSize: fonts.base }]}>
                  {t("news_view_full_article")}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.ctaGhost,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
              ]}
              onPress={compartir}
            >
              <Ionicons name="share-social-outline" size={18} color="#F97613" />
              <Text style={[s.ctaGhostText, { fontSize: fonts.sm }]}>{t("share")}</Text>
            </Pressable>
          </View>

          {/* ── Footer marca ─────────────────────────────────── */}
          <View style={s.brandFooter}>
            <View style={s.brandRow}>
              <Image
                source={require("../../assets/images/logosinnadaoficial.png")}
                style={s.brandIcon}
                resizeMode="contain"
              />
              <Text style={[s.brandTitle, { fontSize: fonts.sm }]}>
                Guadalupe<Text style={{ color: "#F97613" }}>GO</Text>
              </Text>
            </View>
            <Text style={[s.brandSub, { fontSize: fonts.xs }]}>
              <Text style={{ color: "#2D4551", fontWeight: "800" }}>Seamos</Text>
              <Text style={{ color: "#F97613", fontWeight: "800" }}>Grandes</Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function SkeletonNoticia({ s }: { s: any }) {
  return (
    <View style={s.wrapper}>
      <View style={s.skeletonHero} />
      <View style={s.mainCard}>
        <View style={s.skeletonMeta} />
        <View style={s.skeletonTitle1} />
        <View style={s.skeletonTitle2} />
        <View style={s.skeletonLead} />
        <View style={s.skeletonLead2} />
      </View>
      <View style={s.ctaWrap}>
        <View style={s.skeletonCta} />
      </View>
    </View>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) =>
  StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: c.background },
    animated: { flex: 1 },

    // ── Hero
    hero: {
      width: "100%",
      height: HERO_HEIGHT,
      backgroundColor: isDark ? "#111" : "#ddd",
    },
    heroSlide: {
      width: SCREEN_W,
      height: HERO_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
    },
    heroFallback: {
      width: 120,
      height: 120,
      opacity: 0.6,
    },

    backBtn: {
      position: "absolute",
      top: Platform.OS === "ios" ? 56 : 40,
      left: 18,
      backgroundColor: "rgba(0,0,0,0.4)",
      width: 40,
      height: 40,
      borderRadius: 13,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
    },

    shareHeroBtn: {
      position: "absolute",
      top: Platform.OS === "ios" ? 56 : 40,
      right: 18,
      backgroundColor: "rgba(0,0,0,0.4)",
      width: 40,
      height: 40,
      borderRadius: 13,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
    },

    heroBadgeRow: {
      position: "absolute",
      bottom: 22,
      left: 18,
      right: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },

    newsBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(0,0,0,0.55)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.15)",
    },
    newsDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#4ADE80" },
    newsBadgeText: { color: "#fff", fontWeight: "700" },

    counterBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(0,0,0,0.55)",
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.15)",
    },
    counterBadgeText: { color: "#fff", fontWeight: "700" },

    dotsRow: {
      position: "absolute",
      bottom: 8,
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      gap: 5,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "rgba(255,255,255,0.4)",
    },
    dotActive: {
      width: 18,
      backgroundColor: "#fff",
    },

    // ── Tarjeta principal de contenido
    mainCard: {
      backgroundColor: c.card,
      marginTop: -24,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 22,
      paddingTop: 22,
      paddingBottom: 22,
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
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
    },
    metaPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: isDark ? "rgba(249,118,19,0.12)" : "#FFF3E8",
      borderWidth: 1,
      borderColor: isDark ? "rgba(249,118,19,0.25)" : "#FFD4B3",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      maxWidth: "100%",
    },
    metaPillText: {
      color: "#F97613",
      fontWeight: "700",
      textTransform: "capitalize",
    },

    title: {
      fontWeight: "900",
      color: c.text,
      letterSpacing: -0.5,
      lineHeight: f["2xl"] * 1.22,
      marginBottom: 14,
    },

    lead: {
      color: c.text,
      lineHeight: f.base * 1.7,
      fontWeight: "500",
    },

    softDivider: {
      height: 1,
      backgroundColor: c.border,
      marginVertical: 16,
      opacity: 0.6,
    },

    body: {
      color: c.subtext,
      lineHeight: f.sm * 1.75,
    },

    // ── CTA
    ctaWrap: {
      paddingHorizontal: 16,
      marginTop: 14,
      gap: 10,
    },

    ctaPrimary: {
      borderRadius: 16,
      overflow: "hidden",
      elevation: 5,
      shadowColor: "#F97613",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    ctaPrimaryInner: {
      height: 54,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    ctaPrimaryText: { color: "#fff", fontWeight: "800" },

    ctaGhost: {
      height: 48,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: "#F97613",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "transparent",
    },
    ctaGhostText: { color: "#F97613", fontWeight: "700" },

    // ── Footer marca
    brandFooter: {
      alignItems: "center",
      paddingTop: 24,
      paddingBottom: 36,
      gap: 4,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    brandIcon: {
      width: 17,
      height: 22,
      transform: [{ translateY: -3 }],
    },
    brandTitle: { fontWeight: "800", color: c.text },
    brandSub: { color: c.subtext },

    // ── Skeleton
    skeletonHero: {
      width: "100%",
      height: HERO_HEIGHT,
      backgroundColor: isDark ? "#1b1b1b" : "#e9e9e9",
    },
    skeletonMeta: {
      width: 180,
      height: 22,
      borderRadius: 999,
      backgroundColor: isDark ? "#2a2a2a" : "#ececec",
      marginBottom: 16,
    },
    skeletonTitle1: {
      width: "88%",
      height: 22,
      borderRadius: 8,
      backgroundColor: isDark ? "#2a2a2a" : "#ececec",
      marginBottom: 10,
    },
    skeletonTitle2: {
      width: "72%",
      height: 22,
      borderRadius: 8,
      backgroundColor: isDark ? "#2a2a2a" : "#ececec",
      marginBottom: 18,
    },
    skeletonLead: {
      width: "100%",
      height: 16,
      borderRadius: 8,
      backgroundColor: isDark ? "#2a2a2a" : "#ececec",
      marginBottom: 10,
    },
    skeletonLead2: {
      width: "84%",
      height: 16,
      borderRadius: 8,
      backgroundColor: isDark ? "#2a2a2a" : "#ececec",
    },
    skeletonCta: {
      width: "100%",
      height: 54,
      borderRadius: 16,
      backgroundColor: isDark ? "#2a2a2a" : "#ececec",
    },
  });

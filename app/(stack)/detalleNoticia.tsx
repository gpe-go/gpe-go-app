import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
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

function formatearFechaSeguro(fecha?: string | string[]) {
  const valor = Array.isArray(fecha) ? fecha[0] : fecha;
  const limpio = String(valor ?? "").replace(/\s+/g, " ").trim();

  if (!limpio) return "Fecha no disponible";
  if (limpio.toLowerCase() === "invalid date") return "Fecha no disponible";

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

export default function DetalleNoticiaScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  // StatusBar — light-content translucent mientras está activa, restaura al salir
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
      }
      return () => {
        StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(colors.background);
          StatusBar.setTranslucent(false);
        }
      };
    }, [isDark, colors.background])
  );

  const { title, description, image, content, url, date } = useLocalSearchParams();

  const fechaFormateada = formatearFechaSeguro(date);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(26)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim]);

  const compartir = async () => {
    try {
      await Share.share({
        message: `${title}\n\n${description}\n\nVía GuadalupeGO: ${url}`,
        title: String(title ?? ""),
      });
    } catch {}
  };

  const abrirFuente = async () => {
    const enlace = String(url ?? "").trim();
    if (!enlace) return;
    await Linking.openURL(enlace);
  };

  const tieneContenidoSecundario =
    !!content && String(content).trim().length > 0 && String(content).trim() !== String(description ?? "").trim();

  const isLoading = !title;

  if (isLoading) {
    return (
      <View style={s.wrapper}>

        <View style={s.skeletonHero} />

        <View style={s.skeletonMainCard}>
          <View style={s.skeletonDate} />
          <View style={s.skeletonTitle1} />
          <View style={s.skeletonTitle2} />

          <View style={s.skeletonActionRow}>
            <View style={s.skeletonActionPrimary} />
            <View style={s.skeletonActionSecondary} />
          </View>
        </View>

        <View style={s.skeletonContentCard}>
          <View style={s.skeletonParagraph1} />
          <View style={s.skeletonParagraph2} />
          <View style={s.skeletonParagraph3} />
          <View style={s.skeletonFullBtn} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.wrapper}>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          {image ? (
            <Image source={{ uri: image as string }} style={s.heroImage} />
          ) : (
            <LinearGradient colors={["#E96928", "#c4511a"]} style={s.heroImage}>
              <Ionicons name="newspaper-outline" size={64} color="rgba(255,255,255,0.4)" />
            </LinearGradient>
          )}

          <LinearGradient
            colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.55)"]}
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
              s.shareHeroBtn,
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
            onPress={compartir}
          >
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </Pressable>

          <View style={s.heroBadgeRow}>
            <View style={s.newsBadge}>
              <View style={s.newsDot} />
              <Text style={[s.newsBadgeText, { fontSize: fonts.xs }]}>{t('news_badge')}</Text>
            </View>
          </View>
        </View>

        <Animated.View
          style={[
            s.animatedContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            },
          ]}
        >
          <View style={s.mainCard}>
            <View style={s.dateRow}>
              <Ionicons name="calendar-outline" size={14} color="#E96928" />
              <Text style={[s.date, { fontSize: fonts.xs }]} numberOfLines={1}>
                {fechaFormateada}
              </Text>
            </View>

            <Text style={[s.title, { fontSize: fonts["2xl"] }]}>{title}</Text>

            <View style={s.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  s.actionBtn,
                  {
                    opacity: pressed ? 0.88 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
                onPress={abrirFuente}
              >
                <LinearGradient colors={["#E96928", "#c4511a"]} style={s.actionBtnGradient}>
                  <Ionicons name="open-outline" size={16} color="#fff" />
                  <Text style={[s.actionBtnText, { fontSize: fonts.sm }]}>{t('news_source')}</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  s.shareBtn,
                  {
                    opacity: pressed ? 0.88 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
                onPress={compartir}
              >
                <Ionicons name="share-social-outline" size={16} color="#E96928" />
                <Text style={[s.shareBtnText, { fontSize: fonts.sm }]}>{t("share")}</Text>
              </Pressable>
            </View>
          </View>

          <View style={s.contentCard}>
            {description ? (
              <View style={s.descBlock}>
                <View style={s.descAccent} />
                <Text style={[s.description, { fontSize: fonts.base }]}>{description}</Text>
              </View>
            ) : null}

            {tieneContenidoSecundario ? (
              <>
                <View style={s.divider}>
                  <View style={s.dividerLine} />
                  <View style={s.dividerIcon}>
                    <Ionicons name="newspaper-outline" size={14} color={colors.subtext} />
                  </View>
                  <View style={s.dividerLine} />
                </View>

                <Text style={[s.contentText, { fontSize: fonts.sm }]}>{content}</Text>
              </>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                s.fullBtn,
                {
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={abrirFuente}
            >
              <LinearGradient colors={["#E96928", "#c4511a"]} style={s.fullBtnGradient}>
                <Ionicons name="globe-outline" size={18} color="#fff" />
                <Text style={[s.fullBtnText, { fontSize: fonts.base }]}>{t('news_view_full_article')}</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </LinearGradient>
            </Pressable>

            <View style={s.footer}>
              <View style={s.footerLogoRow}>
                <View style={s.footerLogoIcon}>
                  <Ionicons name="location" size={10} color="#fff" />
                </View>
                <Text style={[s.footerLogo, { fontSize: fonts.sm }]}>
                  Guadalupe<Text style={{ color: "#E96928" }}>GO</Text>
                </Text>
              </View>
              <Text style={[s.footerSub, { fontSize: fonts.xs }]}>{t('app_tagline')}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: c.background,
    },

    animatedContent: {
      flex: 1,
    },

    hero: {
      width: "100%",
      height: 280,
      justifyContent: "center",
      alignItems: "center",
    },

    heroImage: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
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
      borderColor: "rgba(255,255,255,0.15)",
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
      borderColor: "rgba(255,255,255,0.15)",
    },

    heroBadgeRow: {
      position: "absolute",
      bottom: 18,
      left: 18,
      flexDirection: "row",
      gap: 8,
    },

    newsBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(0,0,0,0.5)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.15)",
    },

    newsDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "#4ADE80",
    },

    newsBadgeText: {
      color: "#fff",
      fontWeight: "600",
    },

    mainCard: {
      backgroundColor: c.card,
      marginTop: -22,
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

    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },

    date: {
      color: "#E96928",
      fontWeight: "600",
      textTransform: "capitalize",
    },

    title: {
      fontWeight: "900",
      color: c.text,
      letterSpacing: -0.5,
      lineHeight: f["2xl"] * 1.25,
      marginBottom: 18,
    },

    actionRow: {
      flexDirection: "row",
      gap: 10,
    },

    actionBtn: {
      flex: 1,
      borderRadius: 14,
      overflow: "hidden",
      elevation: 4,
      shadowColor: "#E96928",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
    },

    actionBtnGradient: {
      height: 48,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
    },

    actionBtnText: {
      color: "#fff",
      fontWeight: "700",
    },

    shareBtn: {
      height: 48,
      borderWidth: 2,
      borderColor: "#E96928",
      borderRadius: 14,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      backgroundColor: "transparent",
    },

    shareBtnText: {
      color: "#E96928",
      fontWeight: "700",
    },

    contentCard: {
      backgroundColor: c.card,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: c.border,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.07,
      shadowRadius: 6,
      marginBottom: 16,
    },

    descBlock: {
      flexDirection: "row",
      gap: 14,
      marginBottom: 20,
    },

    descAccent: {
      width: 4,
      borderRadius: 2,
      backgroundColor: "#E96928",
    },

    description: {
      flex: 1,
      color: c.text,
      lineHeight: f.base * 1.7,
      fontWeight: "500",
    },

    divider: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
    },

    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.border,
    },

    dividerIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: c.inputBackground,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.border,
    },

    contentText: {
      color: c.subtext,
      lineHeight: f.sm * 1.75,
      marginBottom: 24,
    },

    fullBtn: {
      borderRadius: 16,
      overflow: "hidden",
      elevation: 5,
      shadowColor: "#E96928",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      marginBottom: 24,
    },

    fullBtnGradient: {
      height: 54,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },

    fullBtnText: {
      color: "#fff",
      fontWeight: "800",
    },

    footer: {
      alignItems: "center",
      gap: 4,
      paddingTop: 4,
    },

    footerLogoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    footerLogoIcon: {
      width: 18,
      height: 18,
      borderRadius: 5,
      backgroundColor: "#E96928",
      justifyContent: "center",
      alignItems: "center",
    },

    footerLogo: {
      fontWeight: "800",
      color: c.text,
    },

    footerSub: {
      color: c.subtext,
    },

    skeletonHero: {
      width: "100%",
      height: 280,
      backgroundColor: isDark ? "#1b1b1b" : "#e9e9e9",
    },

    skeletonMainCard: {
      backgroundColor: c.card,
      marginTop: -22,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 20,
      borderWidth: 1,
      borderColor: c.border,
    },

    skeletonDate: {
      width: 120,
      height: 12,
      borderRadius: 6,
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
      marginBottom: 20,
    },

    skeletonActionRow: {
      flexDirection: "row",
      gap: 10,
    },

    skeletonActionPrimary: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      backgroundColor: isDark ? "#2a2a2a" : "#ececec",
    },

    skeletonActionSecondary: {
      width: 120,
      height: 48,
      borderRadius: 14,
      backgroundColor: isDark ? "#2a2a2a" : "#ececec",
    },

    skeletonContentCard: {
      backgroundColor: c.card,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: c.border,
    },

    skeletonParagraph1: {
      width: "100%",
      height: 16,
      borderRadius: 8,
      backgroundColor: isDark ? "#2a2a2a" : "#ececec",
      marginBottom: 12,
    },

    skeletonParagraph2: {
      width: "92%",
      height: 16,
      borderRadius: 8,
      backgroundColor: isDark ? "#2a2a2a" : "#ececec",
      marginBottom: 12,
    },

    skeletonParagraph3: {
      width: "76%",
      height: 16,
      borderRadius: 8,
      backgroundColor: isDark ? "#2a2a2a" : "#ececec",
      marginBottom: 24,
    },

    skeletonFullBtn: {
      width: "100%",
      height: 54,
      borderRadius: 16,
      backgroundColor: isDark ? "#2a2a2a" : "#ececec",
    },
  });
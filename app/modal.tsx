import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import {
  Pressable, StatusBar, StyleSheet, Text, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";

export default function ModalScreen() {
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  return (
    <SafeAreaView style={s.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* ══ HANDLE (arrastrar para cerrar) ══════════════ */}
      <View style={s.handleWrap}>
        <View style={s.handle} />
      </View>

      {/* ══ HEADER ══════════════════════════════════════ */}
      <View style={s.header}>
        <View style={s.headerLeft} />
        <Text style={[s.headerTitle, { fontSize: fonts.base }]}>
          GuadalupeGO
        </Text>
        <Pressable style={s.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={18} color={colors.subtext} />
        </Pressable>
      </View>

      {/* ══ CONTENIDO ═══════════════════════════════════ */}
      <View style={s.content}>

        {/* Ícono central */}
        <LinearGradient
          colors={["#E96928", "#c4511a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.iconWrap}
        >
          <View style={s.circle1} />
          <View style={s.circle2} />
          <Ionicons name="location" size={40} color="#fff" />
        </LinearGradient>

        <Text style={[s.title, { fontSize: fonts["2xl"] }]}>
          GuadalupeGO
        </Text>
        <Text style={[s.subtitle, { fontSize: fonts.sm }]}>
          Tu guía turística de Guadalupe, Nuevo León
        </Text>

        {/* Divider */}
        <View style={s.divider}>
          <View style={s.dividerLine} />
          <View style={s.dividerBadge}>
            <Ionicons name="information-circle-outline" size={14} color={colors.subtext} />
          </View>
          <View style={s.dividerLine} />
        </View>

        {/* Info cards */}
        <View style={s.infoCards}>
          {[
            { icon: "map-outline",       color: "#E96928", label: "Explora",  desc: "Lugares y sitios turísticos" },
            { icon: "calendar-outline",  color: "#9C27B0", label: "Eventos",  desc: "Actividades y festivales"    },
            { icon: "newspaper-outline", color: "#4A90E2", label: "Noticias", desc: "Información local al día"    },
          ].map((item) => (
            <View key={item.label} style={s.infoCard}>
              <View style={[s.infoCardIcon, { backgroundColor: item.color + "18" }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View style={s.infoCardText}>
                <Text style={[s.infoCardLabel, { fontSize: fonts.sm }]}>
                  {item.label}
                </Text>
                <Text style={[s.infoCardDesc, { fontSize: fonts.xs }]}>
                  {item.desc}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
            </View>
          ))}
        </View>

      </View>

      {/* ══ BOTONES ═════════════════════════════════════ */}
      <View style={s.actions}>
        <Link href="/" dismissTo asChild>
          <Pressable
            style={({ pressed }) => [
              s.primaryBtn,
              { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={["#E96928", "#c4511a"]}
              style={s.primaryBtnGradient}
            >
              <Ionicons name="home-outline" size={18} color="#fff" />
              <Text style={[s.primaryBtnText, { fontSize: fonts.base }]}>
                Ir al inicio
              </Text>
            </LinearGradient>
          </Pressable>
        </Link>

        <Pressable
          style={({ pressed }) => [
            s.secondaryBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={16} color="#E96928" />
          <Text style={[s.secondaryBtnText, { fontSize: fonts.sm }]}>
            Volver
          </Text>
        </Pressable>
      </View>

      {/* ══ FOOTER ══════════════════════════════════════ */}
      <View style={s.footer}>
        <View style={s.footerLogoRow}>
          <View style={s.footerLogoIcon}>
            <Ionicons name="location" size={10} color="#fff" />
          </View>
          <Text style={[s.footerLogo, { fontSize: fonts.sm }]}>
            Guadalupe<Text style={{ color: "#E96928" }}>GO</Text>
          </Text>
        </View>
        <Text style={[s.footerSub, { fontSize: fonts.xs }]}>
          v1.0.2 · 2026
        </Text>
      </View>

    </SafeAreaView>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1, backgroundColor: c.background,
  },

  // ── Handle ─────────────────────────────────────────────
  handleWrap: { alignItems: "center", paddingTop: 10, paddingBottom: 4 },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: c.border,
  },

  // ── Header ─────────────────────────────────────────────
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: c.border,
  },
  headerLeft:  { width: 34 },
  headerTitle: { fontWeight: "800", color: c.text },
  closeBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: c.inputBackground,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: c.border,
  },

  // ── Contenido ──────────────────────────────────────────
  content: {
    flex: 1, alignItems: "center",
    paddingHorizontal: 24, paddingTop: 32,
  },

  iconWrap: {
    width: 100, height: 100, borderRadius: 30,
    justifyContent: "center", alignItems: "center",
    marginBottom: 20, overflow: "hidden",
    elevation: 10,
    shadowColor: "#E96928", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16,
  },
  circle1: {
    position: "absolute", width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.08)", top: -20, right: -20,
  },
  circle2: {
    position: "absolute", width: 50, height: 50, borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.06)", bottom: -10, left: -10,
  },

  title: {
    fontWeight: "900", color: c.text,
    letterSpacing: -0.5, marginBottom: 6,
  },
  subtitle: {
    color: c.subtext, fontWeight: "500",
    textAlign: "center", marginBottom: 28,
  },

  // Divider
  divider: {
    flexDirection: "row", alignItems: "center",
    width: "100%", marginBottom: 24,
  },
  dividerLine:  { flex: 1, height: 1, backgroundColor: c.border },
  dividerBadge: {
    marginHorizontal: 12,
    backgroundColor: c.inputBackground,
    width: 28, height: 28, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: c.border,
  },

  // Info cards
  infoCards: { width: "100%", gap: 10 },
  infoCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: c.card,
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: c.border,
    elevation: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 4,
  },
  infoCardIcon: {
    width: 42, height: 42, borderRadius: 13,
    justifyContent: "center", alignItems: "center",
  },
  infoCardText:  { flex: 1 },
  infoCardLabel: { fontWeight: "800", color: c.text, marginBottom: 2 },
  infoCardDesc:  { color: c.subtext },

  // ── Botones ────────────────────────────────────────────
  actions: { paddingHorizontal: 24, paddingTop: 16, gap: 10 },

  primaryBtn: {
    borderRadius: 16, overflow: "hidden",
    elevation: 5,
    shadowColor: "#E96928", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8,
  },
  primaryBtnGradient: {
    height: 54, flexDirection: "row",
    justifyContent: "center", alignItems: "center", gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },

  secondaryBtn: {
    height: 48, borderWidth: 2, borderColor: "#E96928",
    borderRadius: 16, flexDirection: "row",
    justifyContent: "center", alignItems: "center", gap: 6,
  },
  secondaryBtnText: { color: "#E96928", fontWeight: "700" },

  // ── Footer ─────────────────────────────────────────────
  footer:        { alignItems: "center", paddingVertical: 16, gap: 4 },
  footerLogoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerLogoIcon: {
    width: 18, height: 18, borderRadius: 5,
    backgroundColor: "#E96928",
    justifyContent: "center", alignItems: "center",
  },
  footerLogo: { fontWeight: "800", color: c.text },
  footerSub:  { color: c.subtext },
});
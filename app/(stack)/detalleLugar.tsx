import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image, Linking, Platform, Pressable,
  ScrollView, StatusBar, StyleSheet, Text, View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/context/ThemeContext";

export default function DetalleLugar() {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);

  const router = useRouter();
  const { lugar: lugarParam } = useLocalSearchParams();
  const lugar = lugarParam ? JSON.parse(lugarParam as string) : {};

  const abrirMapa = () => {
    const query = encodeURIComponent(`${lugar.nombre} ${lugar.ubicacion}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO IMAGE */}
        <View style={s.hero}>
          <Image source={{ uri: lugar.imagen }} style={s.heroImage} />

          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>

          <Pressable style={s.favBtn}>
            <Ionicons name="heart-outline" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* CARD PRINCIPAL */}
        <View style={s.mainCard}>
          <Text style={s.title}>{lugar.nombre || t("places")}</Text>

          <View style={s.ratingRow}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={s.ratingText}>4.9</Text>
            <Text style={s.dot}>•</Text>
            <Text style={s.locationText}>{lugar.ubicacion || "Nuevo León"}</Text>
          </View>

          <Text style={s.price}>{lugar.costo || "Gratis"}</Text>

          <View style={s.actionRow}>
            <Pressable style={s.actionBtn} onPress={abrirMapa}>
              <Ionicons name="navigate" size={18} color="#fff" />
              <Text style={s.actionText}>{t("location")}</Text>
            </Pressable>

            <Pressable style={s.actionBtnSecondary}>
              <Ionicons name="share-social-outline" size={18} color="#E96928" />
              <Text style={s.actionTextSecondary}>{t("share")}</Text>
            </Pressable>
          </View>
        </View>

        {/* DETALLES */}
        <View style={s.details}>
          <View style={s.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#E96928" />
            <Text style={s.infoText}>{lugar.ubicacion || t("location")}</Text>
          </View>

          <View style={s.separator} />

          <View style={s.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#4A90E2" />
            <Text style={s.infoText}>{t("schedule")}</Text>
          </View>

          <View style={s.separator} />

          <View style={s.infoRow}>
            <MaterialCommunityIcons name="calendar-month" size={24} color="#10B981" />
            <Text style={s.infoText}>{t("date")}</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },

  hero: { width: "100%", height: 260 },
  heroImage: { width: "100%", height: "100%" },

  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
  },
  favBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
  },

  mainCard: {
    backgroundColor: c.card,
    marginTop: -25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: c.border,
  },

  title: { fontSize: f.xl, fontWeight: "bold", color: c.text },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  ratingText: { marginLeft: 4, fontWeight: "bold", color: c.text, fontSize: f.sm },
  dot: { marginHorizontal: 6, color: c.subtext },
  locationText: { color: c.subtext, fontSize: f.sm },
  price: { fontSize: f.lg, fontWeight: "bold", color: "#E96928", marginTop: 10 },

  actionRow: { flexDirection: "row", marginTop: 18, gap: 10 },
  actionBtn: {
    flex: 1, backgroundColor: "#E96928", padding: 12, borderRadius: 12,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6,
  },
  actionBtnSecondary: {
    flex: 1, borderWidth: 2, borderColor: "#E96928", padding: 12, borderRadius: 12,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6,
  },
  actionText: { color: "#fff", fontWeight: "bold", fontSize: f.sm },
  actionTextSecondary: { color: "#E96928", fontWeight: "bold", fontSize: f.sm },

  details: {
    backgroundColor: c.card,
    marginTop: 10, paddingHorizontal: 24, paddingVertical: 20,
    borderRadius: 20, marginHorizontal: 12, marginBottom: 30,
    borderWidth: 1, borderColor: c.border,
  },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  infoText: { marginLeft: 14, fontSize: f.base, color: c.text },
  separator: { height: 1, backgroundColor: c.border },
});
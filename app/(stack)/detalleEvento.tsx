import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image, Linking, Platform, Pressable,
  ScrollView, StatusBar, StyleSheet, Text, View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/context/ThemeContext";

export default function DetalleEvento() {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);

  const router = useRouter();
  const { evento: eventoParam } = useLocalSearchParams();
  const evento = eventoParam ? JSON.parse(eventoParam as string) : {};

  const abrirMapa = () => {
    const query = encodeURIComponent(`${evento.titulo} ${evento.lugar}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const compartir = () => {
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(`¡Mira este evento! ${evento.titulo} - ${evento.fecha} en ${evento.lugar}`)}`);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO IMAGE */}
        <View style={s.hero}>
          <Image source={{ uri: evento.imagen }} style={s.heroImage} />

          {/* Overlay degradado */}
          <View style={s.heroOverlay} />

          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>

          {/* Badge de categoría */}
          <View style={s.categoryBadge}>
            <Text style={s.categoryBadgeText}>{evento.sub}</Text>
          </View>
        </View>

        {/* CARD PRINCIPAL */}
        <View style={s.mainCard}>
          <Text style={s.title}>{evento.titulo}</Text>

          <View style={s.ratingRow}>
            <MaterialCommunityIcons name="tag" size={16} color="#E96928" />
            <Text style={s.categoryText}>{evento.categoria}</Text>
            <Text style={s.dot}>•</Text>
            <Ionicons name="location-outline" size={16} color={colors.subtext} />
            <Text style={s.locationText}>{evento.lugar}</Text>
          </View>

          <Text style={s.price}>{evento.costo}</Text>

          <View style={s.actionRow}>
            <Pressable style={s.actionBtn} onPress={abrirMapa}>
              <Ionicons name="navigate" size={18} color="#fff" />
              <Text style={s.actionText}>{t("location")}</Text>
            </Pressable>

            <Pressable style={s.actionBtnSecondary} onPress={compartir}>
              <Ionicons name="share-social-outline" size={18} color="#E96928" />
              <Text style={s.actionTextSecondary}>{t("share")}</Text>
            </Pressable>
          </View>
        </View>

        {/* DETALLES */}
        <View style={s.details}>

          <View style={s.infoRow}>
            <MaterialCommunityIcons name="calendar-month" size={24} color="#E96928" />
            <View style={s.infoTextWrapper}>
              <Text style={s.infoLabel}>Fecha</Text>
              <Text style={s.infoText}>{evento.fecha}</Text>
            </View>
          </View>

          <View style={s.separator} />

          <View style={s.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#4A90E2" />
            <View style={s.infoTextWrapper}>
              <Text style={s.infoLabel}>Lugar</Text>
              <Text style={s.infoText}>{evento.lugar}</Text>
            </View>
          </View>

          <View style={s.separator} />

          <View style={s.infoRow}>
            <MaterialCommunityIcons name="ticket" size={24} color="#10B981" />
            <View style={s.infoTextWrapper}>
              <Text style={s.infoLabel}>Costo</Text>
              <Text style={s.infoText}>{evento.costo}</Text>
            </View>
          </View>

          <View style={s.separator} />

          <View style={s.infoRow}>
            <MaterialCommunityIcons name="shape" size={24} color="#9C27B0" />
            <View style={s.infoTextWrapper}>
              <Text style={s.infoLabel}>Categoría</Text>
              <Text style={s.infoText}>{evento.categoria}</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },

  hero:      { width: "100%", height: 280 },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
  },

  categoryBadge: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 40,
    right: 20,
    backgroundColor: "#E96928",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 12 },

  mainCard: {
    backgroundColor: c.card,
    marginTop: -25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: c.border,
  },

  title:        { fontSize: f.xl, fontWeight: "bold", color: c.text },
  ratingRow:    { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  categoryText: { fontWeight: "bold", color: "#E96928", fontSize: f.sm },
  dot:          { marginHorizontal: 4, color: c.subtext },
  locationText: { color: c.subtext, fontSize: f.sm, flex: 1 },
  price:        { fontSize: f.lg, fontWeight: "bold", color: "#E96928", marginTop: 10 },

  actionRow: { flexDirection: "row", marginTop: 18, gap: 10 },
  actionBtn: {
    flex: 1, backgroundColor: "#E96928", padding: 12, borderRadius: 12,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6,
  },
  actionBtnSecondary: {
    flex: 1, borderWidth: 2, borderColor: "#E96928", padding: 12, borderRadius: 12,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6,
  },
  actionText:          { color: "#fff", fontWeight: "bold", fontSize: f.sm },
  actionTextSecondary: { color: "#E96928", fontWeight: "bold", fontSize: f.sm },

  details: {
    backgroundColor: c.card,
    marginTop: 10, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 20, marginHorizontal: 12, marginBottom: 30,
    borderWidth: 1, borderColor: c.border,
  },
  infoRow:         { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  infoTextWrapper: { marginLeft: 14, flex: 1 },
  infoLabel:       { fontSize: f.xs, color: c.subtext, fontWeight: "600", marginBottom: 2 },
  infoText:        { fontSize: f.base, color: c.text, fontWeight: "500" },
  separator:       { height: 1, backgroundColor: c.border },
});
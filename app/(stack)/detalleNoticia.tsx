import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image, Pressable, ScrollView,
  StatusBar, StyleSheet, Text, View, Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/context/ThemeContext";

export default function DetalleNoticiaScreen() {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);

  const router = useRouter();
  const { title, description, image, content, url, date } = useLocalSearchParams();

  return (
    <View style={s.wrapper}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

        {/* IMAGEN HERO */}
        <View style={s.hero}>
          <Image source={{ uri: image as string }} style={s.image} />

          {/* Botón volver sobre la imagen */}
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* CONTENIDO */}
        <View style={s.content}>

          <View style={s.dateRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.subtext} />
            <Text style={s.date}>
              {new Date(date as string).toLocaleDateString()}
            </Text>
          </View>

          <Text style={s.title}>{title}</Text>

          <View style={s.separator} />

          <Text style={s.description}>{description}</Text>

          <Text style={s.contentText}>{content}</Text>

          <Pressable
            style={s.button}
            onPress={() => Linking.openURL(url as string)}
          >
            <Ionicons name="open-outline" size={18} color="#fff" />
            <Text style={s.buttonText}>{t("see_more")}</Text>
          </Pressable>

        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: c.background },
  container: { flex: 1 },

  hero: { width: "100%", height: 260, position: "relative" },
  image: { width: "100%", height: "100%" },

  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
  },

  content: {
    backgroundColor: c.card,
    marginTop: -20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: c.border,
    minHeight: 400,
  },

  dateRow: {
    flexDirection: "row", alignItems: "center",
    marginBottom: 12, gap: 6,
  },
  date: { fontSize: f.xs, color: c.subtext },

  title: {
    fontSize: f['2xl'], fontWeight: "bold",
    color: c.text, marginBottom: 16,
    lineHeight: f['2xl'] * 1.3,
  },

  separator: {
    height: 1, backgroundColor: c.border, marginBottom: 16,
  },

  description: {
    fontSize: f.base, color: c.text,
    marginBottom: 16, lineHeight: f.base * 1.6,
  },

  contentText: {
    fontSize: f.sm, color: c.subtext,
    lineHeight: f.sm * 1.7, marginBottom: 30,
  },

  button: {
    backgroundColor: "#E96928",
    paddingVertical: 14, borderRadius: 12,
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", gap: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: f.base },
});
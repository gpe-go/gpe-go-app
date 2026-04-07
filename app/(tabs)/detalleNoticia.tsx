import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useMemo } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../src/context/ThemeContext";

function limpiarTextoPlano(valor?: string | string[]) {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return String(texto ?? "").replace(/\s+/g, " ").trim();
}

function formatearFechaSeguro(fecha?: string | string[]) {
  const valor = limpiarTextoPlano(fecha);
  if (!valor) return "Fecha no disponible";

  if (valor.toLowerCase() === "invalid date") {
    return "Fecha no disponible";
  }

  const parsed = new Date(valor);

  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return valor;
}

export default function DetalleNoticiaScreen() {
  const router = useRouter();
  const { colors, fonts, isDark } = useTheme();

  const { title, description, image, content, date, url } = useLocalSearchParams<{
    title?: string;
    description?: string;
    image?: string;
    content?: string;
    date?: string;
    url?: string;
  }>();

  const titulo = limpiarTextoPlano(title) || "Noticia";
  const descripcion = limpiarTextoPlano(description);
  const contenido = limpiarTextoPlano(content) || descripcion || "No hay contenido disponible.";
  const imagen = limpiarTextoPlano(image);
  const enlace = limpiarTextoPlano(url);
  const fechaFormateada = formatearFechaSeguro(date);

  const tieneImagen = imagen.length > 0;

  const textoPrincipal = useMemo(() => {
    if (contenido.trim().length > 0) return contenido;
    if (descripcion.trim().length > 0) return descripcion;
    return "No hay contenido disponible.";
  }, [contenido, descripcion]);

  const abrirFuente = async () => {
    if (!enlace) {
      Alert.alert("Sin enlace", "Esta noticia no tiene una fuente original disponible.");
      return;
    }

    const canOpen = await Linking.canOpenURL(enlace);
    if (!canOpen) {
      Alert.alert("No se pudo abrir", "El enlace de la noticia no es válido.");
      return;
    }

    await Linking.openURL(enlace);
  };

  const compartirNoticia = async () => {
    try {
      const texto = `${titulo}\n\n${enlace || ""}`.trim();

      if (await Sharing.isAvailableAsync()) {
        Alert.alert(
          "Compartir",
          "La opción de compartir ya está lista. Si luego quieres, la conectamos con el flujo nativo completo."
        );
      } else {
        Alert.alert("Compartir", texto);
      }
    } catch {
      Alert.alert("Error", "No se pudo compartir la noticia.");
    }
  };

  const s = makeStyles(colors, fonts, isDark);

  return (
    <View style={s.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#111111" : "#ffffff"}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <View style={s.hero}>
          {tieneImagen ? (
            <Image source={{ uri: imagen }} style={s.heroImage} />
          ) : (
            <LinearGradient colors={["#E96928", "#c4511a"]} style={s.heroImage}>
              <Ionicons name="newspaper-outline" size={56} color="rgba(255,255,255,0.65)" />
            </LinearGradient>
          )}

          <LinearGradient
            colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.58)"]}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={s.heroTopButtons}>
            <Pressable
              style={({ pressed }) => [
                s.topBtn,
                { transform: [{ scale: pressed ? 0.94 : 1 }] },
              ]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.topBtn,
                { transform: [{ scale: pressed ? 0.94 : 1 }] },
              ]}
              onPress={compartirNoticia}
            >
              <Ionicons name="share-social-outline" size={20} color="#fff" />
            </Pressable>
          </View>

          <View style={s.badgeRow}>
            <View style={s.newsBadge}>
              <View style={s.liveDot} />
              <Text style={[s.newsBadgeText, { fontSize: fonts.sm }]}>Noticia</Text>
            </View>
          </View>
        </View>

        <View style={s.mainCard}>
          <View style={s.dateRow}>
            <Ionicons name="calendar-outline" size={18} color="#E96928" />
            <Text style={[s.date, { fontSize: fonts.sm }]}>{fechaFormateada}</Text>
          </View>

          <Text style={[s.title, { fontSize: fonts["3xl"] || 34 }]}>{titulo}</Text>

          <View style={s.actionsRow}>
            <Pressable
              style={({ pressed }) => [
                s.primaryBtn,
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={abrirFuente}
            >
              <Ionicons name="open-outline" size={20} color="#fff" />
              <Text style={[s.primaryBtnText, { fontSize: fonts.base }]}>Fuente original</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.secondaryBtn,
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={compartirNoticia}
            >
              <Ionicons name="share-social-outline" size={20} color="#E96928" />
              <Text style={[s.secondaryBtnText, { fontSize: fonts.base }]}>Compartir</Text>
            </Pressable>
          </View>
        </View>

        <View style={s.contentCard}>
          <View style={s.quoteMark} />

          {descripcion ? (
            <Text style={[s.description, { fontSize: fonts.lg }]}>{descripcion}</Text>
          ) : null}

          <Text style={[s.contentText, { fontSize: fonts.base }]}>{textoPrincipal}</Text>

          <Pressable
            style={({ pressed }) => [
              s.readFullBtn,
              { transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
            onPress={abrirFuente}
          >
            <Ionicons name="globe-outline" size={22} color="#fff" />
            <Text style={[s.readFullBtnText, { fontSize: fonts.base }]}>
              Ver noticia completa
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>

          <View style={s.brandWrap}>
            <View style={s.brandIcon}>
              <Ionicons name="location" size={18} color="#fff" />
            </View>
            <View>
              <Text style={[s.brandTitle, { fontSize: fonts.xl }]}>GuadalupeGO</Text>
              <Text style={[s.brandSub, { fontSize: fonts.sm }]}>Tu guía de Guadalupe, NL</Text>
            </View>
          </View>
        </View>
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
      paddingBottom: 36,
    },

    hero: {
      height: 350,
      position: "relative",
      backgroundColor: isDark ? "#111" : "#ddd",
    },

    heroImage: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },

    heroTopButtons: {
      position: "absolute",
      top: 54,
      left: 18,
      right: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    topBtn: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: "rgba(30,41,59,0.45)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.14)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 5,
    },

    badgeRow: {
      position: "absolute",
      left: 18,
      bottom: 18,
      right: 18,
      flexDirection: "row",
      alignItems: "center",
    },

    newsBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(15,23,42,0.74)",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.10)",
    },

    liveDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#4ADE80",
    },

    newsBadgeText: {
      color: "#fff",
      fontWeight: "700",
    },

    mainCard: {
      marginTop: -26,
      backgroundColor: c.card,
      borderTopLeftRadius: 34,
      borderTopRightRadius: 34,
      paddingHorizontal: 22,
      paddingTop: 22,
      paddingBottom: 24,
      borderWidth: 1,
      borderColor: c.border,
    },

    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      gap: 8,
    },

    date: {
      color: "#E96928",
      fontWeight: "700",
    },

    title: {
      color: c.text,
      fontWeight: "900",
      lineHeight: 52,
      letterSpacing: -0.8,
      marginBottom: 24,
    },

    actionsRow: {
      flexDirection: "row",
      gap: 14,
    },

    primaryBtn: {
      flex: 1,
      backgroundColor: "#E96928",
      minHeight: 60,
      borderRadius: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      shadowColor: "#E96928",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 14,
      elevation: 4,
    },

    primaryBtnText: {
      color: "#fff",
      fontWeight: "800",
    },

    secondaryBtn: {
      flex: 1,
      minHeight: 60,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: "#E96928",
      backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#fff",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },

    secondaryBtnText: {
      color: "#E96928",
      fontWeight: "800",
    },

    contentCard: {
      marginHorizontal: 16,
      marginTop: 18,
      borderRadius: 28,
      backgroundColor: c.card,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 26,
      borderWidth: 1,
      borderColor: c.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.18 : 0.08,
      shadowRadius: 16,
      elevation: 4,
    },

    quoteMark: {
      width: 6,
      height: 76,
      borderRadius: 3,
      backgroundColor: "#E96928",
      marginBottom: 18,
    },

    description: {
      color: c.text,
      fontWeight: "500",
      lineHeight: 44,
      marginBottom: 16,
    },

    contentText: {
      color: c.text,
      lineHeight: 34,
      marginBottom: 26,
    },

    readFullBtn: {
      minHeight: 62,
      borderRadius: 18,
      backgroundColor: "#E96928",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginBottom: 24,
      shadowColor: "#E96928",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 14,
      elevation: 4,
    },

    readFullBtnText: {
      color: "#fff",
      fontWeight: "800",
    },

    brandWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 8,
      gap: 8,
    },

    brandIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: "#E96928",
      alignItems: "center",
      justifyContent: "center",
    },

    brandTitle: {
      color: c.text,
      fontWeight: "900",
      textAlign: "center",
    },

    brandSub: {
      color: c.subtext,
      textAlign: "center",
      marginTop: 2,
    },
  });
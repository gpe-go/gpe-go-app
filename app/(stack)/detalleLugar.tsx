import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";


export default function DetalleLugar() {
  const router = useRouter();
  const { lugar: lugarParam } = useLocalSearchParams();


  const lugar = lugarParam ? JSON.parse(lugarParam as string) : {};

  const abrirMapa = () => {
    const query = encodeURIComponent(`${lugar.nombre} ${lugar.ubicacion}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO IMAGE */}
        <View style={styles.hero}>
          <Image source={{ uri: lugar.imagen }} style={styles.heroImage} />

          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>

          <Pressable style={styles.favBtn}>
            <Ionicons name="heart-outline" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* CARD PRINCIPAL */}
        <View style={styles.mainCard}>

          <Text style={styles.title}>
            {lugar.nombre || "Lugar turístico"}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>4.9</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.locationText}>
              {lugar.ubicacion || "Nuevo León"}
            </Text>
          </View>

          <Text style={styles.price}>
            {lugar.costo || "Gratis"}
          </Text>

          {/* BOTONES */}
          <View style={styles.actionRow}>

            <Pressable style={styles.actionBtn} onPress={abrirMapa}>
              <Ionicons name="navigate" size={18} color="#fff" />
              <Text style={styles.actionText}>Cómo llegar</Text>
            </Pressable>

            <Pressable style={styles.actionBtnSecondary}>
              <Ionicons name="share-social-outline" size={18} color="#E96928" />
              <Text style={styles.actionTextSecondary}>Compartir</Text>
            </Pressable>

          </View>

        </View>

        {/* DETALLES */}
        <View style={styles.details}>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={24}
              color="#E96928"
            />
            <Text style={styles.infoText}>
              {lugar.ubicacion || "Ubicación no disponible"}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color="#4A90E2"
            />
            <Text style={styles.infoText}>
              Abierto todos los días
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="calendar-month"
              size={24}
              color="#10B981"
            />
            <Text style={styles.infoText}>
              Disponible todo el año
            </Text>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  hero: {
    width: "100%",
    height: 260,
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  favBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  mainCard: {
    backgroundColor: "#fff",
    marginTop: -25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  ratingText: {
    marginLeft: 4,
    fontWeight: "bold",
    color: "#1E293B",
  },

  dot: {
    marginHorizontal: 6,
    color: "#64748B",
  },

  locationText: {
    color: "#64748B",
  },

  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E96928",
    marginTop: 10,
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
  },

  actionBtn: {
    flex: 1,
    backgroundColor: "#E96928",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  actionBtnSecondary: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E96928",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },

  actionTextSecondary: {
    color: "#E96928",
    fontWeight: "bold",
  },

  details: {
    backgroundColor: "#fff",
    marginTop: 10,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 20,
    marginHorizontal: 12,
    marginBottom: 30,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  infoText: {
    marginLeft: 14,
    fontSize: 16,
    color: "#334155",
  },

  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
  }

});
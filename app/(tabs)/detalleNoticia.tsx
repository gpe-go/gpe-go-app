import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function DetalleNoticiaScreen() {

  const { title, description, image, content, date } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>

      <Image source={{ uri: image as string }} style={styles.image} />

      <View style={styles.content}>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color="#64748B" />
          <Text style={styles.date}>
            {new Date(date as string).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.description}>
          {description}
        </Text>

        <Text style={styles.contentText}>
          {content}
        </Text>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff"
  },

  image: {
    width: "100%",
    height: 250
  },

  content: {
    padding: 20
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6
  },

  date: {
    fontSize: 14,
    color: "#64748B"
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 15
  },

  description: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 15,
    lineHeight: 24
  },

  contentText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
    marginBottom: 30
  },

});
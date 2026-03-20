import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritos } from '../../src/context/FavoritosContext';
import { getLugares } from '../../src/api/api';
import { LUGARES } from "../../src/data/lugares";

export default function Categoria() {
  const { tipo } = useLocalSearchParams<{ tipo: string }>();
  const router = useRouter();
  const { toggleFavorito, esFavorito } = useFavoritos();
  const [lugares, setLugares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarLugares();
  }, [tipo]);

  const cargarLugares = async () => {
    try {
      const res = await getLugares({ busqueda: tipo as string, por_pagina: 50 });
      if (res.success && res.data?.lugares?.length > 0) {
        setLugares(res.data.lugares.map((l: any) => ({
          id: String(l.id),
          nombre: l.nombre,
          categoria: l.categoria_nombre,
          imagen: l.imagen || 'https://via.placeholder.com/400x200',
          ubicacion: l.ubicacion || l.direccion || '',
          costo: '',
        })));
      } else {
        // fallback: filtrar datos locales por categoría
        setLugares(LUGARES.filter((l: any) => l.categoria === tipo));
      }
    } catch {
      setLugares(LUGARES.filter((l: any) => l.categoria === tipo));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{tipo}</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E96928" />
        </View>
      ) : lugares.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No hay lugares en esta categoría</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {lugares.map((item: any) => (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => router.push(`/lugar/${item.id}`)}
            >
              <Image source={{ uri: item.imagen }} style={styles.image} />
              <View style={styles.overlay} />

              <View style={styles.topInfo}>
                <View style={styles.ratingBox}>
                  <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorito(item)} style={styles.heartBtn}>
                  <Ionicons
                    name={esFavorito(item.id) ? "heart" : "heart-outline"}
                    size={26}
                    color={esFavorito(item.id) ? "#e63946" : "#fff"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.bottomInfo}>
                <View>
                  <Text style={styles.nombreText}>{item.nombre}</Text>
                  <Text style={styles.categoriaText}>{item.ubicacion}</Text>
                </View>
                {item.costo ? <Text style={styles.precioText}>{item.costo}</Text> : null}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 16 },
  header: {
    paddingTop: 50, paddingBottom: 15,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 15
  },
  backButton: { padding: 5 },
  title: { fontSize: 20, fontWeight: "600", textTransform: 'capitalize' },
  scrollContent: { padding: 15 },
  card: {
    height: 200, marginBottom: 15, borderRadius: 20,
    overflow: "hidden", backgroundColor: "#000", elevation: 4,
  },
  image: { width: "100%", height: "100%", position: 'absolute', opacity: 0.8 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' },
  topInfo: { flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  ratingBox: { flexDirection: 'row' },
  stars: { fontSize: 14 },
  heartBtn: { padding: 5 },
  bottomInfo: {
    position: 'absolute', bottom: 0, width: '100%',
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', padding: 15,
  },
  nombreText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  categoriaText: { color: '#ccc', fontSize: 12 },
  precioText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

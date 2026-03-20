import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritos } from '../../src/context/FavoritosContext';
import { getLugar } from '../../src/api/api';
import { LUGARES } from "../../src/data/lugares";

export default function LugarDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toggleFavorito, esFavorito } = useFavoritos();
  const [lugar, setLugar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarLugar();
  }, [id]);

  const cargarLugar = async () => {
    try {
      const res = await getLugar(Number(id));
      if (res.success && res.data) {
        setLugar({
          id: String(res.data.id),
          nombre: res.data.nombre,
          imagen: res.data.imagen || 'https://via.placeholder.com/400x320',
          ubicacion: res.data.ubicacion || res.data.direccion || '',
          categoria: res.data.categoria_nombre || '',
          costo: '',
          descripcion: res.data.descripcion || '',
          telefono: res.data.telefono || '',
        });
      } else {
        // fallback a datos locales
        const local = LUGARES.find((l: any) => l.id === id);
        if (local) setLugar(local);
      }
    } catch {
      const local = LUGARES.find((l: any) => l.id === id);
      if (local) setLugar(local);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#E96928" />
    </View>
  );

  if (!lugar) return (
    <View style={styles.centered}>
      <Text>Lugar no encontrado</Text>
    </View>
  );

  const favoritado = esFavorito(lugar.id);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View>
          <Image source={{ uri: lugar.imagen }} style={styles.mainImage} />

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.topHeart} onPress={() => toggleFavorito(lugar)}>
            <Ionicons name={favoritado ? "heart" : "heart-outline"} size={28} color={favoritado ? "#e63946" : "#fff"} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoWrapper}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{lugar.nombre}</Text>
            <Text style={styles.cardCategory}>{lugar.categoria}</Text>
            {lugar.costo ? <Text style={styles.cardPrice}>{lugar.costo}</Text> : null}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          {lugar.descripcion ? (
            <View style={styles.row}>
              <Text style={styles.icon}>📝</Text>
              <Text style={styles.detailText}>{lugar.descripcion}</Text>
            </View>
          ) : null}

          {lugar.ubicacion ? (
            <View style={styles.row}>
              <Text style={styles.icon}>📍</Text>
              <Text style={styles.detailText}>{lugar.ubicacion}</Text>
            </View>
          ) : null}

          {lugar.telefono ? (
            <View style={styles.row}>
              <Text style={styles.icon}>📞</Text>
              <Text style={styles.detailText}>{lugar.telefono}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainImage: { width: '100%', height: 320 },
  backBtn: {
    position: 'absolute', top: 50, left: 20,
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 25, padding: 8
  },
  topHeart: {
    position: 'absolute', top: 50, right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 25, padding: 8
  },
  infoWrapper: { alignItems: 'center', marginTop: -50 },
  card: {
    backgroundColor: '#E96928', width: '85%',
    padding: 20, borderRadius: 15, alignItems: 'center', elevation: 8,
  },
  cardTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  cardCategory: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  cardPrice: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 6 },
  detailsContainer: { padding: 25, paddingBottom: 60 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  icon: { fontSize: 20, marginRight: 15 },
  detailText: { fontSize: 15, color: '#555', flex: 1, lineHeight: 22 },
});

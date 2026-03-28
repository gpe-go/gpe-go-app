import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLugar } from "../../src/hooks/useLugar";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritos } from '../../src/context/FavoritosContext';

export default function LugarDetalle() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { toggleFavorito, esFavorito } = useFavoritos();

  const { data: lugar, loading } = useLugar(id as string);

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#E96928" /></View>;
  if (!lugar) return <View style={styles.container}><Text>Lugar no encontrado</Text></View>;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Imagen de Cabecera */}
        <View>
          <Image source={{ uri: lugar.imagen }} style={styles.mainImage} />

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topHeart}
            onPress={() => toggleFavorito(lugar)}
          >
            <Ionicons
              name={esFavorito(lugar.id) ? "heart" : "heart-outline"}
              size={28}
              color={esFavorito(lugar.id) ? "#e63946" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        {/* Tarjeta Rosa Flotante */}
        <View style={styles.infoWrapper}>
          <View style={styles.pinkCard}>
            <Text style={styles.pinkTitle}>{lugar.nombre}</Text>
            <Text style={styles.pinkStars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.pinkPrice}>{lugar.costo}</Text>
          </View>
        </View>

        {/* Detalles de contacto e Info */}
        <View style={styles.detailsContainer}>
          <View style={styles.row}>
            <Text style={styles.icon}>🏷️</Text>
            <Text style={styles.detailText}>Turismo Nuevo León</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.icon}>🕒</Text>
            <Text style={styles.detailText}>Cerrado ahora: 14:00 - 19:00 ▼</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.icon}>📍</Text>
            <Text style={styles.detailText}>{lugar.ubicacion}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.icon}>📅</Text>
            <Text style={styles.detailText}>Todo el año</Text>
          </View>

          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Califica tu experiencia</Text>
            <Text style={styles.bigStars}>⭐⭐⭐⭐⭐</Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón flotante de compra */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.buyBtn}>
          <Text style={styles.buyBtnText}>Comprar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  pinkCard: {
    backgroundColor: '#E96928',
    width: '85%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 8,
  },
  pinkTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  pinkStars: { fontSize: 18, marginVertical: 5 },
  pinkPrice: { color: '#fff', fontSize: 24, fontWeight: '800' },
  detailsContainer: { padding: 25, paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  icon: { fontSize: 20, marginRight: 15 },
  detailText: { fontSize: 16, color: '#555' },
  separator: { height: 1, backgroundColor: '#eee', marginBottom: 20 },
  feedbackSection: { alignItems: 'center', marginTop: 20 },
  feedbackTitle: { fontSize: 16, color: '#888', marginBottom: 10 },
  bigStars: { fontSize: 30, opacity: 0.2 },
  footer: { position: 'absolute', bottom: 30, right: 20 },
  buyBtn: { backgroundColor: '#cddc39', paddingVertical: 15, paddingHorizontal: 35, borderRadius: 25 },
  buyBtnText: { fontWeight: 'bold', fontSize: 18 }
});
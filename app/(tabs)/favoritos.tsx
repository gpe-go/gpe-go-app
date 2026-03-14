import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useFavoritos } from '../../src/context/FavoritosContext';

export default function FavoritosScreen() {
  const { favoritos, toggleFavorito } = useFavoritos();
  const router = useRouter();

  // Función para regresar al inicio con una transición limpia
  const irAlInicio = () => {
    // replace evita que esta pantalla se quede en el stack, haciendo la transición más fluida
    router.replace('/');
  };

  const HeaderFavoritos = () => (
    <View style={styles.banner}>
      <LinearGradient
        colors={['#E96928', '#ff8e53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bannerGradient}
      >
        <Text style={styles.bannerTitle}>Mis Favoritos</Text>
        <Text style={styles.bannerSubtitle}>Tus lugares preferidos en Guadalupe</Text>
      </LinearGradient>
    </View>
  );

  if (favoritos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-dislike-outline" size={100} color="#E96928" style={{ opacity: 0.5 }} />
        <Text style={styles.emptyTitle}>Aún no hay nada aquí</Text>
        <Text style={styles.emptyText}>Explora la app y guarda los lugares que más te gusten.</Text>

        {/* Botón con feedback visual de presión */}
        <Pressable
          style={({ pressed }) => [
            styles.exploreBtn,
            { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }
          ]}
          onPress={irAlInicio}
        >
          <Text style={styles.exploreBtnText}>Ir a Inicio</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={favoritos}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={HeaderFavoritos}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { opacity: pressed ? 0.9 : 1 }
            ]}
            onPress={() => router.push(`/lugar/${item.id}`)}
          >
            <Image source={{ uri: item.imagen }} style={styles.image} />

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.topRow}>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= (item.rating ?? 5) ? "star" : "star-outline"}
                        size={14}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                  <Text style={styles.categoryBadge}>{item.categoria}</Text>
                </View>

                <View style={styles.bottomRow}>
                  <View style={styles.textInfo}>
                    <Text style={styles.nombreText} numberOfLines={1}>{item.nombre}</Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={14} color="#fff" />
                      <Text style={styles.locationText} numberOfLines={1}>{item.ubicacion}</Text>
                    </View>
                  </View>
                  <Text style={styles.priceText}>{item.costo || "$ ---"}</Text>
                </View>
              </View>
            </LinearGradient>

            <Pressable
              style={styles.heartBtn}
              onPress={() => toggleFavorito(item)}
            >
              <Ionicons name="heart" size={24} color="#ff4d4d" />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  banner: {
    height: 140,
    width: '100%',
    marginBottom: 10,
  },
  bannerGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginTop: 2,
  },
  card: {
    height: 220,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    justifyContent: 'flex-end',
    padding: 15,
  },
  cardContent: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    color: '#fff',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  textInfo: {
    flex: 1,
    marginRight: 10,
  },
  nombreText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: 4,
  },
  priceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  heartBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    color: '#1e293b',
  },
  emptyText: {
    color: "#64748b",
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  exploreBtn: {
    marginTop: 25,
    backgroundColor: '#E96928',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#E96928',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  exploreBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  }
});

/* ====================== Cuando exista backend reemplazar ===================== */

// import { getFavoritos } from "@/src/api/api";
// const [favoritos, setFavoritos] = useState(FAVORITOS_DATA);

/*
import { useEffect } from "react";

useEffect(() => {

  const cargarFavoritos = async () => {
    try {
      const data = await getFavoritos();
      setFavoritos(data);
    } catch (error) {
      console.log("Usando datos locales");
    }
  };

  cargarFavoritos();

}, []);
*/

/* ============================================================================ */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNoticias } from '@/src/api/api';
import { router } from "expo-router";

export default function NoticiasScreen() {

  const [noticias, setNoticias] = useState<any[]>([]);

  useEffect(() => {

    const cargarNoticias = async () => {
      const data = await getNoticias();
      setNoticias(data);
    };

    cargarNoticias();

  }, []);

  const getBadgeColor = (cat: string) => {
    switch (cat) {
      case 'Deportes': return '#FFEDE5';
      case 'Turismo': return '#E5F6FF';
      case 'Vialidad': return '#F1F5F9';
      default: return '#F1F5F9';
    }
  };

  const getTextColor = (cat: string) => {
    switch (cat) {
      case 'Deportes': return '#E96928';
      case 'Turismo': return '#0077B6';
      case 'Vialidad': return '#64748B';
      default: return '#64748B';
    }
  };

  const detectarCategoria = (titulo: string) => {

    const texto = titulo.toLowerCase();

    if (texto.includes("futbol") || texto.includes("liga") || texto.includes("mundial") || texto.includes("deporte")) {
      return "Deportes";
    }

    if (texto.includes("turismo") || texto.includes("festival") || texto.includes("cultura")) {
      return "Turismo";
    }

    if (texto.includes("trafico") || texto.includes("avenida") || texto.includes("vial")) {
      return "Vialidad";
    }

    return "Turismo";
  };

  return (
    <ScrollView style={styles.container}>
      
      <View style={styles.blueHeader}>
        <Text style={styles.headerTitle}>Noticias Oficiales</Text>
        <Text style={styles.headerSubtitle}>
          Mantente informado con las últimas noticias y avisos del municipio
        </Text>
      </View>

      <View style={styles.listContainer}>

        {noticias.map((item, index) => {

          const categoria = detectarCategoria(item.title || "");

          return (

            <View key={index} style={styles.newsCard}>

              <Image
                source={{ uri: item.image }}
                style={styles.cardImage}
              />

              <View style={styles.cardContent}>

                <View style={styles.badgeRow}>

                  <View style={[
                    styles.badge,
                    { backgroundColor: getBadgeColor(categoria) }
                  ]}>

                    <Text style={[
                      styles.badgeText,
                      { color: getTextColor(categoria) }
                    ]}>
                      {categoria}
                    </Text>

                  </View>

                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                    <Text style={styles.dateText}>
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </Text>
                  </View>

                </View>

                <Text style={styles.newsTitle}>
                  {item.title}
                </Text>

                <Text style={styles.newsResumen} numberOfLines={3}>
                  {item.description}
                </Text>

                <Pressable
                  style={styles.readMoreBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/detalleNoticia",
                      params: {
                        title: item.title,
                        description: item.description,
                        image: item.image,
                        content: item.content,
                        url: item.url,
                        date: item.publishedAt
                      }
                    })
                  }
                >
                  <Text style={styles.readMoreText}>Leer Más</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </Pressable>

              </View>

            </View>

          );

        })}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  blueHeader: {
    backgroundColor: '#E96928',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 10,
    lineHeight: 20
  },

  listContainer: {
    marginTop: -30,
    paddingHorizontal: 15,
    paddingBottom: 30
  },

  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  cardImage: {
    width: '100%',
    height: 200
  },

  cardContent: {
    padding: 20
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8
  },

  badgeText: {
    fontSize: 12,
    fontWeight: 'bold'
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },

  dateText: {
    fontSize: 12,
    color: '#94A3B8'
  },

  newsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10
  },

  newsResumen: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 20
  },

  readMoreBtn: {
    backgroundColor: '#E96928',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 8,
  },

  readMoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
});
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { EVENTOS_DATA } from "@/src/data/eventos";
import { getEventos } from '../../src/api/api';

const CATEGORIAS = [
  { id: '1', nombre: 'Deporte', icon: 'soccer' },
  { id: '2', nombre: 'Cultural', icon: 'palette' },
  { id: '3', nombre: 'Gastronomía', icon: 'food' },
  { id: '4', nombre: 'Sociales', icon: 'account-group' },
];

/* ================= EVENT CARD OPTIMIZADO ================= */

const EventCard = React.memo(({ item }: any) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imagen }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.categoryLabel}>{item.sub}</Text>
        <Text style={styles.eventTitle}>{item.titulo}</Text>
        <Text style={styles.infoText}>{item.fecha}</Text>
        <Text style={styles.infoText}>{item.lugar}</Text>
      </View>
    </View>
  );
});

EventCard.displayName = "EventCard";

/* ================= SCREEN ================= */

export default function EventosScreen() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('Todas');
  const [playVideo, setPlayVideo] = useState(false);
  const [eventosBackend, setEventosBackend] = useState<any[]>([]);

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      const res = await getEventos({ por_pagina: 50 });
      if (res.success && res.data?.eventos?.length > 0) {
        setEventosBackend(res.data.eventos.map((e: any) => ({
          id: String(e.id),
          titulo: e.titulo,
          fecha: e.fecha_inicio,
          lugar: '',
          imagen: e.imagen || 'https://via.placeholder.com/400x260',
          categoria: e.tipo === 'noticia' ? 'Cultural' : 'Sociales',
          sub: e.tipo,
          costo: '',
          especial: false,
        })));
      }
    } catch {
      // usa datos locales
    }
  };

  const todosEventos = eventosBackend.length > 0 ? eventosBackend : EVENTOS_DATA;
  const eventoPrincipal = EVENTOS_DATA.find(e => e.especial);

  const filteredEvents = todosEventos.filter((event) => {
    if (event.especial) return false;
    const matchesSearch = event.titulo.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === 'Todas' || event.categoria === activeCat;
    return matchesSearch && matchesCat;
  });

  const player = useVideoPlayer(eventoPrincipal?.videoSource, player => {
    player.loop = false;
  });

  const startVideo = () => {
    setPlayVideo(true);
    player.currentTime = 0;
    player.play();
  };

  const stopVideo = () => {
    player.pause();
    player.currentTime = 0;
    setPlayVideo(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard item={item} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}

        ListHeaderComponent={
          <View>

            {/* BANNER */}
            <View style={styles.orangeBanner}>
              <Text style={styles.bannerTitle}>Eventos</Text>
              <Text style={styles.bannerSub}>
                Aquí se estarán publicando las noticias y eventos sociales del municipio.
              </Text>

              {/* BUSCADOR */}
              <View style={{ position: 'relative', zIndex: 100 }}>
                <View style={styles.floatingSearch}>
                  <Ionicons name="search" size={20} color="#94a3b8" />
                  <TextInput
                    placeholder="Buscar eventos..."
                    style={styles.searchInput}
                    value={search}
                    onChangeText={(text) => {
                      setSearch(text);
                    }}
                  />
                </View>

                {search.length > 0 && (
                  <View style={styles.searchResults}>

                    <Text style={styles.resultsTitle}>Resultados de búsqueda</Text>

                    {EVENTOS_DATA.filter(e =>
                      e.titulo.toLowerCase().includes(search.toLowerCase())
                    ).map(item => (
                      <Pressable
                        key={item.id}
                        style={styles.searchItem}
                        onPress={() => {
                          setSearch(item.titulo);
                        }}
                      >
                        <MaterialCommunityIcons
                          name="calendar-star"
                          size={18}
                          color="#64748B"
                        />
                        <Text style={styles.searchItemText}>{item.titulo}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

            </View>

            {/* CATEGORÍAS */}
            <View style={styles.catContainer}>
              <Text style={styles.catTitle}>Categorías</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Pressable
                  style={[styles.catItem, activeCat === 'Todas' && styles.catActive]}
                  onPress={() => setActiveCat('Todas')}
                >
                  <Text style={[styles.catText, activeCat === 'Todas' && styles.catTextActive]}>
                    Todas
                  </Text>
                </Pressable>

                {CATEGORIAS.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[styles.catItem, activeCat === cat.nombre && styles.catActive]}
                    onPress={() => setActiveCat(cat.nombre)}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={18}
                      color={activeCat === cat.nombre ? 'white' : '#64748B'}
                    />
                    <Text style={[styles.catText, activeCat === cat.nombre && styles.catTextActive]}>
                      {cat.nombre}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* EVENTO PRINCIPAL */}
            {eventoPrincipal && (
              <TouchableWithoutFeedback
                onPressIn={startVideo}
                onPressOut={stopVideo}
              >
                <View style={styles.mainEventCard}>
                  {!playVideo ? (
                    <Image
                      source={{ uri: eventoPrincipal.imagen }}
                      style={styles.mainEventImage}
                    />
                  ) : (
                    <VideoView
                      style={styles.mainEventImage}
                      player={player}
                      allowsPictureInPicture={false}
                      nativeControls={false}
                    />
                  )}

                  <View style={styles.worldBadge}>
                    <Text style={styles.worldBadgeText}>Mundial 2026</Text>
                  </View>

                  <View style={styles.mainEventOverlay}>
                    <Text style={styles.mainEventTitle}>
                      {eventoPrincipal.titulo}
                    </Text>
                    <Text style={styles.mainEventSub}>
                      {eventoPrincipal.fecha} • {eventoPrincipal.lugar}
                    </Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}

            <Text style={styles.mainSectionTitle}>Más Eventos</Text>

          </View>
        }

      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  orangeBanner: {
    backgroundColor: '#E96928',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  bannerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 },
  bannerSub: { color: '#fff', fontSize: 14, opacity: 0.9 },

  floatingSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 20,
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 52,
    elevation: 8,
  },

  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  searchInput: { flex: 1, marginLeft: 10 },

  searchResults: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    marginTop: 10,
    paddingVertical: 8,
  },

  searchTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1E293B",
    paddingHorizontal: 12,
    marginBottom: 4,
  },

  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  searchItemText: {
    color: "#1E293B",
    fontSize: 13,
  },

  catContainer: { marginVertical: 20, paddingHorizontal: 20 },

  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  catActive: { backgroundColor: '#E96928' },
  catText: { marginLeft: 5, fontWeight: '600', color: '#64748B' },
  catTextActive: { color: '#fff' },

  mainEventCard: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 10,
  },

  mainEventImage: {
    width: '100%',
    height: 260,
  },

  worldBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#E53935',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  worldBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  mainEventOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },

  mainEventTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },

  mainEventSub: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },

  mainSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 20,
    marginBottom: 15,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },

  catTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },

  cardImage: { width: '100%', height: 160 },
  cardContent: { padding: 15 },

  categoryLabel: {
    color: '#E96928',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 4,
  },

  eventTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  infoText: { color: '#64748B', fontSize: 13, marginTop: 4 },
});

/* ====================== Cuando exista backend reemplazar ===================== */

// import { getEventos } from "@/src/api/api";
// const [eventos, setEventos] = useState(EVENTOS_DATA);

/*
import { useEffect } from "react";

useEffect(() => {

  const cargarEventos = async () => {
    try {
      const data = await getEventos();
      setEventos(data);
    } catch (error) {
      console.log("Usando datos locales");
    }
  };

  cargarEventos();

}, []);

Después cambiar:

const filteredEvents = EVENTOS_DATA.filter(...)

por:

const filteredEvents = eventos.filter(...)
*/

/* ============================================================================ */
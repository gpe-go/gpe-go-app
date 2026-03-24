import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useState } from 'react';
import {
  FlatList, Image, Pressable, ScrollView, StyleSheet,
  Text, TextInput, TouchableWithoutFeedback, View, StatusBar,
} from 'react-native';
import { EVENTOS_DATA } from '@/src/data/eventos';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter } from 'expo-router';

const CATEGORIAS = [
  { id: '1', value: 'Deporte',     labelKey: 'cat_deporte',     icon: 'soccer' },
  { id: '2', value: 'Cultural',    labelKey: 'cat_cultural',    icon: 'palette' },
  { id: '3', value: 'Gastronomía', labelKey: 'cat_gastronomia', icon: 'food' },
  { id: '4', value: 'Sociales',    labelKey: 'cat_sociales',    icon: 'account-group' },
];

const EventCard = React.memo(({ item, colors, fonts, onPress }: any) => {
  const s = makeStyles(colors, fonts);
  return (
    <Pressable style={s.card} onPress={onPress}>
      <Image source={{ uri: item.imagen }} style={s.cardImage} />
      <View style={s.cardContent}>
        <Text style={s.categoryLabel}>{item.sub}</Text>
        <Text style={s.eventTitle}>{item.titulo}</Text>
        <Text style={s.infoText}>{item.fecha}</Text>
        <Text style={s.infoText}>{item.lugar}</Text>
      </View>
    </Pressable>
  );
});

EventCard.displayName = 'EventCard';

export default function EventosScreen() {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);
  const router = useRouter();

  const [search, setSearch]       = useState('');
  const [activeCat, setActiveCat] = useState('Todas');
  const [playVideo, setPlayVideo] = useState(false);

  const eventoPrincipal = EVENTOS_DATA.find(e => e.especial);

  const filteredEvents = EVENTOS_DATA.filter((event) => {
    if (event.especial) return false;
    const matchesSearch = event.titulo.toLowerCase().includes(search.toLowerCase());
    const matchesCat    = activeCat === 'Todas' || event.categoria === activeCat;
    return matchesSearch && matchesCat;
  });

  const player = useVideoPlayer(eventoPrincipal?.videoSource, p => { p.loop = false; });

  const startVideo = () => { setPlayVideo(true); player.currentTime = 0; player.play(); };
  const stopVideo  = () => { player.pause(); player.currentTime = 0; setPlayVideo(false); };

  const limpiarSearch = () => setSearch('');

  // ─── Navegar al detalle del evento ────────────────────
  const irAlDetalle = (item: any) => {
    router.push({
      pathname: '/(stack)/detalleEvento',
      params: { evento: JSON.stringify(item) },
    });
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            item={item}
            colors={colors}
            fonts={fonts}
            onPress={() => irAlDetalle(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews

        ListHeaderComponent={
          <View>
            {/* BANNER */}
            <View style={s.orangeBanner}>
              <Text style={s.bannerTitle}>{t('tab_events')}</Text>
              <Text style={s.bannerSub}>{t('Eve')}</Text>

              {/* BUSCADOR */}
              <View style={{ position: 'relative', zIndex: 100 }}>
                <View style={s.floatingSearch}>
                  <Ionicons name="search" size={20} color="#94a3b8" />
                  <TextInput
                    placeholder={t('search')}
                    placeholderTextColor="#94a3b8"
                    style={s.searchInput}
                    value={search}
                    onChangeText={setSearch}
                  />
                  {search.length > 0 && (
                    <Pressable onPress={limpiarSearch}>
                      <Ionicons name="close-circle" size={20} color="#94a3b8" />
                    </Pressable>
                  )}
                </View>

                {search.length > 0 && (
                  <View style={s.searchResults}>
                    <Text style={s.resultsTitle}>{t('search')}</Text>
                    {EVENTOS_DATA.filter(e =>
                      e.titulo.toLowerCase().includes(search.toLowerCase())
                    ).map(item => (
                      <Pressable
                        key={item.id}
                        style={s.searchItem}
                        onPress={() => setSearch(item.titulo)}
                      >
                        <MaterialCommunityIcons name="calendar-star" size={18} color={colors.subtext} />
                        <Text style={s.searchItemText}>{item.titulo}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* CATEGORÍAS */}
            <View style={s.catContainer}>
              <Text style={s.catTitle}>{t('categories')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Pressable
                  style={[s.catItem, activeCat === 'Todas' && s.catActive]}
                  onPress={() => setActiveCat('Todas')}
                >
                  <Text style={[s.catText, activeCat === 'Todas' && s.catTextActive]}>
                    {t('all')}
                  </Text>
                </Pressable>

                {CATEGORIAS.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[s.catItem, activeCat === cat.value && s.catActive]}
                    onPress={() => setActiveCat(cat.value)}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={18}
                      color={activeCat === cat.value ? 'white' : colors.subtext}
                    />
                    <Text style={[s.catText, activeCat === cat.value && s.catTextActive]}>
                      {t(cat.labelKey)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* EVENTO PRINCIPAL */}
            {eventoPrincipal && (
              <TouchableWithoutFeedback onPressIn={startVideo} onPressOut={stopVideo}>
                <View style={s.mainEventCard}>
                  {!playVideo ? (
                    <Image source={{ uri: eventoPrincipal.imagen }} style={s.mainEventImage} />
                  ) : (
                    <VideoView
                      style={s.mainEventImage}
                      player={player}
                      allowsPictureInPicture={false}
                      nativeControls={false}
                    />
                  )}
                  <View style={s.worldBadge}>
                    <Text style={s.worldBadgeText}>Mundial 2026</Text>
                  </View>
                  <View style={s.mainEventOverlay}>
                    <Text style={s.mainEventTitle}>{eventoPrincipal.titulo}</Text>
                    <Text style={s.mainEventSub}>{eventoPrincipal.fecha} • {eventoPrincipal.lugar}</Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}

            <Text style={s.mainSectionTitle}>{t('see_more')}</Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },

  orangeBanner: {
    backgroundColor: '#E96928',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  bannerTitle: { color: '#fff', fontSize: f.xl, fontWeight: '900', marginBottom: 6 },
  bannerSub:   { color: '#fff', fontSize: f.sm, opacity: 0.9 },

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

  searchInput: { flex: 1, marginLeft: 10, color: '#1E293B', fontSize: f.base },

  searchResults: {
    backgroundColor: c.card,
    borderRadius: 12,
    marginTop: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: c.border,
  },

  resultsTitle: {
    fontSize: f.base,
    fontWeight: '700',
    color: c.text,
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  searchItemText: { color: c.text, fontSize: f.sm },

  catContainer: { marginVertical: 20, paddingHorizontal: 20 },
  catTitle: { fontSize: f.md, fontWeight: 'bold', color: c.text, marginBottom: 12 },

  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    paddingHorizontal: 15,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: c.border,
  },
  catActive:     { backgroundColor: '#E96928', borderColor: '#E96928' },
  catText:       { marginLeft: 5, fontWeight: '600', color: c.subtext, fontSize: f.sm },
  catTextActive: { color: '#fff' },

  mainEventCard: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 10,
  },
  mainEventImage: { width: '100%', height: 260 },

  worldBadge: {
    position: 'absolute',
    top: 15, left: 15,
    backgroundColor: '#E53935',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  worldBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: f.xs },

  mainEventOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 18,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  mainEventTitle: { color: '#fff', fontSize: f.xl, fontWeight: '900', marginBottom: 6 },
  mainEventSub:   { color: '#fff', fontSize: f.sm, opacity: 0.9 },

  mainSectionTitle: {
    fontSize: f.lg,
    fontWeight: 'bold',
    color: c.text,
    marginLeft: 20,
    marginBottom: 15,
  },

  card: {
    backgroundColor: c.card,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.border,
  },
  cardImage:   { width: '100%', height: 160 },
  cardContent: { padding: 15 },

  categoryLabel: { color: '#E96928', fontWeight: 'bold', fontSize: f.xs, marginBottom: 4 },
  eventTitle:    { fontSize: f.md, fontWeight: 'bold', color: c.text },
  infoText:      { color: c.subtext, fontSize: f.sm, marginTop: 4 },
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
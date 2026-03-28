import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, FlatList, Image, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableWithoutFeedback, View, StatusBar,
} from 'react-native';
import { EVENTOS_DATA } from '@/src/data/eventos';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter } from 'expo-router';

// ── Mapa subcategoría → clave i18n ─────────────────────
const SUB_KEYS: Record<string, string> = {
  'Fútbol': 'sub_futbol',
  'Atletismo': 'sub_atletismo',
  'Básquetbol': 'sub_basquetbol',
  'Festivales': 'sub_festivales',
  'Exposiciones': 'sub_exposiciones',
  'Museos': 'cat_museos',
  'Ferias': 'sub_ferias',
  'Degustaciones': 'sub_degustaciones',
  'Comunitario': 'sub_comunitario',
  'Festival': 'sub_festival',
  'Mundial 2026': 'sub_mundial',
};

const CATEGORIAS = [
  { id: '1', value: 'Deporte', labelKey: 'cat_deporte', icon: 'soccer', color: '#E96928' },
  { id: '2', value: 'Cultural', labelKey: 'cat_cultural', icon: 'palette', color: '#9C27B0' },
  { id: '3', value: 'Gastronomía', labelKey: 'cat_gastronomia', icon: 'food', color: '#10B981' },
  { id: '4', value: 'Sociales', labelKey: 'cat_sociales', icon: 'account-group', color: '#4A90E2' },
];

function RefreshLogo({ refreshing }: { refreshing: boolean }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (refreshing) {
      const spin = Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 900, useNativeDriver: true })
      );
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 450, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
        ])
      );
      spin.start(); pulse.start();
      return () => { spin.stop(); pulse.stop(); spinAnim.setValue(0); pulseAnim.setValue(1); };
    }
  }, [refreshing, spinAnim, pulseAnim]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  if (!refreshing) return null;

  return (
    <View style={rl.container}>
      <Animated.View style={[rl.iconWrap, { transform: [{ rotate: spin }, { scale: pulseAnim }] }]}>
        <View style={rl.iconBg}><Ionicons name="location" size={18} color="#bbb" /></View>
      </Animated.View>
      <Text style={rl.label}>GuadalupeGO</Text>
    </View>
  );
}

const rl = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  iconBg: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: '#aaa', letterSpacing: 0.3 },
});

const EventCard = React.memo(({ item, colors, fonts, onPress, t }: any) => {
  const s = makeStyles(colors, fonts);
  const catInfo = CATEGORIAS.find(c => c.value === item.categoria);

  return (
    <Pressable
      style={({ pressed }) => [s.card, { opacity: pressed ? 0.93 : 1 }]}
      onPress={onPress}
    >
      <View style={s.cardImgWrapper}>
        <Image source={{ uri: item.imagen }} style={s.cardImage} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={StyleSheet.absoluteFillObject} />
        {catInfo && (
          <View style={[s.catImgBadge, { backgroundColor: catInfo.color }]}>
            <MaterialCommunityIcons name={catInfo.icon as any} size={12} color="#fff" />
            {/* ── sub traducido ── */}
            <Text style={s.catImgBadgeText}>
              {SUB_KEYS[item.sub] ? t(SUB_KEYS[item.sub]) : item.sub}
            </Text>
          </View>
        )}
      </View>

      <View style={s.cardContent}>
        <Text style={[s.eventTitle, { fontSize: fonts.base }]} numberOfLines={1}>
          {item.titulo}
        </Text>
        <View style={s.cardMetaRow}>
          <View style={s.cardMeta}>
            <Ionicons name="calendar-outline" size={13} color={colors.subtext} />
            <Text style={[s.infoText, { fontSize: fonts.xs }]}>{item.fecha}</Text>
          </View>
          <View style={s.cardMeta}>
            <Ionicons name="location-outline" size={13} color={colors.subtext} />
            <Text style={[s.infoText, { fontSize: fonts.xs }]} numberOfLines={1}>{item.lugar}</Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.subtext} style={{ alignSelf: 'center', marginRight: 14 }} />
    </Pressable>
  );
});

EventCard.displayName = 'EventCard';

export default function EventosScreen() {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('Todas');
  const [playVideo, setPlayVideo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const eventoPrincipal = EVENTOS_DATA.find(e => e.especial);

  const filteredEvents = EVENTOS_DATA.filter((event) => {
    if (event.especial) return false;
    const matchesSearch = event.titulo.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === 'Todas' || event.categoria === activeCat;
    return matchesSearch && matchesCat;
  });

  const player = useVideoPlayer(eventoPrincipal?.videoSource, p => { p.loop = false; });

  const startVideo = () => { setPlayVideo(true); player.currentTime = 0; player.play(); };
  const stopVideo = () => { player.pause(); player.currentTime = 0; setPlayVideo(false); };
  const limpiarSearch = () => setSearch('');

  const fetchData = useCallback(async () => {
    await new Promise((res) => setTimeout(res, 1500));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const irAlDetalle = (item: any) => {
    router.push({ pathname: '/(stack)/detalleEvento', params: { evento: JSON.stringify(item) } });
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard item={item} colors={colors} fonts={fonts} t={t} onPress={() => irAlDetalle(item)} />
        )}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing} onRefresh={onRefresh}
            tintColor="transparent" colors={['transparent']} progressBackgroundColor="transparent"
          />
        }
        ListHeaderComponent={
          <View>
            <RefreshLogo refreshing={refreshing} />

            {/* ── Banner ── */}
            <LinearGradient
              colors={['#E96928', '#c4511a']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.banner}
            >
              <View style={s.circle1} />
              <View style={s.circle2} />

              <View style={s.bannerContent}>
                <View style={s.bannerIconWrap}>
                  <Ionicons name="calendar" size={22} color="#E96928" />
                </View>
                <View>
                  <Text style={[s.bannerTitle, { fontSize: fonts.xl }]}>{t('tab_events')}</Text>
                  <Text style={[s.bannerSub, { fontSize: fonts.sm }]}>{t('Eve')}</Text>
                </View>
              </View>

              <View style={{ position: 'relative', zIndex: 100, marginTop: 16 }}>
                <View style={s.floatingSearch}>
                  <Ionicons name="search" size={20} color="#94a3b8" />
                  <TextInput
                    placeholder={t('search')} placeholderTextColor="#94a3b8"
                    style={[s.searchInput, { fontSize: fonts.base }]}
                    value={search} onChangeText={setSearch}
                  />
                  {search.length > 0 && (
                    <Pressable onPress={limpiarSearch}>
                      <Ionicons name="close-circle" size={20} color="#94a3b8" />
                    </Pressable>
                  )}
                </View>

                {search.length > 0 && (
                  <View style={s.searchResults}>
                    <Text style={[s.resultsTitle, { fontSize: fonts.sm }]}>{t('search')}</Text>
                    {EVENTOS_DATA.filter(e => e.titulo.toLowerCase().includes(search.toLowerCase())).map(item => (
                      <Pressable key={item.id} style={s.searchItem} onPress={() => setSearch(item.titulo)}>
                        <MaterialCommunityIcons name="calendar-star" size={18} color="#E96928" />
                        <Text style={[s.searchItemText, { fontSize: fonts.sm }]}>{item.titulo}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </LinearGradient>

            {/* ── Categorías ── */}
            <View style={s.catSection}>
              <View style={s.sectionHeader}>
                <View style={s.sectionDot} />
                <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>{t('categories')}</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Pressable
                  style={[s.catItem, activeCat === 'Todas' && { backgroundColor: '#E96928', borderColor: '#E96928' }]}
                  onPress={() => setActiveCat('Todas')}
                >
                  <Ionicons name="apps-outline" size={16} color={activeCat === 'Todas' ? '#fff' : colors.subtext} />
                  <Text style={[s.catText, { fontSize: fonts.xs }, activeCat === 'Todas' && s.catTextActive]}>
                    {t('all')}
                  </Text>
                </Pressable>

                {CATEGORIAS.map((cat) => {
                  const activa = activeCat === cat.value;
                  return (
                    <Pressable
                      key={cat.id}
                      style={[s.catItem, activa && { backgroundColor: cat.color, borderColor: cat.color }]}
                      onPress={() => setActiveCat(cat.value)}
                    >
                      <MaterialCommunityIcons name={cat.icon as any} size={16} color={activa ? '#fff' : colors.subtext} />
                      <Text style={[s.catText, { fontSize: fonts.xs }, activa && s.catTextActive]}>
                        {t(cat.labelKey)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* ── Evento principal ── */}
            {eventoPrincipal && (
              <View style={s.featuredSection}>
                <View style={s.sectionHeader}>
                  <View style={s.sectionDot} />
                  <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>
                    {t('events_featured')}
                  </Text>
                </View>

                <TouchableWithoutFeedback onPressIn={startVideo} onPressOut={stopVideo}>
                  <View style={s.mainEventCard}>
                    {!playVideo ? (
                      <Image source={{ uri: eventoPrincipal.imagen }} style={s.mainEventImage} />
                    ) : (
                      <VideoView
                        style={s.mainEventImage} player={player}
                        allowsPictureInPicture={false} nativeControls={false}
                      />
                    )}

                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.82)']}
                      style={StyleSheet.absoluteFillObject}
                    />

                    {/* ── Badge "Mundial 2026" traducido ── */}
                    <View style={s.worldBadge}>
                      <Ionicons name="football-outline" size={12} color="#fff" />
                      <Text style={[s.worldBadgeText, { fontSize: fonts.xs }]}>
                        {SUB_KEYS[eventoPrincipal.sub] ? t(SUB_KEYS[eventoPrincipal.sub]) : eventoPrincipal.sub}
                      </Text>
                    </View>

                    {/* ── Hint traducido ── */}
                    <View style={s.holdHint}>
                      <Ionicons name="play-circle-outline" size={14} color="rgba(255,255,255,0.8)" />
                      <Text style={[s.holdHintText, { fontSize: fonts.xs }]}>
                        {t('events_hold_video')}
                      </Text>
                    </View>

                    <View style={s.mainEventOverlay}>
                      <Text style={[s.mainEventTitle, { fontSize: fonts.xl }]} numberOfLines={2}>
                        {eventoPrincipal.titulo}
                      </Text>
                      <View style={s.mainEventMeta}>
                        <View style={s.mainEventMetaItem}>
                          <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                          <Text style={[s.mainEventSub, { fontSize: fonts.sm }]}>{eventoPrincipal.fecha}</Text>
                        </View>
                        <View style={s.mainEventMetaItem}>
                          <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                          <Text style={[s.mainEventSub, { fontSize: fonts.sm }]}>{eventoPrincipal.lugar}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            )}

            {/* ── Título lista ── */}
            <View style={s.sectionHeader}>
              <View style={s.sectionDot} />
              <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>{t('see_more')}</Text>
            </View>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  banner: { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 26, overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  circle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -50 },
  circle2: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30 },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIconWrap: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
  bannerTitle: { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
  bannerSub: { color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  floatingSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 52, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6 },
  searchInput: { flex: 1, marginLeft: 10, color: '#1E293B' },
  searchResults: { backgroundColor: c.card, borderRadius: 14, marginTop: 8, paddingVertical: 8, borderWidth: 1, borderColor: c.border, elevation: 10 },
  resultsTitle: { fontWeight: '700', color: c.text, paddingHorizontal: 12, marginBottom: 6 },
  searchItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12 },
  searchItemText: { color: c.text },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 12 },
  sectionDot: { width: 4, height: 18, borderRadius: 2, backgroundColor: '#E96928' },
  sectionTitle: { fontWeight: '800', color: c.text },
  catSection: { marginTop: 20, marginBottom: 4, paddingHorizontal: 20 },
  catItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.card, paddingHorizontal: 14, height: 38, borderRadius: 20, marginRight: 10, borderWidth: 1.5, borderColor: c.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  catText: { fontWeight: '600', color: c.subtext },
  catTextActive: { color: '#fff', fontWeight: '700' },
  featuredSection: { marginTop: 20 },
  mainEventCard: { marginHorizontal: 20, marginBottom: 8, borderRadius: 24, overflow: 'hidden', backgroundColor: '#000', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 },
  mainEventImage: { width: '100%', height: 260 },
  worldBadge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E53935', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  worldBadgeText: { color: '#fff', fontWeight: '700' },
  holdHint: { position: 'absolute', top: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  holdHintText: { color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  mainEventOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18 },
  mainEventTitle: { color: '#fff', fontWeight: '900', marginBottom: 8 },
  mainEventMeta: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  mainEventMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  mainEventSub: { color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  card: { backgroundColor: c.card, marginHorizontal: 20, marginBottom: 12, borderRadius: 20, overflow: 'hidden', flexDirection: 'row', borderWidth: 1, borderColor: c.border, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 5 },
  cardImgWrapper: { width: 110, height: 110 },
  cardImage: { width: '100%', height: '100%' },
  catImgBadge: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  catImgBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardContent: { flex: 1, padding: 12, justifyContent: 'center', gap: 6 },
  eventTitle: { fontWeight: '800', color: c.text },
  cardMetaRow: { gap: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { color: c.subtext },
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
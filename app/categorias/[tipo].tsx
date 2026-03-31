import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  FlatList, Image, Pressable, StatusBar, Text, View, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { useLugares } from '../../src/hooks/useLugares';
import { useFavoritos } from '../../src/context/FavoritosContext';
import { StyleSheet } from 'react-native';

const CATEGORIA_KEYS: Record<string, string> = {
  'Naturaleza & Aventura': 'cat_nature',
  'cultura':               'cat_culture',
  'pueblos Magicos':       'cat_pueblos_magicos',
  'explorar':              'cat_explore',
  'compras':               'cat_shopping',
  'servicios':             'cat_services',
  'Fin de semana':         'cat_weekend',
  'tours':                 'cat_tours',
  'Cerros':                'cat_cerros',
  'Parques':               'cat_parques',
  'Pueblos Mágicos':       'cat_pueblos_magicos',
  'Museos':                'cat_museos',
  'Restaurantes':          'cat_restaurantes',
  'Hoteles':               'cat_hoteles',
  'Tiendas':               'cat_tiendas',
  'Servicios':             'cat_services',
  'Plazas':                'cat_plazas',
  'Hospitales':            'cat_hospitales',
  'Farmacias':             'cat_farmacias',
  'Supermercados':         'cat_supermercados',
  'Gasolineras':           'cat_gasolineras',
};

export default function Categoria() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const { tipo, nombre } = useLocalSearchParams<{ tipo: string; nombre: string }>();
  const router = useRouter();
  const { toggleFavorito, esFavorito } = useFavoritos();

  const idCategoria = Number(tipo) || undefined;
  const { data: lugares, loading } = useLugares(idCategoria);

  const rawNombre = nombre || tipo || '';
  const categoriaKey = CATEGORIA_KEYS[rawNombre];
  const titulo = categoriaKey ? t(categoriaKey) : rawNombre;

  const s = makeStyles(colors, fonts, isDark);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />

      {/* ══ BANNER ══ */}
      <LinearGradient
        colors={['#E96928', '#c4511a']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.banner}
      >
        <View style={s.circle1} />
        <View style={s.circle2} />

        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color="#fff" />
          <Text style={[s.backLabel, { fontSize: fonts.sm }]}>{t('back')}</Text>
        </Pressable>

        <View style={s.bannerContent}>
          <View style={s.bannerIconWrap}>
            <Ionicons name="location" size={22} color="#E96928" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.bannerTitle, { fontSize: fonts['2xl'] }]} numberOfLines={1}>
              {titulo}
            </Text>
            <Text style={[s.bannerSub, { fontSize: fonts.sm }]}>
              {loading
                ? t('loading')
                : `${lugares.length} ${t('places')}`}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ══ LISTA ══ */}
      <FlatList
        data={lugares}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[s.list, lugares.length === 0 && { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="large" color="#E96928" />
            </View>
          ) : (
            <View style={s.emptyWrap}>
              <View style={s.emptyIconWrap}>
                <Ionicons name="location-outline" size={32} color="#E96928" />
              </View>
              <Text style={[s.emptyTitle, { fontSize: fonts.base }]}>
                {t('empty_category')}
              </Text>
              <Pressable style={s.emptyBtn} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={16} color="#fff" />
                <Text style={[s.emptyBtnText, { fontSize: fonts.sm }]}>{t('go_back')}</Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }) => {
          const fav = esFavorito(item.id);
          const catKey = CATEGORIA_KEYS[item.categoria];
          const catLabel = catKey ? t(catKey) : item.categoria;

          return (
            <Pressable
              style={({ pressed }) => [s.card, { opacity: pressed ? 0.93 : 1 }]}
              onPress={() =>
                router.push({
                  pathname: '/(stack)/detalleLugar',
                  params: { lugar: JSON.stringify(item) },
                })
              }
            >
              <Image source={{ uri: item.imagen }} style={s.cardImg} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.78)']}
                style={StyleSheet.absoluteFillObject}
              />

              {/* Top: estrellas + favorito */}
              <View style={s.cardTop}>
                <View style={s.starsRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Ionicons
                      key={star}
                      name={star <= Math.round(item.rating ?? 4) ? 'star' : 'star-outline'}
                      size={13} color="#FFD700"
                    />
                  ))}
                </View>
                <Pressable
                  style={[s.heartBtn, fav && { backgroundColor: 'rgba(225,29,72,0.85)' }]}
                  onPress={() => toggleFavorito(item)}
                  hitSlop={8}
                >
                  <Ionicons name={fav ? 'heart' : 'heart-outline'} size={18} color="#fff" />
                </Pressable>
              </View>

              {/* Bottom: info + precio */}
              <View style={s.cardBottom}>
                <View style={{ flex: 1 }}>
                  {catLabel ? (
                    <View style={s.catBadge}>
                      <Text style={[s.catBadgeText, { fontSize: fonts.xs }]}>{catLabel}</Text>
                    </View>
                  ) : null}
                  <Text style={[s.cardName, { fontSize: fonts.lg }]} numberOfLines={1}>
                    {item.nombre}
                  </Text>
                  {item.ubicacion ? (
                    <View style={s.locationRow}>
                      <Ionicons name="location" size={11} color="rgba(255,255,255,0.8)" />
                      <Text style={[s.locationText, { fontSize: fonts.xs }]} numberOfLines={1}>
                        {item.ubicacion}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={s.priceBadge}>
                  <Text style={[s.priceText, { fontSize: fonts.sm }]}>
                    {item.costo || t('detail_free')}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },

  banner: {
    paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24,
    overflow: 'hidden', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  circle1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -40 },
  circle2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -20 },
  backBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginBottom: 16 },
  backLabel:     { color: '#fff', fontWeight: '600' },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIconWrap:{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 },
  bannerTitle:   { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
  bannerSub:     { color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },

  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 },

  card: {
    height: 215, borderRadius: 22, overflow: 'hidden',
    marginBottom: 16, backgroundColor: '#111',
    elevation: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.5 : 0.2, shadowRadius: 10,
  },
  cardImg:    { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  starsRow:   { flexDirection: 'row', gap: 2, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  heartBtn:   { backgroundColor: 'rgba(0,0,0,0.45)', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  cardBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 16 },
  catBadge:     { alignSelf: 'flex-start', backgroundColor: '#E96928', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 5 },
  catBadgeText: { color: '#fff', fontWeight: '700', textTransform: 'uppercase' },
  cardName:     { color: '#fff', fontWeight: '800', letterSpacing: -0.3 },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  locationText: { color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  priceBadge:   { backgroundColor: 'rgba(233,105,40,0.92)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginLeft: 8 },
  priceText:    { color: '#fff', fontWeight: '800' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyWrap:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, padding: 30 },
  emptyIconWrap:   { width: 72, height: 72, borderRadius: 22, backgroundColor: isDark ? 'rgba(233,105,40,0.15)' : 'rgba(233,105,40,0.1)', justifyContent: 'center', alignItems: 'center' },
  emptyTitle:      { color: c.subtext, textAlign: 'center', fontWeight: '600', lineHeight: 22 },
  emptyBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E96928', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginTop: 4 },
  emptyBtnText:    { color: '#fff', fontWeight: '700' },
});

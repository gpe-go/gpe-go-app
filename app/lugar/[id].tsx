import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  Pressable, StatusBar, Platform, ActivityIndicator, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { useLugar } from '../../src/hooks/useLugar';
import { useFavoritos } from '../../src/context/FavoritosContext';
import { abrirEnMapa } from '../../src/utils/abrirMapa';
import Reseñas from '../../components/Reseñas';

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

const COSTOS_GRATIS    = ['Gratis', 'Gratis (entrada)'];
const HORARIOS_ABIERTO = ['Todo el día', 'Abierto todo el año', '24 horas'];

export default function LugarDetalle() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { toggleFavorito, esFavorito } = useFavoritos();

  const { data: lugar, loading } = useLugar(id as string);
  const [activeTab, setActiveTab] = useState<'info' | 'reseñas'>('info');

  const s = makeStyles(colors, fonts, isDark);

  // StatusBar — light-content translucent mientras está activa, restaura al salir
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
      }
      return () => {
        StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(colors.background);
          StatusBar.setTranslucent(false);
        }
      };
    }, [isDark, colors.background])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#E96928" />
      </View>
    );
  }

  if (!lugar) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Ionicons name="location-outline" size={48} color={colors.subtext} />
          <Text style={{ color: colors.text, fontSize: fonts.base, fontWeight: '600' }}>
            {t('no_results')}
          </Text>
          <Pressable
            style={{ backgroundColor: '#E96928', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 }}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: fonts.sm }}>{t('go_back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isFav = esFavorito(lugar.id);

  const getCostoTexto = (costo?: string) =>
    !costo || COSTOS_GRATIS.includes(costo) ? t('detail_free') : costo;

  const getHorarioTexto = (horario?: string) =>
    !horario || HORARIOS_ABIERTO.includes(horario) ? t('detail_open_year') : horario;

  const getCategoriaTexto = (categoria: string) =>
    CATEGORIA_KEYS[categoria] ? t(CATEGORIA_KEYS[categoria]) : categoria;

  const abrirMapa = () => {
    abrirEnMapa(`${lugar.nombre} ${lugar.ubicacion}`);
  };

  const compartir = async () => {
    try {
      await Share.share({
        title: lugar.nombre,
        message: `¡Visita ${lugar.nombre}!\n📍 ${lugar.ubicacion}\n\nDescúbrelo en GuadalupeGO`,
      });
    } catch { /* ignore */ }
  };

  return (
    <View style={s.container}>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ══ HERO ══ */}
        <View style={s.hero}>
          <Image source={{ uri: lugar.imagen }} style={s.heroImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.65)']}
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <Pressable
            style={[s.favBtn, isFav && { backgroundColor: 'rgba(225,29,72,0.85)' }]}
            onPress={() => toggleFavorito(lugar)}
          >
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color="#fff" />
          </Pressable>

          <View style={s.heroInfo}>
            {lugar.categoria ? (
              <View style={s.heroCatBadge}>
                <Text style={[s.heroCatText, { fontSize: fonts.xs }]}>
                  {getCategoriaTexto(lugar.categoria).toUpperCase()}
                </Text>
              </View>
            ) : null}
            <Text style={[s.heroTitle, { fontSize: fonts['2xl'] }]} numberOfLines={2}>
              {lugar.nombre || t('places')}
            </Text>
            <View style={s.heroMeta}>
              <Ionicons name="location" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={[s.heroLocation, { fontSize: fonts.xs }]}>
                {lugar.ubicacion || 'Nuevo León'}
              </Text>
            </View>
          </View>
        </View>

        {/* ══ CARD PRINCIPAL ══ */}
        <View style={s.mainCard}>
          <View style={s.metaRow}>
            <View style={s.ratingWrap}>
              {[1, 2, 3, 4, 5].map(star => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(lugar.rating ?? 4.9) ? 'star' : 'star-outline'}
                  size={16} color="#FFD700"
                />
              ))}
              <Text style={[s.ratingVal, { fontSize: fonts.sm }]}>{lugar.rating ?? '4.9'}</Text>
            </View>
            <View style={s.priceBadge}>
              <Text style={[s.priceText, { fontSize: fonts.sm }]}>
                {getCostoTexto(lugar.costo)}
              </Text>
            </View>
          </View>

          <View style={s.actionRow}>
            <Pressable style={s.actionBtn} onPress={abrirMapa}>
              <LinearGradient colors={['#E96928', '#c4511a']} style={s.actionBtnGradient}>
                <Ionicons name="navigate" size={17} color="#fff" />
                <Text style={[s.actionText, { fontSize: fonts.sm }]}>{t('location')}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={s.actionBtnSecondary} onPress={compartir}>
              <Ionicons name="share-social-outline" size={17} color="#E96928" />
              <Text style={[s.actionTextSecondary, { fontSize: fonts.sm }]}>{t('share')}</Text>
            </Pressable>
          </View>
        </View>

        {/* ══ TABS ══ */}
        <View style={s.tabs}>
          <Pressable
            style={[s.tab, activeTab === 'info' && s.tabActive]}
            onPress={() => setActiveTab('info')}
          >
            <Ionicons
              name="information-circle-outline" size={16}
              color={activeTab === 'info' ? '#E96928' : colors.subtext}
            />
            <Text style={[s.tabText, { fontSize: fonts.sm }, activeTab === 'info' && s.tabTextActive]}>
              {t('detail_info')}
            </Text>
          </Pressable>
          <Pressable
            style={[s.tab, activeTab === 'reseñas' && s.tabActive]}
            onPress={() => setActiveTab('reseñas')}
          >
            <Ionicons
              name="chatbubbles-outline" size={16}
              color={activeTab === 'reseñas' ? '#E96928' : colors.subtext}
            />
            <Text style={[s.tabText, { fontSize: fonts.sm }, activeTab === 'reseñas' && s.tabTextActive]}>
              {t('detail_reviews')}
            </Text>
          </Pressable>
        </View>

        {/* ══ CONTENIDO DE PESTAÑA ══ */}
        {activeTab === 'info' ? (
          <View style={s.detailsCard}>

            <View style={s.detailRow}>
              <View style={[s.detailIconWrap, { backgroundColor: 'rgba(233,105,40,0.12)' }]}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#E96928" />
              </View>
              <View style={s.detailInfo}>
                <Text style={[s.detailLabel, { fontSize: fonts.xs }]}>{t('detail_location')}</Text>
                <Text style={[s.detailValue, { fontSize: fonts.sm }]}>{lugar.ubicacion || t('location')}</Text>
              </View>
              <Pressable onPress={abrirMapa} style={s.detailAction}>
                <Ionicons name="open-outline" size={16} color="#E96928" />
              </Pressable>
            </View>

            <View style={s.detailDivider} />

            <View style={s.detailRow}>
              <View style={[s.detailIconWrap, { backgroundColor: 'rgba(74,144,226,0.12)' }]}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#4A90E2" />
              </View>
              <View style={s.detailInfo}>
                <Text style={[s.detailLabel, { fontSize: fonts.xs }]}>{t('detail_schedule')}</Text>
                <Text style={[s.detailValue, { fontSize: fonts.sm }]}>
                  {getHorarioTexto((lugar as any).horario)}
                </Text>
              </View>
            </View>

            <View style={s.detailDivider} />

            <View style={s.detailRow}>
              <View style={[s.detailIconWrap, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                <MaterialCommunityIcons name="calendar-month" size={20} color="#10B981" />
              </View>
              <View style={s.detailInfo}>
                <Text style={[s.detailLabel, { fontSize: fonts.xs }]}>{t('date')}</Text>
                <Text style={[s.detailValue, { fontSize: fonts.sm }]}>
                  {getHorarioTexto((lugar as any).horario)}
                </Text>
              </View>
            </View>

            <View style={s.detailDivider} />

            <View style={s.detailRow}>
              <View style={[s.detailIconWrap, { backgroundColor: 'rgba(245,190,65,0.12)' }]}>
                <MaterialCommunityIcons name="currency-usd" size={20} color="#F5BE41" />
              </View>
              <View style={s.detailInfo}>
                <Text style={[s.detailLabel, { fontSize: fonts.xs }]}>{t('detail_cost')}</Text>
                <Text style={[s.detailValue, { fontSize: fonts.sm }]}>{getCostoTexto(lugar.costo)}</Text>
              </View>
            </View>

          </View>
        ) : (
          <Reseñas lugarId={lugar.id} />
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  container:  { flex: 1, backgroundColor: c.background },
  hero:       { width: '100%', height: 300 },
  heroImage:  { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 56 : 40, left: 18,
    backgroundColor: 'rgba(0,0,0,0.4)', width: 40, height: 40, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  favBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 56 : 40, right: 18,
    backgroundColor: 'rgba(0,0,0,0.4)', width: 40, height: 40, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  heroInfo:     { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 28 },
  heroCatBadge: { alignSelf: 'flex-start', backgroundColor: '#E96928', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 8 },
  heroCatText:  { color: '#fff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroTitle:    { color: '#fff', fontWeight: '900', letterSpacing: -0.5, marginBottom: 6 },
  heroMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLocation: { color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

  mainCard: {
    backgroundColor: c.card, marginTop: -22,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 22, paddingTop: 24, paddingBottom: 20,
    borderWidth: 1, borderColor: c.border, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  metaRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingVal:  { color: c.subtext, marginLeft: 5, fontWeight: '600' },
  priceBadge: { backgroundColor: isDark ? 'rgba(233,105,40,0.2)' : 'rgba(233,105,40,0.1)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E96928' },
  priceText:  { color: '#E96928', fontWeight: '800' },
  actionRow:  { flexDirection: 'row', gap: 10 },
  actionBtn:  { flex: 1, borderRadius: 14, overflow: 'hidden', elevation: 4, shadowColor: '#E96928', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6 },
  actionBtnGradient:  { height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  actionBtnSecondary: { flex: 1, height: 50, borderWidth: 2, borderColor: '#E96928', borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  actionText:          { color: '#fff', fontWeight: '700' },
  actionTextSecondary: { color: '#E96928', fontWeight: '700' },

  tabs:          { flexDirection: 'row', marginHorizontal: 20, marginTop: 14, marginBottom: 4, backgroundColor: c.inputBackground, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: c.border },
  tab:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 13 },
  tabActive:     { backgroundColor: c.card, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  tabText:       { color: c.subtext, fontWeight: '600' },
  tabTextActive: { color: '#E96928', fontWeight: '700' },

  detailsCard:    { backgroundColor: c.card, marginHorizontal: 20, marginTop: 12, borderRadius: 22, padding: 6, borderWidth: 1, borderColor: c.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.07, shadowRadius: 6 },
  detailRow:      { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  detailIconWrap: { width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  detailInfo:     { flex: 1 },
  detailLabel:    { color: c.subtext, fontWeight: '600', marginBottom: 2 },
  detailValue:    { color: c.text, fontWeight: '700' },
  detailAction:   { padding: 6 },
  detailDivider:  { height: 1, backgroundColor: c.border, marginHorizontal: 14 },
});

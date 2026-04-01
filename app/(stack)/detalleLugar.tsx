import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image, Linking, Platform, Pressable, Share,
  ScrollView, StatusBar, StyleSheet, Text, View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/context/ThemeContext";
import { useAuth } from "../../src/context/AuthContext";
import Reseñas from "../../components/Reseñas";
import { useFavoritos } from "../../src/context/FavoritosContext";
import { Modal } from "react-native";

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

export default function DetalleLugar() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  const { lugar: lugarParam } = useLocalSearchParams();
  const lugar = lugarParam ? JSON.parse(lugarParam as string) : {};

  const { toggleFavorito, esFavorito } = useFavoritos();
  const { isAuthenticated } = useAuth();
  const isFav = esFavorito(lugar.id);

  const [activeTab,  setActiveTab]  = useState<'info' | 'reseñas'>('info');
  const [loginModal, setLoginModal] = useState(false);

  const handleToggleFavorito = () => {
    if (!isAuthenticated) { setLoginModal(true); return; }
    toggleFavorito({ ...lugar, origen: 'detalle' });
  };

  const abrirMapa = () => {
    const query = encodeURIComponent(`${lugar.nombre} ${lugar.ubicacion}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const compartir = async () => {
    try {
      await Share.share({
        title: lugar.nombre,
        message: `¡Visita ${lugar.nombre}!\n📍 ${lugar.ubicacion}\n\nDescúbrelo en GuadalupeGO`,
      });
    } catch { /* ignore */ }
  };

  const getCostoTexto = (costo: string) =>
    !costo || COSTOS_GRATIS.includes(costo) ? t('detail_free') : costo;

  const getHorarioTexto = (horario: string) =>
    !horario || HORARIOS_ABIERTO.includes(horario) ? t('detail_open_year') : horario;

  const getCategoriaTexto = (categoria: string) =>
    CATEGORIA_KEYS[categoria] ? t(CATEGORIA_KEYS[categoria]) : categoria;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Modal login para favoritos */}
      <Modal visible={loginModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, alignItems: 'center', gap: 14 }}>
            <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(233,105,40,0.1)', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="heart" size={30} color="#E96928" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A' }}>{t('favorites_save_place_title')}</Text>
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
              {t('favorites_save_place_sub')}
            </Text>
            <Pressable
              style={{ width: '100%', height: 52, borderRadius: 16, backgroundColor: '#E96928', justifyContent: 'center', alignItems: 'center' }}
              onPress={() => { setLoginModal(false); router.push('/(stack)/perfil'); }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{t('profile_login')}</Text>
            </Pressable>
            <Pressable style={{ width: '100%', height: 44, justifyContent: 'center', alignItems: 'center' }} onPress={() => setLoginModal(false)}>
              <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 15 }}>{t('profile_cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={s.hero}>
          <Image source={{ uri: lugar.imagen }} style={s.heroImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <Pressable
            style={[s.favBtn, isFav && { backgroundColor: 'rgba(225,29,72,0.85)' }]}
            onPress={handleToggleFavorito}
          >
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color="#fff" />
          </Pressable>
          <View style={s.heroInfo}>
            {lugar.categoria && (
              <View style={s.heroCatBadge}>
                <Text style={[s.heroCatText, { fontSize: fonts.xs }]}>
                  {getCategoriaTexto(lugar.categoria).toUpperCase()}
                </Text>
              </View>
            )}
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
            <Pressable
              style={({ pressed }) => [s.actionBtn, { opacity: pressed ? 0.88 : 1 }]}
              onPress={abrirMapa}
            >
              <LinearGradient colors={['#E96928', '#c4511a']} style={s.actionBtnGradient}>
                <Ionicons name="navigate" size={17} color="#fff" />
                <Text style={[s.actionText, { fontSize: fonts.sm }]}>{t('location')}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              style={({ pressed }) => [s.actionBtnSecondary, { opacity: pressed ? 0.85 : 1 }]}
              onPress={compartir}
            >
              <Ionicons name="share-social-outline" size={17} color="#E96928" />
              <Text style={[s.actionTextSecondary, { fontSize: fonts.sm }]}>{t('share')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={s.tabs}>
          <Pressable
            style={[s.tab, activeTab === 'info' && s.tabActive]}
            onPress={() => setActiveTab('info')}
          >
            <Ionicons name="information-circle-outline" size={16} color={activeTab === 'info' ? '#E96928' : colors.subtext} />
            <Text style={[s.tabText, { fontSize: fonts.sm }, activeTab === 'info' && s.tabTextActive]}>
              {t('detail_info')}
            </Text>
          </Pressable>
          <Pressable
            style={[s.tab, activeTab === 'reseñas' && s.tabActive]}
            onPress={() => setActiveTab('reseñas')}
          >
            <Ionicons name="chatbubbles-outline" size={16} color={activeTab === 'reseñas' ? '#E96928' : colors.subtext} />
            <Text style={[s.tabText, { fontSize: fonts.sm }, activeTab === 'reseñas' && s.tabTextActive]}>
              {t('detail_reviews')}
            </Text>
          </Pressable>
        </View>

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
                <Text style={[s.detailValue, { fontSize: fonts.sm }]}>{getHorarioTexto(lugar.horario)}</Text>
              </View>
            </View>

            <View style={s.detailDivider} />

            <View style={s.detailRow}>
              <View style={[s.detailIconWrap, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                <MaterialCommunityIcons name="calendar-month" size={20} color="#10B981" />
              </View>
              <View style={s.detailInfo}>
                <Text style={[s.detailLabel, { fontSize: fonts.xs }]}>{t('date')}</Text>
                <Text style={[s.detailValue, { fontSize: fonts.sm }]}>{getHorarioTexto(lugar.horario)}</Text>
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
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginTop: 14, marginBottom: 4, backgroundColor: c.inputBackground, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: c.border },
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
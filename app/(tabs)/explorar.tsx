import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, View, Text, StyleSheet, TextInput, FlatList, Pressable,
  Image, ScrollView, Linking, Alert, Platform, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFavoritos, Lugar } from '../../src/context/FavoritosContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

const COSTOS_GRATIS = ['Gratis', 'Gratis (entrada)'];

const SITIOS_TURISTICOS: Lugar[] = [
  { id: 'c1',  nombre: 'Cerro de la Silla',   categoria: 'Cerros',          rating: 5,   imagen: 'https://mvsnoticias.com/u/fotografias/m/2023/9/27/f768x400-565219_609122_7.jpg',                                               ubicacion: 'Guadalupe, NL',          costo: 'Gratis' },
  { id: 'c2',  nombre: 'Cerro del Obispado',  categoria: 'Cerros',          rating: 4.8, imagen: 'https://mvsnoticias.com/u/fotografias/m/2023/9/27/f768x400-565213_609116_0.jpg',                                               ubicacion: 'Monterrey, NL',          costo: 'Gratis' },
  { id: 'p1',  nombre: 'Parque Fundidora',    categoria: 'Parques',         rating: 4.9, imagen: 'https://tse4.mm.bing.net/th/id/OIP.LSo-DdPCU1kKKMGv9yBkkwHaFj',                                                               ubicacion: 'Monterrey, NL',          costo: 'Gratis' },
  { id: 'm1',  nombre: 'MARCO',               categoria: 'Museos',          rating: 4.9, imagen: 'https://www.turimexico.com/wp-content/uploads/2015/06/marco.jpg',                                                               ubicacion: 'Centro Monterrey',       costo: '$90 MXN' },
  { id: 'p2',  nombre: 'Parque Pipo',         categoria: 'Parques',         rating: 4.5, imagen: 'https://media-cdn.tripadvisor.com/media/photo-s/12/74/d3/4e/rio-la-silla.jpg',                                                 ubicacion: 'Guadalupe, NL',          costo: 'Gratis' },
  { id: 'p3',  nombre: 'Parque Chipinque',    categoria: 'Parques',         rating: 4.9, imagen: 'https://tse1.mm.bing.net/th/id/OIP.Vd67Wv_2mjiLc_0FQIsLJAHaFj?rs=1&pid=ImgDetMain&o=7&rm=3',                                 ubicacion: 'San Pedro Garza García', costo: '$80 MXN' },
  { id: 'pm1', nombre: 'Santiago',            categoria: 'Pueblos Mágicos', rating: 4.7, imagen: 'https://tse1.mm.bing.net/th/id/OIP.j6MPb2t1znNLuUxVB0-y8QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',                                 ubicacion: 'Santiago, NL',           costo: 'Gratis' },
  { id: 'pm2', nombre: 'Bustamante',          categoria: 'Pueblos Mágicos', rating: 4.6, imagen: 'https://tse1.mm.bing.net/th/id/OIP.xLA8540BS1kQo85-77Z5vwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',                                 ubicacion: 'Bustamante, NL',         costo: 'Gratis' },
  { id: 'pm3', nombre: 'Linares',             categoria: 'Pueblos Mágicos', rating: 4.5, imagen: 'https://mexicodesconocidoviajes.mx/wp-content/uploads/2018/10/Catedral-San-Felipe-Apostol_cortesia-secturNL-ok.jpg',           ubicacion: 'Linares, NL',            costo: 'Gratis' },
];

const CATEGORIAS = [
  { id: '1', value: 'Cerros',          labelKey: 'cat_cerros',          icon: 'image-filter-hdr', color: '#E96928' },
  { id: '2', value: 'Parques',         labelKey: 'cat_parques',         icon: 'pine-tree',        color: '#4CAF50' },
  { id: '3', value: 'Pueblos Mágicos', labelKey: 'cat_pueblos_magicos', icon: 'church',           color: '#9C27B0' },
  { id: '4', value: 'Museos',          labelKey: 'cat_museos',          icon: 'domain',           color: '#4A90E2' },
];

function RefreshLogo({ refreshing }: { refreshing: boolean }) {
  const spinAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (refreshing) {
      const spin  = Animated.loop(Animated.timing(spinAnim,  { toValue: 1, duration: 900, useNativeDriver: true }));
      const pulse = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 450, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 450, useNativeDriver: true }),
      ]));
      spin.start(); pulse.start();
      return () => { spin.stop(); pulse.stop(); spinAnim.setValue(0); pulseAnim.setValue(1); };
    }
  }, [refreshing, spinAnim, pulseAnim]);
  const rotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  if (!refreshing) return null;
  return (
    <View style={rl.container}>
      <Animated.View style={{ transform: [{ rotate }, { scale: pulseAnim }] }}>
        <View style={rl.iconBg}><Ionicons name="location" size={18} color="#bbb" /></View>
      </Animated.View>
      <Text style={rl.label}>GuadalupeGO</Text>
    </View>
  );
}

const rl = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  iconBg:    { width: 42, height: 42, borderRadius: 13, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' },
  label:     { fontSize: 13, fontWeight: '700', color: '#aaa', letterSpacing: 0.3 },
});

type ExplorarHeaderProps = {
  s: any; t: any; colors: any; fonts: any;
  refreshing: boolean; search: string;
  categoriaActiva: string | null; filteredData: Lugar[];
  region: Region | null; mapRef: React.RefObject<MapView | null>;
  onSearch: (text: string) => void; onLimpiar: () => void;
  onCategoria: (cat: string) => void; onUbicacion: () => void;
  onOpenMaps: (nombre: string, ubicacion: string) => void;
};

const ExplorarHeader = React.memo(({
  s, t, colors, fonts, refreshing, search, categoriaActiva,
  filteredData, region, mapRef,
  onSearch, onLimpiar, onCategoria, onUbicacion, onOpenMaps,
}: ExplorarHeaderProps) => (
  <View>
    <RefreshLogo refreshing={refreshing} />
    <LinearGradient colors={['#E96928', '#c4511a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.banner}>
      <View style={s.circle1} />
      <View style={s.circle2} />
      <View style={s.bannerContent}>
        <View style={s.bannerIconWrap}>
          <Ionicons name="compass" size={22} color="#E96928" />
        </View>
        <View>
          <Text style={[s.bannerTitle, { fontSize: fonts.xl }]}>{t('places')}</Text>
          <Text style={[s.bannerSub, { fontSize: fonts.sm }]}>{t('ST')}</Text>
        </View>
      </View>
      <View style={{ marginTop: 16 }}>
        <View style={s.searchBox}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            placeholder={t('search')} placeholderTextColor="#94A3B8"
            value={search} onChangeText={onSearch}
            style={[s.searchInput, { fontSize: fonts.base }]}
          />
          {search.length > 0 && (
            <Pressable onPress={onLimpiar}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </Pressable>
          )}
        </View>
        {search.length > 0 && (
          <View style={s.searchResults}>
            <Text style={[s.searchTitle, { fontSize: fonts.sm }]}>{t('search')}</Text>
            {filteredData.length === 0 ? (
              <Text style={[s.noResults, { fontSize: fonts.sm }]}>{t('no_results')}</Text>
            ) : (
              filteredData.map(item => (
                <Pressable key={item.id} style={s.searchItem} onPress={() => onOpenMaps(item.nombre, item.ubicacion)}>
                  <Ionicons name="location-outline" size={18} color="#E96928" />
                  <Text style={[s.searchItemText, { fontSize: fonts.sm }]}>{item.nombre}</Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      </View>
    </LinearGradient>

    <View style={s.mapSection}>
      <View style={s.sectionHeader}>
        <View style={s.sectionDot} />
        <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>{t('location')}</Text>
      </View>
      <View style={s.mapBox}>
        <MapView
          ref={mapRef} provider={PROVIDER_GOOGLE} style={StyleSheet.absoluteFillObject}
          initialRegion={region ?? { latitude: 25.676, longitude: -100.256, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
          showsUserLocation={false}
        >
          {region && <Marker coordinate={region}><View style={s.userMarker} /></Marker>}
        </MapView>
        <Pressable style={s.locationBtn} onPress={onUbicacion}>
          <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#E96928" />
        </Pressable>
      </View>
    </View>

    <View style={s.catSection}>
      <View style={s.sectionHeader}>
        <View style={s.sectionDot} />
        <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>{t('categories')}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 4 }}>
        {CATEGORIAS.map(cat => {
          const activa = categoriaActiva === cat.value;
          return (
            <Pressable
              key={cat.id} onPress={() => onCategoria(cat.value)}
              style={[s.categoryCard, activa && { borderColor: cat.color, borderWidth: 2, backgroundColor: cat.color + '12' }]}
            >
              <View style={[s.iconCircle, { backgroundColor: cat.color + '20' }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={26} color={cat.color} />
              </View>
              <Text style={[s.catName, { fontSize: fonts.xs }, activa && { color: cat.color, fontWeight: '800' }]}>
                {t(cat.labelKey)}
              </Text>
              {activa && <View style={[s.catActiveDot, { backgroundColor: cat.color }]} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>

    <View style={s.listLabelRow}>
      <View style={s.sectionDot} />
      <Text style={[s.listTitle, { fontSize: fonts.md }]}>
        {categoriaActiva
          ? t(CATEGORIAS.find(c => c.value === categoriaActiva)?.labelKey ?? '')
          : t('tab_explore')}
      </Text>
    </View>
  </View>
));

ExplorarHeader.displayName = 'ExplorarHeader';

export default function ExplorarScreen() {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);

  const router = useRouter();
  const { toggleFavorito, esFavorito } = useFavoritos();
  const mapRef      = useRef<MapView>(null);
  const flatListRef = useRef<FlatList>(null);

  const [search,           setSearch]           = useState('');
  const [categoriaActiva,  setCategoriaActiva]  = useState<string | null>(null);
  const [filteredData,     setFilteredData]     = useState<Lugar[]>(SITIOS_TURISTICOS);
  const [region,           setRegion]           = useState<Region | null>(null);
  const [refreshing,       setRefreshing]       = useState(false);

  const obtenerUbicacion = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso requerido', 'Activa la ubicación'); return; }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const r: Region = { latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    setRegion(r);
    mapRef.current?.animateToRegion(r, 800);
  }, []);

  useEffect(() => { obtenerUbicacion(); }, [obtenerUbicacion]);

  const filtrarCategoria = useCallback((cat: string) => {
    const nueva = cat === categoriaActiva ? null : cat;
    setCategoriaActiva(nueva);
    setSearch('');
    setFilteredData(nueva ? SITIOS_TURISTICOS.filter(l => l.categoria === nueva) : SITIOS_TURISTICOS);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [categoriaActiva]);

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    setCategoriaActiva(null);
    setFilteredData(SITIOS_TURISTICOS.filter(l => l.nombre.toLowerCase().includes(text.toLowerCase())));
  }, []);

  const limpiarSearch = useCallback(() => {
    setSearch(''); setCategoriaActiva(null); setFilteredData(SITIOS_TURISTICOS);
  }, []);

  const fetchData  = useCallback(async () => { await new Promise(res => setTimeout(res, 1500)); }, []);
  const onRefresh  = useCallback(async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }, [fetchData]);
  const openInMaps = useCallback((nombre: string, ubicacion: string) => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nombre} ${ubicacion}`)}`);
  }, []);

  const listHeader = useMemo(() => (
    <ExplorarHeader
      s={s} t={t} colors={colors} fonts={fonts}
      refreshing={refreshing} search={search}
      categoriaActiva={categoriaActiva} filteredData={filteredData}
      region={region} mapRef={mapRef}
      onSearch={handleSearch} onLimpiar={limpiarSearch}
      onCategoria={filtrarCategoria} onUbicacion={obtenerUbicacion}
      onOpenMaps={openInMaps}
    />
  ), [s, t, colors, fonts, refreshing, search, categoriaActiva, filteredData,
      region, handleSearch, limpiarSearch, filtrarCategoria, obtenerUbicacion, openInMaps]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />
      <FlatList
        ref={flatListRef}
        data={filteredData}
        keyExtractor={item => item.id}
        numColumns={2}
        ListHeaderComponent={() => listHeader}
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor="transparent" colors={['transparent']} progressBackgroundColor="transparent" />
        }
        renderItem={({ item }) => {
          const isFav   = esFavorito(item.id);
          const catInfo = CATEGORIAS.find(c => c.value === item.categoria);
          return (
            <Pressable
              style={({ pressed }) => [s.placeCard, { opacity: pressed ? 0.93 : 1 }]}
              onPress={() => router.push({ pathname: '/(stack)/detalleLugar', params: { lugar: JSON.stringify(item), from: 'explorar' } })}
            >
              <View style={s.imgWrapper}>
                <Image source={{ uri: item.imagen }} style={s.placeImg} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFillObject} />
                <Pressable style={s.heartBadge} onPress={() => toggleFavorito({ ...item, origen: 'detalle' })}>
                  <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={16} color={isFav ? '#E11D48' : '#fff'} />
                </Pressable>
                {/* ── Costo badge traducido ── */}
                <View style={s.costBadge}>
                  <Text style={[s.costText, { fontSize: fonts.xs }]}>
                    {!item.costo || COSTOS_GRATIS.includes(item.costo)
                      ? t('detail_free')
                      : item.costo}
                  </Text>
                </View>
              </View>

              <View style={s.cardInfo}>
                <View style={[s.tagWrap, { backgroundColor: (catInfo?.color ?? '#E96928') + '18' }]}>
                  <View style={[s.tagDot, { backgroundColor: catInfo?.color ?? '#E96928' }]} />
                  <Text style={[s.tagText, { color: catInfo?.color ?? '#E96928', fontSize: fonts.xs }]}>
                    {t(catInfo?.labelKey ?? item.categoria)}
                  </Text>
                </View>
                <Text style={[s.placeName, { fontSize: fonts.sm }]} numberOfLines={1}>{item.nombre}</Text>
                <View style={s.locationRow}>
                  <Ionicons name="location-outline" size={11} color={colors.subtext} />
                  <Text style={[s.placeSub, { fontSize: fonts.xs }]} numberOfLines={1}>{item.ubicacion}</Text>
                </View>
                <View style={s.ratingRow}>
                  {[1,2,3,4,5].map(star => (
                    <Ionicons key={star} name={star <= Math.round(item.rating ?? 0) ? 'star' : 'star-outline'} size={10} color="#FFD700" />
                  ))}
                  <Text style={[s.ratingVal, { fontSize: fonts.xs }]}>{item.rating}</Text>
                </View>
                <Pressable style={s.mapBtn} onPress={() => openInMaps(item.nombre, item.ubicacion)}>
                  <Ionicons name="navigate" size={12} color="#fff" />
                  <Text style={[s.mapBtnText, { fontSize: fonts.xs }]}>{t('location')}</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />
    </>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  banner: { paddingHorizontal: 22, paddingTop: Platform.OS === 'ios' ? 40 : 30, paddingBottom: 22, overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  circle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -50 },
  circle2: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30 },
  bannerContent:  { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
  bannerTitle:    { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
  bannerSub:      { color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  searchBox:      { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, alignItems: 'center', height: 50, elevation: 4 },
  searchInput:    { flex: 1, marginLeft: 10, color: '#1E293B' },
  searchResults:  { backgroundColor: '#fff', borderRadius: 14, marginTop: 8, paddingVertical: 8, elevation: 10 },
  searchTitle:    { fontWeight: '700', color: '#1E293B', paddingHorizontal: 12, marginBottom: 4 },
  searchItem:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12 },
  searchItemText: { color: '#1E293B' },
  noResults:      { paddingHorizontal: 12, paddingVertical: 8, color: c.subtext },
  sectionHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionDot:     { width: 4, height: 18, borderRadius: 2, backgroundColor: '#E96928' },
  sectionTitle:   { fontWeight: '800', color: c.text },
  mapSection:     { paddingHorizontal: 20, marginTop: 20, marginBottom: 20 },
  mapBox:         { height: 175, borderRadius: 22, overflow: 'hidden', borderLeftWidth: 5, borderLeftColor: '#E96928', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6 },
  locationBtn:    { position: 'absolute', top: 10, right: 10, backgroundColor: c.card, width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  userMarker:     { width: 16, height: 16, backgroundColor: '#E96928', borderRadius: 8, borderWidth: 3, borderColor: '#fff' },
  catSection:     { paddingHorizontal: 20, marginBottom: 16 },
  categoryCard:   { backgroundColor: c.card, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 18, marginRight: 10, alignItems: 'center', width: 100, borderWidth: 2, borderColor: 'transparent', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
  iconCircle:     { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  catName:        { fontWeight: '700', color: c.text, textAlign: 'center' },
  catActiveDot:   { width: 5, height: 5, borderRadius: 3, marginTop: 5 },
  listLabelRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 8 },
  listTitle:      { fontWeight: '800', color: c.text },
  placeCard:      { width: '44%', margin: '3%', backgroundColor: c.card, borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, borderWidth: 1, borderColor: c.border },
  imgWrapper:     { width: '100%', height: 125 },
  placeImg:       { width: '100%', height: '100%' },
  heartBadge:     { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 5 },
  costBadge:      { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  costText:       { color: '#fff', fontWeight: '700' },
  cardInfo:       { padding: 10, gap: 3 },
  tagWrap:        { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginBottom: 2 },
  tagDot:         { width: 4, height: 4, borderRadius: 2 },
  tagText:        { fontWeight: '700' },
  placeName:      { fontWeight: '800', color: c.text },
  locationRow:    { flexDirection: 'row', alignItems: 'center', gap: 2 },
  placeSub:       { color: c.subtext, flex: 1 },
  ratingRow:      { flexDirection: 'row', alignItems: 'center', gap: 1, marginTop: 1 },
  ratingVal:      { color: c.subtext, marginLeft: 3 },
  mapBtn:         { backgroundColor: '#E96928', marginTop: 6, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
  mapBtnText:     { color: '#fff', fontWeight: '700' },
});
/* ====================== Cuando exista backend reemplazar ===================== */

// import { getLugares } from "@/src/api/api";
// const [lugares, setLugares] = useState(LUGARES_DATA);

/*
import { useEffect } from "react";

useEffect(() => {

  const cargarLugares = async () => {
    try {
      const data = await getLugares();
      setLugares(data);
    } catch (error) {
      console.log("Usando datos locales");
    }
  };

  cargarLugares();

}, []);
*/

/* ============================================================================ */
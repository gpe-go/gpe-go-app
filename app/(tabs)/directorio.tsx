import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, View, Text, StyleSheet, TextInput, FlatList, Pressable,
  Image, ScrollView, Platform, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFavoritos, Lugar } from '../../src/context/FavoritosContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

const COSTOS_GRATIS = ['Gratis', 'Gratis (entrada)'];

const LUGARES: Lugar[] = [
  { id: '1',  nombre: 'Hotel Real Guadalupe',          categoria: 'Hoteles',       rating: 4.8, imagen: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',    ubicacion: 'Av. Benito Juárez 123',  costo: '$$$' },
  { id: '2',  nombre: 'La Terraza Gourmet',            categoria: 'Restaurantes',  rating: 4.9, imagen: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400',    ubicacion: 'Blvd. Central 789',      costo: '$$$$' },
  { id: '3',  nombre: 'Fonda Doña Mari',               categoria: 'Restaurantes',  rating: 4.5, imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',    ubicacion: 'Calle Hidalgo 456',      costo: '$$' },
  { id: '4',  nombre: 'Plaza Multiplaza',              categoria: 'Plazas',        rating: 4.2, imagen: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400',    ubicacion: 'Carretera Reynosa 789',  costo: '$' },
  { id: '5',  nombre: 'Abarrotes El Güero',            categoria: 'Tiendas',       rating: 4.0, imagen: 'https://tse4.mm.bing.net/th/id/OIP.sfUhrvsTMibSw41Y_px8-gHaEK',         ubicacion: 'Av. Pablo Livas 101',    costo: '$' },
  { id: '6',  nombre: 'CFE Guadalupe',                 categoria: 'Servicios',     rating: 3.8, imagen: 'https://recibodeluzmexico.com.mx/wp-content/uploads/2025/03/oficina-cfe-zona-metropolitana-oriente-768x427.jpg', ubicacion: 'Centro de Guadalupe', costo: 'Gratis' },
  { id: '7',  nombre: 'Agua y Drenaje',                categoria: 'Servicios',     rating: 4.1, imagen: 'https://tse1.mm.bing.net/th/id/OIP._P5sJ3inFzgJi9oz6YcaxQHaEw',         ubicacion: 'Av. Eloy Cavazos',       costo: 'Gratis' },
  { id: '8',  nombre: 'Hospital General de Guadalupe', categoria: 'Hospitales',    rating: 4.3, imagen: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400',    ubicacion: 'Av. Benito Juárez',      costo: 'Gratis' },
  { id: '9',  nombre: 'Farmacias Guadalajara',         categoria: 'Farmacias',     rating: 4.4, imagen: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',    ubicacion: 'Av. Pablo Livas',        costo: '$$' },
  { id: '10', nombre: 'Soriana Guadalupe',             categoria: 'Supermercados', rating: 4.2, imagen: 'https://fastly.4sqi.net/img/general/600x600/11459827_LxS6x3Vs_KFdw02l4IWZ_mN_d6wtJfo2-qWKV9Aud_s.jpg', ubicacion: 'Av. Eloy Cavazos', costo: '$$' },
  { id: '11', nombre: 'Gasolinera PEMEX Pablo Livas',  categoria: 'Gasolineras',   rating: 4.1, imagen: 'https://gobmx.org/wp-content/uploads/Gasolineras-PEMEX-Mexico-1024x576.jpg', ubicacion: 'Av. Pablo Livas',   costo: '$$' },
  { id: '12', nombre: 'Oxxo Gas Guadalupe',            categoria: 'Gasolineras',   rating: 4.0, imagen: 'https://www.onexpo.com.mx/NOTICIAS/AFECTA-APERTURAS-DE-OXXO-GAS-LA-FALTA-DE-GUIA-REGU/images/AFECTA-APERTURAS-DE-OXXO-GAS-LA-FALTA-DE-GUIA-REGU.jpg', ubicacion: 'Av. Eloy Cavazos', costo: '$$' },
];

const CATEGORIAS = [
  { id: '1', value: 'Restaurantes',  labelKey: 'cat_restaurantes',  icon: 'silverware-fork-knife', color: '#FF6B35' },
  { id: '2', value: 'Hoteles',       labelKey: 'cat_hoteles',       icon: 'office-building',       color: '#4A90E2' },
  { id: '3', value: 'Tiendas',       labelKey: 'cat_tiendas',       icon: 'shopping',              color: '#F5BE41' },
  { id: '4', value: 'Servicios',     labelKey: 'cat_servicios',     icon: 'hammer-wrench',         color: '#E96928' },
  { id: '5', value: 'Plazas',        labelKey: 'cat_plazas',        icon: 'storefront',            color: '#10B981' },
  { id: '6', value: 'Hospitales',    labelKey: 'cat_hospitales',    icon: 'hospital-box',          color: '#a2a6a6' },
  { id: '7', value: 'Farmacias',     labelKey: 'cat_farmacias',     icon: 'pill',                  color: '#528968' },
  { id: '8', value: 'Supermercados', labelKey: 'cat_supermercados', icon: 'cart',                  color: '#87479c' },
  { id: '9', value: 'Gasolineras',   labelKey: 'cat_gasolineras',   icon: 'gas-station',           color: '#EF4444' },
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

type HeaderProps = {
  s: any; t: any; colors: any; fonts: any;
  refreshing: boolean; search: string;
  categoriaActiva: string | null; filteredData: Lugar[];
  region: any; mapRef: React.RefObject<MapView | null>;
  onSearch: (text: string) => void; onLimpiar: () => void;
  onCategoria: (cat: string) => void; onUbicacion: () => void;
};

const DirectorioHeader = React.memo(({
  s, t, colors, fonts, refreshing, search, categoriaActiva,
  filteredData, region, mapRef, onSearch, onLimpiar, onCategoria, onUbicacion,
}: HeaderProps) => (
  <View>
    <RefreshLogo refreshing={refreshing} />
    <LinearGradient colors={['#E96928', '#c4511a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.banner}>
      <View style={s.circle1} />
      <View style={s.circle2} />
      <View style={s.bannerContent}>
        <View style={s.bannerIconWrap}>
          <MaterialCommunityIcons name="office-building" size={22} color="#E96928" />
        </View>
        <View>
          <Text style={[s.bannerTitle, { fontSize: fonts.xl }]}>{t('tab_directory2')}</Text>
          <Text style={[s.bannerSub,   { fontSize: fonts.sm }]}>{t('DN')}</Text>
        </View>
      </View>
      <View style={{ position: 'relative', zIndex: 100, marginTop: 16 }}>
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
                <Pressable key={item.id} style={s.searchItem} onPress={() => onSearch(item.nombre)}>
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
      <View style={s.mapWrapper}>
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CATEGORIAS.map(cat => {
          const activa = categoriaActiva === cat.value;
          return (
            <Pressable
              key={cat.id} onPress={() => onCategoria(cat.value)}
              style={[s.categoryCard, activa && { borderColor: cat.color, borderWidth: 2, backgroundColor: cat.color + '12' }]}
            >
              <View style={[s.iconCircle, { backgroundColor: cat.color + '20' }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={24} color={cat.color} />
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
          : t('all')}
      </Text>
      <View style={s.countBadge}>
        <Text style={[s.countText, { fontSize: fonts.xs }]} />
      </View>
    </View>
  </View>
));

DirectorioHeader.displayName = 'DirectorioHeader';

export default function DirectorioScreen() {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);

  const router      = useRouter();
  const mapRef      = useRef<MapView>(null);
  const flatListRef = useRef<FlatList>(null);
  const { toggleFavorito, esFavorito } = useFavoritos();

  const [search,          setSearch]          = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [filteredData,    setFilteredData]    = useState<Lugar[]>(LUGARES);
  const [region,          setRegion]          = useState<any>(null);
  const [refreshing,      setRefreshing]      = useState(false);

  const obtenerUbicacion = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const r = { latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    setRegion(r);
    mapRef.current?.animateToRegion(r, 800);
  }, []);

  useEffect(() => { obtenerUbicacion(); }, [obtenerUbicacion]);

  const filtrar = useCallback((texto: string, categoria: string | null) => {
    let data = LUGARES;
    if (categoria) data = data.filter(l => l.categoria === categoria);
    if (texto)     data = data.filter(l =>
      l.nombre.toLowerCase().includes(texto.toLowerCase()) ||
      l.categoria.toLowerCase().includes(texto.toLowerCase())
    );
    setFilteredData(data);
  }, []);

  const handleSearch         = useCallback((text: string) => { setSearch(text); filtrar(text, categoriaActiva); }, [categoriaActiva, filtrar]);
  const limpiarSearch        = useCallback(() => { setSearch(''); filtrar('', categoriaActiva); }, [categoriaActiva, filtrar]);
  const seleccionarCategoria = useCallback((cat: string) => {
    const nueva = cat === categoriaActiva ? null : cat;
    setCategoriaActiva(nueva); filtrar(search, nueva);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [categoriaActiva, search, filtrar]);

  const fetchData = useCallback(async () => { await new Promise(res => setTimeout(res, 1500)); }, []);
  const onRefresh = useCallback(async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }, [fetchData]);

  const listHeader = useMemo(() => (
    <DirectorioHeader
      s={s} t={t} colors={colors} fonts={fonts}
      refreshing={refreshing} search={search}
      categoriaActiva={categoriaActiva} filteredData={filteredData}
      region={region} mapRef={mapRef}
      onSearch={handleSearch} onLimpiar={limpiarSearch}
      onCategoria={seleccionarCategoria} onUbicacion={obtenerUbicacion}
    />
  ), [s, t, colors, fonts, refreshing, search, categoriaActiva, filteredData,
      region, handleSearch, limpiarSearch, seleccionarCategoria, obtenerUbicacion]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />
      <FlatList
        ref={flatListRef}
        data={filteredData}
        keyExtractor={item => item.id}
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
              style={({ pressed }) => [s.placeCard, { opacity: pressed ? 0.95 : 1 }]}
              onPress={() => router.push({ pathname: '/(stack)/detalleLugar', params: { lugar: JSON.stringify(item), from: 'directorio' } })}
            >
              <View style={s.imageWrapper}>
                <Image source={{ uri: item.imagen }} style={s.placeImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.45)']} style={StyleSheet.absoluteFillObject} />
                <Pressable style={s.heartBtn} onPress={() => toggleFavorito({ ...item, origen: 'detalle' })}>
                  <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={18} color={isFav ? '#E11D48' : '#fff'} />
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

              <View style={s.placeInfo}>
                <View style={[s.tagWrap, { backgroundColor: (catInfo?.color ?? '#E96928') + '18' }]}>
                  <View style={[s.tagDot, { backgroundColor: catInfo?.color ?? '#E96928' }]} />
                  <Text style={[s.placeTag, { color: catInfo?.color ?? '#E96928', fontSize: fonts.xs }]}>
                    {t(catInfo?.labelKey ?? item.categoria)}
                  </Text>
                </View>
                <Text style={[s.placeName, { fontSize: fonts.base }]} numberOfLines={1}>{item.nombre}</Text>
                <View style={s.addressRow}>
                  <Ionicons name="location-outline" size={12} color={colors.subtext} />
                  <Text style={[s.placeAddress, { fontSize: fonts.xs }]} numberOfLines={1}>{item.ubicacion}</Text>
                </View>
                <View style={s.ratingRow}>
                  {[1,2,3,4,5].map(star => (
                    <Ionicons key={star} name={star <= Math.round(item.rating ?? 0) ? 'star' : 'star-outline'} size={11} color="#FFD700" />
                  ))}
                  <Text style={[s.ratingText, { fontSize: fonts.xs }]}>{item.rating}</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={16} color={colors.subtext} style={{ alignSelf: 'center', marginRight: 12 }} />
            </Pressable>
          );
        }}
      />
    </>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  banner:         { paddingHorizontal: 22, paddingTop: Platform.OS === 'ios' ? 36 : 28, paddingBottom: 22, overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  circle1:        { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -50 },
  circle2:        { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30 },
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
  mapWrapper:     { height: 185, borderRadius: 22, overflow: 'hidden', borderLeftWidth: 5, borderLeftColor: '#E96928', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6 },
  locationBtn:    { position: 'absolute', top: 12, right: 12, backgroundColor: c.card, width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  userMarker:     { width: 16, height: 16, backgroundColor: '#E96928', borderRadius: 8, borderWidth: 3, borderColor: '#fff' },
  catSection:     { paddingHorizontal: 20, marginBottom: 16 },
  categoryCard:   { backgroundColor: c.card, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 18, marginRight: 10, alignItems: 'center', minWidth: 90, borderWidth: 2, borderColor: 'transparent', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
  iconCircle:     { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  catName:        { fontWeight: '700', color: c.text, textAlign: 'center' },
  catActiveDot:   { width: 5, height: 5, borderRadius: 3, marginTop: 5 },
  listLabelRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 12 },
  listTitle:      { fontWeight: '800', color: c.text, flex: 1 },
  countBadge:     { backgroundColor: c.card, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: c.border },
  countText:      { color: c.subtext, fontWeight: '600' },
  placeCard:      { backgroundColor: c.card, marginHorizontal: 20, marginBottom: 12, borderRadius: 22, overflow: 'hidden', flexDirection: 'row', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, borderWidth: 1, borderColor: c.border },
  imageWrapper:   { width: 115, height: 130 },
  placeImage:     { width: '100%', height: '100%' },
  heartBtn:       { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 14, padding: 5 },
  costBadge:      { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  costText:       { color: '#fff', fontWeight: '700' },
  placeInfo:      { flex: 1, padding: 12, justifyContent: 'center', gap: 4 },
  tagWrap:        { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tagDot:         { width: 5, height: 5, borderRadius: 3 },
  placeTag:       { fontWeight: '700' },
  placeName:      { fontWeight: '800', color: c.text },
  addressRow:     { flexDirection: 'row', alignItems: 'center', gap: 3 },
  placeAddress:   { color: c.subtext },
  ratingRow:      { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  ratingText:     { color: c.subtext, marginLeft: 4 },
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
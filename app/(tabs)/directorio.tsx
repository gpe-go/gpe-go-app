import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, Pressable,
  Image, ScrollView, Platform, StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFavoritos, Lugar } from '../../src/context/FavoritosContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

const LUGARES: Lugar[] = [
  { id: '1',  nombre: 'Hotel Real Guadalupe',         categoria: 'Hoteles',       rating: 4.8, imagen: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',    ubicacion: 'Av. Benito Juárez 123',  costo: '$$$' },
  { id: '2',  nombre: 'La Terraza Gourmet',           categoria: 'Restaurantes',  rating: 4.9, imagen: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400',    ubicacion: 'Blvd. Central 789',      costo: '$$$$' },
  { id: '3',  nombre: 'Fonda Doña Mari',              categoria: 'Restaurantes',  rating: 4.5, imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',    ubicacion: 'Calle Hidalgo 456',      costo: '$$' },
  { id: '4',  nombre: 'Plaza Multiplaza',             categoria: 'Plazas',        rating: 4.2, imagen: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400',    ubicacion: 'Carretera Reynosa 789',  costo: '$' },
  { id: '5',  nombre: 'Abarrotes El Güero',           categoria: 'Tiendas',       rating: 4.0, imagen: 'https://tse4.mm.bing.net/th/id/OIP.sfUhrvsTMibSw41Y_px8-gHaEK',         ubicacion: 'Av. Pablo Livas 101',    costo: '$' },
  { id: '6',  nombre: 'CFE Guadalupe',                categoria: 'Servicios',     rating: 3.8, imagen: 'https://recibodeluzmexico.com.mx/wp-content/uploads/2025/03/oficina-cfe-zona-metropolitana-oriente-768x427.jpg', ubicacion: 'Centro de Guadalupe', costo: 'Gratis' },
  { id: '7',  nombre: 'Agua y Drenaje',               categoria: 'Servicios',     rating: 4.1, imagen: 'https://tse1.mm.bing.net/th/id/OIP._P5sJ3inFzgJi9oz6YcaxQHaEw',         ubicacion: 'Av. Eloy Cavazos',       costo: 'Gratis' },
  { id: '8',  nombre: 'Hospital General de Guadalupe',categoria: 'Hospitales',    rating: 4.3, imagen: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400',    ubicacion: 'Av. Benito Juárez',      costo: 'Gratis' },
  { id: '9',  nombre: 'Farmacias Guadalajara',        categoria: 'Farmacias',     rating: 4.4, imagen: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',    ubicacion: 'Av. Pablo Livas',        costo: '$$' },
  { id: '10', nombre: 'Soriana Guadalupe',            categoria: 'Supermercados', rating: 4.2, imagen: 'https://fastly.4sqi.net/img/general/600x600/11459827_LxS6x3Vs_KFdw02l4IWZ_mN_d6wtJfo2-qWKV9Aud_s.jpg', ubicacion: 'Av. Eloy Cavazos', costo: '$$' },
  { id: '11', nombre: 'Gasolinera PEMEX Pablo Livas', categoria: 'Gasolineras',   rating: 4.1, imagen: 'https://gobmx.org/wp-content/uploads/Gasolineras-PEMEX-Mexico-1024x576.jpg', ubicacion: 'Av. Pablo Livas',   costo: '$$' },
  { id: '12', nombre: 'Oxxo Gas Guadalupe',           categoria: 'Gasolineras',   rating: 4.0, imagen: 'https://www.onexpo.com.mx/NOTICIAS/AFECTA-APERTURAS-DE-OXXO-GAS-LA-FALTA-DE-GUIA-REGU/images/AFECTA-APERTURAS-DE-OXXO-GAS-LA-FALTA-DE-GUIA-REGU.jpg', ubicacion: 'Av. Eloy Cavazos', costo: '$$' },
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

export default function DirectorioScreen() {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);

  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { toggleFavorito, esFavorito } = useFavoritos();

  const [search, setSearch]                   = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [filteredData, setFilteredData]       = useState<Lugar[]>(LUGARES);
  const [region, setRegion]                   = useState<any>(null);

  useEffect(() => { obtenerUbicacion(); }, []);

  const obtenerUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({});
    const nuevaRegion = { latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    setRegion(nuevaRegion);
    mapRef.current?.animateToRegion(nuevaRegion, 1000);
  };

  const filtrar = (texto: string, categoria: string | null) => {
    let data = LUGARES;
    if (categoria) data = data.filter(l => l.categoria === categoria);
    if (texto) data = data.filter(l => l.nombre.toLowerCase().includes(texto.toLowerCase()) || l.categoria.toLowerCase().includes(texto.toLowerCase()));
    setFilteredData(data);
  };

  const handleSearch = (text: string) => { setSearch(text); filtrar(text, categoriaActiva); };
  const seleccionarCategoria = (cat: string) => { const nueva = cat === categoriaActiva ? null : cat; setCategoriaActiva(nueva); filtrar(search, nueva); };

  // ─── Limpiar búsqueda ──────────────────────────────────
  const limpiarSearch = () => {
    setSearch('');
    filtrar('', categoriaActiva);
  };

  const Header = () => (
    <View>
      <View style={s.orangeBanner}>
        <Text style={s.bannerTitle}>{t('tab_directory2')}</Text>
        <Text style={s.bannerSub}>{t('DN')}</Text>

        <View style={{ position: 'relative', zIndex: 100 }}>
          <View style={s.searchBox}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              placeholder={t('search')}
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={handleSearch}
              style={s.searchInput}
            />
            {/* ─── X para limpiar ─── */}
            {search.length > 0 && (
              <Pressable onPress={limpiarSearch}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </Pressable>
            )}
          </View>

          {search.length > 0 && (
            <View style={s.searchResults}>
              <Text style={s.searchTitle}>{t('search')}</Text>
              {filteredData.length === 0 ? (
                <Text style={s.noResults}>{t('no_results')}</Text>
              ) : (
                filteredData.map(item => (
                  <Pressable key={item.id} style={s.searchItem} onPress={() => { setSearch(item.nombre); filtrar(item.nombre, categoriaActiva); }}>
                    <Ionicons name="location-outline" size={18} color="#E96928" />
                    <Text style={s.searchItemText}>{item.nombre}</Text>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>
      </View>

      <View style={s.sectionHeaderContainer}>
        <Text style={s.sectionTitle}>{t('location')}</Text>
      </View>

      <View style={s.mapContainer}>
        <View style={s.mapWrapper}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{ latitude: 25.676, longitude: -100.256, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
          >
            {region && <Marker coordinate={region} />}
          </MapView>
          <Pressable style={s.locationBtn} onPress={obtenerUbicacion}>
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#E96928" />
          </Pressable>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('categories')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIAS.map(cat => {
            const activa = categoriaActiva === cat.value;
            return (
              <Pressable key={cat.id} onPress={() => seleccionarCategoria(cat.value)}
                style={[s.categoryCard, activa && s.categoryCardActive]}>
                <View style={[s.iconCircle, { backgroundColor: cat.color + '20' }]}>
                  <MaterialCommunityIcons name={cat.icon as any} size={24} color={cat.color} />
                </View>
                <Text style={s.catName}>{t(cat.labelKey)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Text style={s.listTitle}>
        {categoriaActiva
          ? `${t('categories')}: ${t(CATEGORIAS.find(c => c.value === categoriaActiva)?.labelKey ?? '')}`
          : t('all')}
      </Text>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        ListHeaderComponent={Header}
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ backgroundColor: colors.background }}
        renderItem={({ item }) => {
          const isFav = esFavorito(item.id);
          return (
            <Pressable style={s.placeCard}
              onPress={() => router.push({ pathname: '/(stack)/detalleLugar', params: { lugar: JSON.stringify(item), from: 'directorio' } })}>
              <View style={s.imageWrapper}>
                <Image source={{ uri: item.imagen }} style={s.placeImage} />
                <Pressable style={s.heartBtn} onPress={() => toggleFavorito({ ...item, origen: 'detalle' })}>
                  <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? '#E11D48' : '#fff'} />
                </Pressable>
              </View>
              <View style={s.placeInfo}>
                <Text style={s.placeTag}>
                  {t(CATEGORIAS.find(c => c.value === item.categoria)?.labelKey ?? item.categoria)}
                </Text>
                <Text style={s.placeName}>{item.nombre}</Text>
                <Text style={s.placeAddress}>{item.ubicacion}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  orangeBanner: { backgroundColor: '#E96928', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 36 : 28, paddingBottom: 16, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  bannerTitle:  { color: '#fff', fontSize: f.xl, fontWeight: '900', marginBottom: 4 },
  bannerSub:    { color: '#fff', fontSize: f.sm, opacity: 0.9, marginBottom: 8 },

  searchBox:        { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 15, alignItems: 'center', height: 46 },
  searchInput:      { flex: 1, marginLeft: 10, color: '#1E293B', fontSize: f.base },
  searchResults:    { backgroundColor: '#fff', borderRadius: 12, marginTop: 10, paddingVertical: 8 },
  searchTitle:      { fontWeight: 'bold', fontSize: f.sm, color: '#1E293B', paddingHorizontal: 12, marginBottom: 4 },
  searchItem:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12 },
  searchItemText:   { color: '#1E293B', fontSize: f.sm },
  noResults:        { paddingHorizontal: 12, paddingVertical: 8, color: c.subtext, fontSize: f.sm },

  sectionHeaderContainer: { paddingHorizontal: 20, marginTop: 18, marginBottom: 12 },
  sectionTitle:           { fontSize: f.md, fontWeight: 'bold', color: c.text, marginBottom: 15 },
  mapContainer:           { paddingHorizontal: 20, height: 180, marginBottom: 18 },
  mapWrapper:             { flex: 1, borderRadius: 25, overflow: 'hidden', borderLeftWidth: 8, borderLeftColor: '#E96928' },
  locationBtn:            { position: 'absolute', top: 14, right: 14, backgroundColor: c.card, width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  section:             { paddingHorizontal: 20 },
  categoryCard:        { backgroundColor: c.card, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 18, marginRight: 12, alignItems: 'center', minWidth: 95 },
  categoryCardActive:  { borderWidth: 2, borderColor: '#E96928' },
  iconCircle:          { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  catName:             { fontWeight: 'bold', fontSize: f.xs, color: c.text },

  listTitle:    { marginHorizontal: 20, marginTop: 14, marginBottom: 12, fontSize: f.md, fontWeight: 'bold', color: c.text },
  placeCard:    { backgroundColor: c.card, marginHorizontal: 20, marginBottom: 12, borderRadius: 20, overflow: 'hidden', flexDirection: 'row' },
  imageWrapper: { width: 110, height: 120 },
  placeImage:   { width: '100%', height: '100%' },
  heartBtn:     { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 15, padding: 6 },
  placeInfo:    { flex: 1, padding: 12, justifyContent: 'center' },
  placeTag:     { color: '#E96928', fontSize: f.xs, fontWeight: 'bold' },
  placeName:    { fontSize: f.base, fontWeight: 'bold', color: c.text },
  placeAddress: { fontSize: f.xs, color: c.subtext },
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
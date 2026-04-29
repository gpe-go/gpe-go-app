import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Linking,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lugar } from '../../src/context/FavoritosContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useAnimatedPlaceholder } from '../../src/hooks/useAnimatedPlaceholder';
import { useLugares } from '../../src/hooks/useLugares';

// ── Categorías por scope ───────────────────────────────────────────────────────
const EXPLORAR_CATS  = ['Cerros', 'Parques', 'Pueblos Mágicos', 'Museos'];
const DIRECTORIO_CATS = [
  'Restaurantes', 'Hoteles', 'Tiendas', 'Servicios',
  'Plazas', 'Hospitales', 'Farmacias', 'Supermercados', 'Gasolineras',
];
const TODAS_CATS = [...EXPLORAR_CATS, ...DIRECTORIO_CATS];

const DEFAULT_REGION = {
  latitude: 25.676,
  longitude: -100.256,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapaCompletoScreen() {
  const router  = useRouter();
  const { t }   = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const insets  = useSafeAreaInsets();
  const mapRef  = useRef<MapView>(null);

  const params = useLocalSearchParams<{
    latitude?:         string;
    longitude?:        string;
    from?:             string;
    categoriaInicial?: string;
    pinLat?:           string;
    pinLng?:           string;
    pinLabel?:         string;
    pinSub?:           string;
  }>();

  const initialLat  = params.latitude  ? parseFloat(params.latitude)  : null;
  const initialLng  = params.longitude ? parseFloat(params.longitude) : null;
  const fromParam   = params.from ?? '';
  const catInicial  = params.categoriaInicial ?? '';

  // Pin dedicado (ej. Estadio BBVA desde el widget del Mundial)
  const pinLat   = params.pinLat   ? parseFloat(params.pinLat)   : null;
  const pinLng   = params.pinLng   ? parseFloat(params.pinLng)   : null;
  const pinLabel = params.pinLabel ?? null;
  const pinSub   = params.pinSub   ?? null;

  // ── Región y ubicación del usuario ─────────────────────────────────────────
  const [region, setRegion] = useState(
    initialLat && initialLng
      ? { latitude: initialLat, longitude: initialLng, latitudeDelta: 0.02, longitudeDelta: 0.02 }
      : DEFAULT_REGION
  );
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    initialLat && initialLng ? { latitude: initialLat, longitude: initialLng } : null
  );

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setUserLocation(coords);
        if (!initialLat) {
          const r = { ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 };
          setRegion(r);
          mapRef.current?.animateToRegion(r, 600);
        }
      } catch { /* GPS no disponible */ }
    })();
  }, [initialLat, initialLng]);

  // ── Búsqueda y datos ────────────────────────────────────────────────────────
  const [mapSearch, setMapSearch] = useState(catInicial);

  // Cargamos todos los lugares cercanos (sin filtro de texto → máx 100 más cercanos)
  const { data: allPlaces } = useLugares(undefined, '', { radio_km: 15, limite: 100 });

  // Scope según la pantalla origen
  const scopeCats: string[] | null = useMemo(() => {
    if (fromParam === 'explorar')   return EXPLORAR_CATS;
    if (fromParam === 'directorio') return DIRECTORIO_CATS;
    return null; // pantalla principal → todas
  }, [fromParam]);

  // Resultados filtrados por scope + búsqueda
  const searchResults: Lugar[] = useMemo(() => {
    const q = mapSearch.trim().toLowerCase();
    if (!q) return [];

    let pool = scopeCats
      ? allPlaces.filter(p => scopeCats.includes(p.categoria))
      : allPlaces;

    // Detectar si el texto coincide con un nombre de categoría conocida
    const matchedCat = TODAS_CATS.find(
      cat => cat.toLowerCase() === q || cat.toLowerCase().startsWith(q)
    );

    if (matchedCat && (!scopeCats || scopeCats.includes(matchedCat))) {
      // Mostrar todos los lugares de esa categoría
      return pool.filter(p => p.categoria === matchedCat);
    }

    // Búsqueda por nombre o categoría parcial
    return pool.filter(
      p =>
        p.nombre.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
    );
  }, [allPlaces, mapSearch, scopeCats]);

  // Marcador seleccionado (para resaltar)
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Centrar mapa en un lugar
  const flyToPlace = useCallback((place: Lugar) => {
    if (!place.lat || !place.lng) return;
    const r = { latitude: place.lat, longitude: place.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    mapRef.current?.animateToRegion(r, 700);
    setSelectedId(place.id);
  }, []);

  // Ajustar mapa para mostrar todos los marcadores de resultados
  useEffect(() => {
    if (searchResults.length === 0) return;
    const valid = searchResults.filter(p => p.lat && p.lng);
    if (valid.length === 0) return;
    const coords = valid.map(p => ({ latitude: p.lat!, longitude: p.lng! }));
    if (userLocation) coords.push(userLocation);
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 160, right: 40, bottom: 240, left: 40 },
        animated: true,
      });
    }, 400);
  }, [searchResults, userLocation]);

  // ── Centrar en usuario ──────────────────────────────────────────────────────
  const centerOnUser = useCallback(() => {
    if (!userLocation) return;
    const r = { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    mapRef.current?.animateToRegion(r, 600);
  }, [userLocation]);

  // ── Abrir en app externa ────────────────────────────────────────────────────
  const openExternalMaps = useCallback(() => {
    if (!userLocation) return;
    const { latitude, longitude } = userLocation;
    if (Platform.OS === 'ios') {
      Alert.alert(
        t('open_in_maps', { defaultValue: 'Abrir en Mapas' }),
        t('choose_maps_app', { defaultValue: 'Elige la aplicación de mapas' }),
        [
          { text: 'Apple Maps',  onPress: () => Linking.openURL(`maps:?ll=${latitude},${longitude}&z=15`).catch(() => {}) },
          { text: 'Google Maps', onPress: () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`).catch(() => {}) },
          { text: t('cancel', { defaultValue: 'Cancelar' }), style: 'cancel' },
        ]
      );
    } else {
      Linking.openURL(`geo:${latitude},${longitude}?q=${latitude},${longitude}`).catch(() => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`).catch(() => {});
      });
    }
  }, [userLocation, t]);

  // ── Placeholder animado: 3 lugares aleatorios + 3 categorías del scope ──────
  const [pickedPlaceNames, setPickedPlaceNames] = useState<string[]>([]);

  useEffect(() => {
    if (pickedPlaceNames.length > 0) return;
    const pool = scopeCats
      ? allPlaces.filter(p => scopeCats.includes(p.categoria))
      : allPlaces;
    if (pool.length === 0) return;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setPickedPlaceNames(shuffled.slice(0, 3).map(p => p.nombre));
  }, [allPlaces, scopeCats, pickedPlaceNames.length]);

  const searchHints = useMemo(() => {
    const cats = scopeCats ?? TODAS_CATS;
    const catHints = cats.slice(0, 3);
    const hints: string[] = [];
    for (let i = 0; i < 3; i++) {
      if (pickedPlaceNames[i]) hints.push(pickedPlaceNames[i]);
      if (catHints[i])          hints.push(catHints[i]);
    }
    return hints.length > 0 ? hints : ['Buscar lugares o categorías'];
  }, [pickedPlaceNames, scopeCats]);

  const { index: hintIdx, opacity: hintOpacity } = useAnimatedPlaceholder(searchHints.length);

  const cardBg  = isDark ? '#1e1e1e' : '#fff';
  const textCol = isDark ? '#e5e5e5' : '#222';
  const subCol  = isDark ? '#9ca3af' : '#64748b';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={ms.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── MAPA ─────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Marcador del usuario */}
        {userLocation && (
          <Marker coordinate={userLocation} zIndex={999}>
            <View style={ms.userMarkerOuter}>
              <View style={ms.userMarkerInner} />
            </View>
          </Marker>
        )}

        {/* ── Pin dedicado (Estadio BBVA u otro lugar fijo) ── */}
        {pinLat && pinLng && (
          <Marker
            coordinate={{ latitude: pinLat, longitude: pinLng }}
            title={pinLabel ?? undefined}
            description={pinSub ?? undefined}
            zIndex={600}
          >
            <View style={ms.pinMarkerWrap}>
              <Text style={ms.pinMarkerEmoji}>🏟️</Text>
              <View style={ms.pinMarkerTail} />
            </View>
          </Marker>
        )}

        {/* Marcadores de lugares buscados */}
        {searchResults.map(place =>
          place.lat && place.lng ? (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.lat, longitude: place.lng }}
              onPress={() => flyToPlace(place)}
              zIndex={place.id === selectedId ? 100 : 10}
            >
              <View style={[
                ms.placeMarkerWrap,
                place.id === selectedId && ms.placeMarkerSelected,
              ]}>
                <Ionicons
                  name="location"
                  size={place.id === selectedId ? 32 : 26}
                  color={place.id === selectedId ? '#C4511A' : '#E96928'}
                />
              </View>
            </Marker>
          ) : null
        )}
      </MapView>

      {/* ── BARRA SUPERIOR ───────────────────────────────── */}
      <View style={[ms.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [ms.topBtn, { backgroundColor: cardBg, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={textCol} />
        </Pressable>

        <View style={[ms.titlePill, { backgroundColor: cardBg }]}>
          <Ionicons name="map" size={16} color="#E96928" />
          <Text style={[ms.titleText, { color: textCol, fontSize: fonts.base }]}>
            {t('map', { defaultValue: 'Mapa' })}
          </Text>
        </View>

        <View style={{ width: 46 }} />
      </View>

      {/* ── BARRA DE BÚSQUEDA ────────────────────────────── */}
      <View style={[
        ms.searchBar,
        { top: insets.top + 72, backgroundColor: cardBg },
      ]}>
        <Ionicons name="search" size={18} color="#E96928" />
        <TextInput
          placeholder=""
          placeholderTextColor="transparent"
          value={mapSearch}
          onChangeText={setMapSearch}
          style={[ms.searchInput, { color: textCol, fontSize: fonts.base }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {mapSearch.length > 0 && (
          <Pressable
            onPress={() => { setMapSearch(''); setSelectedId(null); }}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Ionicons name="close-circle" size={18} color={subCol} />
          </Pressable>
        )}
        {/* Placeholder animado rotativo */}
        {mapSearch.length === 0 && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 44,
              right: 16,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              opacity: hintOpacity,
            }}
          >
            <Text
              style={{ color: subCol, fontSize: fonts.base, fontWeight: '500' }}
              numberOfLines={1}
            >
              {searchHints[hintIdx]}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* ── BARRA DE RESULTADOS (bottom) ─────────────────── */}
      {searchResults.length > 0 && (
        <View style={[
          ms.resultsBar,
          { backgroundColor: cardBg, paddingBottom: insets.bottom + 90 },
        ]}>
          {/* Header de resultados */}
          <View style={ms.resultsHeader}>
            <View style={ms.resultsHeaderDot} />
            <Text style={[ms.resultsTitle, { color: textCol, fontSize: fonts.sm }]}>
              {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Cards horizontales */}
          <FlatList
            horizontal
            data={searchResults}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={ms.resultsScroll}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedId;
              return (
                <Pressable
                  onPress={() => flyToPlace(item)}
                  style={({ pressed }) => [
                    ms.resultCard,
                    isSelected && ms.resultCardSelected,
                    { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                  ]}
                >
                  <Image
                    source={{ uri: item.imagen }}
                    style={ms.resultCardImg}
                    resizeMode="cover"
                  />
                  <View style={ms.resultCardInfo}>
                    <Text
                      style={[ms.resultCardName, { color: isSelected ? '#E96928' : textCol }]}
                      numberOfLines={1}
                    >
                      {item.nombre}
                    </Text>
                    <View style={ms.resultCardCatRow}>
                      <Ionicons name="pricetag" size={9} color="#E96928" />
                      <Text style={[ms.resultCardCat, { color: subCol }]} numberOfLines={1}>
                        {item.categoria}
                      </Text>
                    </View>
                    {item.ubicacion ? (
                      <View style={ms.resultCardLocRow}>
                        <Ionicons name="location-outline" size={9} color={subCol} />
                        <Text style={[ms.resultCardLoc, { color: subCol }]} numberOfLines={1}>
                          {item.ubicacion}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  {!item.lat && (
                    <View style={ms.noCoordsBadge}>
                      <Ionicons name="alert-circle-outline" size={12} color="#94A3B8" />
                    </View>
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* Mensaje sin resultados */}
      {mapSearch.trim().length > 0 && searchResults.length === 0 && (
        <View style={[ms.noResultsBubble, { backgroundColor: cardBg, bottom: insets.bottom + 100 }]}>
          <Ionicons name="search-outline" size={16} color={subCol} />
          <Text style={[ms.noResultsText, { color: subCol, fontSize: fonts.sm }]}>
            Sin resultados para "{mapSearch}"
          </Text>
        </View>
      )}

      {/* ── TARJETA DE PIN (Estadio BBVA u otro lugar fijo) ─ */}
      {pinLat && pinLng && pinLabel && (
        <View style={[ms.pinCard, { bottom: insets.bottom + 80 }]}>
          <View style={ms.pinCardLeft}>
            <Text style={ms.pinCardEmoji}>🏟️</Text>
          </View>
          <View style={ms.pinCardBody}>
            <Text style={ms.pinCardLabel} numberOfLines={1}>{pinLabel}</Text>
            {pinSub ? (
              <Text style={ms.pinCardSub} numberOfLines={1}>{pinSub}</Text>
            ) : null}
          </View>
          <Pressable
            style={({ pressed }) => [ms.pinCardBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => {
              mapRef.current?.animateToRegion(
                { latitude: pinLat, longitude: pinLng, latitudeDelta: 0.008, longitudeDelta: 0.008 },
                600,
              );
            }}
          >
            <Ionicons name="locate" size={16} color="#fff" />
            <Text style={ms.pinCardBtnText}>Centrar</Text>
          </Pressable>
        </View>
      )}

      {/* ── BOTONES INFERIORES ────────────────────────────── */}
      <View style={[ms.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [ms.fabBtn, { backgroundColor: cardBg, opacity: pressed ? 0.85 : 1 }]}
          onPress={centerOnUser}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#E96928" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            ms.externalBtn,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          onPress={openExternalMaps}
        >
          <Ionicons name="navigate" size={18} color="#fff" />
          <Text style={[ms.externalBtnText, { fontSize: fonts.sm }]}>
            {Platform.OS === 'ios'
              ? t('open_in_maps', { defaultValue: 'Abrir en Mapas' })
              : 'Google Maps'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const ms = StyleSheet.create({
  container: { flex: 1 },

  // ── Top bar ──────────────────────────────────────────────
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, zIndex: 20,
  },
  topBtn: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5,
  },
  titlePill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24,
    elevation: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5,
  },
  titleText: { fontWeight: '700' },

  // ── Search bar ───────────────────────────────────────────
  searchBar: {
    position: 'absolute', left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 18, paddingHorizontal: 14, height: 52,
    borderLeftWidth: 5, borderLeftColor: '#E96928',
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8,
    zIndex: 15,
  },
  searchInput: { flex: 1, fontWeight: '500' },

  // ── Results bar ──────────────────────────────────────────
  resultsBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingTop: 10,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    elevation: 12, shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 10,
    zIndex: 10,
  },
  resultsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, marginBottom: 6,
  },
  resultsHeaderDot: {
    width: 4, height: 16, borderRadius: 999, backgroundColor: '#E96928',
  },
  resultsTitle: { fontWeight: '700' },
  resultsScroll: { paddingHorizontal: 14, paddingBottom: 8, gap: 10 },

  resultCard: {
    width: 160, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.06)',
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  resultCardSelected: {
    borderColor: '#E96928', borderWidth: 2,
  },
  resultCardImg: { width: '100%', height: 90 },
  resultCardInfo: { padding: 8, gap: 3 },
  resultCardName: { fontWeight: '700', fontSize: 12 },
  resultCardCatRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  resultCardCat: { fontSize: 10, fontWeight: '600' },
  resultCardLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  resultCardLoc: { fontSize: 10, flex: 1 },
  noCoordsBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8, padding: 2,
  },

  // ── Sin resultados ───────────────────────────────────────
  noResultsBubble: {
    position: 'absolute', left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 16, elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6,
    zIndex: 10,
  },
  noResultsText: { flex: 1, fontWeight: '500' },

  // ── Bottom buttons ───────────────────────────────────────
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, zIndex: 20,
  },
  fabBtn: {
    width: 54, height: 54, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 6,
  },
  externalBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#E96928', paddingHorizontal: 22, paddingVertical: 14,
    borderRadius: 16, elevation: 6, shadowColor: '#E96928',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  externalBtnText: { color: '#fff', fontWeight: '700' },

  // ── Marcadores ───────────────────────────────────────────
  userMarkerOuter: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(233,105,40,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  userMarkerInner: {
    width: 16, height: 16, backgroundColor: '#E96928',
    borderRadius: 8, borderWidth: 3, borderColor: '#fff',
  },
  placeMarkerWrap: {
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  placeMarkerSelected: {
    transform: [{ scale: 1.2 }],
  },

  // ── Pin dedicado (Estadio BBVA) ──────────────────────────
  pinMarkerWrap: {
    alignItems: 'center',
  },
  pinMarkerEmoji: {
    fontSize: 36,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  pinMarkerTail: {
    width: 3, height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    marginTop: -2,
  },

  // ── Tarjeta info del pin ─────────────────────────────────
  pinCard: {
    position: 'absolute',
    left: 16, right: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    zIndex: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(240,180,41,0.3)',
  },
  pinCardLeft: {
    width: 48, height: 48,
    backgroundColor: 'rgba(240,180,41,0.12)',
    borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(240,180,41,0.25)',
  },
  pinCardEmoji: { fontSize: 26 },
  pinCardBody: { flex: 1, gap: 2 },
  pinCardLabel: {
    color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: -0.2,
  },
  pinCardSub: {
    color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '500',
  },
  pinCardBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#E96928',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  pinCardBtnText: {
    color: '#fff', fontWeight: '700', fontSize: 12,
  },
});

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Lugar, useFavoritos } from '../../src/context/FavoritosContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useAnimatedPlaceholder } from '../../src/hooks/useAnimatedPlaceholder';
import { useLugares } from '../../src/hooks/useLugares';

const COSTOS_GRATIS = ['Gratis', 'Gratis (entrada)'];

const CATEGORIAS = [
  { id: '1', value: 'Restaurantes', labelKey: 'cat_restaurantes', icon: 'silverware-fork-knife', color: '#FF6B35' },
  { id: '2', value: 'Hoteles', labelKey: 'cat_hoteles', icon: 'office-building', color: '#4A90E2' },
  { id: '3', value: 'Tiendas', labelKey: 'cat_tiendas', icon: 'shopping', color: '#F5BE41' },
  { id: '4', value: 'Servicios', labelKey: 'cat_servicios', icon: 'hammer-wrench', color: '#E96928' },
  { id: '5', value: 'Plazas', labelKey: 'cat_plazas', icon: 'storefront', color: '#10B981' },
  { id: '6', value: 'Hospitales', labelKey: 'cat_hospitales', icon: 'hospital-box', color: '#A2A6A6' },
  { id: '7', value: 'Farmacias', labelKey: 'cat_farmacias', icon: 'pill', color: '#528968' },
  { id: '8', value: 'Supermercados', labelKey: 'cat_supermercados', icon: 'cart', color: '#87479C' },
  { id: '9', value: 'Gasolineras', labelKey: 'cat_gasolineras', icon: 'gas-station', color: '#EF4444' },
];

function RefreshLogo({ refreshing, isDark }: { refreshing: boolean; isDark: boolean }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (refreshing) {
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        })
      );

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.14,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
        ])
      );

      spin.start();
      pulse.start();

      return () => {
        spin.stop();
        pulse.stop();
        spinAnim.setValue(0);
        pulseAnim.setValue(1);
      };
    }
  }, [refreshing, spinAnim, pulseAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!refreshing) return null;

  return (
    <View style={rl.container}>
      <Animated.View style={{ transform: [{ rotate }, { scale: pulseAnim }] }}>
        <View
          style={[
            rl.iconBg,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EDEDED' },
          ]}
        >
          <Ionicons name="location" size={18} color={isDark ? '#d1d5db' : '#9ca3af'} />
        </View>
      </Animated.View>
      <Text style={[rl.label, { color: isDark ? '#9ca3af' : '#a1a1aa' }]}>GuadalupeGO</Text>
    </View>
  );
}

const rl = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 14,
    gap: 8,
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

type HeaderProps = {
  s: any;
  t: any;
  colors: any;
  fonts: any;
  refreshing: boolean;
  search: string;
  categoriaActiva: string | null;
  filteredData: Lugar[];
  region: any;
  mapRef: React.RefObject<MapView | null>;
  onSearch: (text: string) => void;
  onLimpiar: () => void;
  onCategoria: (cat: string) => void;
  onUbicacion: () => void;
  onSelectItem: (item: Lugar) => void;
  onExpandMap: () => void;
  isDark: boolean;
};

const DirectorioHeader = React.memo(
  ({
    s,
    t,
    colors,
    fonts,
    refreshing,
    search,
    categoriaActiva,
    filteredData,
    region,
    mapRef,
    onSearch,
    onLimpiar,
    onCategoria,
    onUbicacion,
    onSelectItem,
    onExpandMap,
    isDark,
  }: HeaderProps) => {
    const bannerAnim = useRef(new Animated.Value(0)).current;
    const mapAnim = useRef(new Animated.Value(0)).current;
    const catAnim = useRef(new Animated.Value(0)).current;
    const listAnim = useRef(new Animated.Value(0)).current;

    // Animated rotating placeholder hints
    const searchHints = useMemo(
      () => [
        `${t('search')} ${t('cat_restaurantes')}...`,
        `${t('search')} ${t('cat_hoteles')}...`,
        `${t('search')} ${t('cat_tiendas')}...`,
      ],
      [t]
    );
    const { index: hintIdx, opacity: hintOpacity } = useAnimatedPlaceholder(searchHints.length);

    useEffect(() => {
      Animated.stagger(120, [
        Animated.timing(bannerAnim, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(mapAnim, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(catAnim, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(listAnim, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
      ]).start();
    }, [bannerAnim, mapAnim, catAnim, listAnim]);

    const bannerAnimatedStyle = {
      opacity: bannerAnim,
      transform: [
        {
          translateY: bannerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [24, 0],
          }),
        },
      ],
    };

    const mapAnimatedStyle = {
      opacity: mapAnim,
      transform: [
        {
          translateY: mapAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
      ],
    };

    const catAnimatedStyle = {
      opacity: catAnim,
      transform: [
        {
          translateY: catAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 0],
          }),
        },
      ],
    };

    const listAnimatedStyle = {
      opacity: listAnim,
      transform: [
        {
          translateY: listAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 0],
          }),
        },
      ],
    };

    const suggestions = search.trim() ? filteredData.slice(0, 5) : [];

    return (
      <View>
        <RefreshLogo refreshing={refreshing} isDark={isDark} />

        <Animated.View style={bannerAnimatedStyle}>
          <LinearGradient
            colors={['#E96928', '#C4511A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.banner}
          >
            <View style={s.circle1} />
            <View style={s.circle2} />

            <View style={s.bannerContent}>
              <View style={s.bannerIconWrap}>
                <MaterialCommunityIcons name="office-building" size={24} color="#E96928" />
              </View>
              <View style={s.bannerTextWrap}>
                <Text style={[s.bannerTitle, { fontSize: fonts.xl }]}>{t('tab_directory2')}</Text>
                <Text style={[s.bannerSub, { fontSize: fonts.sm }]}>{t('DN')}</Text>
              </View>
            </View>

            <View style={s.searchArea}>
              <View style={s.searchBox}>
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                  placeholder=""
                  placeholderTextColor="transparent"
                  value={search}
                  onChangeText={onSearch}
                  style={[s.searchInput, { fontSize: fonts.base }]}
                />
                {search.length > 0 && (
                  <Pressable
                    onPress={onLimpiar}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    })}
                  >
                    <Ionicons name="close-circle" size={20} color="#94A3B8" />
                  </Pressable>
                )}
                {/* Animated rotating placeholder — absolute inside searchBox */}
                {search.length === 0 && (
                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: 46,
                      right: 16,
                      top: 0,
                      bottom: 0,
                      justifyContent: 'center',
                      opacity: hintOpacity,
                    }}
                  >
                    <Text
                      style={{
                        color: '#94A3B8',
                        fontSize: fonts.base,
                        fontWeight: '500',
                      }}
                      numberOfLines={1}
                    >
                      {searchHints[hintIdx]}
                    </Text>
                  </Animated.View>
                )}
              </View>

              {search.length > 0 && (
                <View style={s.searchResults}>
                  <Text style={[s.searchTitle, { fontSize: fonts.sm }]}>{t('search')}</Text>

                  {suggestions.length === 0 ? (
                    <Text style={[s.noResults, { fontSize: fonts.sm }]}>{t('no_results')}</Text>
                  ) : (
                    suggestions.map((item) => (
                      <Pressable
                        key={item.id}
                        style={({ pressed }) => [
                          s.searchItem,
                          {
                            opacity: pressed ? 0.88 : 1,
                            transform: [{ scale: pressed ? 0.98 : 1 }],
                          },
                        ]}
                        onPress={() => onSelectItem(item)}
                      >
                        <View style={s.searchItemIconWrap}>
                          <Ionicons name="location-outline" size={16} color="#E96928" />
                        </View>
                        <Text style={[s.searchItemText, { fontSize: fonts.sm }]} numberOfLines={1}>
                          {item.nombre}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={mapAnimatedStyle}>
          <View style={s.mapSection}>
            <View style={s.sectionHeader}>
              <View style={s.sectionDot} />
              <Text style={[s.sectionTitle, { fontSize: fonts.lg }]}>{t('location')}</Text>
            </View>

            <View style={s.mapWrapper}>
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFillObject}
                initialRegion={
                  region ?? {
                    latitude: 25.676,
                    longitude: -100.256,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                  }
                }
                showsUserLocation={false}
              >
                {region && (
                  <Marker coordinate={region}>
                    <View style={s.userMarkerOuter}>
                      <View style={s.userMarker} />
                    </View>
                  </Marker>
                )}
              </MapView>

              <Pressable
                style={({ pressed }) => [
                  s.locationBtn,
                  {
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
                onPress={onUbicacion}
              >
                <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#E96928" />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  s.expandMapBtn,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={onExpandMap}
              >
                <Ionicons name="expand-outline" size={18} color="#E96928" />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={catAnimatedStyle}>
          <View style={s.catSection}>
            <View style={s.sectionHeader}>
              <View style={s.sectionDot} />
              <Text style={[s.sectionTitle, { fontSize: fonts.lg }]}>{t('categories')}</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.categoriesScroll}
            >
              {CATEGORIAS.map((cat) => {
                const activa = categoriaActiva === cat.value;

                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => onCategoria(cat.value)}
                    style={({ pressed }) => [
                      s.categoryCard,
                      activa && {
                        borderColor: cat.color,
                        borderWidth: 2,
                        backgroundColor: cat.color + '12',
                      },
                      {
                        opacity: pressed ? 0.94 : 1,
                        transform: [{ scale: pressed ? 0.975 : 1 }],
                      },
                    ]}
                  >
                    <View style={[s.iconCircle, { backgroundColor: cat.color + '20' }]}>
                      <MaterialCommunityIcons name={cat.icon as any} size={24} color={cat.color} />
                    </View>

                    <Text
                      style={[
                        s.catName,
                        { fontSize: fonts.sm },
                        activa && { color: cat.color, fontWeight: '800' },
                      ]}
                    >
                      {t(cat.labelKey)}
                    </Text>

                    {activa && <View style={[s.catActiveDot, { backgroundColor: cat.color }]} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Animated.View>

        <Animated.View style={listAnimatedStyle}>
          <View style={s.listLabelRow}>
            <View style={s.sectionDot} />
            <Text style={[s.listTitle, { fontSize: fonts.lg }]}>
              {categoriaActiva
                ? t(CATEGORIAS.find((c) => c.value === categoriaActiva)?.labelKey ?? '')
                : t('all')}
            </Text>

            <View style={s.countBadge}>
              <Text style={[s.countText, { fontSize: fonts.xs }]}>
                {filteredData.length}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }
);

DirectorioHeader.displayName = 'DirectorioHeader';

export default function DirectorioScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const flatListRef = useRef<FlatList>(null);
  const { toggleFavorito, esFavorito } = useFavoritos();
  const { data: lugares, refresh: refreshLugares } = useLugares();

  const [search, setSearch] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [region, setRegion] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const emptyAnim = useRef(new Animated.Value(0)).current;

  const filteredData = useMemo(() => {
    let data = lugares;
    if (categoriaActiva) {
      data = data.filter((l) => l.categoria === categoriaActiva);
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (l) =>
          l.nombre.toLowerCase().includes(q) ||
          l.categoria.toLowerCase().includes(q) ||
          l.ubicacion.toLowerCase().includes(q)
      );
    }
    return data;
  }, [lugares, search, categoriaActiva]);

  const isEmpty = filteredData.length === 0 && (search.length > 0 || categoriaActiva !== null);

  useEffect(() => {
    if (isEmpty) {
      emptyAnim.setValue(0);
      Animated.timing(emptyAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }).start();
    }
  }, [isEmpty, emptyAnim]);

  const obtenerUbicacion = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const r = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setRegion(r);
    mapRef.current?.animateToRegion(r, 800);
  }, []);

  useEffect(() => {
    obtenerUbicacion();
  }, [obtenerUbicacion]);

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
  }, []);

  const limpiarSearch = useCallback(() => {
    setSearch('');
  }, []);

  const seleccionarCategoria = useCallback(
    (cat: string) => {
      setCategoriaActiva(prev => cat === prev ? null : cat);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    },
    []
  );

  const expandMap = useCallback(() => {
    router.push({
      pathname: '/(stack)/mapaCompleto',
      params: region
        ? { latitude: String(region.latitude), longitude: String(region.longitude), from: 'directorio' }
        : { from: 'directorio' },
    });
  }, [router, region]);

  const irAlDetalle = useCallback(
    (item: Lugar) => {
      setSearch('');
      router.push({
        pathname: '/(stack)/detalleLugar',
        params: { lugar: JSON.stringify(item), from: 'directorio' },
      });
    },
    [router]
  );

  const fetchData = useCallback(async () => {
    await refreshLugares();
  }, [refreshLugares]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchData(),
      new Promise((r) => setTimeout(r, 1000)),
    ]);
    setRefreshing(false);
  }, [fetchData]);

  const listHeader = useMemo(
    () => (
      <DirectorioHeader
        s={s}
        t={t}
        colors={colors}
        fonts={fonts}
        refreshing={refreshing}
        search={search}
        categoriaActiva={categoriaActiva}
        filteredData={filteredData}
        region={region}
        mapRef={mapRef}
        onSearch={handleSearch}
        onLimpiar={limpiarSearch}
        onCategoria={seleccionarCategoria}
        onUbicacion={obtenerUbicacion}
        onSelectItem={irAlDetalle}
        onExpandMap={expandMap}
        isDark={isDark}
      />
    ),
    [
      s,
      t,
      colors,
      fonts,
      refreshing,
      search,
      categoriaActiva,
      filteredData,
      region,
      handleSearch,
      limpiarSearch,
      seleccionarCategoria,
      obtenerUbicacion,
      irAlDetalle,
      expandMap,
      isDark,
    ]
  );

  const emptyAnimatedStyle = {
    opacity: emptyAnim,
    transform: [
      {
        translateY: emptyAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
      {
        scale: emptyAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.97, 1],
        }),
      },
    ],
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <FlatList
        ref={flatListRef}
        data={filteredData}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !refreshing ? (
            <Animated.View style={[s.emptyWrap, emptyAnimatedStyle]}>
              <View style={s.emptyIconWrap}>
                <Ionicons name="business-outline" size={42} color="#cbd5e1" />
              </View>
              <Text style={[s.emptyTitle, { fontSize: fonts.base }]}>
                {t('no_results')}
              </Text>
              <Text style={[s.emptySub, { fontSize: fonts.sm }]}>
                {t('directory_empty_hint', {
                  defaultValue: 'Prueba con otra categoría o busca otro lugar.',
                })}
              </Text>
            </Animated.View>
          ) : null
        }
        contentContainerStyle={s.listContent}
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={['transparent']}
            progressBackgroundColor="transparent"
          />
        }
        renderItem={({ item }) => {
          const isFav = esFavorito(item.id);
          const catInfo = CATEGORIAS.find((c) => c.value === item.categoria);

          return (
            <Pressable
              style={({ pressed }) => [
                s.placeCard,
                {
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.975 : 1 }],
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/(stack)/detalleLugar',
                  params: { lugar: JSON.stringify(item), from: 'directorio' },
                })
              }
            >
              <View style={s.imageWrapper}>
                <Image source={{ uri: item.imagen }} style={s.placeImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.45)']}
                  style={StyleSheet.absoluteFillObject}
                />

                <Pressable
                  style={({ pressed }) => [
                    s.heartBtn,
                    {
                      opacity: pressed ? 0.88 : 1,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                  onPress={() => toggleFavorito({ ...item, origen: 'detalle' })}
                >
                  <Ionicons
                    name={isFav ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isFav ? '#E11D48' : '#fff'}
                  />
                </Pressable>

                <View style={s.costBadge}>
                  <Text style={[s.costText, { fontSize: fonts.xs }]}>
                    {!item.costo || COSTOS_GRATIS.includes(item.costo)
                      ? t('detail_free')
                      : item.costo}
                  </Text>
                </View>
              </View>

              <View style={s.placeInfo}>
                <View
                  style={[
                    s.tagWrap,
                    { backgroundColor: (catInfo?.color ?? '#E96928') + '18' },
                  ]}
                >
                  <View
                    style={[
                      s.tagDot,
                      { backgroundColor: catInfo?.color ?? '#E96928' },
                    ]}
                  />
                  <Text
                    style={[
                      s.placeTag,
                      {
                        color: catInfo?.color ?? '#E96928',
                        fontSize: fonts.xs,
                      },
                    ]}
                  >
                    {t(catInfo?.labelKey ?? item.categoria)}
                  </Text>
                </View>

                <Text style={[s.placeName, { fontSize: fonts.base }]} numberOfLines={1}>
                  {item.nombre}
                </Text>

                <View style={s.addressRow}>
                  <Ionicons name="location-outline" size={12} color={colors.subtext} />
                  <Text
                    style={[s.placeAddress, { fontSize: fonts.xs }]}
                    numberOfLines={1}
                  >
                    {item.ubicacion}
                  </Text>
                </View>

                <View style={s.ratingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={
                        star <= Math.round(item.rating ?? 0) ? 'star' : 'star-outline'
                      }
                      size={11}
                      color="#FFD700"
                    />
                  ))}
                  <Text style={[s.ratingText, { fontSize: fonts.xs }]}>
                    {item.rating}
                  </Text>
                </View>
              </View>

              <View style={s.chevronWrap}>
                <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
              </View>
            </Pressable>
          );
        }}
      />

    </>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) =>
  StyleSheet.create({
    banner: {
      paddingHorizontal: 22,
      paddingTop: Platform.OS === 'ios' ? 38 : 30,
      paddingBottom: 24,
      overflow: 'hidden',
      borderBottomLeftRadius: 34,
      borderBottomRightRadius: 34,
      marginBottom: 6,
    },

    circle1: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(255,255,255,0.07)',
      top: -52,
      right: -44,
    },

    circle2: {
      position: 'absolute',
      width: 118,
      height: 118,
      borderRadius: 59,
      backgroundColor: 'rgba(255,255,255,0.05)',
      bottom: -24,
      left: -32,
    },

    bannerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },

    bannerTextWrap: {
      flex: 1,
    },

    bannerIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 6,
    },

    bannerTitle: {
      color: '#fff',
      fontWeight: '900',
      letterSpacing: -0.5,
    },

    bannerSub: {
      color: 'rgba(255,255,255,0.82)',
      marginTop: 3,
      fontWeight: '500',
    },

    searchArea: {
      marginTop: 18,
      position: 'relative',
      zIndex: 20,
    },

    searchBox: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 18,
      paddingHorizontal: 16,
      alignItems: 'center',
      height: 56,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 7,
    },

    searchInput: {
      flex: 1,
      marginLeft: 10,
      color: '#1E293B',
      fontWeight: '500',
    },

    searchResults: {
      backgroundColor: c.card,
      borderRadius: 18,
      marginTop: 10,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: c.border,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },

    searchTitle: {
      fontWeight: '800',
      color: c.text,
      paddingHorizontal: 14,
      marginBottom: 6,
    },

    searchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },

    searchItemIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(233,105,40,0.12)' : 'rgba(233,105,40,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    searchItemText: {
      color: c.text,
      fontWeight: '600',
      flex: 1,
    },

    noResults: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      color: c.subtext,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },

    sectionDot: {
      width: 5,
      height: 18,
      borderRadius: 999,
      backgroundColor: '#E96928',
    },

    sectionTitle: {
      fontWeight: '800',
      color: c.text,
      letterSpacing: -0.2,
    },

    mapSection: {
      paddingHorizontal: 20,
      marginTop: 16,
      marginBottom: 22,
    },

    mapWrapper: {
      height: 190,
      borderRadius: 24,
      overflow: 'hidden',
      borderLeftWidth: 5,
      borderLeftColor: '#E96928',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.18 : 0.1,
      shadowRadius: 8,
      backgroundColor: c.card,
    },

    locationBtn: {
      position: 'absolute',
      top: 14,
      right: 14,
      backgroundColor: c.card,
      width: 46,
      height: 46,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      borderWidth: 1,
      borderColor: c.border,
    },

    expandMapBtn: {
      position: 'absolute',
      top: 14,
      left: 14,
      backgroundColor: c.card,
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      borderWidth: 1,
      borderColor: c.border,
    },

    userMarkerOuter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(233,105,40,0.18)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    userMarker: {
      width: 14,
      height: 14,
      backgroundColor: '#E96928',
      borderRadius: 7,
      borderWidth: 3,
      borderColor: '#fff',
    },

    catSection: {
      marginBottom: 18,
    },

    categoriesScroll: {
      paddingHorizontal: 20,
      paddingRight: 28,
    },

    categoryCard: {
      backgroundColor: c.card,
      paddingVertical: 16,
      paddingHorizontal: 14,
      borderRadius: 20,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 104,
      minHeight: 124,
      borderWidth: 2,
      borderColor: 'transparent',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.16 : 0.06,
      shadowRadius: 5,
    },

    iconCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },

    catName: {
      fontWeight: '700',
      color: c.text,
      textAlign: 'center',
    },

    catActiveDot: {
      width: 7,
      height: 7,
      borderRadius: 999,
      marginTop: 8,
    },

    listLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 20,
      marginBottom: 14,
    },

    listTitle: {
      fontWeight: '800',
      color: c.text,
      flex: 1,
    },

    countBadge: {
      minWidth: 34,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
    },

    countText: {
      color: c.subtext,
      fontWeight: '700',
    },

    listContent: {
      paddingBottom: 34,
      flexGrow: 1,
    },

    placeCard: {
      backgroundColor: c.card,
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 22,
      overflow: 'hidden',
      flexDirection: 'row',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.18 : 0.08,
      shadowRadius: 6,
      borderWidth: 1,
      borderColor: c.border,
    },

    imageWrapper: {
      width: 118,
      height: 132,
    },

    placeImage: {
      width: '100%',
      height: '100%',
    },

    heartBtn: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.42)',
      borderRadius: 14,
      padding: 6,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
    },

    costBadge: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      backgroundColor: 'rgba(0,0,0,0.58)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 9,
    },

    costText: {
      color: '#fff',
      fontWeight: '700',
    },

    placeInfo: {
      flex: 1,
      paddingHorizontal: 13,
      paddingVertical: 12,
      justifyContent: 'center',
      gap: 6,
    },

    tagWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },

    tagDot: {
      width: 5,
      height: 5,
      borderRadius: 999,
    },

    placeTag: {
      fontWeight: '700',
    },

    placeName: {
      fontWeight: '800',
      color: c.text,
    },

    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    placeAddress: {
      color: c.subtext,
      flexShrink: 1,
    },

    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginTop: 2,
    },

    ratingText: {
      color: c.subtext,
      marginLeft: 4,
      fontWeight: '600',
    },

    chevronWrap: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingRight: 14,
      paddingLeft: 4,
    },

    emptyWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 22,
      marginHorizontal: 20,
      paddingHorizontal: 20,
      paddingVertical: 34,
      borderRadius: 24,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
    },

    emptyIconWrap: {
      width: 74,
      height: 74,
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(233,105,40,0.06)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },

    emptyTitle: {
      color: c.text,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 8,
    },

    emptySub: {
      color: c.subtext,
      textAlign: 'center',
      lineHeight: 22,
    },
  });
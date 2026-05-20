import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, FlatList, Image, Platform, Pressable, RefreshControl, StatusBar, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavoritos } from '../../src/context/FavoritosContext';
import { useTheme } from '../../src/context/ThemeContext';
import { getLugares } from '../../src/api/api';
import { getFotoLugarCached } from '../../src/hooks/fotosCache';
import { mapLugar } from '../../src/mappers/lugaresMapper';
import { Lugar } from '../../src/types/lugar';
import { useUbicacion } from '../../src/hooks/useUbicacion';
import { CARD_CATEGORIAS, filtrarPorCategorias, rotarLugares } from '../../src/hooks/filtrosLugares';
import { getImagenLugarSource } from '../../src/utils/imagenLugar';

// Logo animado de carga (gira + pulsa) — mismo patrón que en las
// tabs principales (Inicio, Noticias, Eventos, etc.). Se monta arriba
// de la lista y solo es visible mientras `refreshing` es true.
function RefreshLogo({ refreshing, isDark }: { refreshing: boolean; isDark: boolean }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!refreshing) return;
    const spin = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 450, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 450, useNativeDriver: true }),
      ]),
    );
    spin.start();
    pulse.start();
    return () => {
      spin.stop();
      pulse.stop();
      spinAnim.setValue(0);
      pulseAnim.setValue(1);
    };
  }, [refreshing, spinAnim, pulseAnim]);

  const rotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  if (!refreshing) return null;

  return (
    <View style={rl.container}>
      <Animated.View style={{ transform: [{ rotate }, { scale: pulseAnim }] }}>
        <View style={[rl.iconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EDEDED' }]}>
          <Image
            source={require('../../assets/images/logosinnadaoficial.png')}
            style={{ width: 24, height: 24, tintColor: isDark ? '#d1d5db' : '#9ca3af' }}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
      <Text style={[rl.label, { color: isDark ? '#9ca3af' : '#a1a1aa' }]}>GuadalupeGO</Text>
    </View>
  );
}

const rl = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  iconBg: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
});

const CATEGORIA_KEYS: Record<string, string> = {
  'Naturaleza & Aventura': 'cat_nature',
  'cultura': 'cat_culture',
  'pueblos Magicos': 'cat_pueblos_magicos',
  'explorar': 'cat_explore',
  'compras': 'cat_shopping',
  'servicios': 'cat_services',
  'Fin de semana': 'cat_weekend',
  'tours': 'cat_tours',
  'Cerros': 'cat_cerros',
  'Parques': 'cat_parques',
  'Pueblos Mágicos': 'cat_pueblos_magicos',
  'Museos': 'cat_museos',
  'Restaurantes': 'cat_restaurantes',
  'Hoteles': 'cat_hoteles',
  'Tiendas': 'cat_tiendas',
  'Servicios': 'cat_services',
  'Plazas': 'cat_plazas',
  'Hospitales': 'cat_hospitales',
  'Farmacias': 'cat_farmacias',
  'Supermercados': 'cat_supermercados',
  'Gasolineras': 'cat_gasolineras',
};

export default function Categoria() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const { tipo, nombre } = useLocalSearchParams<{ tipo: string; nombre: string }>();
  const router = useRouter();
  const { toggleFavorito, esFavorito } = useFavoritos();

  const idCategoria = Number(tipo) || undefined;
  const rawNombre = nombre || tipo || '';
  const categoriaKey = CATEGORIA_KEYS[rawNombre];
  const titulo = categoriaKey ? t(categoriaKey) : rawNombre;

  // ── Paginación / infinite scroll ─────────────────────────────
  // Antes el screen llamaba a useLugares() que traía un solo bloque
  // fijo (20 o 40). El usuario llegaba al final y no había forma de
  // ver más. Ahora pedimos el backend en páginas: cada vez que la
  // FlatList llega al final disparamos `cargarMas()` que pide la
  // siguiente página y la APPENDA al estado, sin repetir IDs.
  const PAGE_SIZE = 20;
  const { coords } = useUbicacion();

  const [items, setItems]               = useState<Lugar[]>([]);
  const [pagina, setPagina]             = useState(1);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [refreshing, setRefreshing]     = useState(false);
  const [hayMas, setHayMas]             = useState(true);

  // Set de IDs vistos para dedupe entre páginas — el backend a veces
  // regresa el mismo lugar en páginas consecutivas si hay paginación
  // basada en orden no estable (proximidad cambia con GPS).
  const vistosRef = useRef<Set<string>>(new Set());

  // Si la card es slug-based (Pueblos Mágicos, Naturaleza, etc.) el
  // backend no sabe del filtro, así que filtramos en cliente. Para
  // categorías por ID (directorio) NO filtramos en cliente.
  const filtroPermitido = useMemo(
    () => (idCategoria ? null : CARD_CATEGORIAS[rawNombre] ?? null),
    [idCategoria, rawNombre],
  );

  const cargarPagina = useCallback(
    async (pg: number, reset: boolean) => {
      const params: Record<string, any> = { pagina: pg, por_pagina: PAGE_SIZE };
      if (idCategoria) params.id_categoria = idCategoria;
      if (coords) {
        params.lat = coords.lat;
        params.lng = coords.lng;
        params.radio_km = 15;
      }

      try {
        const res = await getLugares(params);
        const raws: any[] = res?.success ? (res.data?.lugares ?? []) : [];

        // Trae fotos en paralelo (cacheadas en memoria por id).
        const mapeados: Lugar[] = await Promise.all(
          raws.map(async (raw) => {
            const url = await getFotoLugarCached(raw.id);
            return mapLugar(raw, url ?? undefined);
          }),
        );

        // Dedupe + filtro de slug-card si aplica.
        let frescos = mapeados.filter((l) => !vistosRef.current.has(l.id));
        if (filtroPermitido) {
          frescos = filtrarPorCategorias(frescos as any, filtroPermitido) as Lugar[];
        }
        frescos.forEach((l) => vistosRef.current.add(l.id));

        if (reset) {
          vistosRef.current = new Set(frescos.map((l) => l.id));
          // Rotamos solo la primera carga para mantener la sensación de
          // contenido fresco; al cargar más NO rotamos para que los
          // resultados nuevos aparezcan en orden estable abajo.
          setItems(rotarLugares(frescos));
        } else {
          setItems((prev) => [...prev, ...frescos]);
        }

        // Si el backend ya no entregó la página completa, no hay más.
        setHayMas(raws.length === PAGE_SIZE);
      } catch {
        setHayMas(false);
      }
    },
    [idCategoria, coords, filtroPermitido],
  );

  // Carga inicial / cuando cambia la categoría
  useEffect(() => {
    let activo = true;
    (async () => {
      setLoading(true);
      vistosRef.current.clear();
      await cargarPagina(1, true);
      if (activo) {
        setPagina(1);
        setLoading(false);
      }
    })();
    return () => { activo = false; };
  }, [cargarPagina]);

  const cargarMas = useCallback(async () => {
    if (loadingMore || loading || refreshing || !hayMas) return;
    setLoadingMore(true);
    const sig = pagina + 1;
    await cargarPagina(sig, false);
    setPagina(sig);
    setLoadingMore(false);
  }, [loadingMore, loading, refreshing, hayMas, pagina, cargarPagina]);

  const refrescar = useCallback(async () => {
    setRefreshing(true);
    vistosRef.current.clear();
    await cargarPagina(1, true);
    setPagina(1);
    setHayMas(true);
    setRefreshing(false);
  }, [cargarPagina]);

  // Alias para que el resto del JSX siga usando `lugares`.
  const lugares = items;

  const s = makeStyles(colors, fonts, isDark);

  // StatusBar — la zona del status bar es la SafeAreaView (fondo del tema),
  // no el header naranja. Por eso usamos iconos del tema, NO siempre claros.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(colors.background);
      }
    }, [isDark, colors.background])
  );

  const bannerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const emptyAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(bannerAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 560,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bannerAnim, contentAnim]);

  useEffect(() => {
    if (!loading && lugares.length === 0) {
      Animated.timing(emptyAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start();
    } else {
      emptyAnim.setValue(0);
    }
  }, [loading, lugares.length, emptyAnim]);

  const bannerAnimatedStyle = {
    opacity: bannerAnim,
    transform: [
      {
        translateY: bannerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const contentAnimatedStyle = {
    opacity: contentAnim,
    transform: [
      {
        translateY: contentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [26, 0],
        }),
      },
    ],
  };

  const emptyAnimatedStyle = useMemo(
    () => ({
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
            outputRange: [0.96, 1],
          }),
        },
      ],
    }),
    [emptyAnim]
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <Animated.View style={bannerAnimatedStyle}>
        <LinearGradient
          colors={['#F97613', '#F97613']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.banner}
        >
          <View style={s.circle1} />

          <Pressable
            style={({ pressed }) => [
              s.backBtn,
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={18} color="#fff" />
            <Text style={[s.backLabel, { fontSize: fonts.sm }]}>{t('back')}</Text>
          </Pressable>

          <View style={s.bannerContent}>
            <View style={s.bannerIconWrap}>
              <Ionicons name="location" size={22} color="#F97613" />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[s.bannerTitle, { fontSize: fonts['2xl'] }]}
                numberOfLines={1}
              >
                {titulo}
              </Text>

              <Text style={[s.bannerSub, { fontSize: fonts.sm }]}>
                {loading ? t('loading') : `${lugares.length} ${t('places')}`}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[s.contentWrap, contentAnimatedStyle]}>
        <FlatList
          data={lugares}
          keyExtractor={(item, index) => String(item?.id ?? index)}
          contentContainerStyle={[s.list, lugares.length === 0 && { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          // Infinite scroll: dispara `cargarMas` cuando el usuario se acerca
          // al final. Threshold de 0.6 = pide la página siguiente cuando aún
          // quedan 60 % del viewport por ver, para que la carga sea invisible.
          onEndReached={cargarMas}
          onEndReachedThreshold={0.6}
          // Spinner del sistema en `transparent` para que NO se vea — la
          // animación visible es el `RefreshLogo` propio que renderiza el
          // logo girando + "GuadalupeGO".
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refrescar}
              tintColor="transparent"
              colors={["transparent"]}
              progressBackgroundColor="transparent"
            />
          }
          ListHeaderComponent={<RefreshLogo refreshing={refreshing} isDark={isDark} />}
          ListFooterComponent={
            loadingMore ? (
              <View style={s.footerLoader}>
                <ActivityIndicator size="small" color="#F97613" />
                <Text style={[s.footerLoaderText, { fontSize: fonts.xs }]}>
                  {t('loading')}
                </Text>
              </View>
            ) : !hayMas && lugares.length > 0 ? (
              <View style={s.footerLoader}>
                <Text style={[s.footerLoaderText, { fontSize: fonts.xs }]}>
                  {t('no_more_results', { defaultValue: 'Eso es todo por ahora' })}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            loading ? (
              <View style={s.loadingWrap}>
                <View style={s.loadingCard}>
                  <ActivityIndicator size="large" color="#F97613" />
                  <Text style={[s.loadingText, { fontSize: fonts.sm }]}>
                    {t('loading')}
                  </Text>
                </View>
              </View>
            ) : (
              <Animated.View style={[s.emptyWrap, emptyAnimatedStyle]}>
                <View style={s.emptyGlow} />
                <View style={s.emptyIconWrap}>
                  <Ionicons name="location-outline" size={34} color="#F97613" />
                </View>

                <Text style={[s.emptyTitle, { fontSize: fonts.lg }]}>
                  {t('empty_category')}
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    s.emptyBtn,
                    {
                      opacity: pressed ? 0.88 : 1,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    },
                  ]}
                  onPress={() => router.back()}
                >
                  <Ionicons name="chevron-back" size={16} color="#fff" />
                  <Text style={[s.emptyBtnText, { fontSize: fonts.sm }]}>
                    {t('go_back')}
                  </Text>
                </Pressable>
              </Animated.View>
            )
          }
          renderItem={({ item }) => {
            const fav = esFavorito(item.id);
            const catKey = CATEGORIA_KEYS[item.categoria];
            const catLabel = catKey ? t(catKey) : item.categoria;

            return (
              <Pressable
                style={({ pressed }) => [
                  s.card,
                  {
                    transform: [{ scale: pressed ? 0.975 : 1 }],
                    opacity: pressed ? 0.96 : 1,
                  },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/(stack)/detalleLugar',
                    params: { lugar: JSON.stringify(item) },
                  })
                }
              >
                <Image source={getImagenLugarSource(item.imagen)} style={s.cardImg} />

                <LinearGradient
                  colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.22)', 'rgba(0,0,0,0.84)']}
                  style={StyleSheet.absoluteFillObject}
                />

                <View style={s.cardTop}>
                  <View style={s.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(item.rating ?? 4) ? 'star' : 'star-outline'}
                        size={13}
                        color="#FFD700"
                      />
                    ))}
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      s.heartBtn,
                      fav && s.heartBtnActive,
                      { transform: [{ scale: pressed ? 0.92 : 1 }] },
                    ]}
                    onPress={() => toggleFavorito(item)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={fav ? 'heart' : 'heart-outline'}
                      size={18}
                      color="#fff"
                    />
                  </Pressable>
                </View>

                <View style={s.cardBottom}>
                  <View style={{ flex: 1 }}>
                    {catLabel ? (
                      <View style={s.catBadge}>
                        <Text style={[s.catBadgeText, { fontSize: fonts.xs }]}>
                          {catLabel}
                        </Text>
                      </View>
                    ) : null}

                    <Text
                      style={[s.cardName, { fontSize: fonts.lg }]}
                      numberOfLines={1}
                    >
                      {item.nombre}
                    </Text>

                    {item.ubicacion ? (
                      <View style={s.locationRow}>
                        <Ionicons
                          name="location"
                          size={11}
                          color="rgba(255,255,255,0.82)"
                        />
                        <Text
                          style={[s.locationText, { fontSize: fonts.xs }]}
                          numberOfLines={1}
                        >
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
      </Animated.View>
    </SafeAreaView>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background,
    },

    contentWrap: {
      flex: 1,
    },

    banner: {
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 26,
      overflow: 'hidden',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 18,
      elevation: 6,
    },

    circle1: {
      position: 'absolute',
      width: 170,
      height: 170,
      borderRadius: 85,
      backgroundColor: 'rgba(255,255,255,0.07)',
      top: -55,
      right: -42,
    },

    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.20)',
      paddingVertical: 7,
      paddingHorizontal: 13,
      borderRadius: 22,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
    },

    backLabel: {
      color: '#fff',
      fontWeight: '700',
    },

    bannerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },

    bannerIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
    },

    bannerTitle: {
      color: '#fff',
      fontWeight: '900',
      letterSpacing: -0.5,
    },

    bannerSub: {
      color: 'rgba(255,255,255,0.82)',
      marginTop: 4,
      fontWeight: '600',
    },

    list: {
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 30,
    },

    card: {
      height: 220,
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 18,
      backgroundColor: '#111',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.45 : 0.18,
      shadowRadius: 14,
    },

    cardImg: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },

    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 14,
    },

    starsRow: {
      flexDirection: 'row',
      gap: 2,
      backgroundColor: 'rgba(0,0,0,0.38)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.10)',
    },

    heartBtn: {
      backgroundColor: 'rgba(0,0,0,0.44)',
      padding: 9,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
    },

    heartBtnActive: {
      backgroundColor: 'rgba(225,29,72,0.88)',
      borderColor: 'rgba(255,255,255,0.2)',
    },

    cardBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      padding: 16,
    },

    catBadge: {
      alignSelf: 'flex-start',
      backgroundColor: '#F97613',
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 9,
      marginBottom: 6,
    },

    catBadgeText: {
      color: '#fff',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },

    cardName: {
      color: '#fff',
      fontWeight: '900',
      letterSpacing: -0.35,
    },

    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },

    locationText: {
      color: 'rgba(255,255,255,0.82)',
      fontWeight: '500',
    },

    priceBadge: {
      backgroundColor: 'rgba(249,118,19,0.95)',
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderRadius: 13,
      marginLeft: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
    },

    priceText: {
      color: '#fff',
      fontWeight: '800',
    },

    loadingWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },

    loadingCard: {
      minWidth: 170,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      paddingHorizontal: 22,
      paddingVertical: 24,
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 12,
      elevation: 4,
    },

    loadingText: {
      color: c.subtext,
      fontWeight: '600',
    },

    footerLoader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 22,
    },
    footerLoaderText: {
      color: c.subtext,
      fontWeight: '600',
    },

    emptyWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 28,
      paddingVertical: 34,
      borderRadius: 28,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      marginHorizontal: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.18 : 0.08,
      shadowRadius: 16,
      elevation: 4,
      overflow: 'hidden',
    },

    emptyGlow: {
      position: 'absolute',
      top: -24,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: isDark
        ? 'rgba(249,118,19,0.08)'
        : 'rgba(249,118,19,0.06)',
    },

    emptyIconWrap: {
      width: 78,
      height: 78,
      borderRadius: 24,
      backgroundColor: isDark
        ? 'rgba(249,118,19,0.15)'
        : 'rgba(249,118,19,0.10)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 2,
    },

    emptyTitle: {
      color: c.text,
      textAlign: 'center',
      fontWeight: '800',
      lineHeight: 26,
    },

    emptyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#F97613',
      paddingVertical: 11,
      paddingHorizontal: 22,
      borderRadius: 22,
      marginTop: 8,
      shadowColor: '#F97613',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.24,
      shadowRadius: 12,
      elevation: 4,
    },

    emptyBtnText: {
      color: '#fff',
      fontWeight: '800',
    },
  });

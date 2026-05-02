import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useAnimatedPlaceholder } from '../../src/hooks/useAnimatedPlaceholder';
import { useEventos } from '../../src/hooks/useEventos';

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

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!refreshing) return null;

  return (
    <View style={rl.container}>
      <Animated.View
        style={[
          rl.iconWrap,
          {
            transform: [{ rotate: spin }, { scale: pulseAnim }],
          },
        ]}
      >
        <View
          style={[
            rl.iconBg,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EDEDED',
            },
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
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
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

const EventCard = React.memo(({ item, colors, fonts, onPress, t, isDark }: any) => {
  const s = makeStyles(colors, fonts, isDark);
  const catInfo = CATEGORIAS.find((c) => c.value === item.categoria);

  return (
    <Pressable
      style={({ pressed }) => [
        s.card,
        {
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.975 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      <View style={s.cardImgWrapper}>
        <Image source={{ uri: item.imagen }} style={s.cardImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.52)']}
          style={StyleSheet.absoluteFillObject}
        />

        {catInfo && (
          <View style={[s.catImgBadge, { backgroundColor: catInfo.color }]}>
            <MaterialCommunityIcons name={catInfo.icon as any} size={12} color="#fff" />
            <Text style={s.catImgBadgeText}>
              {SUB_KEYS[item.sub] ? t(SUB_KEYS[item.sub]) : item.sub}
            </Text>
          </View>
        )}
      </View>

      <View style={s.cardContent}>
        <Text style={[s.eventTitle, { fontSize: fonts.base }]} numberOfLines={2}>
          {item.titulo}
        </Text>

        <View style={s.cardMetaRow}>
          <View style={s.cardMeta}>
            <Ionicons name="calendar-outline" size={13} color={colors.subtext} />
            <Text style={[s.infoText, { fontSize: fonts.xs }]} numberOfLines={1}>
              {item.fecha}
            </Text>
          </View>

          <View style={s.cardMeta}>
            <Ionicons name="location-outline" size={13} color={colors.subtext} />
            <Text style={[s.infoText, { fontSize: fonts.xs }]} numberOfLines={1}>
              {item.lugar}
            </Text>
          </View>
        </View>
      </View>

      <View style={s.chevronWrap}>
        <Ionicons name="chevron-forward" size={17} color={colors.subtext} />
      </View>
    </Pressable>
  );
});

EventCard.displayName = 'EventCard';

export default function EventosScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('Todas');
  const [refreshing, setRefreshing] = useState(false);

  // Radio 10 km · máx 40 eventos. Con búsqueda activa el hook consulta toda la BD.
  const { data: eventos, refresh: refreshEventos } = useEventos(
    undefined,
    search,
    { radio_km: 10, limite: 40 },
  );

  // Animated rotating placeholder hints
  const searchHints = useMemo(
    () => [
      `${t('search')} ${t('cat_deporte')}...`,
      `${t('search')} ${t('cat_cultural')}...`,
      `${t('search')} ${t('cat_sociales')}...`,
    ],
    [t]
  );
  const { index: hintIdx, opacity: hintOpacity } = useAnimatedPlaceholder(searchHints.length);

  const bannerAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const featuredAnim = useRef(new Animated.Value(0)).current;
  const listTitleAnim = useRef(new Animated.Value(0)).current;
  const emptyAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(bannerAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(categoryAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(featuredAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(listTitleAnim, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bannerAnim, categoryAnim, featuredAnim, listTitleAnim]);

  useEffect(() => {
    emptyAnim.setValue(0);
    Animated.timing(emptyAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [activeCat, search, emptyAnim]);

  // La búsqueda ya la maneja el hook (backend). Aquí solo filtramos por categoría.
  const filteredEvents = useMemo(() => {
    return eventos.filter((event: any) => {
      if (event.especial) return false;
      return activeCat === 'Todas' || event.categoria === activeCat;
    });
  }, [eventos, activeCat]);

  const searchSuggestions = useMemo(() => {
    if (!search.trim()) return [];

    return eventos
      .filter((e: any) =>
        String(e.titulo || '').toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 5);
  }, [eventos, search]);

  const limpiarSearch = () => setSearch('');

  const fetchData = useCallback(async () => {
    await refreshEventos();
  }, [refreshEventos]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchData(),
      new Promise((r) => setTimeout(r, 1000)),
    ]);
    setRefreshing(false);
  }, [fetchData]);

  const irAlDetalle = (item: any) => {
    router.push({
      pathname: '/(stack)/detalleEvento',
      params: { evento: JSON.stringify(item) },
    });
  };

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

  const categoryAnimatedStyle = {
    opacity: categoryAnim,
    transform: [
      {
        translateY: categoryAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const featuredAnimatedStyle = {
    opacity: featuredAnim,
    transform: [
      {
        translateY: featuredAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [22, 0],
        }),
      },
    ],
  };

  const listTitleAnimatedStyle = {
    opacity: listTitleAnim,
    transform: [
      {
        translateY: listTitleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

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
    <View style={s.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <FlatList
        data={eventos.filter((e: any) => !e.especial)}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <EventCard
            item={item}
            colors={colors}
            fonts={fonts}
            t={t}
            isDark={isDark}
            onPress={() => irAlDetalle(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={['transparent']}
            progressBackgroundColor="transparent"
          />
        }
        ListEmptyComponent={
          <Animated.View style={[s.emptyWrap, emptyAnimatedStyle]}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={42} color={isDark ? '#cbd5e1' : '#cbd5e1'} />
            </View>
            <Text style={[s.emptyTitle, { fontSize: fonts.base }]}>
              {t('events_no_results')}
            </Text>
            <Text style={[s.emptySub, { fontSize: fonts.sm }]}>
              {t('events_empty_hint', {
                defaultValue: 'Prueba con otra categoría o busca otro evento.',
              })}
            </Text>
          </Animated.View>
        }
        ListHeaderComponent={
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
                    <Ionicons name="calendar" size={22} color="#E96928" />
                  </View>

                  <View style={s.bannerTextWrap}>
                    <Text style={[s.bannerTitle, { fontSize: fonts.xl }]}>
                      {t('tab_events')}
                    </Text>
                    <Text style={[s.bannerSub, { fontSize: fonts.sm }]}>
                      {t('Eve')}
                    </Text>
                  </View>
                </View>

                <View style={s.searchArea}>
                  <View style={s.floatingSearch}>
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                      placeholder=""
                      placeholderTextColor="transparent"
                      style={[s.searchInput, { fontSize: fonts.base }]}
                      value={search}
                      onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                      <Pressable
                        onPress={limpiarSearch}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                          transform: [{ scale: pressed ? 0.96 : 1 }],
                        })}
                      >
                        <Ionicons name="close-circle" size={20} color="#94a3b8" />
                      </Pressable>
                    )}
                    {/* Animated rotating placeholder — absolute inside floatingSearch */}
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
                            color: '#94a3b8',
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

                  {searchSuggestions.length > 0 && (
                    <View style={s.searchResults}>
                      <Text style={[s.resultsTitle, { fontSize: fonts.sm }]}>
                        {t('search')}
                      </Text>

                      {searchSuggestions.map((item: any) => (
                        <Pressable
                          key={item.id}
                          style={({ pressed }) => [
                            s.searchItem,
                            {
                              opacity: pressed ? 0.88 : 1,
                              transform: [{ scale: pressed ? 0.98 : 1 }],
                            },
                          ]}
                          onPress={() => {
                            setSearch('');
                            irAlDetalle(item);
                          }}
                        >
                          <View style={s.searchItemIconWrap}>
                            <MaterialCommunityIcons
                              name="calendar-star"
                              size={16}
                              color="#E96928"
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[s.searchItemText, { fontSize: fonts.sm }]}
                              numberOfLines={1}
                            >
                              {item.titulo}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </LinearGradient>
            </Animated.View>

            {/* ── Chips de categoría ─────────────────────── */}
            <Animated.View style={categoryAnimatedStyle}>
              <View style={{ marginTop: 18, marginBottom: 10 }}>
                <View style={s.sectionHeader}>
                  <View style={s.sectionDot} />
                  <Text style={[s.sectionTitle, { fontSize: fonts.lg }]}>
                    {t('categories')}
                  </Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.chipScroll}
              >
                <Pressable
                  style={({ pressed }) => [
                    s.chip,
                    activeCat === 'Todas' && { backgroundColor: '#E96928', borderColor: '#E96928' },
                    { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                  ]}
                  onPress={() => setActiveCat('Todas')}
                >
                  <Ionicons
                    name="apps-outline"
                    size={15}
                    color={activeCat === 'Todas' ? '#fff' : colors.subtext}
                  />
                  <Text style={[s.chipText, { fontSize: fonts.xs }, activeCat === 'Todas' && s.chipTextActive]}>
                    {t('all')}
                  </Text>
                </Pressable>

                {CATEGORIAS.map((cat) => {
                  const activa = activeCat === cat.value;
                  return (
                    <Pressable
                      key={cat.id}
                      style={({ pressed }) => [
                        s.chip,
                        activa && { backgroundColor: cat.color, borderColor: cat.color },
                        { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                      ]}
                      onPress={() => setActiveCat(cat.value)}
                    >
                      <MaterialCommunityIcons
                        name={cat.icon as any}
                        size={15}
                        color={activa ? '#fff' : colors.subtext}
                      />
                      <Text style={[s.chipText, { fontSize: fonts.xs }, activa && s.chipTextActive]}>
                        {t(cat.labelKey)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Animated.View>

            {/* ── Scroll horizontal de eventos ─────────────── */}
            <Animated.View style={featuredAnimatedStyle}>
              <View style={s.hSection}>
                <View style={[s.sectionHeader, { paddingHorizontal: 20 }]}>
                  <View style={s.sectionDot} />
                  <Text style={[s.sectionTitle, { fontSize: fonts.lg }]}>
                    {activeCat === 'Todas'
                      ? t('tab_events')
                      : t(CATEGORIAS.find((c) => c.value === activeCat)?.labelKey ?? '')}
                  </Text>
                  <View style={s.countBadge}>
                    <Text style={[s.countText, { fontSize: fonts.xs }]}>
                      {filteredEvents.filter((e: any) => !e.especial).length}
                    </Text>
                  </View>
                </View>

                {filteredEvents.filter((e: any) => !e.especial).length === 0 ? (
                  <Text style={{ paddingHorizontal: 20, color: colors.subtext, fontSize: fonts.sm, marginBottom: 8 }}>
                    {t('no_results')}
                  </Text>
                ) : (
                  <FlatList
                    horizontal
                    data={filteredEvents.filter((e: any) => !e.especial)}
                    keyExtractor={(item: any) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.hScroll}
                    renderItem={({ item }: any) => {
                      const catInfo = CATEGORIAS.find((c) => c.value === item.categoria);
                      return (
                        <Pressable
                          onPress={() => irAlDetalle(item)}
                          style={({ pressed }) => [
                            s.hCard,
                            { opacity: pressed ? 0.93 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                          ]}
                        >
                          <Image source={{ uri: item.imagen }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.75)']}
                            style={StyleSheet.absoluteFillObject}
                          />
                          <View style={s.hCardInfo}>
                            {catInfo && (
                              <View style={[s.hCardTag, { backgroundColor: catInfo.color + 'CC' }]}>
                                <Text style={s.hCardTagText}>{t(catInfo.labelKey)}</Text>
                              </View>
                            )}
                            <Text style={s.hCardName} numberOfLines={2}>{item.titulo}</Text>
                            <View style={s.hCardLocRow}>
                              <Ionicons name="calendar-outline" size={10} color="rgba(255,255,255,0.85)" />
                              <Text style={s.hCardLoc} numberOfLines={1}>{item.fecha}</Text>
                            </View>
                          </View>
                        </Pressable>
                      );
                    }}
                  />
                )}
              </View>
            </Animated.View>

            {/* ── "Ver más" header ─────────────────────────── */}
            <Animated.View style={listTitleAnimatedStyle}>
              <View style={s.verMasRow}>
                <View style={s.sectionDot} />
                <Text style={[s.sectionTitle, { fontSize: fonts.lg }]}>
                  {t('ver_mas', { defaultValue: 'Ver más' })}
                </Text>
                <View style={s.countBadge}>
                  <Text style={[s.countText, { fontSize: fonts.xs }]}>
                    {eventos.filter((e: any) => !e.especial).length}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        }
      />

    </View>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },

    listContent: {
      paddingBottom: 28,
    },

    banner: {
      paddingHorizontal: 22,
      paddingTop: 30,
      paddingBottom: 26,
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

    floatingSearch: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 18,
      paddingHorizontal: 16,
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

    resultsTitle: {
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
    },

    // ── Chips de categoría ──────────────────────────────
    chipScroll: {
      paddingHorizontal: 20,
      paddingRight: 28,
      paddingBottom: 6,
      gap: 8,
      flexDirection: 'row',
    },

    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 50,
      backgroundColor: c.card,
      borderWidth: 1.5,
      borderColor: c.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.16 : 0.06,
      shadowRadius: 3,
    },

    chipText: {
      fontWeight: '700',
      color: c.text,
    },

    chipTextActive: {
      color: '#fff',
    },

    // ── Sección scroll horizontal ────────────────────────
    hSection: {
      marginBottom: 6,
      marginTop: 6,
    },

    hScroll: {
      paddingHorizontal: 20,
      paddingRight: 28,
      gap: 12,
      paddingBottom: 4,
    },

    hCard: {
      width: 152,
      height: 212,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.22 : 0.14,
      shadowRadius: 8,
    },

    hCardInfo: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 12,
    },

    hCardTag: {
      alignSelf: 'flex-start',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
      marginBottom: 5,
    },

    hCardTagText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '700',
    },

    hCardName: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 13,
      letterSpacing: -0.2,
      marginBottom: 4,
    },

    hCardLocRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },

    hCardLoc: {
      color: 'rgba(255,255,255,0.82)',
      fontSize: 11,
      flex: 1,
    },

    // ── "Ver más" header ─────────────────────────────────
    verMasRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 20,
      marginBottom: 14,
      marginTop: 12,
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

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 20,
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

    featuredSection: {
      marginTop: 14,
      marginBottom: 2,
    },

    mainEventCard: {
      marginHorizontal: 20,
      marginBottom: 10,
      borderRadius: 26,
      overflow: 'hidden',
      backgroundColor: '#000',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
    },

    mainEventImage: {
      width: '100%',
      height: 270,
    },

    worldBadge: {
      position: 'absolute',
      top: 14,
      left: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#E96928',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },

    worldBadgeText: {
      color: '#fff',
      fontWeight: '800',
    },

    holdHint: {
      position: 'absolute',
      top: 14,
      right: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0,0,0,0.42)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },

    holdHintText: {
      color: 'rgba(255,255,255,0.86)',
      fontWeight: '500',
    },

    mainEventOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 18,
    },

    mainEventTitle: {
      color: '#fff',
      fontWeight: '900',
      marginBottom: 10,
      letterSpacing: -0.4,
    },

    mainEventMeta: {
      flexDirection: 'row',
      gap: 16,
      flexWrap: 'wrap',
    },

    mainEventMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      maxWidth: '100%',
    },

    mainEventSub: {
      color: 'rgba(255,255,255,0.86)',
      fontWeight: '500',
    },


    card: {
      backgroundColor: c.card,
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 22,
      overflow: 'hidden',
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: c.border,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.18 : 0.06,
      shadowRadius: 6,
    },

    cardImgWrapper: {
      width: 112,
      height: 112,
    },

    cardImage: {
      width: '100%',
      height: '100%',
    },

    catImgBadge: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },

    catImgBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '800',
    },

    cardContent: {
      flex: 1,
      paddingHorizontal: 13,
      paddingVertical: 12,
      justifyContent: 'center',
      gap: 8,
    },

    eventTitle: {
      fontWeight: '800',
      color: c.text,
      lineHeight: 22,
    },

    cardMetaRow: {
      gap: 5,
    },

    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    infoText: {
      color: c.subtext,
      fontWeight: '500',
      flexShrink: 1,
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
      marginTop: 34,
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import {
  Animated, FlatList, Image, Platform, Pressable,
  StatusBar, StyleSheet, Text, View, Alert,
} from 'react-native';
import { useFavoritos } from '../../src/context/FavoritosContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const da = StyleSheet.create({
  wrapper:  { width: 90, marginHorizontal: 16, marginVertical: 10, borderRadius: 20, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inner:    { alignItems: 'center', gap: 4 },
  label:    { color: '#fff', fontSize: 11, fontWeight: '700' },
});

function SwipeableCard({
  item, colors, fonts, onDelete, onPress,
}: {
  item: any; colors: any; fonts: any;
  onDelete: () => void; onPress: () => void;
}) {
  const { t } = useTranslation();
  const swipeRef  = useRef<Swipeable>(null);
  const isSwiping = useRef(false);
  const s = makeStyles(colors, fonts);

  const confirmarEliminar = () => {
    Alert.alert(
      t('review_delete'),
      `¿Quieres eliminar "${item.nombre}" de favoritos?`,
      [
        { text: t('profile_cancel'), style: 'cancel', onPress: () => swipeRef.current?.close() },
        { text: t('favorites_delete'), style: 'destructive', onPress: () => { swipeRef.current?.close(); onDelete(); } },
      ]
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({ inputRange: [-90, 0], outputRange: [1, 0.8], extrapolate: 'clamp' });
    const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    return (
      <Animated.View style={[da.wrapper, { opacity, transform: [{ scale }] }]}>
        <Pressable onPress={confirmarEliminar} style={{ flex: 1 }}>
          <LinearGradient colors={['#ff4d4d', '#c0392b']} style={da.gradient}>
            <View style={da.inner}>
              <Ionicons name="trash-outline" size={24} color="#fff" />
              <Text style={da.label}>{t('favorites_delete')}</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={60}
      overshootRight={false}
      friction={2}
      onSwipeableWillOpen={() => { isSwiping.current = true; }}
      onSwipeableClose={() => { setTimeout(() => { isSwiping.current = false; }, 100); }}
    >
      <Pressable
        style={({ pressed }) => [s.card, { opacity: pressed ? 0.92 : 1 }]}
        onPress={() => { if (isSwiping.current) return; onPress(); }}
      >
        <Image source={{ uri: item.imagen }} style={s.image} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} style={s.gradient}>
          <View style={s.cardContent}>
            <View style={s.topRow}>
              <View style={s.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Ionicons key={star} name={star <= (item.rating ?? 5) ? 'star' : 'star-outline'} size={13} color="#FFD700" />
                ))}
              </View>
              <View style={s.categoryBadge}>
                <Text style={s.categoryText}>{item.categoria}</Text>
              </View>
            </View>
            <View style={s.bottomRow}>
              <View style={s.textInfo}>
                <Text style={s.nombreText} numberOfLines={1}>{item.nombre}</Text>
                <View style={s.locationRow}>
                  <Ionicons name="location" size={13} color="rgba(255,255,255,0.8)" />
                  <Text style={s.locationText} numberOfLines={1}>{item.ubicacion}</Text>
                </View>
              </View>
              <View style={s.priceBadge}>
                <Text style={s.priceText}>{item.costo || '---'}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <View style={s.swipeHint}>
          <Ionicons name="chevron-back-outline" size={14} color="rgba(255,255,255,0.6)" />
        </View>
      </Pressable>
    </Swipeable>
  );
}

export default function FavoritosScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts);
  const { favoritos, toggleFavorito } = useFavoritos();
  const router = useRouter();

  const irAlInicio = () => router.replace('/');

  const handlePress = useCallback((item: any) => {
    if (item.origen === 'detalle') {
      router.push({ pathname: '/(stack)/detalleLugar', params: { lugar: JSON.stringify(item), from: 'favoritos' } });
    } else {
      router.push(`/lugar/${item.id}`);
    }
  }, [router]);

  const Header = () => (
    <View>
      <LinearGradient
        colors={['#E96928', '#c4511a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.banner}
      >
        <View style={s.circle1} />
        <View style={s.circle2} />
        <View style={s.bannerContent}>
          <View style={s.bannerIconWrap}>
            <Ionicons name="heart" size={22} color="#E96928" />
          </View>
          <View>
            <Text style={[s.bannerTitle, { fontSize: fonts['2xl'] }]}>
              {t('tab_favorites')}
            </Text>
            <Text style={[s.bannerSubtitle, { fontSize: fonts.sm }]}>
              {favoritos.length} {favoritos.length === 1 ? t('place_saved_one') : t('place_saved_many')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={s.tipRow}>
        <Ionicons name="information-circle-outline" size={15} color={colors.subtext} />
        <Text style={[s.tipText, { fontSize: fonts.xs }]}>
          {t('swipe_to_delete')}
        </Text>
      </View>
    </View>
  );

  if (favoritos.length === 0) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={s.emptyContainer}>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
          <LinearGradient colors={['#E96928', '#c4511a']} style={s.emptyIconWrap}>
            <Ionicons name="heart-dislike-outline" size={44} color="#fff" />
          </LinearGradient>
          <Text style={[s.emptyTitle, { fontSize: fonts.xl }]}>
            {t('favorites_empty')}
          </Text>
          <Text style={[s.emptyText, { fontSize: fonts.sm }]}>
            {t('fav_empty_sub')}
          </Text>
          <Pressable
            style={({ pressed }) => [s.exploreBtn, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={irAlInicio}
          >
            <Ionicons name="compass-outline" size={18} color="#fff" />
            <Text style={[s.exploreBtnText, { fontSize: fonts.base }]}>
              {t('favorites_explore')}
            </Text>
          </Pressable>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={s.container}>
        <StatusBar barStyle="light-content" />
        <FlatList
          data={favoritos}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={Header}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SwipeableCard
              item={item}
              colors={colors}
              fonts={fonts}
              onDelete={() => toggleFavorito(item)}
              onPress={() => handlePress(item)}
            />
          )}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  banner: {
    paddingHorizontal: 22, paddingTop: Platform.OS === 'ios' ? 20 : 28,
    paddingBottom: 28, overflow: 'hidden',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 4,
  },
  circle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -50 },
  circle2: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30 },
  bannerContent:  { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
  bannerTitle:    { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10 },
  tipText: { color: c.subtext },
  card: { height: 210, marginHorizontal: 16, marginVertical: 8, borderRadius: 22, overflow: 'hidden', backgroundColor: '#000', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
  image:    { width: '100%', height: '100%', position: 'absolute' },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '75%', justifyContent: 'flex-end', padding: 16 },
  cardContent:    { width: '100%' },
  topRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  starsContainer: { flexDirection: 'row', gap: 2 },
  categoryBadge:  { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  categoryText:   { color: '#fff', fontSize: f.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bottomRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  textInfo:     { flex: 1, marginRight: 10 },
  nombreText:   { color: '#fff', fontSize: f.lg, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  locationText: { color: 'rgba(255,255,255,0.75)', fontSize: f.xs },
  priceBadge:   { backgroundColor: '#E96928', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  priceText:    { color: '#fff', fontSize: f.sm, fontWeight: '800' },
  swipeHint:    { position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -10 }] },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: c.background },
  emptyIconWrap:  { width: 90, height: 90, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#E96928', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  emptyTitle:     { fontWeight: '900', color: c.text, marginBottom: 8 },
  emptyText:      { color: c.subtext, textAlign: 'center', lineHeight: f.sm * 1.6, marginBottom: 8 },
  exploreBtn:     { marginTop: 20, backgroundColor: '#E96928', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 30, elevation: 4, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#E96928', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  exploreBtnText: { color: '#fff', fontWeight: '800' },
});
/* ====================== Cuando exista backend reemplazar ===================== */

// import { getFavoritos } from "@/src/api/api";
// const [favoritos, setFavoritos] = useState(FAVORITOS_DATA);

/*
import { useEffect } from "react";

useEffect(() => {

  const cargarFavoritos = async () => {
    try {
      const data = await getFavoritos();
      setFavoritos(data);
    } catch (error) {
      console.log("Usando datos locales");
    }
  };

  cargarFavoritos();

}, []);
*/

/* ============================================================================ */
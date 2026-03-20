import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useFavoritos } from '../../src/context/FavoritosContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

export default function FavoritosScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts);

  const { favoritos, toggleFavorito } = useFavoritos();
  const router = useRouter();

  const irAlInicio = () => router.replace('/');

  const HeaderFavoritos = () => (
    <View style={s.banner}>
      <LinearGradient
        colors={['#E96928', '#ff8e53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.bannerGradient}
      >
        <Text style={s.bannerTitle}>{t('favorites')}</Text>
        <Text style={s.bannerSubtitle}>{t('tab_favorites')}</Text>
      </LinearGradient>
    </View>
  );

  if (favoritos.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <Ionicons name="heart-dislike-outline" size={100} color="#E96928" style={{ opacity: 0.5 }} />
        <Text style={s.emptyTitle}>{t('no_results')}</Text>
        <Text style={s.emptyText}>{t('Fav')}</Text>
        <Pressable
          style={({ pressed }) => [s.exploreBtn, { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
          onPress={irAlInicio}
        >
          <Text style={s.exploreBtnText}>{t('tab_inic')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={favoritos}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={HeaderFavoritos}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [s.card, { opacity: pressed ? 0.9 : 1 }]}
            onPress={() => {
              if (item.origen === 'detalle') {
                router.push({ pathname: '/(stack)/detalleLugar', params: { lugar: JSON.stringify(item), from: 'favoritos' } });
              } else {
                router.push(`/lugar/${item.id}`);
              }
            }}
          >
            <Image source={{ uri: item.imagen }} style={s.image} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={s.gradient}>
              <View style={s.cardContent}>
                <View style={s.topRow}>
                  <View style={s.starsContainer}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Ionicons key={star} name={star <= (item.rating ?? 5) ? 'star' : 'star-outline'} size={14} color="#FFD700" />
                    ))}
                  </View>
                  <Text style={s.categoryBadge}>{item.categoria}</Text>
                </View>
                <View style={s.bottomRow}>
                  <View style={s.textInfo}>
                    <Text style={s.nombreText} numberOfLines={1}>{item.nombre}</Text>
                    <View style={s.locationRow}>
                      <Ionicons name="location" size={14} color="#fff" />
                      <Text style={s.locationText} numberOfLines={1}>{item.ubicacion}</Text>
                    </View>
                  </View>
                  <Text style={s.priceText}>{item.costo || '$ ---'}</Text>
                </View>
              </View>
            </LinearGradient>

            <Pressable style={s.heartBtn} onPress={() => toggleFavorito(item)}>
              <Ionicons name="heart" size={24} color="#ff4d4d" />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },

  banner:        { height: 140, width: '100%', marginBottom: 10 },
  bannerGradient: { flex: 1, justifyContent: 'center', paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingTop: Platform.OS === 'ios' ? 20 : 0 },
  bannerTitle:    { fontSize: f['3xl'], fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  bannerSubtitle: { fontSize: f.sm, color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginTop: 2 },

  card: {
    height: 220, marginHorizontal: 16, marginVertical: 10,
    borderRadius: 20, overflow: 'hidden', backgroundColor: '#000',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
  },
  image:    { width: '100%', height: '100%', position: 'absolute' },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '70%', justifyContent: 'flex-end', padding: 15 },

  cardContent:    { width: '100%' },
  topRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  starsContainer: { flexDirection: 'row' },
  categoryBadge:  { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, color: '#fff', fontSize: f.xs, textTransform: 'uppercase', fontWeight: 'bold' },

  bottomRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  textInfo:    { flex: 1, marginRight: 10 },
  nombreText:  { color: '#fff', fontSize: f.lg, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locationText: { color: 'rgba(255,255,255,0.8)', fontSize: f.xs, marginLeft: 4 },
  priceText:   { color: '#fff', fontSize: f.md, fontWeight: '800' },

  heartBtn: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 20 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: c.background },
  emptyTitle:     { fontSize: f.xl, fontWeight: 'bold', marginTop: 20, color: c.text },
  emptyText:      { color: c.subtext, textAlign: 'center', marginTop: 10, lineHeight: f.base * 1.5, fontSize: f.base },
  exploreBtn:     { marginTop: 25, backgroundColor: '#E96928', paddingVertical: 12, paddingHorizontal: 35, borderRadius: 30, elevation: 4 },
  exploreBtnText: { color: '#fff', fontWeight: 'bold', fontSize: f.md },
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
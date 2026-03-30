import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, FlatList, Image, Pressable, RefreshControl,
  StatusBar, StyleSheet, Text, View, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

const RSS_SOURCES = [
  { url: 'https://www.milenio.com/rss',                   label: 'Milenio'      },
  { url: 'https://www.elfinanciero.com.mx/rss/feed.xml',  label: 'El Financiero'},
  { url: 'https://www.infobae.com/rss/mexico.xml',        label: 'Infobae MX'   },
];

async function fetchRSS(url: string, label: string): Promise<any[]> {
  try {
    const res  = await fetch(url, { headers: { 'User-Agent': 'GuadalupeGO/1.0' } });
    const text = await res.text();
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const block = match[1];
      const get = (tag: string) => {
        const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        return m ? (m[1] ?? m[2] ?? '').trim() : '';
      };
      const getAttr = (tag: string, attr: string) => {
        const m = block.match(new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`));
        return m ? m[1] : '';
      };
      const title       = get('title');
      const description = get('description').replace(/<[^>]+>/g, '').trim();
      const pubDate     = get('pubDate');
      const link        = get('link');
      const image       =
        getAttr('enclosure', 'url') ||
        getAttr('media:content', 'url') ||
        getAttr('media:thumbnail', 'url') ||
        (block.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i)?.[0] ?? '');
      if (title) items.push({ title, description, pubDate, link, image, source: label });
    }
    return items;
  } catch {
    return [];
  }
}

function detectarCategoria(titulo: string): { label: string; color: string; bg: string } {
  const t = titulo.toLowerCase();
  if (t.includes('futbol') || t.includes('liga') || t.includes('mundial') || t.includes('deporte'))
    return { label: 'Deportes', color: '#E96928', bg: 'rgba(233,105,40,0.12)' };
  if (t.includes('turismo') || t.includes('festival') || t.includes('cultura') || t.includes('guadalupe'))
    return { label: 'Local', color: '#10B981', bg: 'rgba(16,185,129,0.12)' };
  if (t.includes('trafico') || t.includes('avenida') || t.includes('vial'))
    return { label: 'Vialidad', color: '#4A90E2', bg: 'rgba(74,144,226,0.12)' };
  if (t.includes('salud') || t.includes('hospital') || t.includes('medic'))
    return { label: 'Salud', color: '#9C27B0', bg: 'rgba(156,39,176,0.12)' };
  return { label: 'Noticias', color: '#64748B', bg: 'rgba(100,116,139,0.12)' };
}

function RefreshLogo({ refreshing }: { refreshing: boolean }) {
  const spinAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (refreshing) {
      const spin = Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 900, useNativeDriver: true })
      );
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 450, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 450, useNativeDriver: true }),
        ])
      );
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

const PAGE_SIZE = 8;

export default function NoticiasScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);

  const [todas,      setTodas]      = useState<any[]>([]);
  const [visible,    setVisible]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore,setLoadingMore]= useState(false);
  const [page,       setPage]       = useState(1);
  const [agotado,    setAgotado]    = useState(false);

  const cargarNoticias = useCallback(async () => {
    try {
      const resultados = await Promise.all(
        RSS_SOURCES.map(src => fetchRSS(src.url, src.label))
      );
      const mezcladas = resultados
        .flat()
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setTodas(mezcladas);
      setVisible(mezcladas.slice(0, PAGE_SIZE));
      setPage(1);
      setAgotado(mezcladas.length <= PAGE_SIZE);
    } catch {
      setTodas([]); setVisible([]);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { cargarNoticias(); }, [cargarNoticias]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargarNoticias();
  }, [cargarNoticias]);

  const cargarMas = useCallback(() => {
    if (loadingMore || agotado) return;
    setLoadingMore(true);
    const nextPage  = page + 1;
    const nextItems = todas.slice(0, nextPage * PAGE_SIZE);
    setTimeout(() => {
      setVisible(nextItems);
      setPage(nextPage);
      setAgotado(nextItems.length >= todas.length);
      setLoadingMore(false);
    }, 600);
  }, [loadingMore, agotado, page, todas]);

  const irAlDetalle = (item: any) => {
    router.push({
      pathname: '/(stack)/detalleNoticia',
      params: {
        title:       item.title,
        description: item.description,
        image:       item.image,
        content:     item.description,
        url:         item.link,
        date:        item.pubDate,
      },
    });
  };

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#E96928" />
        <ActivityIndicator size="large" color="#E96928" />
        <Text style={[s.loadingText, { fontSize: fonts.sm }]}>
          {t('news_loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />

      <FlatList
        data={visible}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        onEndReached={cargarMas}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={['transparent']}
            progressBackgroundColor="transparent"
          />
        }
        ListFooterComponent={() =>
          loadingMore ? (
            <View style={s.footerLoader}>
              <ActivityIndicator size="small" color="#E96928" />
              <Text style={[s.footerText, { fontSize: fonts.xs }]}>
                {t('news_loading_more')}
              </Text>
            </View>
          ) : agotado && visible.length > 0 ? (
            <View style={s.footerEnd}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.subtext} />
              <Text style={[s.footerText, { fontSize: fonts.xs }]}>
                {t('news_up_to_date')}
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View>
            <RefreshLogo refreshing={refreshing} />

            {/* ── Banner ── */}
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
                  <Ionicons name="newspaper" size={22} color="#E96928" />
                </View>
                <View>
                  <Text style={[s.bannerTitle, { fontSize: fonts.xl }]}>{t('NO')}</Text>
                  <Text style={[s.bannerSub, { fontSize: fonts.sm }]}>{t('Not')}</Text>
                </View>
              </View>

              <View style={s.liveRow}>
                <View style={s.liveDot} />
                <Text style={[s.liveText, { fontSize: fonts.xs }]}>
                  {visible.length} {t('news_count')} · {t('news_updated')}
                </Text>
              </View>
            </LinearGradient>

            {/* ── Sección label ── */}
            <View style={s.sectionHeader}>
              <View style={s.sectionDot} />
              <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>
                {t('news_latest')}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const cat = detectarCategoria(item.title);
          const fechaFormateada = item.pubDate
            ? new Date(item.pubDate).toLocaleDateString('es-MX', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })
            : '';

          if (index === 0) {
            return (
              <Pressable
                style={({ pressed }) => [s.featuredCard, { opacity: pressed ? 0.93 : 1 }]}
                onPress={() => irAlDetalle(item)}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={s.featuredImage} />
                ) : (
                  <LinearGradient colors={['#E96928', '#c4511a']} style={s.featuredImage}>
                    <Ionicons name="newspaper-outline" size={48} color="rgba(255,255,255,0.5)" />
                  </LinearGradient>
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={s.featuredOverlay}>
                  <View style={[s.catBadge, { backgroundColor: cat.color }]}>
                    <Text style={[s.catBadgeText, { fontSize: fonts.xs }]}>{cat.label}</Text>
                  </View>
                  <Text style={[s.featuredTitle, { fontSize: fonts.lg }]} numberOfLines={3}>
                    {item.title}
                  </Text>
                  <View style={s.featuredMeta}>
                    <View style={s.metaItem}>
                      <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.8)" />
                      <Text style={[s.metaText, { fontSize: fonts.xs }]}>{fechaFormateada}</Text>
                    </View>
                    <View style={s.metaItem}>
                      <Ionicons name="globe-outline" size={13} color="rgba(255,255,255,0.8)" />
                      <Text style={[s.metaText, { fontSize: fonts.xs }]}>{item.source}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              style={({ pressed }) => [s.newsCard, { opacity: pressed ? 0.93 : 1 }]}
              onPress={() => irAlDetalle(item)}
            >
              <View style={s.cardImgWrap}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={s.cardImage} />
                ) : (
                  <LinearGradient colors={['#E96928', '#c4511a']} style={s.cardImage}>
                    <Ionicons name="newspaper-outline" size={28} color="rgba(255,255,255,0.6)" />
                  </LinearGradient>
                )}
                <View style={[s.catImgBadge, { backgroundColor: cat.color }]}>
                  <Text style={[s.catImgBadgeText, { fontSize: 9 }]}>{cat.label}</Text>
                </View>
              </View>

              <View style={s.cardContent}>
                <Text style={[s.newsTitle, { fontSize: fonts.sm }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[s.newsDesc, { fontSize: fonts.xs }]} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={s.cardFooter}>
                  <View style={s.metaItem}>
                    <Ionicons name="time-outline" size={11} color={colors.subtext} />
                    <Text style={[s.cardDate, { fontSize: fonts.xs }]}>{fechaFormateada}</Text>
                  </View>
                  <View style={s.readMoreChip}>
                    <Text style={[s.readMoreChipText, { fontSize: 10 }]}>
                      {t('news_read_full')}
                    </Text>
                    <Ionicons name="arrow-forward" size={10} color="#E96928" />
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  container:   { flex: 1, backgroundColor: c.background },
  loadingText: { color: c.subtext, marginTop: 12 },

  banner: {
    paddingHorizontal: 22, paddingTop: 28, paddingBottom: 24,
    overflow: 'hidden',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  circle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -50 },
  circle2: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30 },
  bannerContent:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  bannerIconWrap: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
  bannerTitle: { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
  bannerSub:   { color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  liveRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  liveText: { color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginTop: 20, marginBottom: 12 },
  sectionDot:    { width: 4, height: 18, borderRadius: 2, backgroundColor: '#E96928' },
  sectionTitle:  { fontWeight: '800', color: c.text },

  featuredCard: { marginHorizontal: 20, marginBottom: 12, height: 240, borderRadius: 24, overflow: 'hidden', backgroundColor: '#000', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, justifyContent: 'center', alignItems: 'center' },
  featuredImage:   { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18 },
  catBadge:        { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 8 },
  catBadgeText:    { color: '#fff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  featuredTitle:   { color: '#fff', fontWeight: '900', marginBottom: 10, letterSpacing: -0.3 },
  featuredMeta:    { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  metaItem:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:        { color: 'rgba(255,255,255,0.8)', fontWeight: '500' },

  newsCard: { backgroundColor: c.card, marginHorizontal: 20, marginBottom: 12, borderRadius: 20, overflow: 'hidden', flexDirection: 'row', borderWidth: 1, borderColor: c.border, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.07, shadowRadius: 5 },
  cardImgWrap:     { width: 105, height: 110 },
  cardImage:       { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  catImgBadge:     { position: 'absolute', bottom: 6, left: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  catImgBadgeText: { color: '#fff', fontWeight: '700' },
  cardContent:     { flex: 1, padding: 12, justifyContent: 'space-between' },
  newsTitle:       { fontWeight: '800', color: c.text, marginBottom: 4 },
  newsDesc:        { color: c.subtext, lineHeight: f.xs * 1.6 },
  cardFooter:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cardDate:        { color: c.subtext },
  readMoreChip:    { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: isDark ? 'rgba(233,105,40,0.15)' : 'rgba(233,105,40,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  readMoreChipText:{ color: '#E96928', fontWeight: '700' },

  footerLoader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 20 },
  footerEnd:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 20 },
  footerText:   { color: c.subtext, fontWeight: '600' },
});
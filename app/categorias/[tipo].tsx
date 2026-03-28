import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Image, Platform, Pressable, ScrollView,
  StatusBar, StyleSheet, Text, View,
} from 'react-native';
import { useFavoritos } from '../../src/context/FavoritosContext';
import { useTheme } from '../../src/context/ThemeContext';
import { LUGARES } from '../../src/data/lugares';

const CATEGORIA_TRANSLATION_KEY: Record<string, string> = {
  'explorar':              'cat_explore',
  'Fin de semana':         'cat_weekend',
  'Naturaleza & Aventura': 'cat_nature',
  'pueblos Magicos':       'cat_pueblos_magicos',
  'tours':                 'cat_tours',
  'cultura':               'cat_culture',
  'compras':               'cat_shopping',
  'servicios':             'cat_services',
};

const CATEGORIA_META: Record<string, { color: string; icon: string }> = {
  'explorar':              { color: '#E96928', icon: 'map-outline'        },
  'Fin de semana':         { color: '#9C27B0', icon: 'sunny-outline'      },
  'Naturaleza & Aventura': { color: '#4CAF50', icon: 'leaf-outline'       },
  'pueblos Magicos':       { color: '#F5BE41', icon: 'sparkles-outline'   },
  'tours':                 { color: '#4A90E2', icon: 'compass-outline'    },
  'cultura':               { color: '#E53935', icon: 'library-outline'    },
  'compras':               { color: '#10B981', icon: 'bag-handle-outline' },
  'servicios':             { color: '#64748B', icon: 'construct-outline'  },
};

// ── Costos/horarios que vienen como texto fijo en la data
const COSTOS_GRATIS   = ['Gratis', 'Gratis (entrada)'];

export default function Categoria() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);

  const { tipo } = useLocalSearchParams();
  const router = useRouter();
  const { toggleFavorito, esFavorito } = useFavoritos();

  const tipoStr        = Array.isArray(tipo) ? tipo[0] : tipo ?? '';
  const translationKey = CATEGORIA_TRANSLATION_KEY[tipoStr];
  const titulo         = translationKey ? t(translationKey) : tipoStr;
  const meta           = CATEGORIA_META[tipoStr] ?? { color: '#E96928', icon: 'grid-outline' };

  const lugares = LUGARES.filter((item) => item.categoria === tipoStr);

  // ── Helper costo ───────────────────────────────────────
  const getCostoTexto = (costo: string) =>
    !costo || COSTOS_GRATIS.includes(costo) ? t('detail_free') : costo;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ══ BANNER ══════════════════════════════════════ */}
      <LinearGradient
        colors={['#E96928', '#c4511a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.banner}
      >
        <View style={s.circle1} />
        <View style={s.circle2} />

        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>

        <View style={s.bannerContent}>
          <View style={[s.bannerIconWrap, { backgroundColor: meta.color + '22' }]}>
            <Ionicons name={meta.icon as any} size={26} color="#fff" />
          </View>
          <View>
            <Text style={[s.bannerTitle, { fontSize: fonts['2xl'] }]}>{titulo}</Text>
            <Text style={[s.bannerSub, { fontSize: fonts.xs }]}>
              {lugares.length} {lugares.length === 1
                ? t('place_saved_one')
                : t('place_saved_many')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ══ LISTA ═══════════════════════════════════════ */}
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {lugares.length === 0 ? (
          <View style={s.emptyContainer}>
            <LinearGradient colors={['#E96928', '#c4511a']} style={s.emptyIconWrap}>
              <Ionicons name={meta.icon as any} size={36} color="#fff" />
            </LinearGradient>
            <Text style={[s.emptyTitle, { fontSize: fonts.lg }]}>{t('no_results')}</Text>
            <Text style={[s.emptySub, { fontSize: fonts.sm }]}>
              {t('empty_category')}
            </Text>
            <Pressable
              style={({ pressed }) => [s.emptyBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={16} color="#fff" />
              <Text style={[s.emptyBtnText, { fontSize: fonts.sm }]}>{t('go_back')}</Text>
            </Pressable>
          </View>
        ) : (
          lugares.map((item: any) => {
            const isFav = esFavorito(item.id);
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [s.card, { opacity: pressed ? 0.93 : 1 }]}
                onPress={() => router.push({
                  pathname: '/(stack)/detalleLugar',
                  params: { lugar: JSON.stringify(item), from: 'categorias' },
                })}
              >
                <Image source={{ uri: item.imagen }} style={s.cardImage} />

                <LinearGradient
                  colors={['rgba(0,0,0,0.25)', 'transparent', 'rgba(0,0,0,0.75)']}
                  style={StyleSheet.absoluteFillObject}
                />

                {/* Top: rating + favorito */}
                <View style={s.cardTop}>
                  <View style={s.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={[s.ratingText, { fontSize: fonts.xs }]}>
                      {item.rating ?? '4.8'}
                    </Text>
                  </View>

                  <Pressable
                    style={[s.heartBtn, isFav && { backgroundColor: 'rgba(225,29,72,0.85)' }]}
                    onPress={() => toggleFavorito({ ...item, origen: 'detalle' })}
                  >
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={18}
                      color="#fff"
                    />
                  </Pressable>
                </View>

                {/* Bottom: info */}
                <View style={s.cardBottom}>
                  <View style={[s.catBadge, { backgroundColor: meta.color }]}>
                    <Text style={[s.catBadgeText, { fontSize: 9 }]}>
                      {titulo.toUpperCase()}
                    </Text>
                  </View>

                  <View style={s.cardBottomRow}>
                    <View style={s.cardTextBlock}>
                      <Text style={[s.cardName, { fontSize: fonts.md }]} numberOfLines={1}>
                        {item.nombre}
                      </Text>
                      <View style={s.locationRow}>
                        <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.8)" />
                        <Text style={[s.locationText, { fontSize: fonts.xs }]} numberOfLines={1}>
                          {item.ubicacion}
                        </Text>
                      </View>
                    </View>

                    <View style={s.priceBadge}>
                      <Text style={[s.priceText, { fontSize: fonts.xs }]}>
                        {getCostoTexto(item.costo || item.precio)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Chip "Ver detalle" */}
                <View style={s.viewChip}>
                  <Text style={[s.viewChipText, { fontSize: 10 }]}>
                    {t('see_more')}
                  </Text>
                  <Ionicons name="chevron-forward" size={10} color="rgba(255,255,255,0.9)" />
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  banner: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 28,
    overflow: 'hidden',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  circle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -50,
  },
  circle2: {
    position: 'absolute', width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30,
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8, borderRadius: 12, marginBottom: 18,
  },
  bannerContent:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bannerIconWrap: {
    width: 56, height: 56, borderRadius: 18,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  bannerTitle: { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
  bannerSub:   { color: 'rgba(255,255,255,0.75)', marginTop: 3, fontWeight: '500' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    height: 210, marginBottom: 14,
    borderRadius: 22, overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 7,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22, shadowRadius: 10,
  },
  cardImage: { width: '100%', height: '100%', position: 'absolute' },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 14,
  },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  ratingText: { color: '#fff', fontWeight: '700' },
  heartBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  cardBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 14, gap: 6,
  },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  catBadgeText:  { color: '#fff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardTextBlock: { flex: 1, marginRight: 10 },
  cardName: {
    color: '#fff', fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  locationText: { color: 'rgba(255,255,255,0.8)', flex: 1 },
  priceBadge: {
    backgroundColor: 'rgba(233,105,40,0.85)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  priceText: { color: '#fff', fontWeight: '800' },
  viewChip: {
    position: 'absolute', top: 14, left: '50%',
    transform: [{ translateX: -40 }],
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  viewChipText: { color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIconWrap: {
    width: 90, height: 90, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    shadowColor: '#E96928', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  emptyTitle: { fontWeight: '900', color: c.text, marginBottom: 8 },
  emptySub:   { color: c.subtext, textAlign: 'center', lineHeight: f.sm * 1.6, marginBottom: 24 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#E96928',
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 20, elevation: 4,
    shadowColor: '#E96928', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8,
  },
  emptyBtnText: { color: '#fff', fontWeight: '800' },
});
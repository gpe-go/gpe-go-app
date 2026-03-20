import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
    Image,
    Platform,
    Pressable, ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFavoritos } from '../../src/context/FavoritosContext';
import { useTheme } from '../../src/context/ThemeContext';
import { LUGARES } from '../../src/data/lugares';

// ── Mapa: valor del parámetro URL → clave de traducción ──────────────
const CATEGORIA_TRANSLATION_KEY: Record<string, string> = {
  'explorar':              'cat_explore',
  'Fin de semana':         'cat_weekend',
  'Naturaleza & Aventura': 'cat_nature',
  'pueblos Magicos':       'cat_magic',
  'tours':                 'cat_tours',
  'cultura':               'cat_culture',
  'compras':               'cat_shopping',
  'servicios':             'cat_services',
};

export default function Categoria() {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);

  const { tipo } = useLocalSearchParams();
  const router = useRouter();
  const { toggleFavorito, esFavorito } = useFavoritos();

  const tipoStr = Array.isArray(tipo) ? tipo[0] : tipo ?? '';
  const translationKey = CATEGORIA_TRANSLATION_KEY[tipoStr];
  // Si tiene clave de traducción la usa, si no muestra el valor directo con capitalización
  const tituloTraducido = translationKey ? t(translationKey) : tipoStr;

  const lugares = LUGARES.filter((item) => item.categoria === tipoStr);

  return (
    <View style={s.container}>
      <StatusBar
        barStyle={colors.background === '#0D1117' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        {/* ✅ Título traducido */}
        <Text style={s.title}>{tituloTraducido}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        {lugares.length === 0 && (
          <Text style={s.emptyText}>{t('no_results')}</Text>
        )}

        {lugares.map((item: any) => (
          <Pressable
            key={item.id}
            style={s.card}
            onPress={() => router.push(`/lugar/${item.id}`)}
          >
            <Image source={{ uri: item.imagen }} style={s.image} />
            <View style={s.overlay} />

            <View style={s.topInfo}>
              <View style={s.ratingBox}>
                <Text style={s.stars}>⭐⭐⭐⭐<Text style={{ color: '#666' }}>⭐</Text></Text>
              </View>

              <TouchableOpacity
                onPress={() => toggleFavorito(item)}
                style={s.heartBtn}
              >
                <Ionicons
                  name={esFavorito(item.id) ? 'heart' : 'heart-outline'}
                  size={26}
                  color={esFavorito(item.id) ? '#e63946' : '#fff'}
                />
              </TouchableOpacity>
            </View>

            <View style={s.bottomInfo}>
              <View>
                <Text style={s.nombreText}>{item.nombre}</Text>
                <Text style={s.categoriaText}>{tituloTraducido}</Text>
              </View>
              <Text style={s.precioText}>{item.costo || item.precio}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },

  header: {
    paddingTop: Platform.OS === 'ios' ? 55 : 40,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    backgroundColor: c.background,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  backButton: { padding: 5 },
  title: { fontSize: f.lg, fontWeight: '600', textTransform: 'capitalize', color: c.text },

  scrollContent: { padding: 15 },

  emptyText: {
    textAlign: 'center', marginTop: 40,
    color: c.subtext, fontSize: f.base,
  },

  card: {
    height: 200, marginBottom: 15, borderRadius: 20,
    overflow: 'hidden', backgroundColor: '#000', elevation: 4,
  },
  image:   { width: '100%', height: '100%', position: 'absolute', opacity: 0.8 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' },

  topInfo:   { flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  ratingBox: { flexDirection: 'row' },
  stars:     { fontSize: f.sm },
  heartBtn:  { padding: 5 },

  bottomInfo: {
    position: 'absolute', bottom: 0, width: '100%',
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', padding: 15,
  },
  nombreText:    { color: '#fff', fontSize: f.md, fontWeight: 'bold' },
  categoriaText: { color: '#ccc', fontSize: f.xs },
  precioText:    { color: '#fff', fontSize: f.md, fontWeight: 'bold' },
});
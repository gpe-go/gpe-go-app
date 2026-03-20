import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LUGARES } from '../../src/data/lugares';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritos } from '../../src/context/FavoritosContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

export default function LugarDetalle() {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { toggleFavorito, esFavorito } = useFavoritos();

  const lugar = LUGARES.find((item: any) => item.id === id);

  if (!lugar) {
    return (
      <View style={s.container}>
        <Text style={s.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView>
        {/* Imagen de Cabecera */}
        <View>
          <Image source={{ uri: lugar.imagen }} style={s.mainImage} />

          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={s.topHeart}
            onPress={() => toggleFavorito({ ...lugar, origen: 'id' })}
          >
            <Ionicons
              name={esFavorito(lugar.id) ? 'heart' : 'heart-outline'}
              size={28}
              color={esFavorito(lugar.id) ? '#e63946' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Tarjeta flotante */}
        <View style={s.infoWrapper}>
          <View style={s.pinkCard}>
            <Text style={s.pinkTitle}>{lugar.nombre}</Text>
            <Text style={s.pinkStars}>⭐⭐⭐⭐⭐</Text>
            <Text style={s.pinkPrice}>{lugar.costo}</Text>
          </View>
        </View>

        {/* Detalles */}
        <View style={s.detailsContainer}>
          <View style={s.row}>
            <Text style={s.icon}>🏷️</Text>
            <Text style={s.detailText}>Turismo Nuevo León</Text>
          </View>

          <View style={s.separator} />

          <View style={s.row}>
            <Text style={s.icon}>🕒</Text>
            <Text style={s.detailText}>{t('schedule')}</Text>
          </View>

          <View style={s.row}>
            <Text style={s.icon}>📍</Text>
            <Text style={s.detailText}>{lugar.ubicacion}</Text>
          </View>

          <View style={s.row}>
            <Text style={s.icon}>📅</Text>
            <Text style={s.detailText}>{t('date')}</Text>
          </View>

          <View style={s.feedbackSection}>
            <Text style={s.feedbackTitle}>{t('popular')}</Text>
            <Text style={s.bigStars}>⭐⭐⭐⭐⭐</Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón flotante */}
      <View style={s.footer}>
        <TouchableOpacity style={s.buyBtn}>
          <Text style={s.buyBtnText}>{t('confirm')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  container:   { flex: 1, backgroundColor: c.background },
  loadingText: { color: c.text, fontSize: f.base, textAlign: 'center', marginTop: 40 },

  mainImage: { width: '100%', height: 320 },

  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 25, padding: 8,
  },
  topHeart: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 25, padding: 8,
  },

  infoWrapper: { alignItems: 'center', marginTop: -50 },
  pinkCard: {
    backgroundColor: '#E96928',
    width: '85%', padding: 20, borderRadius: 15,
    alignItems: 'center', elevation: 8,
  },
  pinkTitle: { color: '#fff', fontSize: f.xl, fontWeight: 'bold', textAlign: 'center' },
  pinkStars: { fontSize: f.md, marginVertical: 5 },
  pinkPrice: { color: '#fff', fontSize: f.xl, fontWeight: '800' },

  detailsContainer: { padding: 25, paddingBottom: 100 },
  row:      { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  icon:     { fontSize: 20, marginRight: 15 },
  detailText: { fontSize: f.base, color: c.text },           // ← reactivo
  separator:  { height: 1, backgroundColor: c.border, marginBottom: 20 }, // ← reactivo

  feedbackSection: { alignItems: 'center', marginTop: 20 },
  feedbackTitle:   { fontSize: f.base, color: c.subtext, marginBottom: 10 },
  bigStars:        { fontSize: 30, opacity: 0.2 },

  footer: { position: 'absolute', bottom: 30, right: 20 },
  buyBtn: {
    backgroundColor: '#cddc39',
    paddingVertical: 15, paddingHorizontal: 35, borderRadius: 25,
  },
  buyBtnText: { fontWeight: 'bold', fontSize: f.md },
});
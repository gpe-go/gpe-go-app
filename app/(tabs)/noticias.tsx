import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNoticias } from '@/src/api/api';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

export default function NoticiasScreen() {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);

  const [noticias, setNoticias] = useState<any[]>([]);

  useEffect(() => {
    const cargarNoticias = async () => {
      const data = await getNoticias();
      setNoticias(data);
    };
    cargarNoticias();
  }, []);

  const getBadgeColor = (cat: string) => {
    switch (cat) {
      case 'Deportes': return '#FFEDE5';
      case 'Turismo':  return '#E5F6FF';
      default:         return colors.cardAlt;
    }
  };

  const getTextColor = (cat: string) => {
    switch (cat) {
      case 'Deportes': return '#E96928';
      case 'Turismo':  return '#0077B6';
      default:         return colors.subtext;
    }
  };

  const detectarCategoria = (titulo: string) => {
    const texto = titulo.toLowerCase();
    if (texto.includes('futbol') || texto.includes('liga') || texto.includes('mundial') || texto.includes('deporte')) return 'Deportes';
    if (texto.includes('turismo') || texto.includes('festival') || texto.includes('cultura')) return 'Turismo';
    if (texto.includes('trafico') || texto.includes('avenida') || texto.includes('vial')) return 'Vialidad';
    return 'Turismo';
  };

  return (
    <ScrollView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />

      <View style={s.blueHeader}>
        <Text style={s.headerTitle}>{t('NO')}</Text>
        <Text style={s.headerSubtitle}>
          {t('Not')}
        </Text>
      </View>

      <View style={s.listContainer}>
        {noticias.map((item, index) => {
          const categoria = detectarCategoria(item.title || '');
          return (
            <View key={index} style={s.newsCard}>
              <Image source={{ uri: item.image }} style={s.cardImage} />

              <View style={s.cardContent}>
                <View style={s.badgeRow}>
                  <View style={[s.badge, { backgroundColor: getBadgeColor(categoria) }]}>
                    <Text style={[s.badgeText, { color: getTextColor(categoria) }]}>
                      {categoria}
                    </Text>
                  </View>
                  <View style={s.dateRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.subtext} />
                    <Text style={s.dateText}>
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <Text style={s.newsTitle}>{item.title}</Text>
                <Text style={s.newsResumen} numberOfLines={3}>{item.description}</Text>

                <Pressable
                  style={s.readMoreBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/(stack)/detalleNoticia',
                      params: {
                        title: item.title,
                        description: item.description,
                        image: item.image,
                        content: item.content,
                        url: item.url,
                        date: item.publishedAt,
                      },
                    })
                  }
                >
                  <Text style={s.readMoreText}>{t('see_more')}</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },

  blueHeader: {
    backgroundColor: '#E96928',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: f['2xl'], fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: f.sm, color: '#E0E7FF', marginTop: 10, lineHeight: f.sm * 1.5 },

  listContainer: { marginTop: -30, paddingHorizontal: 15, paddingBottom: 30 },

  newsCard: {
    backgroundColor: c.card,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  cardImage: { width: '100%', height: 200 },
  cardContent: { padding: 20 },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: f.xs, fontWeight: 'bold' },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: f.xs, color: c.subtext },

  newsTitle: { fontSize: f.lg, fontWeight: 'bold', color: c.text, marginBottom: 10 },
  newsResumen: { fontSize: f.sm, color: c.subtext, lineHeight: f.sm * 1.6, marginBottom: 20 },

  readMoreBtn: {
    backgroundColor: '#E96928',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 8,
  },
  readMoreText: { color: '#fff', fontWeight: 'bold', fontSize: f.sm },
});
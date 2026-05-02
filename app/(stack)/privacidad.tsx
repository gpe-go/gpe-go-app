import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';

export default function PrivacidadScreen() {
  const router = useRouter();
  const { colors, fonts, isDark } = useTheme();
  const { t } = useTranslation();

  const abrirAjustesSistema = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:').catch(() =>
        Linking.openURL('App-Prefs:root=Privacy')
      );
    } else {
      Linking.openSettings();
    }
  };

  const abrirAvisoCompleto = () => {
    Linking.openURL('https://guadalupe.gob.mx/aviso-de-privacidad/').catch(() => {});
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={[st.header, { borderBottomColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [
            st.backBtn,
            { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={[st.headerTitle, { color: colors.text, fontSize: fonts.lg }]}>
          {t('privacy_permissions')}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <Text style={[st.headerSub, { color: colors.subtext, fontSize: fonts.sm }]}>
        {t('privacy_screen_subtitle')}
      </Text>

      <ScrollView
        contentContainerStyle={st.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sección: Cómo usamos tus datos ─────────────────────── */}
        <Text style={[st.sectionTitle, { color: colors.text, fontSize: fonts.base }]}>
          {t('privacy_how_we_use_data')}
        </Text>

        {/* Card: Recomendaciones */}
        <View style={[st.dataCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[st.dataIconWrap, { backgroundColor: isDark ? 'rgba(233,105,40,0.15)' : 'rgba(233,105,40,0.1)' }]}>
            <Ionicons name="bar-chart-outline" size={22} color="#E96928" />
          </View>
          <View style={st.dataCardBody}>
            <Text style={[st.dataCardTitle, { color: colors.text, fontSize: fonts.base }]}>
              {t('privacy_recommendations_title')}
            </Text>
            <Text style={[st.dataCardDesc, { color: colors.subtext, fontSize: fonts.sm }]}>
              {t('privacy_recommendations_desc')}
            </Text>
          </View>
        </View>

        {/* Card: Ubicación */}
        <View style={[st.dataCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[st.dataIconWrap, { backgroundColor: isDark ? 'rgba(233,105,40,0.15)' : 'rgba(233,105,40,0.1)' }]}>
            <Ionicons name="location-outline" size={22} color="#E96928" />
          </View>
          <View style={st.dataCardBody}>
            <Text style={[st.dataCardTitle, { color: colors.text, fontSize: fonts.base }]}>
              {t('privacy_location_title')}
            </Text>
            <Text style={[st.dataCardDesc, { color: colors.subtext, fontSize: fonts.sm }]}>
              {t('privacy_location_desc')}
            </Text>
          </View>
        </View>

        {/* Link aviso completo */}
        <Pressable
          style={({ pressed }) => [st.linkBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={abrirAvisoCompleto}
        >
          <Ionicons name="open-outline" size={14} color="#E96928" />
          <Text style={[st.linkBtnText, { fontSize: fonts.sm }]}>
            {t('privacy_view_full_notice')}
          </Text>
        </Pressable>

        {/* ── Sección: Permisos del sistema ───────────────────────── */}
        <Text style={[st.sectionTitle, { color: colors.text, fontSize: fonts.base, marginTop: 28 }]}>
          {t('privacy_system_permissions')}
        </Text>

        <View style={[st.permCard, { backgroundColor: isDark ? '#1C2333' : '#1C2333' }]}>
          <View style={st.permIconWrap}>
            <Ionicons name="shield-checkmark" size={26} color="#E96928" />
          </View>
          <Text style={st.permTitle}>
            {t('privacy_perm_title')}
          </Text>
          <Text style={st.permDesc}>
            {t('privacy_perm_desc')}
          </Text>
          <Pressable
            style={({ pressed }) => [
              st.permBtn,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
            onPress={abrirAjustesSistema}
          >
            <Ionicons name="settings-outline" size={17} color="#fff" />
            <Text style={[st.permBtnText, { fontSize: fonts.base }]}>
              {t('privacy_open_system_settings')}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 10,
    marginBottom: 4,
    lineHeight: 20,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  sectionTitle: {
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.2,
  },

  // ── Tarjetas de datos
  dataCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  dataIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  dataCardBody: {
    flex: 1,
    gap: 5,
  },
  dataCardTitle: {
    fontWeight: '700',
    lineHeight: 20,
  },
  dataCardDesc: {
    lineHeight: 19,
  },

  // ── Link
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 4,
  },
  linkBtnText: {
    color: '#E96928',
    fontWeight: '700',
  },

  // ── Tarjeta de permisos
  permCard: {
    borderRadius: 20,
    padding: 22,
    gap: 10,
  },
  permIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(233,105,40,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  permTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  permDesc: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    lineHeight: 20,
  },
  permBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E96928',
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 8,
  },
  permBtnText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});

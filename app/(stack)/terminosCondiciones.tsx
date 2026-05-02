import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';

// ─── Claves de las secciones (texto en archivos i18n) ─────────────────────
const SECCION_KEYS = [
  { titleKey: 'tc_s1_title',  bodyKey: 'tc_s1_body',  icono: 'checkmark-circle-outline' as const },
  { titleKey: 'tc_s2_title',  bodyKey: 'tc_s2_body',  icono: 'phone-portrait-outline'   as const },
  { titleKey: 'tc_s3_title',  bodyKey: 'tc_s3_body',  icono: 'shield-outline'            as const },
  { titleKey: 'tc_s4_title',  bodyKey: 'tc_s4_body',  icono: 'ribbon-outline'            as const },
  { titleKey: 'tc_s5_title',  bodyKey: 'tc_s5_body',  icono: 'lock-closed-outline'       as const },
  { titleKey: 'tc_s6_title',  bodyKey: 'tc_s6_body',  icono: 'information-circle-outline' as const },
  { titleKey: 'tc_s7_title',  bodyKey: 'tc_s7_body',  icono: 'cloud-outline'             as const },
  { titleKey: 'tc_s8_title',  bodyKey: 'tc_s8_body',  icono: 'refresh-outline'           as const },
  { titleKey: 'tc_s9_title',  bodyKey: 'tc_s9_body',  icono: 'business-outline'          as const },
  { titleKey: 'tc_s10_title', bodyKey: 'tc_s10_body', icono: 'mail-outline'              as const },
];

export default function TerminosCondicionesScreen() {
  const router = useRouter();
  const { colors, fonts, isDark } = useTheme();
  const { t } = useTranslation();

  const abrirPortal = () => {
    Linking.openURL('https://guadalupe.gob.mx/').catch(() => {});
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
          {t('terms')}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={st.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ────────────────────────────────────────────────── */}
        <View style={st.heroWrap}>
          <View style={[st.heroIcon, { backgroundColor: isDark ? 'rgba(233,105,40,0.15)' : 'rgba(233,105,40,0.1)' }]}>
            <Ionicons name="reader" size={32} color="#E96928" />
          </View>
          <Text style={[st.heroTitle, { color: colors.text, fontSize: fonts.xl }]}>
            {t('terms_hero_title')}
          </Text>
          <Text style={[st.heroSub, { color: colors.subtext, fontSize: fonts.sm }]}>
            {t('terms_hero_authority')}
          </Text>
          <View style={st.dateBadge}>
            <Text style={[st.dateBadgeText, { fontSize: fonts.xs }]}>
              {t('terms_effective_date')}
            </Text>
          </View>
        </View>

        {/* ── Secciones ───────────────────────────────────────────── */}
        {SECCION_KEYS.map((sec, i) => (
          <View
            key={i}
            style={[
              st.section,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={st.sectionHeader}>
              <View style={[st.sectionIconWrap, { backgroundColor: isDark ? 'rgba(233,105,40,0.2)' : 'rgba(233,105,40,0.12)' }]}>
                <Ionicons name={sec.icono} size={18} color="#E96928" />
              </View>
              <Text style={[st.sectionTitle, { color: colors.text, fontSize: fonts.base }]}>
                {t(sec.titleKey)}
              </Text>
            </View>
            <Text style={[st.sectionBody, { color: colors.subtext, fontSize: fonts.sm }]}>
              {t(sec.bodyKey)}
            </Text>
          </View>
        ))}

        {/* ── Link al portal ───────────────────────────────────────── */}
        <Pressable
          style={({ pressed }) => [
            st.linkCard,
            {
              backgroundColor: '#1C2333',
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            },
          ]}
          onPress={abrirPortal}
        >
          <Ionicons name="globe-outline" size={22} color="#E96928" />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[st.linkCardTitle, { fontSize: fonts.base }]}>
              {t('terms_official_portal')}
            </Text>
            <Text style={[st.linkCardSub, { fontSize: fonts.xs }]}>
              guadalupe.gob.mx
            </Text>
          </View>
          <Ionicons name="open-outline" size={18} color="rgba(255,255,255,0.5)" />
        </Pressable>

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

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // ── Hero
  heroWrap: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSub: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  dateBadge: {
    backgroundColor: 'rgba(233,105,40,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
  },
  dateBadgeText: {
    color: '#E96928',
    fontWeight: '700',
  },

  // ── Secciones
  section: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sectionTitle: {
    fontWeight: '700',
    flex: 1,
    lineHeight: 22,
  },
  sectionBody: {
    lineHeight: 21,
  },

  // ── Link card
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
  },
  linkCardTitle: {
    color: '#fff',
    fontWeight: '700',
  },
  linkCardSub: {
    color: 'rgba(255,255,255,0.5)',
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { useTheme } from '../../src/context/ThemeContext';

function CreditRow({
  name,
  role,
  colors,
  fonts,
}: {
  name: string;
  role: string;
  colors: any;
  fonts: any;
}) {
  return (
    <View style={st.creditRow}>
      <View style={st.creditDot} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: fonts.sm, fontWeight: '700' }}>
          {name}
        </Text>
        <Text style={{ color: colors.subtext, fontSize: fonts.xs, marginTop: 2 }}>
          {role}
        </Text>
      </View>
    </View>
  );
}

function GroupTitle({
  label,
  fonts,
}: {
  label: string;
  fonts: any;
}) {
  return (
    <Text style={[st.groupTitle, { fontSize: fonts.xs }]}>
      {label}
    </Text>
  );
}

function SubGroupTitle({
  label,
  colors,
  fonts,
  marginTop = 6,
}: {
  label: string;
  colors: any;
  fonts: any;
  marginTop?: number;
}) {
  return (
    <Text
      style={[
        st.subGroupTitle,
        { fontSize: fonts.xs, color: colors.subtext, marginTop },
      ]}
    >
      {label}
    </Text>
  );
}

export default function AcercaDeScreen() {
  const router = useRouter();
  const { colors, fonts, isDark } = useTheme();
  const { t } = useTranslation();

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
          {t('settings_about')}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={st.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo de la app + descripción ───────────────────────── */}
        <View style={st.heroWrap}>
          <Image
            source={require('../../assets/images/GPE GO.png')}
            style={st.appLogo}
            resizeMode="contain"
          />
          <Text style={[st.heroTitle, { color: colors.text, fontSize: fonts.xl }]}>
            GuadalupeGO
          </Text>
          <Text style={[st.heroSub, { color: colors.subtext, fontSize: fonts.sm }]}>
            {t('about_description')}
          </Text>
        </View>

        {/* ── Aliados institucionales ─────────────────────────────── */}
        <View
          style={[
            st.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <GroupTitle label={t('about_partners')} fonts={fonts} />
          <View style={st.partnersRow}>
            <View
              style={[
                st.partnerCell,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FAFAFA',
                  borderColor: colors.border,
                },
              ]}
            >
              <Image
                source={require('../../assets/images/logocombinadotecnlo.png')}
                style={st.partnerLogo}
                resizeMode="contain"
              />
            </View>
            <View
              style={[
                st.partnerCell,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FAFAFA',
                  borderColor: colors.border,
                },
              ]}
            >
              <Image
                source={require('../../assets/images/LOGOS G1 (1)_page-0001.png')}
                style={st.partnerLogo}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* ── Municipio ───────────────────────────────────────────── */}
        <View
          style={[
            st.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <GroupTitle label={t('about_municipality')} fonts={fonts} />
          <CreditRow name="Lic. Héctor García García" role={t('about_president')} colors={colors} fonts={fonts} />
          <CreditRow name="Lic. Jorge Israel Treviño Escamilla" role={t('about_role_secretaria_innovacion')} colors={colors} fonts={fonts} />
          <CreditRow name="Lic. Araceli W. Ching Pacheco" role={t('about_role_secretaria_economico')} colors={colors} fonts={fonts} />
          <CreditRow name="Ing. Hugo Dimas" role={t('about_role_secretaria_innovacion')} colors={colors} fonts={fonts} />
          <CreditRow name="Lic. Hugo Rodríguez Torres" role={t('about_role_emprendimiento')} colors={colors} fonts={fonts} />
        </View>

        {/* ── Instituto Tecnológico de Nuevo León ─────────────────── */}
        <View
          style={[
            st.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <GroupTitle label={t('about_itnl')} fonts={fonts} />
          <CreditRow name="Ing. Pedro Rosales Gutiérrez" role={t('about_itnl_director')} colors={colors} fonts={fonts} />
          <CreditRow name="Mtra. Ericka Yazmín Villarreal Sánchez" role={t('about_itnl_dept_head')} colors={colors} fonts={fonts} />
          <CreditRow name="Ing. Angela Gabriela Benavides Ríos" role={t('about_itnl_angela_role')} colors={colors} fonts={fonts} />
          <CreditRow name="MAD. Marta Alicia Casillas Careaga" role={t('about_itnl_marta_role')} colors={colors} fonts={fonts} />
        </View>

        {/* ── Equipo de desarrollo ────────────────────────────────── */}
        <View
          style={[
            st.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <GroupTitle label={t('about_developers')} fonts={fonts} />

          <SubGroupTitle label={t('about_frontend')} colors={colors} fonts={fonts} marginTop={0} />
          <CreditRow name="Ricardo Rodríguez Rodríguez" role={t('about_frontend_lead')} colors={colors} fonts={fonts} />
          <CreditRow name="Iván Jahir Castillo González" role={t('about_support')} colors={colors} fonts={fonts} />
          <CreditRow name="Alan Josafat Rodríguez Rodríguez" role={t('about_support')} colors={colors} fonts={fonts} />

          <SubGroupTitle label={t('about_backend')} colors={colors} fonts={fonts} marginTop={14} />
          <CreditRow name="Omar Alejandro Chaires Lugo" role={t('about_backend')} colors={colors} fonts={fonts} />
          <CreditRow name="Marvin Yahir Aguilar Fuentes" role={t('about_backend')} colors={colors} fonts={fonts} />

          <SubGroupTitle label={t('about_database')} colors={colors} fonts={fonts} marginTop={14} />
          <CreditRow name="Fernando Jiménez Rentería" role={t('about_database')} colors={colors} fonts={fonts} />
          <CreditRow name="Roberto de Jesús Ambriz García" role={t('about_database')} colors={colors} fonts={fonts} />
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

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // ── Hero (logo + descripción)
  heroWrap: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  appLogo: {
    width: 150,
    height: 150,
  },
  heroTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSub: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 6,
  },

  // ── Card genérica
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },

  // ── Títulos
  groupTitle: {
    fontWeight: '800',
    color: '#F97613',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  subGroupTitle: {
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
  },

  // ── Aliados
  partnersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  partnerCell: {
    flex: 1,
    aspectRatio: 1.2,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  partnerLogo: {
    width: '100%',
    height: '100%',
  },

  // ── Créditos
  creditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
  },
  creditDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F97613',
    marginTop: 8,
  },
});

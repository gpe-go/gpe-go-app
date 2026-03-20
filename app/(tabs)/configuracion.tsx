import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Switch, TouchableOpacity,
  ScrollView, Modal, StatusBar, Platform, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import i18n, { LANGUAGE_LIST, AppLanguage } from '../../src/i18n/i18n';
import { useTheme, FontSize } from '../../src/context/ThemeContext';

// ─────────────────────────────────────────────
// PANTALLA DE CONFIGURACIÓN
// ─────────────────────────────────────────────

export default function ConfiguracionScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark, toggleTheme, fontSize, setFontSize } = useTheme();
  const [langModal, setLangModal] = useState(false);

  // ✅ FIX: estado local para forzar re-render al cambiar idioma
  const [currentLang, setCurrentLang] = useState<AppLanguage>(i18n.language as AppLanguage);

  const router = useRouter();

  const currentLangInfo = LANGUAGE_LIST.find(l => l.code === currentLang) ?? LANGUAGE_LIST[0];

  const changeLanguage = (code: AppLanguage) => {
    i18n.changeLanguage(code);
    setCurrentLang(code); // ✅ actualiza el estado local → fuerza re-render
    setLangModal(false);
  };

  const s = makeStyles(colors, fonts);

  const fontOptions: { key: FontSize; icon: string }[] = [
    { key: 'small',  icon: 'A'  },
    { key: 'medium', icon: 'A'  },
    { key: 'large',  icon: 'A'  },
  ];
  const fontIconSizes = { small: 13, medium: 17, large: 22 };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <Text style={[s.backIcon, { color: colors.text }]}>‹</Text>
            <Text style={[s.backLabel, { color: colors.text }]}>{t('back') ?? 'Inicio'}</Text>
          </TouchableOpacity>
          <Text style={s.headerEmoji}>⚙️</Text>
          <Text style={s.headerTitle}>{t('settings_title')}</Text>
          <Text style={s.headerSub}>{t('settings_appearance')}</Text>
        </View>

        {/* ── DARK MODE ── */}
        <SectionLabel label={t('settings_appearance')} colors={colors} fonts={fonts} />
        <View style={s.card}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <View style={[s.iconBox, { backgroundColor: isDark ? '#1C2333' : '#EEF2FF' }]}>
                <Text style={s.iconEmoji}>{isDark ? '🌙' : '☀️'}</Text>
              </View>
              <View>
                <Text style={s.rowTitle}>{t('settings_dark_mode')}</Text>
                <Text style={s.rowSub}>{isDark ? 'ON' : 'OFF'}</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {/* ── FONT SIZE ── */}
        <SectionLabel label={t('settings_font_size')} colors={colors} fonts={fonts} />
        <View style={s.card}>
          <View style={s.fontRow}>
            {fontOptions.map(opt => {
              const active = fontSize === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[s.fontBtn, active && { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
                  onPress={() => setFontSize(opt.key)}
                >
                  <Text style={[
                    s.fontBtnLetter,
                    { fontSize: fontIconSizes[opt.key] },
                    active && { color: colors.primary },
                  ]}>
                    {opt.icon}
                  </Text>
                  <Text style={[s.fontBtnLabel, active && { color: colors.primary, fontWeight: '700' }]}>
                    {t(`font_${opt.key}`)}
                  </Text>
                  {active && <View style={[s.fontDot, { backgroundColor: colors.primary }]} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── IDIOMA ── */}
        <SectionLabel label={t('settings_language')} colors={colors} fonts={fonts} />
        <TouchableOpacity style={s.card} onPress={() => setLangModal(true)} activeOpacity={0.75}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <View style={[s.iconBox, { backgroundColor: colors.primaryLight }]}>
                <Text style={s.iconEmoji}>🌐</Text>
              </View>
              <View>
                <Text style={s.rowTitle}>{t('settings_language')}</Text>
                {/* ✅ Ahora muestra la bandera y nombre del idioma seleccionado */}
                <Text style={s.rowSub}>{currentLangInfo.flag} {currentLangInfo.label}</Text>
              </View>
            </View>
            <Text style={[s.chevron, { color: colors.subtext }]}>›</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── MODAL DE IDIOMA ── */}
      <Modal visible={langModal} animationType="slide" transparent statusBarTranslucent>
        <Pressable style={s.modalBackdrop} onPress={() => setLangModal(false)} />
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{t('select_language')}</Text>
            <TouchableOpacity onPress={() => setLangModal(false)} hitSlop={12}>
              <Text style={[s.modalCloseBtn, { color: colors.subtext }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {LANGUAGE_LIST.map(item => {
              const selected = currentLang === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[s.langItem, selected && { backgroundColor: colors.primaryLight }]}
                  onPress={() => changeLanguage(item.code)}
                  activeOpacity={0.7}
                >
                  <Text style={s.langFlag}>{item.flag}</Text>
                  <Text style={[s.langLabel, selected && { color: colors.primary, fontWeight: '700' }]}>
                    {item.label}
                  </Text>
                  {selected && <Text style={[s.langCheck, { color: colors.primary }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
            <View style={{ height: Platform.OS === 'ios' ? 30 : 16 }} />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// SUB-COMPONENTE: etiqueta de sección
// ─────────────────────────────────────────────

function SectionLabel({ label, colors, fonts }: { label: string; colors: any; fonts: any }) {
  return (
    <Text style={{
      fontSize: fonts.xs, fontWeight: '700', color: colors.subtext,
      letterSpacing: 1.1, marginBottom: 8, marginLeft: 4, marginTop: 20,
      textTransform: 'uppercase',
    }}>
      {label}
    </Text>
  );
}

// ─────────────────────────────────────────────
// ESTILOS REACTIVOS
// ─────────────────────────────────────────────

const makeStyles = (c: any, f: any) => StyleSheet.create({
  safe:  { flex: 1, backgroundColor: c.background },
  scroll: { padding: 20, paddingTop: 8 },

  header: { alignItems: 'center', paddingVertical: 24 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 2,
    marginBottom: 16,
  },
  backIcon: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '300',
    marginTop: -1,
  },
  backLabel: {
    fontSize: f.sm,
    fontWeight: '600',
  },
  headerEmoji: { fontSize: 44, marginBottom: 8 },
  headerTitle: { fontSize: f['3xl'], fontWeight: '800', color: c.text, textAlign: 'center' },
  headerSub:   { fontSize: f.sm, color: c.subtext, marginTop: 4 },

  card: {
    backgroundColor: c.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: c.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },

  row:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 22 },
  rowTitle:  { fontSize: f.base, fontWeight: '600', color: c.text },
  rowSub:    { fontSize: f.xs, color: c.subtext, marginTop: 2 },
  chevron:   { fontSize: 30, fontWeight: '300', lineHeight: 34 },

  fontRow: { flexDirection: 'row', gap: 10 },
  fontBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 14,
    backgroundColor: c.inputBackground, borderWidth: 2, borderColor: c.border,
    position: 'relative',
  },
  fontBtnLetter: { fontWeight: '800', color: c.subtext },
  fontBtnLabel:  { fontSize: f.xs, color: c.subtext, marginTop: 4 },
  fontDot: { width: 5, height: 5, borderRadius: 3, marginTop: 6 },

  modalBackdrop: { flex: 1, backgroundColor: c.overlay },
  modalSheet: {
    backgroundColor: c.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12,
    maxHeight: '75%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: c.border,
    alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  modalTitle:    { fontSize: f.lg, fontWeight: '700', color: c.text },
  modalCloseBtn: { fontSize: 18, padding: 4 },

  langItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: c.border,
    borderRadius: 8, gap: 12,
  },
  langFlag:  { fontSize: 26 },
  langLabel: { flex: 1, fontSize: f.base, color: c.text },
  langCheck: { fontSize: 18, fontWeight: '800' },
});
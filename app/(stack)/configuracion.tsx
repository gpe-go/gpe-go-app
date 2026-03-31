import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, Switch, TouchableOpacity,
  ScrollView, Modal, StatusBar, Platform, Pressable, AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import i18n, { LANGUAGE_LIST, AppLanguage, cambiarIdioma } from '../../src/i18n/i18n';
import { useTheme, FontSize } from '../../src/context/ThemeContext';

type ConnectionStatus = 'stable' | 'critical' | 'offline';

export default function ConfiguracionScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark, toggleTheme, fontSize, setFontSize } = useTheme();
  const [langModal,       setLangModal]       = useState(false);
  const [privacyModal,    setPrivacyModal]     = useState(false);
  const [currentLang,     setCurrentLang]     = useState<AppLanguage>((i18n.language ?? 'es') as AppLanguage);
  const [connStatus,      setConnStatus]      = useState<ConnectionStatus>('stable');
  const router = useRouter();

  const currentLangInfo = LANGUAGE_LIST.find(l => l.code === currentLang) ?? LANGUAGE_LIST[0];

  // ── Verificación de conectividad ──────────────────────
  const checkingRef = useRef(false);

  const checkConnectivity = useCallback(async () => {
    if (checkingRef.current) return;       // evitar llamadas simultáneas
    checkingRef.current = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500); // máx 1.5 s
    const start = Date.now();
    try {
      await fetch('https://connectivitycheck.gstatic.com/generate_204', {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);
      const ms = Date.now() - start;
      setConnStatus(ms > 900 ? 'critical' : 'stable');
    } catch {
      clearTimeout(timeout);
      setConnStatus('offline');
    } finally {
      checkingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Verificar al montar
    checkConnectivity();

    // Intervalo corto: cada 6 segundos
    const interval = setInterval(checkConnectivity, 6_000);

    // Verificar inmediatamente cuando la app vuelve al primer plano
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkConnectivity();
    });

    return () => {
      clearInterval(interval);
      appStateSub.remove();
    };
  }, [checkConnectivity]);

  // ── Badge de conexión ──────────────────────────────────
  const connBadge: Record<ConnectionStatus, { label: string; bg: string; border: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
    stable:   { label: t('stable'),              bg: isDark ? 'rgba(34,197,94,0.15)' : '#F0FDF4',   border: '#22C55E', text: '#16A34A', icon: 'wifi'           },
    critical: { label: t('connection_critical'), bg: isDark ? 'rgba(245,158,11,0.15)' : '#FFFBEB',  border: '#F59E0B', text: '#D97706', icon: 'warning-outline' },
    offline:  { label: t('connection_offline'),  bg: isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2',   border: '#EF4444', text: '#DC2626', icon: 'wifi-outline'    },
  };
  const badge = connBadge[connStatus];

  const changeLanguage = async (code: AppLanguage) => {
    await cambiarIdioma(code);
    setCurrentLang(code);
    setLangModal(false);
  };

  const s = makeStyles(colors, fonts, isDark);

  const fontOptions: { key: FontSize; label: string; size: number }[] = [
    { key: 'small',  label: t('font_small'),  size: 13 },
    { key: 'medium', label: t('font_medium'), size: 17 },
    { key: 'large',  label: t('font_large'),  size: 22 },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ══ BANNER ══════════════════════════════════════ */}
        <LinearGradient
          colors={['#E96928', '#c4511a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.banner}
        >
          <View style={s.circle1} />
          <View style={s.circle2} />

          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
            <Text style={[s.backLabel, { fontSize: fonts.sm }]}>{t('back')}</Text>
          </TouchableOpacity>

          <View style={s.bannerContent}>
            <View style={s.bannerIconWrap}>
              <Ionicons name="settings-outline" size={24} color="#E96928" />
            </View>
            <View>
              <Text style={[s.bannerTitle, { fontSize: fonts['2xl'] }]}>
                {t('settings_title')}
              </Text>
              <Text style={[s.bannerSub, { fontSize: fonts.sm }]}>
                {t('settings_appearance')}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ══ APARIENCIA ══════════════════════════════════ */}
        <SectionLabel label={t('settings_appearance')} colors={colors} fonts={fonts} />

        <View style={s.card}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <View style={[s.iconBox, { backgroundColor: isDark ? '#1a1a2e' : '#FFF3E0' }]}>
                <Ionicons
                  name={isDark ? 'moon' : 'sunny'}
                  size={22}
                  color={isDark ? '#818CF8' : '#F59E0B'}
                />
              </View>
              <View>
                <Text style={[s.rowTitle, { fontSize: fonts.base }]}>
                  {t('settings_dark_mode')}
                </Text>
                <Text style={[s.rowSub, { fontSize: fonts.xs }]}>
                  {isDark ? t('activated') : t('deactivated')}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: '#E96928' }}
              thumbColor="#fff"
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {/* ══ TAMAÑO DE FUENTE ════════════════════════════ */}
        <SectionLabel label={t('settings_font_size')} colors={colors} fonts={fonts} />

        <View style={s.card}>
          <View style={s.fontRow}>
            {fontOptions.map(opt => {
              const active = fontSize === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[
                    s.fontBtn,
                    active && {
                      borderColor: '#E96928',
                      backgroundColor: isDark ? 'rgba(233,105,40,0.15)' : 'rgba(233,105,40,0.08)',
                    },
                  ]}
                  onPress={() => setFontSize(opt.key)}
                >
                  {active && (
                    <View style={s.fontActiveBadge}>
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    </View>
                  )}
                  <Text style={[s.fontBtnLetter, { fontSize: opt.size }, active && { color: '#E96928' }]}>
                    A
                  </Text>
                  <Text style={[s.fontBtnLabel, { fontSize: fonts.xs }, active && { color: '#E96928', fontWeight: '700' }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={s.fontPreview}>
            <Ionicons name="eye-outline" size={14} color={colors.subtext} />
            <Text style={[s.fontPreviewText, { fontSize: fonts.sm }]}>
              {t('font_preview')}
            </Text>
          </View>
        </View>

        {/* ══ IDIOMA ══════════════════════════════════════ */}
        <SectionLabel label={t('settings_language')} colors={colors} fonts={fonts} />

        <TouchableOpacity style={s.card} onPress={() => setLangModal(true)} activeOpacity={0.75}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <View style={[s.iconBox, { backgroundColor: isDark ? 'rgba(233,105,40,0.15)' : 'rgba(233,105,40,0.1)' }]}>
                <Text style={{ fontSize: 22 }}>🌐</Text>
              </View>
              <View>
                <Text style={[s.rowTitle, { fontSize: fonts.base }]}>
                  {t('settings_language')}
                </Text>
                <Text style={[s.rowSub, { fontSize: fonts.xs }]}>
                  {currentLangInfo.flag} {currentLangInfo.label}
                </Text>
              </View>
            </View>
            <View style={s.chevronWrap}>
              <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
            </View>
          </View>
        </TouchableOpacity>

        {/* ══ INFO APP ════════════════════════════════════ */}
        <SectionLabel label={t('information')} colors={colors} fonts={fonts} />

        <View style={s.card}>

          {/* Versión + badge de conectividad */}
          <View style={[s.row, { marginBottom: 14 }]}>
            <View style={s.rowLeft}>
              <View style={[s.iconBox, { backgroundColor: isDark ? 'rgba(233,105,40,0.15)' : 'rgba(233,105,40,0.1)' }]}>
                <Ionicons name="information-circle-outline" size={22} color="#E96928" />
              </View>
              <View>
                <Text style={[s.rowTitle, { fontSize: fonts.base }]}>{t('version')}</Text>
                <Text style={[s.rowSub, { fontSize: fonts.xs }]}>GuadalupeGO v1.0.2</Text>
              </View>
            </View>

            {/* Badge dinámico de conectividad */}
            <Pressable
              onPress={checkConnectivity}
              style={[s.connBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}
              hitSlop={8}
            >
              <Ionicons name={badge.icon} size={12} color={badge.text} />
              <Text style={[s.connBadgeText, { color: badge.text, fontSize: fonts.xs }]}>
                {badge.label}
              </Text>
            </Pressable>
          </View>

          <View style={s.infoDivider} />

          {/* Privacidad — tappable */}
          <TouchableOpacity
            style={[s.row, { marginTop: 14 }]}
            onPress={() => setPrivacyModal(true)}
            activeOpacity={0.75}
          >
            <View style={s.rowLeft}>
              <View style={[s.iconBox, { backgroundColor: isDark ? '#1a2e1a' : '#F0FDF4' }]}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#22C55E" />
              </View>
              <View>
                <Text style={[s.rowTitle, { fontSize: fonts.base }]}>{t('privacy')}</Text>
                <Text style={[s.rowSub, { fontSize: fonts.xs }]}>{t('privacy_sub')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ══ MODAL IDIOMA ════════════════════════════════ */}
      <Modal visible={langModal} animationType="slide" transparent statusBarTranslucent>
        <Pressable style={s.modalBackdrop} onPress={() => setLangModal(false)} />
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />

          <View style={s.modalHeader}>
            <Text style={[s.modalTitle, { fontSize: fonts.lg }]}>
              {t('select_language')}
            </Text>
            <TouchableOpacity onPress={() => setLangModal(false)} style={s.modalCloseBtn} hitSlop={12}>
              <Ionicons name="close" size={20} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {LANGUAGE_LIST.map(item => {
              const selected = currentLang === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    s.langItem,
                    selected && { backgroundColor: isDark ? 'rgba(233,105,40,0.15)' : 'rgba(233,105,40,0.08)' },
                  ]}
                  onPress={() => changeLanguage(item.code)}
                  activeOpacity={0.7}
                >
                  <Text style={s.langFlag}>{item.flag}</Text>
                  <Text style={[s.langLabel, { fontSize: fonts.base }, selected && { color: '#E96928', fontWeight: '700' }]}>
                    {item.label}
                  </Text>
                  {selected && (
                    <View style={s.langCheckWrap}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            <View style={{ height: Platform.OS === 'ios' ? 30 : 16 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* ══ MODAL PRIVACIDAD ════════════════════════════ */}
      <Modal visible={privacyModal} animationType="slide" transparent statusBarTranslucent>
        <Pressable style={s.modalBackdrop} onPress={() => setPrivacyModal(false)} />
        <View style={[s.modalSheet, s.privacySheet]}>
          <View style={s.modalHandle} />

          <View style={s.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={s.privacyIconWrap}>
                <Ionicons name="shield-checkmark" size={20} color="#22C55E" />
              </View>
              <Text style={[s.modalTitle, { fontSize: fonts.lg }]}>
                {t('privacy_policy_title')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setPrivacyModal(false)} style={s.modalCloseBtn} hitSlop={12}>
              <Ionicons name="close" size={20} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.privacyScroll}>

            {/* Intro */}
            <View style={s.privacySection}>
              <Text style={[s.privacySectionTitle, { fontSize: fonts.sm, color: colors.text }]}>
                🛡️ {t('privacy_intro_title')}
              </Text>
              <Text style={[s.privacyBody, { fontSize: fonts.sm, color: colors.subtext }]}>
                {t('privacy_intro_body')}
              </Text>
            </View>

            <View style={s.privacyDivider} />

            {/* Datos recopilados */}
            <View style={s.privacySection}>
              <Text style={[s.privacySectionTitle, { fontSize: fonts.sm, color: colors.text }]}>
                📋 {t('privacy_data_title')}
              </Text>
              {[
                t('privacy_data_1'),
                t('privacy_data_2'),
                t('privacy_data_3'),
                t('privacy_data_4'),
              ].map((item, i) => (
                <View key={i} style={s.privacyBulletRow}>
                  <View style={s.privacyBullet} />
                  <Text style={[s.privacyBody, { fontSize: fonts.sm, color: colors.subtext, flex: 1 }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <View style={s.privacyDivider} />

            {/* Almacenamiento local */}
            <View style={s.privacySection}>
              <Text style={[s.privacySectionTitle, { fontSize: fonts.sm, color: colors.text }]}>
                📱 {t('privacy_storage_title')}
              </Text>
              <Text style={[s.privacyBody, { fontSize: fonts.sm, color: colors.subtext }]}>
                {t('privacy_storage_body')}
              </Text>
            </View>

            <View style={s.privacyDivider} />

            {/* Ubicación */}
            <View style={s.privacySection}>
              <Text style={[s.privacySectionTitle, { fontSize: fonts.sm, color: colors.text }]}>
                📍 {t('privacy_location_title')}
              </Text>
              <Text style={[s.privacyBody, { fontSize: fonts.sm, color: colors.subtext }]}>
                {t('privacy_location_body')}
              </Text>
            </View>

            <View style={s.privacyDivider} />

            {/* Derechos */}
            <View style={s.privacySection}>
              <Text style={[s.privacySectionTitle, { fontSize: fonts.sm, color: colors.text }]}>
                ✅ {t('privacy_rights_title')}
              </Text>
              <Text style={[s.privacyBody, { fontSize: fonts.sm, color: colors.subtext }]}>
                {t('privacy_rights_body')}
              </Text>
            </View>

            {/* Botón cerrar */}
            <Pressable style={s.privacyCloseBtn} onPress={() => setPrivacyModal(false)}>
              <Text style={[s.privacyCloseBtnText, { fontSize: fonts.base }]}>
                {t('privacy_close')}
              </Text>
            </Pressable>

            <View style={{ height: Platform.OS === 'ios' ? 30 : 16 }} />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SectionLabel({ label, colors, fonts }: { label: string; colors: any; fonts: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 22 }}>
      <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: '#E96928' }} />
      <Text style={{ fontSize: fonts.xs, fontWeight: '700', color: colors.subtext, letterSpacing: 0.8, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: c.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },

  banner:        { marginHorizontal: -20, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 28, overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 4 },
  circle1:       { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -50 },
  circle2:       { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30 },
  backBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginBottom: 18 },
  backLabel:     { color: '#fff', fontWeight: '600' },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIconWrap:{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
  bannerTitle:   { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
  bannerSub:     { color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },

  card:    { backgroundColor: c.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: c.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.07, shadowRadius: 6, elevation: 3 },
  row:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  rowTitle:    { fontWeight: '700', color: c.text },
  rowSub:      { color: c.subtext, marginTop: 2 },
  chevronWrap: { backgroundColor: c.inputBackground, padding: 6, borderRadius: 10 },

  fontRow:         { flexDirection: 'row', gap: 10, marginBottom: 14 },
  fontBtn:         { flex: 1, alignItems: 'center', paddingVertical: 18, borderRadius: 16, backgroundColor: c.inputBackground, borderWidth: 2, borderColor: c.border, position: 'relative' },
  fontActiveBadge: { position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: '#E96928', justifyContent: 'center', alignItems: 'center' },
  fontBtnLetter:   { fontWeight: '900', color: c.subtext },
  fontBtnLabel:    { color: c.subtext, marginTop: 6 },
  fontPreview:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.inputBackground, borderRadius: 10, padding: 10 },
  fontPreviewText: { color: c.subtext, flex: 1 },

  // Badge de conectividad dinámico
  connBadge:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  connBadgeText: { fontWeight: '700' },

  infoDivider:      { height: 1, backgroundColor: c.border },

  modalBackdrop: { flex: 1, backgroundColor: c.overlay },
  modalSheet:    { backgroundColor: c.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, maxHeight: '75%', paddingBottom: Platform.OS === 'ios' ? 34 : 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 20 },
  modalHandle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginBottom: 16 },
  modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:    { fontWeight: '800', color: c.text },
  modalCloseBtn: { backgroundColor: c.inputBackground, padding: 8, borderRadius: 10 },
  langItem:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 10, borderRadius: 14, marginBottom: 4, gap: 12 },
  langFlag:      { fontSize: 26 },
  langLabel:     { flex: 1, color: c.text },
  langCheckWrap: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E96928', justifyContent: 'center', alignItems: 'center' },

  // Privacidad modal
  privacySheet:      { maxHeight: '88%' },
  privacyIconWrap:   { width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  privacyScroll:     { paddingBottom: 8 },
  privacySection:    { paddingVertical: 14 },
  privacySectionTitle:{ fontWeight: '800', marginBottom: 8, lineHeight: 20 },
  privacyBody:       { lineHeight: 20 },
  privacyDivider:    { height: 1, backgroundColor: c.border },
  privacyBulletRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  privacyBullet:     { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E', marginTop: 7 },
  privacyCloseBtn:   { marginTop: 20, backgroundColor: '#E96928', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  privacyCloseBtnText:{ color: '#fff', fontWeight: '800' },
});

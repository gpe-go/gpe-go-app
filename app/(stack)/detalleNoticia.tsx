import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image, Pressable, ScrollView, Share,
  StatusBar, StyleSheet, Text, View, Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/context/ThemeContext";

export default function DetalleNoticiaScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  const { title, description, image, content, url, date } = useLocalSearchParams();

  const fechaFormateada = date
    ? new Date(date as string).toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  const compartir = async () => {
    try {
      await Share.share({
        message: `${title}\n\n${description}\n\nVía GuadalupeGO: ${url}`,
        title: title as string,
      });
    } catch { /* ignore */ }
  };

  return (
    <View style={s.wrapper}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ══ HERO ════════════════════════════════════════ */}
        <View style={s.hero}>
          {image ? (
            <Image source={{ uri: image as string }} style={s.heroImage} />
          ) : (
            <LinearGradient colors={['#E96928', '#c4511a']} style={s.heroImage}>
              <Ionicons name="newspaper-outline" size={64} color="rgba(255,255,255,0.4)" />
            </LinearGradient>
          )}

          {/* Gradiente sobre imagen */}
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.55)']}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Botones flotantes */}
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>

          <Pressable style={s.shareHeroBtn} onPress={compartir}>
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </Pressable>

          {/* Badge en vivo + fecha sobre imagen */}
          <View style={s.heroBadgeRow}>
            <View style={s.newsBadge}>
              <View style={s.newsDot} />
              <Text style={[s.newsBadgeText, { fontSize: fonts.xs }]}>Noticia</Text>
            </View>
          </View>
        </View>

        {/* ══ CARD PRINCIPAL ══════════════════════════════ */}
        <View style={s.mainCard}>

          {/* Fecha */}
          <View style={s.dateRow}>
            <Ionicons name="calendar-outline" size={14} color="#E96928" />
            <Text style={[s.date, { fontSize: fonts.xs }]} numberOfLines={1}>
              {fechaFormateada}
            </Text>
          </View>

          {/* Título */}
          <Text style={[s.title, { fontSize: fonts['2xl'] }]}>
            {title}
          </Text>

          {/* Acciones rápidas */}
          <View style={s.actionRow}>
            <Pressable
              style={({ pressed }) => [s.actionBtn, { opacity: pressed ? 0.88 : 1 }]}
              onPress={() => Linking.openURL(url as string)}
            >
              <LinearGradient colors={['#E96928', '#c4511a']} style={s.actionBtnGradient}>
                <Ionicons name="open-outline" size={16} color="#fff" />
                <Text style={[s.actionBtnText, { fontSize: fonts.sm }]}>Fuente original</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.shareBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={compartir}
            >
              <Ionicons name="share-social-outline" size={16} color="#E96928" />
              <Text style={[s.shareBtnText, { fontSize: fonts.sm }]}>{t('share')}</Text>
            </Pressable>
          </View>
        </View>

        {/* ══ CONTENIDO ═══════════════════════════════════ */}
        <View style={s.contentCard}>

          {/* Descripción destacada */}
          {description ? (
            <View style={s.descBlock}>
              <View style={s.descAccent} />
              <Text style={[s.description, { fontSize: fonts.base }]}>
                {description}
              </Text>
            </View>
          ) : null}

          {/* Divisor */}
          {content && content !== description ? (
            <>
              <View style={s.divider}>
                <View style={s.dividerLine} />
                <View style={s.dividerIcon}>
                  <Ionicons name="newspaper-outline" size={14} color={colors.subtext} />
                </View>
                <View style={s.dividerLine} />
              </View>

              <Text style={[s.contentText, { fontSize: fonts.sm }]}>
                {content}
              </Text>
            </>
          ) : null}

          {/* Botón ver completo */}
          <Pressable
            style={({ pressed }) => [
              s.fullBtn,
              { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
            onPress={() => Linking.openURL(url as string)}
          >
            <LinearGradient colors={['#E96928', '#c4511a']} style={s.fullBtnGradient}>
              <Ionicons name="globe-outline" size={18} color="#fff" />
              <Text style={[s.fullBtnText, { fontSize: fonts.base }]}>
                Ver noticia completa
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </Pressable>

          {/* Footer GuadalupeGO */}
          <View style={s.footer}>
            <View style={s.footerLogoRow}>
              <View style={s.footerLogoIcon}>
                <Ionicons name="location" size={10} color="#fff" />
              </View>
              <Text style={[s.footerLogo, { fontSize: fonts.sm }]}>
                Guadalupe<Text style={{ color: '#E96928' }}>GO</Text>
              </Text>
            </View>
            <Text style={[s.footerSub, { fontSize: fonts.xs }]}>
              Tu guía de Guadalupe, NL
            </Text>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: c.background },

  // ── Hero ───────────────────────────────────────────────
  hero:      { width: '100%', height: 280, justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },

  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 40, height: 40, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  shareHeroBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    right: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 40, height: 40, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  heroBadgeRow: {
    position: 'absolute', bottom: 18, left: 18,
    flexDirection: 'row', gap: 8,
  },
  newsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  newsDot:      { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  newsBadgeText:{ color: '#fff', fontWeight: '600' },

  // ── Main card ──────────────────────────────────────────
  mainCard: {
    backgroundColor: c.card,
    marginTop: -22,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 22, paddingTop: 24, paddingBottom: 20,
    borderWidth: 1, borderColor: c.border,
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08, shadowRadius: 8,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  date:    { color: '#E96928', fontWeight: '600', textTransform: 'capitalize' },
  title:   {
    fontWeight: '900', color: c.text,
    letterSpacing: -0.5, lineHeight: f['2xl'] * 1.25,
    marginBottom: 18,
  },

  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, borderRadius: 14, overflow: 'hidden',
    elevation: 4,
    shadowColor: '#E96928', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 6,
  },
  actionBtnGradient: {
    height: 48, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  actionBtnText: { color: '#fff', fontWeight: '700' },
  shareBtn: {
    height: 48, borderWidth: 2, borderColor: '#E96928',
    borderRadius: 14, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 6,
    paddingHorizontal: 16,
  },
  shareBtnText: { color: '#E96928', fontWeight: '700' },

  // ── Content card ───────────────────────────────────────
  contentCard: {
    backgroundColor: c.card,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: c.border,
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.07, shadowRadius: 6,
    marginBottom: 16,
  },

  // Descripción con acento
  descBlock:  { flexDirection: 'row', gap: 14, marginBottom: 20 },
  descAccent: { width: 4, borderRadius: 2, backgroundColor: '#E96928' },
  description:{ flex: 1, color: c.text, lineHeight: f.base * 1.7, fontWeight: '500' },

  // Divisor
  divider:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: c.border },
  dividerIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: c.inputBackground,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: c.border,
  },

  contentText: { color: c.subtext, lineHeight: f.sm * 1.75, marginBottom: 24 },

  // Botón ver completo
  fullBtn: {
    borderRadius: 16, overflow: 'hidden',
    elevation: 5,
    shadowColor: '#E96928', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8,
    marginBottom: 24,
  },
  fullBtnGradient: {
    height: 54, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  fullBtnText: { color: '#fff', fontWeight: '800' },

  // Footer
  footer:        { alignItems: 'center', gap: 4, paddingTop: 4 },
  footerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerLogoIcon: {
    width: 18, height: 18, borderRadius: 5,
    backgroundColor: '#E96928',
    justifyContent: 'center', alignItems: 'center',
  },
  footerLogo: { fontWeight: '800', color: c.text },
  footerSub:  { color: c.subtext },
});
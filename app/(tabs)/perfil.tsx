import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ScrollView, StatusBar, Image, Alert,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';

export default function PerfilScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  const seleccionarDeGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('profile_permission_gallery'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setFotoPerfil(result.assets[0].uri);
  };

  const tomarFoto = async () => {
    const { status } = await Camera.Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('profile_permission_camera'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setFotoPerfil(result.assets[0].uri);
  };

  const cambiarFoto = () => {
    Alert.alert(t('profile_photo'), t('profile_photo'), [
      { text: `📷 ${t('profile_camera')}`,  onPress: tomarFoto },
      { text: `🖼️ ${t('profile_gallery')}`, onPress: seleccionarDeGaleria },
      { text: t('profile_cancel'), style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ══ BANNER ══════════════════════════════════════ */}
        <LinearGradient
          colors={['#E96928', '#c4511a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.banner}
        >
          <View style={s.circle1} />
          <View style={s.circle2} />

          <Pressable style={s.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>

          <Pressable onPress={cambiarFoto} style={s.avatarWrapper}>
            {fotoPerfil ? (
              <Image source={{ uri: fotoPerfil }} style={s.avatarImage} />
            ) : (
              <View style={s.avatarCircle}>
                <Ionicons name="person" size={38} color="#E96928" />
              </View>
            )}
            <View style={s.cameraOverlay}>
              <Ionicons name="camera" size={13} color="#fff" />
            </View>
          </Pressable>

          <Text style={[s.welcomeText, { fontSize: fonts['2xl'] }]}>
            {t('welcome')}
          </Text>
          <Text style={[s.instructionText, { fontSize: fonts.sm }]}>
            {t('Per')}
          </Text>
        </LinearGradient>

        {/* ══ FORMULARIO ══════════════════════════════════ */}
        <View style={s.formCard}>

          {/* Email */}
          <View style={s.inputWrapper}>
            <View style={s.inputIconWrap}>
              <Ionicons name="mail-outline" size={18} color="#E96928" />
            </View>
            <TextInput
              style={[s.input, { fontSize: fonts.base }]}
              placeholder={t('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.subtext}
            />
          </View>

          {/* Contraseña */}
          <View style={s.inputWrapper}>
            <View style={s.inputIconWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#E96928" />
            </View>
            <TextInput
              style={[s.input, { fontSize: fonts.base }]}
              placeholder={t('profile_password')}
              secureTextEntry
              placeholderTextColor={colors.subtext}
            />
          </View>

          {/* Botón confirmar */}
          <Pressable
            style={({ pressed }) => [
              s.loginBtn,
              { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={['#E96928', '#c4511a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.loginBtnGradient}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={[s.loginBtnText, { fontSize: fonts.md }]}>
                {t('confirm')}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => router.back()}>
            <Text style={[s.forgotText, { fontSize: fonts.sm }]}>
              {t('back')}
            </Text>
          </Pressable>
        </View>

        {/* ══ DIVISOR ═════════════════════════════════════ */}
        <View style={s.divider}>
          <View style={s.dividerLine} />
          <View style={s.dividerBadge}>
            <Text style={[s.dividerText, { fontSize: fonts.xs }]}>
              {t('All')}
            </Text>
          </View>
          <View style={s.dividerLine} />
        </View>

        {/* ══ BOTONES SOCIALES ════════════════════════════ */}
        <View style={s.socialButtons}>
          <Pressable
            style={({ pressed }) => [s.socialBtn, s.googleBtn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={s.socialIconWrap}>
              <FontAwesome5 name="google" size={16} color="#ea4335" />
            </View>
            <Text style={[s.socialBtnText, { fontSize: fonts.base, color: colors.text }]}>
              {t('profile_google')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.socialBtn, s.appleBtn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={[s.socialIconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name="logo-apple" size={18} color="#fff" />
            </View>
            <Text style={[s.socialBtnText, { fontSize: fonts.base, color: '#fff' }]}>
              {t('profile_apple')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </View>

        {/* ══ REGISTRO ════════════════════════════════════ */}
        <Pressable style={s.registerContainer}>
          <Text style={[s.registerText, { fontSize: fonts.base }]}>
            {t('profile_no_account')}{' '}
            <Text style={s.orangeLink}>{t('profile_register')}</Text>
          </Text>
        </Pressable>

        {/* ══ INFO APP ════════════════════════════════════ */}
        <View style={s.appInfo}>
          <View style={s.appInfoLogoRow}>
            <View style={s.appInfoIconWrap}>
              <Ionicons name="location" size={10} color="#fff" />
            </View>
            <Text style={[s.appInfoLogo, { fontSize: fonts.sm }]}>
              Guadalupe<Text style={{ color: '#E96928' }}>GO</Text>
            </Text>
          </View>
          <Text style={[s.appInfoVersion, { fontSize: fonts.xs }]}>
            {t('app_version')}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: c.background },
  scrollContent: { paddingBottom: 40 },
  banner: {
    paddingHorizontal: 22, paddingTop: 16, paddingBottom: 32,
    overflow: 'hidden', alignItems: 'center',
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36, marginBottom: 4,
  },
  circle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -60,
  },
  circle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -40, left: -40,
  },
  closeBtn: {
    alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8, borderRadius: 12, marginBottom: 20,
  },
  avatarWrapper:  { marginBottom: 16, position: 'relative' },
  avatarCircle:   {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 8,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarImage:    {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
  },
  cameraOverlay:  {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: '#c4511a', borderRadius: 14,
    width: 26, height: 26,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff', elevation: 4,
  },
  welcomeText:     { color: '#fff', fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  instructionText: { color: 'rgba(255,255,255,0.8)', marginTop: 6, textAlign: 'center', fontWeight: '500', paddingHorizontal: 20 },
  formCard: {
    marginHorizontal: 20, marginTop: 24, backgroundColor: c.card,
    borderRadius: 26, padding: 22, borderWidth: 1, borderColor: c.border,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 10, gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.inputBackground,
    borderRadius: 16, paddingHorizontal: 14, height: 56,
    borderWidth: 1, borderColor: c.border,
  },
  inputIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: isDark ? 'rgba(233,105,40,0.15)' : 'rgba(233,105,40,0.1)',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  input:        { flex: 1, color: c.text },
  loginBtn:     {
    borderRadius: 16, overflow: 'hidden', elevation: 5,
    shadowColor: '#E96928', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, marginTop: 4,
  },
  loginBtnGradient: {
    height: 56, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  loginBtnText: { color: '#fff', fontWeight: '800' },
  forgotText:   { textAlign: 'center', color: c.subtext, marginTop: 2 },
  divider: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 24, paddingHorizontal: 20,
  },
  dividerLine:  { flex: 1, height: 1, backgroundColor: c.border },
  dividerBadge: {
    marginHorizontal: 12, backgroundColor: c.card,
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: c.border,
  },
  dividerText:   { color: c.subtext, fontWeight: '600' },
  socialButtons: { paddingHorizontal: 20, gap: 12 },
  socialBtn: {
    height: 56, borderRadius: 18, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, gap: 12, borderWidth: 1,
  },
  googleBtn:      { backgroundColor: c.card, borderColor: c.border },
  appleBtn:       { backgroundColor: '#000', borderColor: '#000' },
  socialIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(234,67,53,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  socialBtnText:     { flex: 1, fontWeight: '700' },
  registerContainer: { marginTop: 24, alignItems: 'center' },
  registerText:      { color: c.subtext },
  orangeLink:        { color: '#E96928', fontWeight: '800' },
  appInfo:           { marginTop: 32, alignItems: 'center', gap: 4, paddingBottom: 10 },
  appInfoLogoRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appInfoIconWrap:   {
    width: 18, height: 18, borderRadius: 5,
    backgroundColor: '#E96928',
    justifyContent: 'center', alignItems: 'center',
  },
  appInfoLogo:    { fontWeight: '800', color: c.text },
  appInfoVersion: { color: c.subtext },
});
/* ====================== Cuando exista backend reemplazar ===================== */

// import { getUsuario } from "@/src/api/api";
// const [usuario, setUsuario] = useState(USUARIO_DATA);

/*
import { useEffect } from "react";

useEffect(() => {

  const cargarUsuario = async () => {
    try {
      const data = await getUsuario();
      setUsuario(data);
    } catch (error) {
      console.log("Usando datos locales");
    }
  };

  cargarUsuario();

}, []);
*/

/* ============================================================================ */
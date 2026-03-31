import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ScrollView, StatusBar, Image, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { solicitarCodigo, verificarCodigo, registrarUsuario } from '../../src/api/api';

type Step = 'login' | 'registro' | 'codigo';

// ── Avatar superior ─────────────────────────────────────────
// showCamera=true solo cuando el usuario ya tiene sesión
function AvatarSection({
  fotoPerfil, onCambiarFoto, showCamera = false,
}: { fotoPerfil: string | null; onCambiarFoto: () => void; showCamera?: boolean }) {
  return (
    <Pressable onPress={showCamera ? onCambiarFoto : undefined} style={styles.avatarWrapper}>
      {fotoPerfil ? (
        <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={38} color="#E96928" />
        </View>
      )}
      {showCamera && (
        <View style={styles.cameraOverlay}>
          <Ionicons name="camera" size={13} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

// ════════════════════════════════════════════════════════════
export default function PerfilScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  const { usuario, fotoPerfil, isAuthenticated, login, logout, actualizarUsuario, actualizarFoto } = useAuth();

  const [step,    setStep]    = useState<Step>('login');
  const [email,   setEmail]   = useState('');
  const [nombre,  setNombre]  = useState('');
  const [codigo,  setCodigo]  = useState('');
  const [loading, setLoading] = useState(false);

  // ── Foto de perfil ─────────────────────────────────────
  const cambiarFoto = () => {
    Alert.alert(t('profile_photo'), '', [
      { text: `📷 ${t('profile_camera')}`,  onPress: tomarFoto },
      { text: `🖼️ ${t('profile_gallery')}`, onPress: seleccionarDeGaleria },
      { text: t('profile_cancel'), style: 'cancel' },
    ]);
  };

  const seleccionarDeGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t('profile_permission_gallery')); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) actualizarFoto(result.assets[0].uri);
  };

  const tomarFoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) actualizarFoto(result.assets[0].uri);
  };

  // ── Auth handlers ──────────────────────────────────────
  const handleSolicitarCodigo = async () => {
    if (!email.trim()) { Alert.alert('Error', 'Ingresa tu correo electrónico'); return; }
    setLoading(true);
    try {
      const res = await solicitarCodigo(email.trim().toLowerCase());
      if (res.success) {
        if (res.data?.codigo) Alert.alert('Código (dev)', `Tu código es: ${res.data.codigo}`);
        else Alert.alert('Código enviado', 'Revisa tu correo electrónico');
        setStep('codigo');
      } else {
        Alert.alert('Error', res.error?.mensaje || 'No se pudo enviar el código');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error?.mensaje || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async () => {
    if (!nombre.trim() || !email.trim()) { Alert.alert('Error', 'Ingresa tu nombre y correo'); return; }
    setLoading(true);
    try {
      const res = await registrarUsuario(nombre.trim(), email.trim().toLowerCase());
      if (res.success) {
        Alert.alert('Cuenta creada', 'Ahora te enviaremos un código de verificación');
        await handleSolicitarCodigo();
      } else {
        Alert.alert('Error', res.error?.mensaje || 'No se pudo crear la cuenta');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error?.mensaje || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigo.trim()) { Alert.alert('Error', 'Ingresa el código de verificación'); return; }
    setLoading(true);
    try {
      const res = await verificarCodigo(email.trim().toLowerCase(), codigo.trim());
      if (res.success) {
        await login(res.data.token, res.data.usuario);
        setCodigo(''); setEmail(''); setNombre('');
      } else {
        Alert.alert('Error', res.error?.mensaje || 'Código incorrecto');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error?.mensaje || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarSesion = async () => {
    await logout();
    setStep('login');
    setEmail(''); setNombre(''); setCodigo('');
  };

  // ════════════════ VISTA: USUARIO LOGUEADO ═══════════════
  if (isAuthenticated && usuario) {
    return (
      <SafeAreaView style={s.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#E96928" />
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Banner */}
          <LinearGradient
            colors={['#E96928', '#c4511a']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.banner}
          >
            <View style={s.circle1} /><View style={s.circle2} />
            <Pressable style={s.closeBtn} onPress={() => router.back()}>
              <Ionicons name="close" size={20} color="#fff" />
            </Pressable>
            <AvatarSection fotoPerfil={fotoPerfil} onCambiarFoto={cambiarFoto} />
            <Text style={[s.welcomeText, { fontSize: fonts['2xl'] }]}>{usuario.nombre}</Text>
            <Text style={[s.instructionText, { fontSize: fonts.sm }]}>{usuario.email}</Text>
            {usuario.rol === 'comercio' && (
              <View style={styles.rolBadge}>
                <Ionicons name="storefront" size={13} color="#E96928" />
                <Text style={styles.rolBadgeText}>Locatario</Text>
              </View>
            )}
          </LinearGradient>

          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            {/* Editar datos y foto → nueva pantalla */}
            <Pressable
              style={[styles.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(stack)/editarPerfil')}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(233,105,40,0.1)' }]}>
                <Ionicons name="create-outline" size={20} color="#E96928" />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text, fontSize: fonts.base }]}>
                {t('edit_profile_btn')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
            </Pressable>

            {/* Sección locatario */}
            {usuario.rol === 'comercio' ? (
              <Pressable
                style={styles.locatarioButton}
                onPress={() => router.push('/registrar-negocio' as any)}
              >
                <Ionicons name="storefront-outline" size={22} color="#fff" />
                <Text style={styles.locatarioButtonText}>Registrar mi negocio</Text>
              </Pressable>
            ) : (
              <View style={[styles.locatarioCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="storefront-outline" size={30} color="#E96928" />
                <Text style={[styles.locatarioTitle, { color: colors.text }]}>¿Tienes un negocio?</Text>
                <Text style={[styles.locatarioDesc, { color: colors.subtext }]}>
                  Solicita ser locatario para publicar tu comercio en GuadalupeGO.
                </Text>
              </View>
            )}

            {/* Cerrar sesión */}
            <Pressable
              style={[styles.logoutButton, { borderColor: '#E96928', backgroundColor: colors.card }]}
              onPress={handleCerrarSesion}
            >
              <Ionicons name="log-out-outline" size={20} color="#E96928" />
              <Text style={styles.logoutText}>{t('profile_logout')}</Text>
            </Pressable>
          </View>

          <AppInfoFooter fonts={fonts} colors={colors} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ════════════════ VISTA: PASO CÓDIGO ════════════════════
  if (step === 'codigo') {
    return (
      <SafeAreaView style={s.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#E96928" />
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#E96928', '#c4511a']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.banner}
          >
            <View style={s.circle1} /><View style={s.circle2} />
            <Pressable style={s.closeBtn} onPress={() => router.back()}>
              <Ionicons name="close" size={20} color="#fff" />
            </Pressable>
            <View style={styles.avatarCircle}>
              <Ionicons name="key" size={36} color="#E96928" />
            </View>
            <Text style={[s.welcomeText, { fontSize: fonts['2xl'] }]}>{t('verification_title')}</Text>
            <Text style={[s.instructionText, { fontSize: fonts.sm }]}>
              {t('profile_code_sent_to')} {email}
            </Text>
          </LinearGradient>

          <View style={[s.formCard, { marginTop: 24 }]}>
            <View style={s.inputWrapper}>
              <View style={s.inputIconWrap}>
                <Ionicons name="key-outline" size={18} color="#E96928" />
              </View>
              <TextInput
                style={[s.input, { fontSize: fonts.base }]}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                value={codigo}
                onChangeText={setCodigo}
                placeholderTextColor={colors.subtext}
                editable={!loading}
              />
            </View>

            <Pressable
              style={[s.loginBtn, { opacity: loading ? 0.6 : 1 }]}
              onPress={handleVerificarCodigo}
              disabled={loading}
            >
              <LinearGradient
                colors={['#E96928', '#c4511a']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.loginBtnGradient}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={[s.loginBtnText, { fontSize: fonts.md }]}>{t('confirm')}</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable onPress={handleSolicitarCodigo} disabled={loading}>
              <Text style={[s.forgotText, { fontSize: fonts.sm }]}>{t('verification_resend')}</Text>
            </Pressable>
            <Pressable onPress={() => { setStep('login'); setCodigo(''); }}>
              <Text style={[s.forgotText, { fontSize: fonts.sm }]}>{t('back')}</Text>
            </Pressable>
          </View>

          <AppInfoFooter fonts={fonts} colors={colors} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ════════════════ VISTA: REGISTRO ═══════════════════════
  if (step === 'registro') {
    return (
      <SafeAreaView style={s.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#E96928" />
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#E96928', '#c4511a']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.banner}
          >
            <View style={s.circle1} /><View style={s.circle2} />
            <Pressable style={s.closeBtn} onPress={() => router.back()}>
              <Ionicons name="close" size={20} color="#fff" />
            </Pressable>
            <AvatarSection fotoPerfil={fotoPerfil} onCambiarFoto={cambiarFoto} />
            <Text style={[s.welcomeText, { fontSize: fonts['2xl'] }]}>{t('profile_create_account')}</Text>
            <Text style={[s.instructionText, { fontSize: fonts.sm }]}>
              {t('profile_register_sub')}
            </Text>
          </LinearGradient>

          <View style={[s.formCard, { marginTop: 24 }]}>
            <View style={s.inputWrapper}>
              <View style={s.inputIconWrap}>
                <Ionicons name="person-outline" size={18} color="#E96928" />
              </View>
              <TextInput
                style={[s.input, { fontSize: fonts.base }]}
                placeholder={t('edit_profile_full_name')}
                autoCapitalize="words"
                value={nombre}
                onChangeText={setNombre}
                placeholderTextColor={colors.subtext}
                editable={!loading}
              />
            </View>

            <View style={s.inputWrapper}>
              <View style={s.inputIconWrap}>
                <Ionicons name="mail-outline" size={18} color="#E96928" />
              </View>
              <TextInput
                style={[s.input, { fontSize: fonts.base }]}
                placeholder={t('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={colors.subtext}
                editable={!loading}
              />
            </View>

            <Pressable
              style={[s.loginBtn, { opacity: loading ? 0.6 : 1 }]}
              onPress={handleRegistro}
              disabled={loading}
            >
              <LinearGradient
                colors={['#E96928', '#c4511a']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.loginBtnGradient}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={[s.loginBtnText, { fontSize: fonts.md }]}>{t('profile_create_account')}</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          <Pressable style={s.registerContainer} onPress={() => setStep('login')}>
            <Text style={[s.registerText, { fontSize: fonts.base }]}>
              {t('profile_already_account')}{' '}
              <Text style={s.orangeLink}>{t('profile_login')}</Text>
            </Text>
          </Pressable>

          <AppInfoFooter fonts={fonts} colors={colors} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ════════════════ VISTA: LOGIN ═══════════════════════════
  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        <LinearGradient
          colors={['#E96928', '#c4511a']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.banner}
        >
          <View style={s.circle1} /><View style={s.circle2} />
          <Pressable style={s.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
          <AvatarSection fotoPerfil={fotoPerfil} onCambiarFoto={cambiarFoto} />
          <Text style={[s.welcomeText, { fontSize: fonts['2xl'] }]}>{t('welcome')}</Text>
          <Text style={[s.instructionText, { fontSize: fonts.sm }]}>
            {t('profile_login_sub')}
          </Text>
        </LinearGradient>

        <View style={[s.formCard, { marginTop: 24 }]}>
          <View style={s.inputWrapper}>
            <View style={s.inputIconWrap}>
              <Ionicons name="mail-outline" size={18} color="#E96928" />
            </View>
            <TextInput
              style={[s.input, { fontSize: fonts.base }]}
              placeholder={t('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={colors.subtext}
              editable={!loading}
            />
          </View>

          <Pressable
            style={[s.loginBtn, { opacity: loading ? 0.6 : 1 }]}
            onPress={handleSolicitarCodigo}
            disabled={loading}
          >
            <LinearGradient
              colors={['#E96928', '#c4511a']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.loginBtnGradient}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={[s.loginBtnText, { fontSize: fonts.md }]}>{t('confirm')}</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => router.back()}>
            <Text style={[s.forgotText, { fontSize: fonts.sm }]}>{t('back')}</Text>
          </Pressable>
        </View>

        {/* Divisor */}
        <View style={s.divider}>
          <View style={s.dividerLine} />
          <View style={s.dividerBadge}>
            <Text style={[s.dividerText, { fontSize: fonts.xs }]}>{t('profile_or_continue')}</Text>
          </View>
          <View style={s.dividerLine} />
        </View>

        {/* Botones sociales */}
        <View style={s.socialButtons}>
          <Pressable
            style={({ pressed }) => [s.socialBtn, s.googleBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => Alert.alert('Google Sign-In', 'Próximamente disponible.\nRequiere configuración de Google Cloud Console.')}
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
            onPress={() => Alert.alert('Apple Sign-In', 'Próximamente disponible.\nRequiere cuenta de Apple Developer.')}
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

        {/* Registro */}
        <Pressable style={s.registerContainer} onPress={() => setStep('registro')}>
          <Text style={[s.registerText, { fontSize: fonts.base }]}>
            {t('profile_no_account')}{' '}
            <Text style={s.orangeLink}>{t('profile_register')}</Text>
          </Text>
        </Pressable>

        <AppInfoFooter fonts={fonts} colors={colors} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Footer de la app ────────────────────────────────────────
function AppInfoFooter({ fonts, colors }: { fonts: any; colors: any }) {
  return (
    <View style={styles.appInfo}>
      <View style={styles.appInfoLogoRow}>
        <View style={styles.appInfoIconWrap}>
          <Ionicons name="location" size={10} color="#fff" />
        </View>
        <Text style={[styles.appInfoLogo, { fontSize: fonts.sm, color: colors.text }]}>
          Guadalupe<Text style={{ color: '#E96928' }}>GO</Text>
        </Text>
      </View>
      <Text style={[styles.appInfoVersion, { fontSize: fonts.xs, color: colors.subtext }]}>
        v1.0.2 · 2026
      </Text>
    </View>
  );
}

// ── Estilos estáticos ───────────────────────────────────────
const styles = StyleSheet.create({
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
  sectionLabelRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionDot:       { width: 3, height: 14, borderRadius: 2, backgroundColor: '#E96928' },
  sectionLabelText: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  rolBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4, marginTop: 8,
  },
  rolBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1,
  },
  actionIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: { flex: 1, fontWeight: '600' },
  locatarioButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#E96928', borderRadius: 18,
    height: 55, marginBottom: 14, elevation: 4,
    marginTop: 4,
  },
  locatarioButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  locatarioCard: {
    borderRadius: 20, padding: 24, alignItems: 'center',
    marginBottom: 14, elevation: 2, gap: 8, borderWidth: 1, marginTop: 4,
  },
  locatarioTitle: { fontSize: 17, fontWeight: '800' },
  locatarioDesc:  { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 18, height: 55, borderWidth: 1, marginTop: 4,
  },
  logoutText: { color: '#E96928', fontSize: 16, fontWeight: '700' },
  appInfo:        { marginTop: 32, alignItems: 'center', gap: 4, paddingBottom: 20 },
  appInfoLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appInfoIconWrap: {
    width: 18, height: 18, borderRadius: 5, backgroundColor: '#E96928',
    justifyContent: 'center', alignItems: 'center',
  },
  appInfoLogo:    { fontWeight: '800' },
  appInfoVersion: {},
});

// ── Estilos dinámicos ────────────────────────────────────────
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
  welcomeText:     { color: '#fff', fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  instructionText: { color: 'rgba(255,255,255,0.8)', marginTop: 6, textAlign: 'center', fontWeight: '500', paddingHorizontal: 20 },
  formCard: {
    marginHorizontal: 20, backgroundColor: c.card,
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
    shadowOpacity: 0.4, shadowRadius: 8,
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
});

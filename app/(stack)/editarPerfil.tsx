import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ScrollView, StatusBar, Image, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { editarPerfil, eliminarCuenta, subirFotoPerfil } from '../../src/api/api';

export default function EditarPerfilScreen() {
  const { colors, fonts, isDark } = useTheme();
  const { usuario, fotoPerfil, actualizarUsuario, actualizarFoto, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const s = makeStyles(colors, fonts, isDark);

  const [nombre,       setNombre]       = useState(usuario?.nombre ?? '');
  const [loading,      setLoading]      = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [goodbyeModal, setGoodbyeModal] = useState(false);
  const [countdown,    setCountdown]    = useState(3);
  const [pendingPhoto, setPendingPhoto] = useState<{ uri: string; base64: string } | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Foto a mostrar: pendiente (no subida aún) o la guardada en contexto
  const fotoDisplay = pendingPhoto?.uri ?? fotoPerfil;
  const haycambios = nombre.trim() !== (usuario?.nombre ?? '') || pendingPhoto !== null;

  // Cuenta regresiva del modal de despedida
  useEffect(() => {
    if (goodbyeModal) {
      setCountdown(3);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [goodbyeModal]);

  // Navegar cuando el countdown llega a 0 (fuera del render)
  useEffect(() => {
    if (countdown === 0 && goodbyeModal) {
      clearInterval(countdownRef.current!);
      setGoodbyeModal(false);
      // dismissAll regresa al perfil YA existente en el stack (sin duplicarlo)
      // El useEffect en perfil.tsx resetea el step a 'login' al detectar !isAuthenticated
      setTimeout(() => router.dismissAll(), 100);
    }
  }, [countdown, goodbyeModal]);

  // ── Foto ───────────────────────────────────────────────
  const cambiarFoto = () => {
    Alert.alert(t('photo_title'), '', [
      {
        text: t('photo_option_camera'),
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.8, base64: true,
          });
          if (!result.canceled && result.assets[0].base64) {
            const asset = result.assets[0];
            setPendingPhoto({ uri: asset.uri, base64: `data:image/jpeg;base64,${asset.base64}` });
          }
        },
      },
      {
        text: t('photo_option_gallery'),
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { Alert.alert(t('profile_permission_gallery')); return; }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true, aspect: [1, 1], quality: 0.8, base64: true,
          });
          if (!result.canceled && result.assets[0].base64) {
            const asset = result.assets[0];
            setPendingPhoto({ uri: asset.uri, base64: `data:image/jpeg;base64,${asset.base64}` });
          }
        },
      },
      { text: t('profile_cancel'), style: 'cancel' },
    ]);
  };

  const quitarFoto = () => {
    Alert.alert(t('photo_remove_confirm_title'), t('photo_remove_confirm_body'), [
      { text: t('profile_cancel'), style: 'cancel' },
      {
        text: t('photo_remove_btn'),
        style: 'destructive',
        onPress: () => {
          if (pendingPhoto) {
            // Solo limpiar la selección pendiente
            setPendingPhoto(null);
          } else {
            // Quitar foto guardada
            actualizarFoto(null);
          }
        },
      },
    ]);
  };

  // ── Eliminar cuenta ────────────────────────────────────
  const confirmarEliminarCuenta = () => {
    Alert.alert(
      t('delete_account_title'),
      t('delete_account_confirm'),
      [
        { text: t('profile_cancel'), style: 'cancel' },
        {
          text: t('delete_account_btn'),
          style: 'destructive',
          onPress: ejecutarEliminarCuenta,
        },
      ]
    );
  };

  const ejecutarEliminarCuenta = async () => {
    setDeleting(true);
    try {
      const res = await eliminarCuenta();
      if (!res.success) {
        // El servidor respondió pero con error — avisamos pero igual limpiamos local
        console.warn('[eliminarCuenta] servidor respondió con error:', res.error?.mensaje);
      }
    } catch (e) {
      // Error de red — igualmente limpiamos localmente
      console.warn('[eliminarCuenta] error de red:', e);
    } finally {
      // Limpiar sesión + foto localmente siempre
      await actualizarFoto(null);
      await logout();
      setDeleting(false);
      setGoodbyeModal(true);
    }
  };

  // ── Guardar cambios ────────────────────────────────────
  const aplicarCambios = async () => {
    if (!nombre.trim()) { Alert.alert('Error', 'El nombre no puede estar vacío'); return; }
    setLoading(true);
    try {
      // 1. Subir foto a S3 si hay una pendiente
      if (pendingPhoto) {
        try {
          const fotoRes = await subirFotoPerfil(pendingPhoto.base64);
          if (fotoRes.success && fotoRes.data?.url) {
            await actualizarFoto(fotoRes.data.url);
            await actualizarUsuario({ foto_url: fotoRes.data.url });
          }
        } catch (e: any) {
          // S3 puede no estar configurado en desarrollo — avisamos pero continuamos con el nombre
          const codigo = e?.response?.data?.error?.codigo;
          if (codigo === 'S3_ERROR' || e?.response?.status === 500) {
            Alert.alert(
              'Foto no subida',
              'No se pudo subir la foto (servidor de imágenes no disponible). El nombre se guardará de todos modos.',
            );
          }
          // No hacemos return — seguimos guardando el nombre
        }
        setPendingPhoto(null);
      }

      // 2. Guardar nombre si cambió
      const nombreCambio = nombre.trim() !== (usuario?.nombre ?? '');
      if (nombreCambio) {
        const res = await editarPerfil(nombre.trim());
        if (res.success) {
          await actualizarUsuario({ nombre: res.data?.nombre ?? nombre.trim() });
        } else {
          Alert.alert('Error', res.error?.mensaje || 'No se pudo actualizar el nombre');
          return;
        }
      }

      Alert.alert('¡Listo!', 'Tus datos han sido actualizados.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ══ BANNER ══ */}
        <LinearGradient
          colors={['#E96928', '#c4511a']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.banner}
        >
          <View style={s.circle1} />
          <View style={s.circle2} />

          <Pressable style={s.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
            <Text style={[s.backLabel, { fontSize: fonts.sm }]}>{t('back')}</Text>
          </Pressable>

          {/* Avatar — solo visual (los controles están abajo en el formulario) */}
          <View style={s.avatarArea}>
            <View style={s.avatarWrap}>
              {fotoDisplay ? (
                <Image source={{ uri: fotoDisplay }} style={s.avatarImg} />
              ) : (
                <View style={s.avatarCircle}>
                  <Ionicons name="person" size={40} color="#E96928" />
                </View>
              )}
            </View>
          </View>

          <View style={s.bannerTitleRow}>
            <View style={s.bannerIconWrap}>
              <Ionicons name="create-outline" size={22} color="#E96928" />
            </View>
            <View>
              <Text style={[s.bannerTitle, { fontSize: fonts['2xl'] }]}>
                {t('edit_profile_title')}
              </Text>
              <Text style={[s.bannerSub, { fontSize: fonts.sm }]}>
                {t('edit_profile_sub')}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ══ FORMULARIO ══ */}
        <View style={s.card}>

          {/* Sección label */}
          <View style={s.sectionRow}>
            <View style={s.sectionBar} />
            <Text style={[s.sectionLabel, { fontSize: fonts.xs }]}>{t('edit_profile_section_data').toUpperCase()}</Text>
          </View>

          {/* Nombre */}
          <Text style={[s.fieldLabel, { fontSize: fonts.sm }]}>{t('edit_profile_full_name')}</Text>
          <View style={s.inputWrap}>
            <View style={s.inputIcon}>
              <Ionicons name="person-outline" size={18} color="#E96928" />
            </View>
            <TextInput
              style={[s.input, { fontSize: fonts.base }]}
              value={nombre}
              onChangeText={setNombre}
              placeholder={t('edit_profile_full_name')}
              placeholderTextColor={colors.subtext}
              autoCapitalize="words"
              editable={!loading}
            />
            {nombre.trim() !== (usuario?.nombre ?? '') && (
              <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginRight: 12 }} />
            )}
          </View>

          {/* Email — solo lectura */}
          <Text style={[s.fieldLabel, { fontSize: fonts.sm, marginTop: 4 }]}>
            {t('email')}
          </Text>
          <View style={[s.inputWrap, s.inputWrapDisabled]}>
            <View style={s.inputIcon}>
              <Ionicons name="mail-outline" size={18} color="#E96928" />
            </View>
            <TextInput
              style={[s.input, { fontSize: fonts.base, color: colors.subtext }]}
              value={usuario?.email ?? ''}
              editable={false}
            />
            <Ionicons name="lock-closed-outline" size={15} color={colors.subtext} style={{ marginRight: 12 }} />
          </View>
          <Text style={[s.emailNote, { fontSize: fonts.xs }]}>
            {t('edit_profile_email_note')}
          </Text>

          {/* Foto */}
          <View style={[s.sectionRow, { marginTop: 20 }]}>
            <View style={s.sectionBar} />
            <Text style={[s.sectionLabel, { fontSize: fonts.xs }]}>{t('edit_profile_section_photo').toUpperCase()}</Text>
          </View>

          <Pressable style={s.fotoRow} onPress={cambiarFoto}>
            <View style={s.fotoPreviewWrap}>
              {fotoDisplay ? (
                <Image source={{ uri: fotoDisplay }} style={s.fotoPreview} />
              ) : (
                <View style={[s.fotoPreview, s.fotoPreviewEmpty]}>
                  <Ionicons name="person" size={22} color={colors.subtext} />
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.fotoRowTitle, { fontSize: fonts.base }]}>
                {fotoDisplay ? t('edit_profile_change_photo') : t('edit_profile_add_photo')}
              </Text>
              <Text style={[s.fotoRowSub, { fontSize: fonts.xs }]}>
                {t('edit_profile_photo_hint2')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </Pressable>

          {fotoDisplay && (
            <Pressable style={s.removeRow} onPress={quitarFoto}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={[s.removeRowText, { fontSize: fonts.sm }]}>{t('edit_profile_remove_photo_row')}</Text>
            </Pressable>
          )}
        </View>

        {/* ══ BOTÓN APLICAR ══ */}
        <Pressable
          style={[s.applyBtn, (!haycambios || loading) && { opacity: 0.5 }]}
          onPress={aplicarCambios}
          disabled={!haycambios || loading}
        >
          <LinearGradient
            colors={['#E96928', '#c4511a']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.applyBtnGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                <Text style={[s.applyBtnText, { fontSize: fonts.md }]}>{t('edit_profile_apply')}</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        {/* ══ BOTÓN ELIMINAR CUENTA ══ */}
        <Pressable
          style={s.deleteBtn}
          onPress={confirmarEliminarCuenta}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#EF4444" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={[s.deleteBtnText, { fontSize: fonts.sm }]}>
                {t('delete_account_btn')}
              </Text>
            </>
          )}
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ══ MODAL DESPEDIDA ══ */}
      <Modal visible={goodbyeModal} transparent animationType="fade">
        <View style={s.goodbyeBackdrop}>
          <View style={s.goodbyeSheet}>
            <View style={s.goodbyeIconWrap}>
              <Text style={{ fontSize: 40 }}>👋</Text>
            </View>
            <Text style={[s.goodbyeTitle, { fontSize: fonts.xl }]}>
              {t('delete_account_goodbye_title')}
            </Text>
            <Text style={[s.goodbyeBody, { fontSize: fonts.sm }]}>
              {t('delete_account_goodbye_body')}
            </Text>
            <View style={s.goodbyeCountdownWrap}>
              <Text style={[s.goodbyeCountdown, { fontSize: fonts['2xl'] }]}>
                {countdown}
              </Text>
            </View>
            <Pressable
              style={s.goodbyeBtn}
              onPress={() => {
                if (countdownRef.current) clearInterval(countdownRef.current);
                setGoodbyeModal(false);
                setTimeout(() => router.dismissAll(), 100);
              }}
            >
              <Text style={[s.goodbyeBtnText, { fontSize: fonts.base }]}>
                {t('delete_account_goodbye_close')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: 20 },

  banner: {
    paddingHorizontal: 22, paddingTop: 16, paddingBottom: 28,
    overflow: 'hidden', marginBottom: 4,
  },
  circle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -60 },
  circle2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -40, left: -40 },

  backBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginBottom: 20 },
  backLabel: { color: '#fff', fontWeight: '600' },

  avatarArea:   { alignItems: 'center', marginBottom: 20 },
  avatarWrap:   { marginBottom: 8 },
  avatarImg:    { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)' },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },

  bannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6 },
  bannerTitle:    { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
  bannerSub:      { color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },

  card: {
    marginHorizontal: 20, marginTop: 16,
    backgroundColor: c.card, borderRadius: 22,
    padding: 20, borderWidth: 1, borderColor: c.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.07, shadowRadius: 8, elevation: 3,
  },

  sectionRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionBar:  { width: 3, height: 14, borderRadius: 2, backgroundColor: '#E96928' },
  sectionLabel:{ fontWeight: '700', color: c.subtext, letterSpacing: 0.8, textTransform: 'uppercase' },

  fieldLabel: { color: c.subtext, fontWeight: '600', marginBottom: 8 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.inputBackground, borderRadius: 16,
    height: 56, borderWidth: 1, borderColor: c.border, marginBottom: 4,
  },
  inputWrapDisabled: { opacity: 0.6 },
  inputIcon: {
    width: 34, height: 34, borderRadius: 10, marginLeft: 12, marginRight: 10,
    backgroundColor: isDark ? 'rgba(233,105,40,0.15)' : 'rgba(233,105,40,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  input: { flex: 1, color: c.text },

  emailNote: { color: c.subtext, marginBottom: 4, marginLeft: 4 },

  fotoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: c.inputBackground, borderRadius: 16,
    padding: 12, borderWidth: 1, borderColor: c.border,
  },
  fotoPreviewWrap: {},
  fotoPreview:      { width: 52, height: 52, borderRadius: 14 },
  fotoPreviewEmpty: { backgroundColor: c.border, justifyContent: 'center', alignItems: 'center' },
  fotoRowTitle:     { fontWeight: '700', color: c.text },
  fotoRowSub:       { color: c.subtext, marginTop: 2 },

  removeRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, padding: 10 },
  removeRowText: { color: '#EF4444', fontWeight: '600' },

  applyBtn: {
    marginHorizontal: 20, marginTop: 24,
    borderRadius: 18, overflow: 'hidden',
    elevation: 5, shadowColor: '#E96928',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  applyBtnGradient: {
    height: 58, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  applyBtnText: { color: '#fff', fontWeight: '900' },

  // Eliminar cuenta
  deleteBtn: {
    marginHorizontal: 20, marginTop: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 18,
    borderWidth: 1, borderColor: '#EF4444',
    backgroundColor: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)',
  },
  deleteBtnText: { color: '#EF4444', fontWeight: '700' },

  // Modal despedida
  goodbyeBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  goodbyeSheet: {
    backgroundColor: c.card, borderRadius: 28,
    padding: 28, alignItems: 'center', gap: 12, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 20,
  },
  goodbyeIconWrap: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: isDark ? 'rgba(233,105,40,0.12)' : 'rgba(233,105,40,0.08)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  goodbyeTitle: { fontWeight: '900', color: c.text, textAlign: 'center' },
  goodbyeBody:  { color: c.subtext, textAlign: 'center', lineHeight: 22 },
  goodbyeCountdownWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#E96928',
    justifyContent: 'center', alignItems: 'center',
    marginVertical: 4,
  },
  goodbyeCountdown: { color: '#fff', fontWeight: '900' },
  goodbyeBtn: {
    width: '100%', height: 52, borderRadius: 16,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: c.border,
  },
  goodbyeBtnText: { color: c.text, fontWeight: '700' },
});

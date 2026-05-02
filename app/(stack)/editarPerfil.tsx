import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { editarPerfil, eliminarCuenta } from '../../src/api/api';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function EditarPerfilScreen() {
  const { colors, fonts, isDark } = useTheme();
  const { usuario, fotoPerfil, actualizarUsuario, actualizarFoto, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const s = makeStyles(colors, fonts, isDark);

  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [goodbyeModal, setGoodbyeModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [pendingPhoto, setPendingPhoto] = useState<{ uri: string } | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bannerAnim  = useRef(new Animated.Value(0)).current;
  const cardAnim    = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const focusAnim   = useRef(new Animated.Value(0)).current;

  // StatusBar — la zona del status bar es la SafeAreaView (fondo del tema),
  // no el header naranja. Por eso usamos iconos del tema, NO siempre claros.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(colors.background);
      }
    }, [isDark, colors.background])
  );

  // ── Border animado
  const animatedBorderColor = focusAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [colors.border, '#E96928'],
  });
  const animatedShadowOpacity = focusAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 0.18],
  });

  // ── Floating label — solo animación de color (siempre visible arriba del input)
  const labelColor = focusAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [colors.text, '#E96928'],
  });

  const handleNombreFocus = () =>
    Animated.timing(focusAnim, { toValue: 1, duration: 160, useNativeDriver: false }).start();

  const handleNombreBlur = () =>
    Animated.timing(focusAnim, { toValue: 0, duration: 160, useNativeDriver: false }).start();

  const fotoDisplay = pendingPhoto?.uri ?? fotoPerfil;
  const haycambios = nombre.trim() !== (usuario?.nombre ?? '') || pendingPhoto !== null;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(bannerAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(actionsAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bannerAnim, cardAnim, actionsAnim]);

  useEffect(() => {
    if (goodbyeModal) {
      setCountdown(3);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [goodbyeModal]);

  useEffect(() => {
    if (countdown === 0 && goodbyeModal) {
      clearInterval(countdownRef.current!);
      setGoodbyeModal(false);
      setTimeout(() => router.dismissAll(), 100);
    }
  }, [countdown, goodbyeModal, router]);

  const cambiarFoto = () => {
    Alert.alert(t('photo_title'), '', [
      {
        text: t('photo_option_camera'),
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(t('profile_permission_gallery'));
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled) {
            setPendingPhoto({ uri: result.assets[0].uri });
          }
        },
      },
      {
        text: t('photo_option_gallery'),
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(t('profile_permission_gallery'));
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled) {
            setPendingPhoto({ uri: result.assets[0].uri });
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
            setPendingPhoto(null);
          } else {
            actualizarFoto(null);
          }
        },
      },
    ]);
  };

  const confirmarEliminarCuenta = () => {
    Alert.alert(t('delete_account_title'), t('delete_account_confirm'), [
      { text: t('profile_cancel'), style: 'cancel' },
      {
        text: t('delete_account_btn'),
        style: 'destructive',
        onPress: ejecutarEliminarCuenta,
      },
    ]);
  };

  const ejecutarEliminarCuenta = async () => {
    setDeleting(true);
    try {
      const res = await eliminarCuenta();
      if (!res.success) {
        if (__DEV__) console.warn('[eliminarCuenta] servidor respondió con error:', res.error?.mensaje);
      }
    } catch (e) {
      if (__DEV__) console.warn('[eliminarCuenta] error de red:', e);
    } finally {
      await actualizarFoto(null);
      await logout();
      setDeleting(false);
      setGoodbyeModal(true);
    }
  };

  const aplicarCambios = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    setLoading(true);
    try {
      // Foto: solo guardado local, sin servidor
      if (pendingPhoto) {
        await actualizarFoto(pendingPhoto.uri);
        setPendingPhoto(null);
      }

      // Nombre: sí va al backend
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

  const bannerAnimatedStyle = {
    opacity: bannerAnim,
    transform: [
      {
        translateY: bannerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  const cardAnimatedStyle = {
    opacity: cardAnim,
    transform: [
      {
        translateY: cardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const actionsAnimatedStyle = {
    opacity: actionsAnim,
    transform: [
      {
        translateY: actionsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={bannerAnimatedStyle}>
          <LinearGradient
            colors={['#E96928', '#c4511a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.banner}
          >
            <View style={s.circle1} />
            <View style={s.circle2} />

            <Pressable
              style={({ pressed }) => [
                s.backBtn,
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={18} color="#fff" />
              <Text style={[s.backLabel, { fontSize: fonts.sm }]}>{t('back')}</Text>
            </Pressable>

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
              <View style={{ flex: 1 }}>
                <Text style={[s.bannerTitle, { fontSize: fonts['2xl'] }]}>
                  {t('edit_profile_title')}
                </Text>
                <Text style={[s.bannerSub, { fontSize: fonts.sm }]}>
                  {t('edit_profile_sub')}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={cardAnimatedStyle}>
          <View style={s.card}>
            <View style={s.sectionRow}>
              <View style={s.sectionBar} />
              <Text style={[s.sectionLabel, { fontSize: fonts.xs }]}>
                {t('edit_profile_section_data').toUpperCase()}
              </Text>
            </View>

            {/* Etiqueta — siempre visible, se pone naranja al enfocar */}
            <Animated.Text style={[s.fieldLabel, { fontSize: fonts.sm, color: labelColor }]}>
              {t('edit_profile_full_name')}
            </Animated.Text>

            <Animated.View
              style={[
                s.inputWrap,
                {
                  borderColor:   animatedBorderColor,
                  shadowColor:   '#E96928',
                  shadowOpacity: animatedShadowOpacity,
                  shadowOffset:  { width: 0, height: 0 },
                  shadowRadius:  8,
                  elevation:     0,
                },
              ]}
            >
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
                onFocus={handleNombreFocus}
                onBlur={handleNombreBlur}
              />
              {nombre.trim() !== (usuario?.nombre ?? '') && nombre.length > 0 && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#10B981"
                  style={{ marginRight: 4 }}
                />
              )}
              {nombre.length > 0 && (
                <Pressable
                  onPress={() => setNombre('')}
                  hitSlop={8}
                  style={{ paddingHorizontal: 10, paddingVertical: 4 }}
                >
                  <Ionicons name="close-circle" size={18} color={colors.subtext} />
                </Pressable>
              )}
            </Animated.View>

            <Text style={[s.fieldLabel, { fontSize: fonts.sm, marginTop: 6 }]}>
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
              <Ionicons
                name="lock-closed-outline"
                size={15}
                color={colors.subtext}
                style={{ marginRight: 12 }}
              />
            </View>

            <Text style={[s.emailNote, { fontSize: fonts.xs }]}>
              {t('edit_profile_email_note')}
            </Text>

            <View style={[s.sectionRow, { marginTop: 20 }]}>
              <View style={s.sectionBar} />
              <Text style={[s.sectionLabel, { fontSize: fonts.xs }]}>
                {t('edit_profile_section_photo').toUpperCase()}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                s.fotoRow,
                {
                  opacity: pressed ? 0.94 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}
              onPress={cambiarFoto}
            >
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
                  {fotoDisplay
                    ? t('edit_profile_change_photo')
                    : t('edit_profile_add_photo')}
                </Text>
                <Text style={[s.fotoRowSub, { fontSize: fonts.xs }]}>
                  {t('edit_profile_photo_hint2')}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
            </Pressable>

            {fotoDisplay && (
              <Pressable
                style={({ pressed }) => [
                  s.removeRow,
                  {
                    opacity: pressed ? 0.75 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}
                onPress={quitarFoto}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={[s.removeRowText, { fontSize: fonts.sm }]}>
                  {t('edit_profile_remove_photo_row')}
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        <Animated.View style={actionsAnimatedStyle}>
          <Pressable
            style={[s.applyBtn, (!haycambios || loading) && { opacity: 0.5 }]}
            onPress={aplicarCambios}
            disabled={!haycambios || loading}
          >
            <LinearGradient
              colors={['#E96928', '#c4511a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.applyBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                  <Text style={[s.applyBtnText, { fontSize: fonts.md }]}>
                    {t('edit_profile_apply')}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              s.deleteBtn,
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
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
        </Animated.View>
      </ScrollView>

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
              style={({ pressed }) => [
                s.goodbyeBtn,
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}
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

const makeStyles = (c: any, f: any, isDark: boolean) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    scroll: { paddingBottom: 20 },

    banner: {
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 30,
      overflow: 'hidden',
      marginBottom: 4,
      borderBottomLeftRadius: 34,
      borderBottomRightRadius: 34,
    },

    circle1: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(255,255,255,0.07)',
      top: -60,
      right: -60,
    },

    circle2: {
      position: 'absolute',
      width: 130,
      height: 130,
      borderRadius: 65,
      backgroundColor: 'rgba(255,255,255,0.05)',
      bottom: -40,
      left: -40,
    },

    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 999,
      marginBottom: 20,
    },

    backLabel: {
      color: '#fff',
      fontWeight: '700',
    },

    avatarArea: {
      alignItems: 'center',
      marginBottom: 20,
    },

    avatarWrap: {
      marginBottom: 8,
    },

    avatarImg: {
      width: 94,
      height: 94,
      borderRadius: 47,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.6)',
    },

    avatarCircle: {
      width: 94,
      height: 94,
      borderRadius: 47,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.6)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },

    bannerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },

    bannerIconWrap: {
      width: 54,
      height: 54,
      borderRadius: 17,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },

    bannerTitle: {
      color: '#fff',
      fontWeight: '900',
      letterSpacing: -0.5,
    },

    bannerSub: {
      color: 'rgba(255,255,255,0.82)',
      marginTop: 2,
      fontWeight: '500',
    },

    card: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: c.card,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: c.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.07,
      shadowRadius: 8,
      elevation: 3,
    },

    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14,
    },

    sectionBar: {
      width: 3,
      height: 14,
      borderRadius: 2,
      backgroundColor: '#E96928',
    },

    sectionLabel: {
      fontWeight: '700',
      color: c.subtext,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },

    fieldLabel: {
      color: c.subtext,
      fontWeight: '600',
      marginBottom: 8,
    },

    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.inputBackground,
      borderRadius: 18,
      height: 58,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 4,
    },

    inputWrapDisabled: {
      opacity: 0.6,
    },

    inputIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      marginLeft: 12,
      marginRight: 10,
      backgroundColor: isDark
        ? 'rgba(233,105,40,0.15)'
        : 'rgba(233,105,40,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    input: {
      flex: 1,
      color: c.text,
    },

    emailNote: {
      color: c.subtext,
      marginBottom: 4,
      marginLeft: 4,
      marginTop: 4,
    },

    fotoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: c.inputBackground,
      borderRadius: 18,
      padding: 12,
      borderWidth: 1,
      borderColor: c.border,
    },

    fotoPreviewWrap: {},

    fotoPreview: {
      width: 54,
      height: 54,
      borderRadius: 16,
    },

    fotoPreviewEmpty: {
      backgroundColor: c.border,
      justifyContent: 'center',
      alignItems: 'center',
    },

    fotoRowTitle: {
      fontWeight: '700',
      color: c.text,
    },

    fotoRowSub: {
      color: c.subtext,
      marginTop: 2,
      lineHeight: 18,
    },

    removeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 10,
      padding: 10,
      alignSelf: 'flex-start',
    },

    removeRowText: {
      color: '#EF4444',
      fontWeight: '600',
    },

    applyBtn: {
      marginHorizontal: 20,
      marginTop: 24,
      borderRadius: 18,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#E96928',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },

    applyBtnGradient: {
      height: 58,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },

    applyBtnText: {
      color: '#fff',
      fontWeight: '900',
    },

    deleteBtn: {
      marginHorizontal: 20,
      marginTop: 14,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#EF4444',
      backgroundColor: isDark
        ? 'rgba(239,68,68,0.08)'
        : 'rgba(239,68,68,0.05)',
    },

    deleteBtnText: {
      color: '#EF4444',
      fontWeight: '700',
    },

    goodbyeBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
    },

    goodbyeSheet: {
      backgroundColor: c.card,
      borderRadius: 28,
      padding: 28,
      alignItems: 'center',
      gap: 12,
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 20,
    },

    goodbyeIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 24,
      backgroundColor: isDark
        ? 'rgba(233,105,40,0.12)'
        : 'rgba(233,105,40,0.08)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },

    goodbyeTitle: {
      fontWeight: '900',
      color: c.text,
      textAlign: 'center',
    },

    goodbyeBody: {
      color: c.subtext,
      textAlign: 'center',
      lineHeight: 22,
    },

    goodbyeCountdownWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#E96928',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 4,
    },

    goodbyeCountdown: {
      color: '#fff',
      fontWeight: '900',
    },

    goodbyeBtn: {
      width: '100%',
      height: 52,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },

    goodbyeBtnText: {
      color: c.text,
      fontWeight: '700',
    },
  });
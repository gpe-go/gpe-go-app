import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
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
import { useFocusEffect } from '@react-navigation/native';
import { getMisLugares, registrarUsuario, solicitarCodigo, verificarCodigo } from '../../src/api/api';
import { useNotificaciones } from '../../src/context/NotificacionesContext';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

type Step = 'login' | 'registro' | 'codigo';

function AvatarSection({
  fotoPerfil,
  onCambiarFoto,
  showCamera = false,
}: {
  fotoPerfil: string | null;
  onCambiarFoto: () => void;
  showCamera?: boolean;
}) {
  return (
    <Pressable
      onPress={showCamera ? onCambiarFoto : undefined}
      style={styles.avatarWrapper}
    >
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

function ScreenShell({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthBanner({
  s,
  fonts,
  title,
  subtitle,
  iconName,
  onClose,
}: {
  s: any;
  fonts: any;
  title: string;
  subtitle: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onClose: () => void;
}) {
  const bannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bannerAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [bannerAnim]);

  const animatedStyle = {
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

  return (
    <Animated.View style={animatedStyle}>
      <LinearGradient
        colors={['#E96928', '#C4511A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.banner}
      >
        <View style={s.circle1} />
        <View style={s.circle2} />

        <View style={s.bannerTopRow}>
          <View style={{ width: 44 }} />
          <Pressable
            style={({ pressed }) => [
              s.closeBtn,
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={s.bannerIconCircle}>
          <Ionicons name={iconName || 'person'} size={44} color="#E96928" />
        </View>

        <Text style={[s.welcomeText, { fontSize: fonts['3xl'] ?? fonts['2xl'] }]}>
          {title}
        </Text>

        <Text style={[s.instructionText, { fontSize: fonts.base }]}>
          {subtitle}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

function AppInfoFooter({
  fonts,
  colors,
}: {
  fonts: any;
  colors: any;
}) {
  return (
    <View style={styles.appInfo}>
      <View style={styles.appInfoLogoRow}>
        <View style={styles.appInfoIconWrap}>
          <Ionicons name="location" size={10} color="#fff" />
        </View>
        <Text
          style={[
            styles.appInfoLogo,
            { fontSize: fonts.sm, color: colors.text },
          ]}
        >
          Guadalupe<Text style={{ color: '#E96928' }}>GO</Text>
        </Text>
      </View>

      <Text
        style={[
          styles.appInfoVersion,
          { fontSize: fonts.xs, color: colors.subtext },
        ]}
      >
        v1.0.2 · 2026
      </Text>
    </View>
  );
}

export default function PerfilScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  const {
    usuario,
    fotoPerfil,
    isAuthenticated,
    login,
    logout,
    actualizarFoto,
  } = useAuth();
  const { refresh: refreshNotif } = useNotificaciones();

  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  type MiNegocio = { id: number; nombre: string; estado: string; id_categoria: number; motivo_rechazo?: string | null };
  const [misNegocios, setMisNegocios] = useState<MiNegocio[]>([]);

  // Recargar mis negocios y notificaciones cada vez que la pantalla toma foco
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        getMisLugares()
          .then(res => { if (res.success) setMisNegocios(res.data ?? []); })
          .catch(() => {});
        refreshNotif();
      } else {
        setMisNegocios([]);
      }
    }, [isAuthenticated, refreshNotif])
  );

  const topAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isAuthenticated) {
      setStep('login');
      setEmail('');
      setNombre('');
      setCodigo('');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && usuario) {
      topAnim.setValue(0);
      cardsAnim.setValue(0);
      Animated.stagger(120, [
        Animated.timing(topAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(cardsAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]).start();
    } else {
      cardAnim.setValue(0);
      Animated.timing(cardAnim, { toValue: 1, duration: 380, useNativeDriver: true }).start();
    }
  }, [isAuthenticated, usuario, step, topAnim, cardsAnim, cardAnim]);

  const cambiarFoto = () => {
    Alert.alert(t('profile_photo'), '', [
      { text: ` ${t('profile_camera')}`, onPress: tomarFoto },
      { text: ` ${t('profile_gallery')}`, onPress: seleccionarDeGaleria },
      { text: t('profile_cancel'), style: 'cancel' },
    ]);
  };

  const seleccionarDeGaleria = async () => {
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

    if (!result.canceled) actualizarFoto(result.assets[0].uri);
  };

  const tomarFoto = async () => {
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

    if (!result.canceled) actualizarFoto(result.assets[0].uri);
  };

  const handleSolicitarCodigo = async () => {
    if (!email.trim()) {
      Alert.alert('Error', t('login_error_no_email'));
      return;
    }

    setLoading(true);
    try {
      const res = await solicitarCodigo(email.trim().toLowerCase());

      if (res.success) {
        if (res.data?.codigo) {
          Alert.alert(t('login_code_dev_title'), t('login_code_dev_msg', { code: res.data.codigo }));
        } else {
          Alert.alert(t('login_code_sent_title'), t('login_code_sent_msg'));
        }
        setStep('codigo');
      } else {
        Alert.alert('Error', res.error?.mensaje || t('login_error_send_code'));
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error?.mensaje || t('login_error_connection'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async () => {
    if (!nombre.trim() || !email.trim()) {
      Alert.alert('Error', t('register_error_no_data'));
      return;
    }

    setLoading(true);
    try {
      const res = await registrarUsuario(nombre.trim(), email.trim().toLowerCase());

      if (res.success) {
        Alert.alert(t('register_account_created_title'), t('register_account_created_msg'), [
          { text: 'OK', onPress: handleSolicitarCodigo },
        ]);
      } else {
        Alert.alert('Error', res.error?.mensaje || t('register_error_create'));
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error?.mensaje || t('login_error_connection'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigo.trim()) {
      Alert.alert('Error', t('login_error_no_code'));
      return;
    }

    setLoading(true);
    try {
      const res = await verificarCodigo(email.trim().toLowerCase(), codigo.trim());

      if (res.success) {
        await login(res.data.token, res.data.usuario);
        setCodigo('');
        setEmail('');
        setNombre('');
      } else {
        Alert.alert('Error', res.error?.mensaje || t('login_error_wrong_code'));
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error?.mensaje || t('login_error_connection'));
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarSesion = async () => {
    await logout();
    setStep('login');
    setEmail('');
    setNombre('');
    setCodigo('');
  };

  if (isAuthenticated && usuario) {
    return (
      <ScreenShell colors={colors}>
        <Animated.View
          style={{
            opacity: topAnim,
            transform: [
              {
                translateY: topAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          }}
        >
          <LinearGradient
            colors={['#E96928', '#C4511A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.bannerLogged}
          >
            <View style={s.circle1} />
            <View style={s.circle2} />

            <View style={s.bannerTopRow}>
              <View style={{ width: 44 }} />
              <Pressable
                style={({ pressed }) => [
                  s.closeBtn,
                  {
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
                onPress={() => router.back()}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </Pressable>
            </View>

            <AvatarSection
              fotoPerfil={fotoPerfil}
              onCambiarFoto={cambiarFoto}
              showCamera={true}
            />

            <Text style={[s.welcomeText, { fontSize: fonts['2xl'] }]}>
              {usuario.nombre}
            </Text>

            <Text style={[s.instructionText, { fontSize: fonts.sm }]}>
              {usuario.email}
            </Text>

            {usuario.rol === 'comercio' && (
              <View style={styles.rolBadge}>
                <Ionicons name="storefront" size={13} color="#E96928" />
                <Text style={styles.rolBadgeText}>{t('role_merchant')}</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={{
            opacity: cardsAnim,
            transform: [
              {
                translateY: cardsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <View style={s.loggedContent}>
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                { backgroundColor: colors.card, borderColor: colors.border },
                {
                  opacity: pressed ? 0.92 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}
              onPress={() => router.push('/(stack)/editarPerfil')}
            >
              <View
                style={[
                  styles.actionIconWrap,
                  { backgroundColor: 'rgba(233,105,40,0.1)' },
                ]}
              >
                <Ionicons name="create-outline" size={20} color="#E96928" />
              </View>
              <Text
                style={[
                  styles.actionLabel,
                  { color: colors.text, fontSize: fonts.base },
                ]}
              >
                {t('edit_profile_btn')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                { backgroundColor: colors.card, borderColor: colors.border },
                {
                  opacity: pressed ? 0.92 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}
              onPress={() => router.push('/(stack)/registrar-negocio' as any)}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(233,105,40,0.1)' }]}>
                <Ionicons name="storefront-outline" size={20} color="#E96928" />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text, fontSize: fonts.base }]}>
                {t('biz_register_btn')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
            </Pressable>

            {/* ── Mis Negocios ── */}
            {misNegocios.length > 0 && (
              <View style={[styles.misNegociosSection, { borderColor: colors.border }]}>
                <Text style={[styles.misNegociosTitle, { color: colors.text, fontSize: fonts.sm }]}>
                  {t('mis_negocios_title')}
                </Text>
                {misNegocios.map(neg => {
                  const estadoColor =
                    neg.estado === 'aprobado'  ? '#22c55e' :
                    neg.estado === 'rechazado' ? '#ef4444' : '#f59e0b';
                  const estadoKey =
                    neg.estado === 'aprobado'  ? 'negocio_estado_aprobado' :
                    neg.estado === 'rechazado' ? 'negocio_estado_rechazado' : 'negocio_estado_pendiente';
                  return (
                    <View key={neg.id}>
                      <View
                        style={[styles.misNegociosCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                      >
                        <View style={[styles.misNegociosIconWrap, { backgroundColor: 'rgba(233,105,40,0.1)' }]}>
                          <Ionicons name="storefront-outline" size={18} color="#E96928" />
                        </View>
                        <Text
                          style={[styles.misNegociosName, { color: colors.text, fontSize: fonts.sm }]}
                          numberOfLines={1}
                        >
                          {neg.nombre}
                        </Text>
                        <View style={[styles.estadoBadge, { backgroundColor: estadoColor + '22' }]}>
                          <View style={[styles.estadoDot, { backgroundColor: estadoColor }]} />
                          <Text style={[styles.estadoText, { color: estadoColor, fontSize: fonts.xs }]}>
                            {t(estadoKey)}
                          </Text>
                        </View>
                      </View>
                      {neg.estado === 'rechazado' && neg.motivo_rechazo ? (
                        <View style={[styles.rechazoMotivo, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                          <Ionicons name="information-circle-outline" size={16} color="#ef4444" />
                          <Text style={[styles.rechazoMotivoText, { fontSize: fonts.xs }]}>
                            {neg.motivo_rechazo}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                {
                  borderColor: '#E96928',
                  backgroundColor: colors.card,
                  opacity: pressed ? 0.92 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}
              onPress={handleCerrarSesion}
            >
              <Ionicons name="log-out-outline" size={20} color="#E96928" />
              <Text style={styles.logoutText}>{t('profile_logout')}</Text>
            </Pressable>
          </View>

          <AppInfoFooter fonts={fonts} colors={colors} />
        </Animated.View>
      </ScreenShell>
    );
  }

  if (step === 'codigo') {
    return (
      <ScreenShell colors={colors}>
        <AuthBanner
          s={s}
          fonts={fonts}
          title={t('verification_title')}
          subtitle={`${t('profile_code_sent_to')} ${email}`}
          iconName="key"
          onClose={() => router.back()}
        />

        <Animated.View
          style={{
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
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
                colors={['#E96928', '#C4511A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.loginBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={[s.loginBtnText, { fontSize: fonts.md }]}>
                      {t('confirm')}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => ({
                opacity: pressed ? 0.72 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              })}
              onPress={handleSolicitarCodigo}
              disabled={loading}
            >
              <Text style={[s.forgotText, { fontSize: fonts.sm }]}>
                {t('verification_resend')}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => ({
                opacity: pressed ? 0.72 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              })}
              onPress={() => {
                setStep('login');
                setCodigo('');
              }}
            >
              <Text style={[s.forgotText, { fontSize: fonts.sm }]}>
                {t('back')}
              </Text>
            </Pressable>
          </View>

          <AppInfoFooter fonts={fonts} colors={colors} />
        </Animated.View>
      </ScreenShell>
    );
  }

  if (step === 'registro') {
    return (
      <ScreenShell colors={colors}>
        <AuthBanner
          s={s}
          fonts={fonts}
          title={t('profile_create_account')}
          subtitle={t('profile_register_sub')}
          iconName="person"
          onClose={() => router.back()}
        />

        <Animated.View
          style={{
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
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
                colors={['#E96928', '#C4511A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.loginBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={[s.loginBtnText, { fontSize: fonts.md }]}>
                      {t('profile_create_account')}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          <Pressable
            style={s.registerContainer}
            onPress={() => setStep('login')}
          >
            <Text style={[s.registerText, { fontSize: fonts.base }]}>
              {t('profile_already_account')}{' '}
              <Text style={s.orangeLink}>{t('profile_login')}</Text>
            </Text>
          </Pressable>

          <AppInfoFooter fonts={fonts} colors={colors} />
        </Animated.View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell colors={colors}>
      <AuthBanner
        s={s}
        fonts={fonts}
        title={t('welcome')}
        subtitle={t('profile_login_sub')}
        iconName="person"
        onClose={() => router.back()}
      />

      <Animated.View
        style={{
          opacity: cardAnim,
          transform: [
            {
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
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
              colors={['#E96928', '#C4511A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.loginBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={[s.loginBtnText, { fontSize: fonts.md }]}>
                    {t('confirm')}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            })}
            onPress={() => router.back()}
          >
            <Text style={[s.forgotText, { fontSize: fonts.sm }]}>
              {t('back')}
            </Text>
          </Pressable>
        </View>

        <View style={s.divider}>
          <View style={s.dividerLine} />
          <View style={s.dividerBadge}>
            <Text style={[s.dividerText, { fontSize: fonts.xs }]}>
              {t('profile_or_continue')}
            </Text>
          </View>
          <View style={s.dividerLine} />
        </View>

        <View style={s.socialButtons}>
          <Pressable
            style={({ pressed }) => [
              s.socialBtn,
              s.googleBtn,
              {
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
            onPress={() =>
              Alert.alert(
                t('google_signin_title'),
                t('google_signin_coming_soon')
              )
            }
          >
            <View style={s.socialIconWrap}>
              <FontAwesome5 name="google" size={16} color="#EA4335" />
            </View>
            <Text
              style={[
                s.socialBtnText,
                { fontSize: fonts.base, color: colors.text },
              ]}
            >
              {t('profile_google')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              s.socialBtn,
              s.appleBtn,
              {
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
            onPress={() =>
              Alert.alert(
                t('apple_signin_title'),
                t('apple_signin_coming_soon')
              )
            }
          >
            <View style={[s.socialIconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name="logo-apple" size={18} color="#fff" />
            </View>
            <Text
              style={[s.socialBtnText, { fontSize: fonts.base, color: '#fff' }]}
            >
              {t('profile_apple')}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="rgba(255,255,255,0.6)"
            />
          </Pressable>
        </View>

        <Pressable
          style={s.registerContainer}
          onPress={() => setStep('registro')}
        >
          <Text style={[s.registerText, { fontSize: fonts.base }]}>
            {t('profile_no_account')}{' '}
            <Text style={s.orangeLink}>{t('profile_register')}</Text>
          </Text>
        </Pressable>

        <AppInfoFooter fonts={fonts} colors={colors} />
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  avatarWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#C4511A',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
  },
  rolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
  },
  rolBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    flex: 1,
    fontWeight: '700',
  },
  locatarioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#E96928',
    borderRadius: 18,
    height: 56,
    marginBottom: 14,
    elevation: 4,
    marginTop: 4,
  },
  locatarioButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  locatarioCard: {
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
    gap: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  locatarioTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  locatarioDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    height: 56,
    borderWidth: 1,
    marginTop: 4,
  },
  logoutText: {
    color: '#E96928',
    fontSize: 16,
    fontWeight: '700',
  },
  misNegociosSection: {
    marginTop: 8,
    marginBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
    gap: 8,
  },
  misNegociosTitle: {
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  misNegociosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  misNegociosIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  misNegociosName: {
    flex: 1,
    fontWeight: '600',
  },
  estadoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  estadoDot: {
    width: 6, height: 6, borderRadius: 3,
  },
  estadoText: {
    fontWeight: '700',
  },
  rechazoMotivo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: -4,
    marginBottom: 8,
    marginHorizontal: 4,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  rechazoMotivoText: {
    flex: 1,
    color: '#b91c1c',
    lineHeight: 18,
  },
  appInfo: {
    marginTop: 34,
    alignItems: 'center',
    gap: 6,
    paddingBottom: 20,
  },
  appInfoLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appInfoIconWrap: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: '#E96928',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfoLogo: {
    fontWeight: '800',
  },
  appInfoVersion: {},
});

const makeStyles = (c: any, f: any, isDark: boolean) =>
  StyleSheet.create({
    banner: {
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 34,
      overflow: 'hidden',
      alignItems: 'center',
      borderBottomLeftRadius: 38,
      borderBottomRightRadius: 38,
      marginBottom: 4,
    },
    bannerLogged: {
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 34,
      overflow: 'hidden',
      alignItems: 'center',
      borderBottomLeftRadius: 38,
      borderBottomRightRadius: 38,
      marginBottom: 4,
    },
    circle1: {
      position: 'absolute',
      width: 210,
      height: 210,
      borderRadius: 105,
      backgroundColor: 'rgba(255,255,255,0.07)',
      top: -62,
      right: -62,
    },
    circle2: {
      position: 'absolute',
      width: 128,
      height: 128,
      borderRadius: 64,
      backgroundColor: 'rgba(255,255,255,0.05)',
      bottom: -44,
      left: -40,
    },
    bannerTopRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    closeBtn: {
      alignSelf: 'flex-end',
      backgroundColor: 'rgba(255,255,255,0.2)',
      padding: 10,
      borderRadius: 14,
    },
    bannerIconCircle: {
      width: 112,
      height: 112,
      borderRadius: 56,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.6)',
      marginBottom: 18,
    },
    welcomeText: {
      color: '#fff',
      fontWeight: '900',
      letterSpacing: -0.6,
      textAlign: 'center',
    },
    instructionText: {
      color: 'rgba(255,255,255,0.84)',
      marginTop: 8,
      textAlign: 'center',
      fontWeight: '500',
      paddingHorizontal: 20,
      lineHeight: 30,
    },
    loggedContent: {
      paddingHorizontal: 20,
      marginTop: 22,
    },
    locatarioIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(233,105,40,0.12)' : 'rgba(233,105,40,0.08)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    formCard: {
      marginHorizontal: 20,
      backgroundColor: c.card,
      borderRadius: 28,
      padding: 22,
      borderWidth: 1,
      borderColor: c.border,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.28 : 0.08,
      shadowRadius: 10,
      gap: 14,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.inputBackground,
      borderRadius: 18,
      paddingHorizontal: 14,
      height: 58,
      borderWidth: 1,
      borderColor: c.border,
    },
    inputIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: isDark
        ? 'rgba(233,105,40,0.15)'
        : 'rgba(233,105,40,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    input: {
      flex: 1,
      color: c.text,
      fontWeight: '500',
    },
    loginBtn: {
      borderRadius: 18,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#E96928',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    loginBtnGradient: {
      height: 58,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    loginBtnText: {
      color: '#fff',
      fontWeight: '800',
    },
    forgotText: {
      textAlign: 'center',
      color: c.subtext,
      marginTop: 2,
      fontWeight: '600',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
      paddingHorizontal: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.border,
    },
    dividerBadge: {
      marginHorizontal: 12,
      backgroundColor: c.card,
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
    },
    dividerText: {
      color: c.subtext,
      fontWeight: '700',
    },
    socialButtons: {
      paddingHorizontal: 20,
      gap: 12,
    },
    socialBtn: {
      height: 58,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      gap: 12,
      borderWidth: 1,
    },
    googleBtn: {
      backgroundColor: c.card,
      borderColor: c.border,
    },
    appleBtn: {
      backgroundColor: '#000',
      borderColor: '#000',
    },
    socialIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: 'rgba(234,67,53,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    socialBtnText: {
      flex: 1,
      fontWeight: '800',
    },
    registerContainer: {
      marginTop: 26,
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    registerText: {
      color: c.subtext,
      textAlign: 'center',
    },
    orangeLink: {
      color: '#E96928',
      fontWeight: '800',
    },
  });
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Image, Linking, Platform, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { Alert } from '../../components/Alert';
import { Text, TextInput } from '../../components/Text';
import { enviarMensajeSoporte, getContactoInfo, getEmergencias } from '../../src/api/api';
import { useTheme } from '../../src/context/ThemeContext';

// ── Filtro de lenguaje inapropiado ──────────────────────────────────────────
// Usamos el filtro centralizado en src/utils/filtrarPalabras.ts para asegurar
// la misma cobertura y comportamiento que las reseñas (mayús/minús, mEzClA,
// con/sin acentos y sin falsos positivos como "círculo" → "culo").
import { contienePalabraProhibida } from '../../src/utils/filtrarPalabras';

// ── Datos por defecto (fallback si la API no responde) ───
const EMERGENCIAS_DEFAULT = [
  { icon: 'flame', title: 'Bomberos', sub: 'Estación Guadalupe', phone: '+528140400021', color: '#EF4444' },
  { icon: 'megaphone', title: 'Protección Civil', sub: 'Rescate y Auxilio', phone: '+528117718801', color: '#F97316' },
  { icon: 'medical', title: 'Cruz Verde', sub: 'Ambulancias', phone: '+528140409080', color: '#10B981' },
  { icon: 'shield', title: 'Seguridad Pública', sub: 'Policía Municipal', phone: '+528181355900', color: '#3B82F6' },
  { icon: 'car-sport', title: 'Tránsito y Vialidad', sub: 'Asistencia Vial', phone: '+528181355900', color: '#8B5CF6' },
  { icon: 'business', title: 'Presidencia Municipal', sub: 'Municipio de Guadalupe', phone: '+528180306000', color: '#F97613' },
];

type Emergencia = {
  icon: string;
  title: string;
  sub: string;
  phone: string;
  color: string;
};

// ── Resolver de ícono + color por NOMBRE de la emergencia ──────────
// Antes el ícono se asignaba por POSICIÓN en la lista (ICONS_CICLO[i]),
// así que la 6ª emergencia siempre caía en el genérico y una 7ª
// reciclaba íconos equivocados. Ahora detectamos palabras clave en el
// nombre → cada emergencia recibe su ícono correcto sin importar el
// orden, y las que el municipio agregue en el futuro salen bien solas.
// NO requiere tocar el dashboard ni el código: el municipio solo crea
// la emergencia con su nombre normal.
const resolverEmergencia = (nombre: string): { icon: string; color: string } => {
  const n = nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .toLowerCase();

  if (/bombero|incendio|fuego/.test(n))                       return { icon: 'flame',         color: '#EF4444' };
  if (/proteccion civil|rescate|auxilio/.test(n))             return { icon: 'megaphone',     color: '#F97316' };
  if (/cruz|ambulancia|medic|paramedic|hospital|salud/.test(n)) return { icon: 'medical',     color: '#10B981' };
  if (/policia|seguridad|911|emergencia/.test(n))             return { icon: 'shield',        color: '#3B82F6' };
  if (/transito|vial|vialidad|transporte/.test(n))            return { icon: 'car-sport',     color: '#8B5CF6' };
  if (/presidencia|municipio|alcald|ayuntamiento|gobierno/.test(n)) return { icon: 'business', color: '#F97613' };
  if (/agua|drenaje/.test(n))                                 return { icon: 'water',         color: '#0EA5E9' };
  if (/luz|electric|cfe|energia/.test(n))                     return { icon: 'flash',         color: '#F59E0B' };
  if (/\bgas\b/.test(n))                                      return { icon: 'flame-outline', color: '#DC2626' };
  if (/denuncia|fiscalia|ministerio|juridic/.test(n))         return { icon: 'document-text', color: '#6366F1' };
  if (/mujer|violencia|familiar/.test(n))                     return { icon: 'heart',         color: '#EC4899' };
  if (/animal|veterinari|mascota/.test(n))                    return { icon: 'paw',           color: '#92400E' };

  // Fallback genérico decente para cualquier emergencia nueva no mapeada:
  // un ícono de teléfono, que siempre tiene sentido en una tarjeta con
  // botón "Llamar".
  return { icon: 'call', color: '#64748B' };
};

// ── Mapea la respuesta de la API al formato que espera la UI ───
const mapearEmergencias = (data: any[]): Emergencia[] =>
  data.map((item) => {
    const { icon, color } = resolverEmergencia(item.nombre ?? '');
    return {
      icon,
      title: item.nombre ?? '',
      sub: item.descripcion ?? '',
      phone: item.telefono ?? '',
      color,
    };
  });

function AnimatedSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 380,
      delay,
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

function FocusInput({
  icon,
  placeholder,
  value,
  onChangeText,
  colors,
  fonts,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  numberOfLines,
  textAlignVertical,
  onClear,
  errorMsg,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  colors: any;
  fonts: any;
  multiline?: boolean;
  keyboardType?: any;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  numberOfLines?: number;
  textAlignVertical?: 'auto' | 'top' | 'center' | 'bottom';
  onClear?: () => void;
  errorMsg?: string;
}) {
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 160,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, '#F97613'],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.16],
  });

  return (
    <>
      <Animated.View
        style={[
          inputStyles.wrapper,
          {
            backgroundColor: colors.inputBackground,
            borderColor: errorMsg ? '#EF4444' : borderColor,
            shadowColor: errorMsg ? '#EF4444' : '#F97613',
            shadowOpacity,
          },
          multiline && inputStyles.textAreaWrapper,
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={errorMsg ? '#EF4444' : colors.subtext}
          style={[inputStyles.icon, multiline ? { marginTop: 2 } : null]}
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.subtext}
          style={[
            inputStyles.input,
            { color: colors.text, fontSize: fonts.base },
            multiline && inputStyles.textArea,
          ]}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={textAlignVertical}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {onClear && value.length > 0 && (
          <Pressable
            onPress={onClear}
            hitSlop={8}
            style={[inputStyles.clearBtn, multiline && { alignSelf: 'flex-start', marginTop: 1 }]}
          >
            <Ionicons name="close-circle" size={18} color={colors.subtext} />
          </Pressable>
        )}
      </Animated.View>
      {!!errorMsg && (
        <View style={inputStyles.errorRow}>
          <Ionicons name="warning-outline" size={13} color="#EF4444" />
          <Text style={[inputStyles.errorText, { fontSize: fonts.xs }]}>{errorMsg}</Text>
        </View>
      )}
    </>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 12,
    minHeight: 50,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 0,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 14,
    paddingBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  clearBtn: {
    marginLeft: 6,
    padding: 2,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#EF4444',
    fontWeight: '600',
    flex: 1,
  },
});

// Logo animado de carga (rotación + pulso) — mismo patrón que en las
// otras tabs, para el pull-to-refresh.
function RefreshLogo({ refreshing, isDark }: { refreshing: boolean; isDark: boolean }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!refreshing) return;
    const spin = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }),
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 450, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 450, useNativeDriver: true }),
      ]),
    );
    spin.start();
    pulse.start();
    return () => { spin.stop(); pulse.stop(); spinAnim.setValue(0); pulseAnim.setValue(1); };
  }, [refreshing, spinAnim, pulseAnim]);
  const rotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  if (!refreshing) return null;
  return (
    <View style={refreshLogoStyles.container}>
      <Animated.View style={{ transform: [{ rotate }, { scale: pulseAnim }] }}>
        <View style={[refreshLogoStyles.iconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EDEDED' }]}>
          <Image
            source={require('../../assets/images/logosinnadaoficial.png')}
            style={{ width: 24, height: 24, tintColor: isDark ? '#d1d5db' : '#9ca3af' }}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
      <Text style={[refreshLogoStyles.label, { color: isDark ? '#9ca3af' : '#a1a1aa' }]}>GuadalupeGO</Text>
    </View>
  );
}
const refreshLogoStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  iconBg: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
});

export default function ContactoScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);

  // StatusBar — el header del drawer (GuadalupeGO) es el que vive arriba con
  // fondo de tema, no el banner naranja. Iconos del tema para que se vean bien.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(colors.card);
      }
    }, [isDark, colors.card])
  );

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [emergencias, setEmergencias] = useState<Emergencia[]>(EMERGENCIAS_DEFAULT);
  // Contactos institucionales (institutos de gobierno, etc.). Vacío por
  // defecto → la sección "Institucional" no se muestra hasta que el
  // dashboard tenga al menos uno con tipo "institucional".
  const [institucionales, setInstitucionales] = useState<Emergencia[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleMensaje = (text: string) => {
    setMensaje(text);
    if (text.length > 0 && contienePalabraProhibida(text)) {
      setMensajeError(t('profanity_inline_warning'));
    } else {
      setMensajeError('');
    }
  };

  // Info de contacto institucional desde la BD
  const [contactoInfo, setContactoInfo] = useState<{
    emails: string[];
    telefono: string | null;
    telefono_nombre: string;
    horario: string | null;
    direccion: string | null;
    maps_url: string | null;
  }>({
    emails: ['go@guadalupe.gob.mx'],
    telefono: '+528180306000',
    telefono_nombre: 'Presidencia Municipal',
    horario: 'Lunes a viernes de 8:00 a 17:00 horas',
    direccion: 'C/ Hidalgo SN, Centro de Guadalupe, 67100 Guadalupe, N.L.',
    maps_url: 'https://maps.google.com/?q=Palacio+Municipal+Guadalupe+Nuevo+Leon+Mexico',
  });

  // ── Carga de contactos (emergencia + institucional + info) ─────────
  // Una sola función reutilizable que pide ambos endpoints en paralelo.
  // El endpoint `emergencias` devuelve TODOS los contactos con un campo
  // `tipo` ("emergencia" | "institucional"); los separamos en el cliente.
  // Si el municipio agrega institucionales en el dashboard, la sección
  // "Institucional" aparece sola; si no hay, no se muestra.
  const cargarContactos = useCallback(async () => {
    const [emRes, infoRes] = await Promise.allSettled([
      getEmergencias(),
      getContactoInfo(),
    ]);

    if (emRes.status === 'fulfilled') {
      const res = emRes.value;
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const todos = res.data;
        const emerg = todos.filter((x: any) => (x.tipo ?? 'emergencia') === 'emergencia');
        const inst  = todos.filter((x: any) => x.tipo === 'institucional');
        if (emerg.length > 0) setEmergencias(mapearEmergencias(emerg));
        setInstitucionales(mapearEmergencias(inst));
      }
    }

    if (infoRes.status === 'fulfilled') {
      const res = infoRes.value;
      if (res?.success && res.data) {
        // El correo institucional se fija a go@guadalupe.gob.mx; ignoramos
        // lo que devuelva el backend en `emails`.
        const { emails: _ignored, ...rest } = res.data;
        setContactoInfo(prev => ({ ...prev, ...rest }));
      }
    }
  }, []);

  // #1 Carga inicial (al abrir la app / montar la pantalla).
  useEffect(() => {
    cargarContactos();
  }, [cargarContactos]);

  // #2 Refresco al VOLVER a la pantalla. Saltamos el primer foco para no
  //    duplicar la carga inicial del #1.
  const primerFocoRef = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primerFocoRef.current) {
        primerFocoRef.current = false;
        return;
      }
      cargarContactos();
    }, [cargarContactos]),
  );

  // #3 Pull-to-refresh manual (refresco en vivo).
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await cargarContactos();
    } finally {
      setRefreshing(false);
    }
  }, [cargarContactos]);

  const handleCall = (numero: string) => Linking.openURL(`tel:${numero}`);
  const handleEmail = (correo: string) => Linking.openURL(`mailto:${correo}`);
  const handleMaps = () => {
    const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/e28q3nYAanyh4BzK9?g_st=ic';
    const APPLE_MAPS_URL = 'https://maps.apple/p/sv5wZPp3UpGIgp';

    const opciones: { text: string; onPress: () => void }[] = [
      {
        text: 'Google Maps',
        onPress: () => Linking.openURL(GOOGLE_MAPS_URL),
      },
    ];

    if (Platform.OS === 'ios') {
      opciones.unshift({
        text: 'Apple Maps',
        onPress: () => Linking.openURL(APPLE_MAPS_URL),
      });
    }

    Alert.alert(t('open_in_maps'), t('choose_maps_app'), [
      ...opciones,
      { text: t('cancel'), style: 'cancel' },
    ]);
  };

  const enviarSoporte = async () => {
    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      Alert.alert(t('required_fields'), t('required_fields_msg'));
      return;
    }
    if (contienePalabraProhibida(mensaje)) {
      setMensajeError(t('profanity_inline_warning'));
      Alert.alert(
        t('profanity_alert_title'),
        t('profanity_alert_msg'),
        [{ text: t('profanity_alert_btn'), style: 'default' }],
      );
      return;
    }
    setEnviando(true);
    try {
      await enviarMensajeSoporte({
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
        mensaje: mensaje.trim(),
      });
    } catch {
      // Aunque falle la API, mostramos confirmación al usuario
    } finally {
      setNombre('');
      setEmail('');
      setTelefono('');
      setMensaje('');
      setMensajeError('');
      setEnviando(false);
      Alert.alert(t('message_sent'), t('message_sent_sub'));
    }
  };

  // Tarjeta reutilizable para contactos (emergencia e institucional).
  // `showBadge247` solo se activa en emergencias — las instituciones
  // tienen horario, no son 24/7.
  const renderContactoCard = (item: Emergencia, key: React.Key, showBadge247: boolean) => (
    <View key={key} style={s.emergencyCard}>
      <View style={[s.emergencyIconWrap, { backgroundColor: item.color + '18' }]}>
        <Ionicons name={item.icon as any} size={22} color={item.color} />
      </View>
      <View style={s.emergencyInfo}>
        <View style={s.emergencyTitleRow}>
          <Text style={[s.emergencyTitle, { fontSize: fonts.sm }]} numberOfLines={1}>
            {item.title}
          </Text>
          {showBadge247 && (
            <View style={s.badge247}>
              <Text style={s.badgeText}>24/7</Text>
            </View>
          )}
        </View>
        <Text style={[s.emergencySub, { fontSize: fonts.xs }]} numberOfLines={1}>
          {item.sub}
        </Text>
      </View>
      <Pressable
        onPress={() => handleCall(item.phone)}
        style={({ pressed }) => [
          s.callBtn,
          {
            backgroundColor: item.color,
            opacity: pressed ? 0.88 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <Ionicons name="call" size={14} color="#fff" />
        <Text style={[s.callBtnText, { fontSize: fonts.xs }]}>
          {t('call_btn')}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="transparent"
          colors={["transparent"]}
          progressBackgroundColor="transparent"
        />
      }
    >
      <RefreshLogo refreshing={refreshing} isDark={isDark} />

      {/* ══ BANNER ══════════════════════════════════════ */}
      <AnimatedSection delay={0}>
        <LinearGradient
          colors={['#F97613', '#F97613']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.banner}
        >
          <View style={s.circle1} />
          <View style={s.circle2} />
          <View style={s.bannerContent}>
            <View style={s.bannerIconWrap}>
              <Ionicons name="headset" size={24} color="#F97613" />
            </View>
            <View>
              <Text style={[s.bannerTitle, { fontSize: fonts['2xl'] }]}>
                {t('help_center')}
              </Text>
              <Text style={[s.bannerSub, { fontSize: fonts.sm }]}>
                {t('contact_banner_sub')}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </AnimatedSection>

      {/* ══ EMERGENCIAS ════════════════════════════════ */}
      <AnimatedSection delay={90}>
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>
              {t('emergency_title')}
            </Text>
          </View>

          {emergencias.map((item, i) => renderContactoCard(item, `em-${i}`, true))}
        </View>
      </AnimatedSection>

      {/* ══ INSTITUCIONAL (solo si hay contactos institucionales) ══ */}
      {institucionales.length > 0 && (
        <AnimatedSection delay={130}>
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionDot} />
              <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>
                {t('institutional_title', { defaultValue: 'Institucional' })}
              </Text>
            </View>

            {institucionales.map((item, i) => renderContactoCard(item, `inst-${i}`, false))}
          </View>
        </AnimatedSection>
      )}

      {/* ══ FORMULARIO SOPORTE ═════════════════════════ */}
      <AnimatedSection delay={170}>
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>
              {t('support_guadalupe')}
            </Text>
          </View>

          <View style={s.formCard}>
            <FocusInput
              icon="person-outline"
              placeholder={t('contact_name')}
              value={nombre}
              onChangeText={setNombre}
              colors={colors}
              fonts={fonts}
              onClear={() => setNombre('')}
            />

            <FocusInput
              icon="mail-outline"
              placeholder={t('email')}
              value={email}
              onChangeText={setEmail}
              colors={colors}
              fonts={fonts}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onClear={() => setEmail('')}
            />

            <FocusInput
              icon="call-outline"
              placeholder={t('phone')}
              value={telefono}
              onChangeText={setTelefono}
              colors={colors}
              fonts={fonts}
              keyboardType="phone-pad"
              onClear={() => setTelefono('')}
            />

            <FocusInput
              icon="chatbubble-outline"
              placeholder={t('contact_message')}
              value={mensaje}
              onChangeText={handleMensaje}
              colors={colors}
              fonts={fonts}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onClear={() => { setMensaje(''); setMensajeError(''); }}
              errorMsg={mensajeError}
            />

            <Pressable
              style={({ pressed }) => [
                s.sendBtn,
                {
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={enviarSoporte}
              disabled={enviando}
            >
              <Ionicons name="send" size={16} color="#fff" />
              <Text style={[s.sendText, { fontSize: fonts.base }]}>
                {enviando ? t('loading') : t('contact_send')}
              </Text>
            </Pressable>
          </View>
        </View>
      </AnimatedSection>

      {/* ══ CONTACTO DIRECTO ═══════════════════════════ */}
      <AnimatedSection delay={250}>
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>
              {t('contact_direct')}
            </Text>
          </View>

          <View style={s.contactCard}>
            {/* Correos electrónicos — toca para abrir app de correo */}
            <View style={s.contactRow}>
              <LinearGradient colors={['#F97613', '#d85f0e']} style={s.contactIconWrap}>
                <Ionicons name="mail" size={20} color="#fff" />
              </LinearGradient>
              <View style={s.contactInfo}>
                <Text style={[s.contactLabel, { fontSize: fonts.sm }]}>{t('email')}</Text>
                {contactoInfo.emails.map(correo => (
                  <Pressable
                    key={correo}
                    onPress={() => handleEmail(correo)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.6 : 1,
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                    })}
                  >
                    <Text style={[s.contactValue, s.contactLink, { fontSize: fonts.xs }]}>
                      {correo}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* La fila de TELÉFONO se removió a propósito de "Contacto
                directo": los números (emergencia + institucional) ahora
                viven en sus secciones dedicadas (Emergencias / Institucional).
                Aquí solo van Correo electrónico y Dirección. */}

            {/* Dirección — toca para abrir Google Maps. Divisor dentro del
                condicional para no dejar una rayita huérfana. */}
            {contactoInfo.direccion && (
              <>
                <View style={s.contactDivider} />
                <Pressable
                style={({ pressed }) => [
                  s.contactRow,
                  {
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.995 : 1 }],
                  },
                ]}
                onPress={handleMaps}
              >
                <LinearGradient colors={['#F97613', '#d85f0e']} style={s.contactIconWrap}>
                  <Ionicons name="location" size={20} color="#fff" />
                </LinearGradient>
                <View style={s.contactInfo}>
                  <Text style={[s.contactLabel, { fontSize: fonts.sm }]}>{t('address')}</Text>
                  <Text style={[s.contactValue, { fontSize: fonts.xs }]}>
                    {contactoInfo.direccion}
                  </Text>
                  <Text style={[s.contactSubValue, s.contactLink, { fontSize: fonts.xs, marginTop: 3 }]}>
                    Ver en Mapas ↗
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
                </Pressable>
              </>
            )}
          </View>
        </View>
      </AnimatedSection>
    </ScrollView>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  banner: { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 30, overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  circle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -50 },
  circle2: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30 },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
  bannerTitle: { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
  bannerSub: { color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionDot: { width: 4, height: 20, borderRadius: 2, backgroundColor: '#F97613' },
  sectionTitle: { fontWeight: '800', color: c.text },

  emergencyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: c.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.07, shadowRadius: 4 },
  emergencyIconWrap: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  emergencyInfo: { flex: 1, minWidth: 0 },
  emergencyTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  emergencyTitle: { fontWeight: '700', color: c.text, flexShrink: 1 },
  emergencySub: { color: c.subtext, marginTop: 2 },
  badge247: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E' },
  badgeText: { color: '#166534', fontSize: 10, fontWeight: '800' },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, minWidth: 64, justifyContent: 'center' },
  callBtnText: { color: '#fff', fontWeight: '700' },

  formCard: { backgroundColor: c.card, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: c.border, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 6 },
  sendBtn: { backgroundColor: '#F97613', borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, elevation: 4, shadowColor: '#F97613', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  sendText: { color: '#fff', fontWeight: '800' },

  contactCard: { backgroundColor: c.card, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: c.border, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 6 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  contactIconWrap: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  contactInfo: { flex: 1 },
  contactLabel: { fontWeight: '700', color: c.text, marginBottom: 3 },
  contactValue: { color: c.subtext },
  contactSubValue: { color: c.subtext, marginTop: 2, opacity: 0.75 },
  contactDivider: { height: 1, backgroundColor: c.border, marginVertical: 14 },
  contactLink: { color: '#3B82F6', textDecorationLine: 'underline' },
  llamarBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F97613', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  llamarBtnText: { color: '#fff', fontWeight: '700' },
});
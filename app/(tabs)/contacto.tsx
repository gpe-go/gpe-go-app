import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ScrollView, Linking, StatusBar, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { getEmergencias, enviarMensajeSoporte, getContactoInfo } from '../../src/api/api';

// ── Datos por defecto (fallback si la API no responde) ───
const EMERGENCIAS_DEFAULT = [
  { icon: 'flame',        title: 'Bomberos',              sub: 'Estación Guadalupe',       phone: '+528140400021', color: '#EF4444' },
  { icon: 'megaphone',    title: 'Protección Civil',      sub: 'Rescate y Auxilio',        phone: '+528117718801', color: '#F97316' },
  { icon: 'medical',      title: 'Cruz Verde',             sub: 'Ambulancias',              phone: '+528140409080', color: '#10B981' },
  { icon: 'shield',       title: 'Seguridad Pública',     sub: 'Policía Municipal',        phone: '+528181355900', color: '#3B82F6' },
  { icon: 'car-sport',    title: 'Tránsito y Vialidad',   sub: 'Asistencia Vial',          phone: '+528181355900', color: '#8B5CF6' },
  { icon: 'business',     title: 'Alcaldía de Guadalupe', sub: 'Municipio de Guadalupe',   phone: '+528180306000', color: '#E96928' },
];

type Emergencia = {
  icon: string;
  title: string;
  sub: string;
  phone: string;
  color: string;
};

// ── Mapea la respuesta de la API al formato que espera la UI ───
const ICONS_CICLO  = ['flame', 'megaphone', 'medical', 'shield', 'car-sport', 'alert-circle'];
const COLORS_CICLO = ['#EF4444', '#F97316', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

const mapearEmergencias = (data: any[]): Emergencia[] =>
  data.map((item, i) => ({
    icon:  ICONS_CICLO[i % ICONS_CICLO.length],
    title: item.nombre ?? '',
    sub:   item.descripcion ?? '',
    phone: item.telefono ?? '',
    color: COLORS_CICLO[i % COLORS_CICLO.length],
  }));

export default function ContactoScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);

  const [nombre,       setNombre]       = useState('');
  const [email,        setEmail]        = useState('');
  const [telefono,     setTelefono]     = useState('');
  const [mensaje,      setMensaje]      = useState('');
  const [enviando,     setEnviando]     = useState(false);
  const [emergencias,  setEmergencias]  = useState<Emergencia[]>(EMERGENCIAS_DEFAULT);

  // Info de contacto institucional desde la BD
  const [contactoInfo, setContactoInfo] = useState<{
    emails: string[];
    telefono: string | null;
    telefono_nombre: string;
    horario: string | null;
    direccion: string | null;
    maps_url: string | null;
  }>({
    emails: ['turismo@guadalupe.gob.mx', 'info@guadalupe.gob.mx'],
    telefono: '+528180306000',
    telefono_nombre: 'Alcaldía de Guadalupe',
    horario: 'Lunes a viernes de 8:00 a 17:00 horas',
    direccion: 'Palacio Municipal, Hidalgo S/N Col. Centro, Guadalupe, Nuevo León, México',
    maps_url: 'https://maps.google.com/?q=Palacio+Municipal+Guadalupe+Nuevo+Leon+Mexico',
  });

  // ── Cargar emergencias desde la API ───────────────────
  useEffect(() => {
    getEmergencias()
      .then(res => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setEmergencias(mapearEmergencias(res.data));
        }
      })
      .catch(() => { /* Sin conexión → usa datos por defecto */ });
  }, []);

  // ── Cargar info de contacto institucional desde la API ─
  useEffect(() => {
    getContactoInfo()
      .then(res => {
        if (res?.success && res.data) {
          setContactoInfo(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => { /* Sin conexión → usa datos por defecto */ });
  }, []);

  const handleCall  = (numero: string) => Linking.openURL(`tel:${numero}`);
  const handleEmail = (correo: string) => Linking.openURL(`mailto:${correo}`);
  const handleMaps  = (direccion: string) => {
    const query = encodeURIComponent(direccion);
    const url = Platform.select({
      ios:     `maps://maps.apple.com/?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://maps.google.com/?q=${query}`,
    })!;
    Linking.openURL(url).catch(() => {
      // Fallback al navegador si no tiene app de mapas
      Linking.openURL(`https://maps.google.com/?q=${query}`);
    });
  };

  const enviarSoporte = async () => {
    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      Alert.alert(t('required_fields'), t('required_fields_msg'));
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
      setNombre(''); setEmail(''); setTelefono(''); setMensaje('');
      setEnviando(false);
      Alert.alert(t('message_sent'), t('message_sent_sub'));
    }
  };

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />

      {/* ══ BANNER ══════════════════════════════════════ */}
      <LinearGradient
        colors={['#E96928', '#c4511a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.banner}
      >
        <View style={s.circle1} />
        <View style={s.circle2} />
        <View style={s.bannerContent}>
          <View style={s.bannerIconWrap}>
            <Ionicons name="headset" size={24} color="#E96928" />
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

      {/* ══ EMERGENCIAS ════════════════════════════════ */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <View style={s.sectionDot} />
          <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>
            {t('emergency_title')}
          </Text>
        </View>

        {emergencias.map((item, i) => (
          <View key={i} style={s.emergencyCard}>
            <View style={[s.emergencyIconWrap, { backgroundColor: item.color + '18' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={s.emergencyInfo}>
              <View style={s.emergencyTitleRow}>
                <Text style={[s.emergencyTitle, { fontSize: fonts.sm }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={s.badge247}>
                  <Text style={s.badgeText}>24/7</Text>
                </View>
              </View>
              <Text style={[s.emergencySub, { fontSize: fonts.xs }]}>{item.sub}</Text>
            </View>
            <Pressable
              onPress={() => handleCall(item.phone)}
              style={({ pressed }) => [s.callBtn, { backgroundColor: item.color, opacity: pressed ? 0.85 : 1 }]}
            >
              <Ionicons name="call" size={14} color="#fff" />
              <Text style={[s.callBtnText, { fontSize: fonts.xs }]}>
                {t('call_btn')}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      {/* ══ FORMULARIO SOPORTE ═════════════════════════ */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <View style={s.sectionDot} />
          <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>
            {t('support_guadalupe')}
          </Text>
        </View>

        <View style={s.formCard}>
          <View style={s.inputWrapper}>
            <Ionicons name="person-outline" size={18} color={colors.subtext} style={s.inputIcon} />
            <TextInput
              placeholder={t('contact_name')}
              placeholderTextColor={colors.subtext}
              style={[s.input, { fontSize: fonts.base }]}
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View style={s.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={colors.subtext} style={s.inputIcon} />
            <TextInput
              placeholder={t('email')}
              placeholderTextColor={colors.subtext}
              style={[s.input, { fontSize: fonts.base }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={s.inputWrapper}>
            <Ionicons name="call-outline" size={18} color={colors.subtext} style={s.inputIcon} />
            <TextInput
              placeholder={t('phone')}
              placeholderTextColor={colors.subtext}
              style={[s.input, { fontSize: fonts.base }]}
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
          </View>

          <View style={[s.inputWrapper, s.textAreaWrapper]}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.subtext} style={[s.inputIcon, { marginTop: 2 }]} />
            <TextInput
              placeholder={t('contact_message')}
              placeholderTextColor={colors.subtext}
              style={[s.input, s.textArea, { fontSize: fonts.base }]}
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <Pressable
            style={({ pressed }) => [s.sendBtn, { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
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

      {/* ══ CONTACTO DIRECTO ═══════════════════════════ */}
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
            <LinearGradient colors={['#E96928', '#c4511a']} style={s.contactIconWrap}>
              <Ionicons name="mail" size={20} color="#fff" />
            </LinearGradient>
            <View style={s.contactInfo}>
              <Text style={[s.contactLabel, { fontSize: fonts.sm }]}>{t('email')}</Text>
              {contactoInfo.emails.map(correo => (
                <Pressable key={correo} onPress={() => handleEmail(correo)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                  <Text style={[s.contactValue, s.contactLink, { fontSize: fonts.xs }]}>
                    {correo}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={s.contactDivider} />

          {/* Teléfono — botón llamar */}
          {contactoInfo.telefono && (
            <View style={s.contactRow}>
              <LinearGradient colors={['#E96928', '#c4511a']} style={s.contactIconWrap}>
                <Ionicons name="call" size={20} color="#fff" />
              </LinearGradient>
              <View style={s.contactInfo}>
                <Text style={[s.contactLabel, { fontSize: fonts.sm }]}>
                  {contactoInfo.telefono_nombre}
                </Text>
                <Text style={[s.contactValue, { fontSize: fonts.xs }]}>
                  {contactoInfo.telefono}
                </Text>
                {contactoInfo.horario && (
                  <Text style={[s.contactSubValue, { fontSize: fonts.xs }]}>
                    {contactoInfo.horario}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => handleCall(contactoInfo.telefono!)}
                style={({ pressed }) => [s.llamarBtn, { opacity: pressed ? 0.85 : 1 }]}
              >
                <Ionicons name="call" size={14} color="#fff" />
                <Text style={[s.llamarBtnText, { fontSize: fonts.xs }]}>{t('call_btn')}</Text>
              </Pressable>
            </View>
          )}

          <View style={s.contactDivider} />

          {/* Dirección — toca para abrir Google Maps */}
          {contactoInfo.direccion && (
            <Pressable
              style={({ pressed }) => [s.contactRow, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => contactoInfo.direccion && handleMaps(contactoInfo.direccion)}
            >
              <LinearGradient colors={['#E96928', '#c4511a']} style={s.contactIconWrap}>
                <Ionicons name="location" size={20} color="#fff" />
              </LinearGradient>
              <View style={s.contactInfo}>
                <Text style={[s.contactLabel, { fontSize: fonts.sm }]}>{t('address')}</Text>
                <Text style={[s.contactValue, { fontSize: fonts.xs }]}>
                  {contactoInfo.direccion}
                </Text>
                <Text style={[s.contactSubValue, s.contactLink, { fontSize: fonts.xs, marginTop: 3 }]}>
                  Ver en Google Maps ↗
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
            </Pressable>
          )}

        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  container:       { flex: 1, backgroundColor: c.background },
  banner:          { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 30, overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  circle1:         { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -50 },
  circle2:         { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30 },
  bannerContent:   { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIconWrap:  { width: 52, height: 52, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
  bannerTitle:     { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
  bannerSub:       { color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  section:         { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionDot:      { width: 4, height: 20, borderRadius: 2, backgroundColor: '#E96928' },
  sectionTitle:    { fontWeight: '800', color: c.text },
  emergencyCard:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: c.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.07, shadowRadius: 4 },
  emergencyIconWrap:  { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  emergencyInfo:      { flex: 1, minWidth: 0 },
  emergencyTitleRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  emergencyTitle:     { fontWeight: '700', color: c.text, flexShrink: 1 },
  emergencySub:       { color: c.subtext, marginTop: 2 },
  badge247:    { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E' },
  badgeText:   { color: '#166534', fontSize: 10, fontWeight: '800' },
  callBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, minWidth: 64, justifyContent: 'center' },
  callBtnText: { color: '#fff', fontWeight: '700' },
  formCard:        { backgroundColor: c.card, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: c.border, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 6 },
  inputWrapper:    { flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBackground, borderRadius: 14, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, marginBottom: 12, minHeight: 50 },
  textAreaWrapper: { alignItems: 'flex-start', paddingTop: 14, paddingBottom: 10 },
  inputIcon:       { marginRight: 10 },
  input:           { flex: 1, color: c.text },
  textArea:        { minHeight: 90, textAlignVertical: 'top' },
  sendBtn:         { backgroundColor: '#E96928', borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, elevation: 4, shadowColor: '#E96928', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  sendText:        { color: '#fff', fontWeight: '800' },
  contactCard:     { backgroundColor: c.card, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: c.border, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 6 },
  contactRow:      { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  contactIconWrap: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  contactInfo:     { flex: 1 },
  contactLabel:    { fontWeight: '700', color: c.text, marginBottom: 3 },
  contactValue:    { color: c.subtext },
  contactSubValue: { color: c.subtext, marginTop: 2, opacity: 0.75 },
  contactDivider:  { height: 1, backgroundColor: c.border, marginVertical: 14 },
  contactLink:     { color: '#3B82F6', textDecorationLine: 'underline' },
  llamarBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E96928', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  llamarBtnText:   { color: '#fff', fontWeight: '700' },
});

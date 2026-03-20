import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Linking, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

export default function ContactoScreen() {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);

  const handleCall = (numero: string) => Linking.openURL(`tel:${numero}`);

  const EmergencyItem = ({ icon, title, sub, phone, is247 = false }: any) => (
    <View style={s.emergencyCard}>
      {/* Fila superior: ícono + info + botón */}
      <View style={s.emergencyRow}>
        <Ionicons name={icon} size={26} color="#EF4444" />
        <View style={s.emergencyInfo}>
          <View style={s.emergencyTitleRow}>
            <Text style={s.emergencyText} numberOfLines={1}>{title}</Text>
            {is247 && (
              <View style={s.badge247}>
                <Text style={s.badgeText}>24/7</Text>
              </View>
            )}
          </View>
          <Text style={s.emergencySub}>{sub}</Text>
        </View>
        <Pressable onPress={() => handleCall(phone)} style={s.callBtn}>
          <Text style={s.callBtnText}>{t('call_btn')}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />

      <View style={s.header}>
        <Text style={s.headerTitle}>{t('help_center')}</Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('emergency_title')}</Text>

        <EmergencyItem icon="flame"      title="Bomberos"          sub="Estación Guadalupe"       phone="+528140400021" is247 />
        <EmergencyItem icon="megaphone"  title="Protección Civil"  sub="Rescate y Auxilio"        phone="+528117718801" is247 />
        <EmergencyItem icon="medical"    title="Cruz Verde"        sub="Ambulancias"              phone="+528140409080" is247 />
        <EmergencyItem icon="shield"     title="Seguridad Pública" sub="Policía Municipal"        phone="+528181355900" is247 />
        <EmergencyItem icon="car-sport"  title="Tránsito y Vialidad" sub="Asistencia Vial"        phone="+528181355900" is247 />
      </View>

      <View style={s.formCard}>
        <Text style={s.formTitle}>Soporte Técnico GuadalupeGO</Text>
        <TextInput placeholder={t('tab_profile')} style={s.input} placeholderTextColor={colors.subtext} />
        <TextInput placeholder={t('email')} style={s.input} placeholderTextColor={colors.subtext} />
        <TextInput placeholder={t('phone')} style={s.input} placeholderTextColor={colors.subtext} />
        <TextInput
          placeholder={t('description')}
          style={[s.input, { height: 80 }]}
          multiline
          placeholderTextColor={colors.subtext}
        />

        <Pressable style={s.sendBtn}>
          <Text style={s.sendText}>{t('share')}</Text>
        </Pressable>

        <View style={s.directContactContainer}>
          <Text style={s.formTitle}>{t('tab_contact')}</Text>

          <View style={s.infoRow}>
            <View style={[s.iconBox, { backgroundColor: '#FF6B35' }]}>
              <Ionicons name="mail" size={20} color="white" />
            </View>
            <View style={s.infoTextContainer}>
              <Text style={s.infoLabel}>{t('email')}</Text>
              <Text style={s.infoValue}>turismo@guadalupe.gob.mx</Text>
              <Text style={s.infoValue}>info@guadalupe.gob.mx</Text>
            </View>
          </View>

          <Pressable style={s.infoRow} onPress={() => handleCall('8112345678')}>
            <View style={[s.iconBox, { backgroundColor: '#4A90E2' }]}>
              <Ionicons name="call" size={20} color="white" />
            </View>
            <View style={s.infoTextContainer}>
              <Text style={s.infoLabel}>{t('phone')}</Text>
              <Text style={s.infoValue}>+52 (81) 1234-5678</Text>
              <Text style={s.infoSubValue}>{t('schedule')}: 9:00 AM - 6:00 PM</Text>
            </View>
          </Pressable>

          <View style={s.infoRow}>
            <View style={[s.iconBox, { backgroundColor: '#F5BE41' }]}>
              <Ionicons name="location" size={20} color="white" />
            </View>
            <View style={s.infoTextContainer}>
              <Text style={s.infoLabel}>{t('address')}</Text>
              <Text style={s.infoValue}>Palacio Municipal, Centro</Text>
              <Text style={s.infoSubValue}>Guadalupe, Nuevo León, México</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  container:  { flex: 1, backgroundColor: c.background },
  header:     { backgroundColor: '#E96928', padding: 30 },
  headerTitle:{ color: '#fff', fontSize: f.xl, fontWeight: '900', textAlign: 'center' },

  section:      { padding: 20 },
  sectionTitle: { fontSize: f.md, fontWeight: 'bold', marginBottom: 15, color: c.text },

  emergencyCard: {
    backgroundColor: c.card,
    padding: 14,
    borderRadius: 18,
    elevation: 3,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: c.border,
  },
  // Fila interna: ícono | info | botón
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyInfo: {
    flex: 1,           // ocupa todo el espacio disponible
    minWidth: 0,       // permite que el texto se trunque en lugar de empujar
  },
  emergencyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',  // si no cabe, el badge baja a la siguiente línea
    gap: 6,
  },
  emergencyText: { fontWeight: 'bold', fontSize: f.base, color: c.text, flexShrink: 1 },
  emergencySub:  { color: c.subtext, fontSize: f.xs, marginTop: 2 },

  badge247:  { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#22C55E',flexShrink: 0,  },
  badgeText: { color: '#166534', fontSize: f.xs, fontWeight: 'bold' },

  // Botón siempre con ancho fijo para que no varíe
  callBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 60,
    justifyContent: 'center',
  },
  callBtnText: { color: '#fff', fontWeight: 'bold', fontSize: f.xs },

  formCard:   { margin: 20, backgroundColor: c.card, padding: 20, borderRadius: 25, elevation: 4, marginBottom: 40, borderWidth: 1, borderColor: c.border },
  formTitle:  { fontSize: f.md, fontWeight: 'bold', marginBottom: 20, color: c.text },
  input:      { backgroundColor: c.inputBackground, borderRadius: 12, padding: 12, marginBottom: 12, color: c.text, fontSize: f.base, borderWidth: 1, borderColor: c.border },
  sendBtn:    { backgroundColor: '#E96928', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  sendText:   { color: '#fff', fontWeight: 'bold', fontSize: f.base },

  directContactContainer: { marginTop: 25, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 20 },
  infoRow:            { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
  iconBox:            { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15, elevation: 2 },
  infoTextContainer:  { flex: 1 },
  infoLabel:          { fontSize: f.base, fontWeight: 'bold', color: c.text, marginBottom: 2 },
  infoValue:          { fontSize: f.sm, color: c.subtext },
  infoSubValue:       { fontSize: f.xs, color: c.subtext, marginTop: 2 },
});
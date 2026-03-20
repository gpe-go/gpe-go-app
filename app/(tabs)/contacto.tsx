import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export default function ContactoScreen() {
  const handleCall = (numero: string) => Linking.openURL(`tel:${numero}`);

  // Componente interno con el distintivo 24/7
  const EmergencyItem = ({ icon, title, sub, phone, is247 = false }: any) => (
    <View style={styles.emergencyCard}>
      <Ionicons name={icon} size={30} color="#EF4444" />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.emergencyText}>{title}</Text>
          {is247 && (
            <View style={styles.badge247}>
              <Text style={styles.badgeText}>24/7</Text>
            </View>
          )}
        </View>
        <Text style={styles.emergencySub}>{sub}</Text>
      </View>

      <Pressable onPress={() => handleCall(phone)} style={styles.callBtn}>
        <Text style={styles.callBtnText}>Llamar</Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Centro de Ayuda</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergencias Guadalupe</Text>

        <EmergencyItem
          icon="flame"
          title="Bomberos"
          sub="Estación Guadalupe"
          phone="+528140400021"
          is247={true}
        />

        <EmergencyItem
          icon="megaphone"
          title="Protección Civil"
          sub="Rescate y Auxilio"
          phone="+528117718801"
          is247={true}
        />

        <EmergencyItem
          icon="medical"
          title="Cruz Verde"
          sub="Ambulancias"
          phone="+528140409080"
          is247={true}
        />

        <EmergencyItem
          icon="shield"
          title="Seguridad Pública"
          sub="Policía Municipal"
          phone="+528181355900"
          is247={true}
        />

        <EmergencyItem
          icon="car-sport"
          title="Tránsito y Vialidad"
          sub="Asistencia Vial Guadalupe"
          phone="+528181355900"
          is247={true}
        />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Soporte Técnico GuadalupeGO</Text>
        <TextInput placeholder="Tu Nombre" style={styles.input} placeholderTextColor="#94a3b8" />
        <TextInput placeholder="Correo electrónico" style={styles.input} placeholderTextColor="#94a3b8" />
        <TextInput placeholder="Teléfono (Opcional)" style={styles.input} placeholderTextColor="#94a3b8" />
        <TextInput
          placeholder="¿En qué podemos ayudarte?"
          style={[styles.input, { height: 80 }]}
          multiline
          placeholderTextColor="#94a3b8"
        />

        <Pressable style={styles.sendBtn}>
          <Text style={styles.sendText}>Enviar Mensaje</Text>
        </Pressable>

        <View style={styles.directContactContainer}>
          <Text style={styles.formTitle}>Contacto Directo</Text>

          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: '#FF6B35' }]}>
              <Ionicons name="mail" size={20} color="white" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Correo Electrónico</Text>
              <Text style={styles.infoValue}>turismo@guadalupe.gob.mx</Text>
              <Text style={styles.infoValue}>info@guadalupe.gob.mx</Text>
            </View>
          </View>

          <Pressable style={styles.infoRow} onPress={() => handleCall('8112345678')}>
            <View style={[styles.iconBox, { backgroundColor: '#4A90E2' }]}>
              <Ionicons name="call" size={20} color="white" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>+52 (81) 1234-5678</Text>
              <Text style={styles.infoSubValue}>Lun - Vie: 9:00 AM - 6:00 PM</Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.infoRow}
            onPress={() => Linking.openURL('https://www.google.com/maps/search/?api=1&query=Palacio+Municipal+Guadalupe+Nuevo+Leon+Mexico')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#F5BE41' }]}>
              <Ionicons name="location" size={20} color="white" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Dirección</Text>
              <Text style={[styles.infoValue, { color: '#E96928' }]}>Palacio Municipal, Centro</Text>
              <Text style={styles.infoSubValue}>Guadalupe, Nuevo León, México</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#E96928', padding: 30 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1E293B' },

  emergencyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 3,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emergencyText: { fontWeight: 'bold', fontSize: 15, color: '#1E293B' },
  emergencySub: { color: '#64748B', fontSize: 12 },

  badge247: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#22C55E'
  },
  badgeText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: 'bold',
  },

  callBtn: { backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  callBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  formCard: { margin: 20, backgroundColor: '#fff', padding: 20, borderRadius: 25, elevation: 4, marginBottom: 40 },
  formTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 20, color: '#1E293B' },
  input: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 12, marginBottom: 12, color: '#1E293B' },
  sendBtn: { backgroundColor: '#E96928', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  sendText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  directContactContainer: { marginTop: 25, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20 },
  infoRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15, elevation: 2 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#64748B' },
  infoSubValue: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
});
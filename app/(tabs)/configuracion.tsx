import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ConfiguracionScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('Normal');

  // Idiomas para el Mundial 2026
  const [selectedLang, setSelectedLang] = useState('es');
  const idiomas = [
    { id: 'es', label: 'Español', flag: '🇲🇽', desc: 'Sede México' },
    { id: 'en', label: 'English', flag: '🇺🇸', desc: 'Sede USA' },
    { id: 'fr', label: 'Français', flag: '🇨🇦', desc: 'Sede Canadá' },
    { id: 'pt', label: 'Português', flag: '🇧🇷', desc: 'Brasil' },
    { id: 'de', label: 'Deutsch', flag: '🇩🇪', desc: 'Alemania' },
    { id: 'ja', label: '日本語', flag: '🇯🇵', desc: 'Japón' },
  ];

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Header Personalizado */}
      <View style={[styles.header, darkMode && styles.darkHeader]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#fff" : "#1E293B"} />
        </Pressable>
        <Text style={[styles.headerTitle, darkMode && styles.textWhite]}>Ajustes del Sistema</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* SECCIÓN: APARIENCIA */}
        <Text style={styles.sectionTitle}>Apariencia y Lectura</Text>
        <View style={[styles.card, darkMode && styles.darkCard]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { backgroundColor: '#f1f5f9' }]}>
                <Ionicons name="moon" size={20} color="#E96928" />
              </View>
              <Text style={[styles.rowText, darkMode && styles.textWhite]}>Modo Oscuro</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#cbd5e1", true: "#E96928" }}
            />
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.row}
            onPress={() =>
              setFontSize(fontSize === 'Normal' ? 'Grande' : 'Normal')
            }
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { backgroundColor: '#f1f5f9' }]}>
                <Ionicons name="text" size={20} color="#E96928" />
              </View>
              <Text style={[styles.rowText, darkMode && styles.textWhite]}>Tamaño de Letra </Text>
            </View>
            <Text style={styles.valueText}>{fontSize} ›</Text>
          </Pressable>
        </View>

        {/* SECCIÓN: IDIOMAS MUNDIALISTAS */}
        <Text style={styles.sectionTitle}>Idiomas Mundial 2026</Text>
        <View style={[styles.card, darkMode && styles.darkCard]}>
          {idiomas.map((item, index) => (
            <View key={item.id}>
              <Pressable
                style={styles.langRow}
                onPress={() => setSelectedLang(item.id)}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.flagIcon}>{item.flag}</Text>
                  <View>
                    <Text style={[styles.langLabel, darkMode && styles.textWhite]}>{item.label}</Text>
                    <Text style={styles.langDesc}>{item.desc}</Text>
                  </View>
                </View>
                {selectedLang === item.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#E96928" />
                )}
              </Pressable>
              {index !== idiomas.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.footerNote}>GuadalupeGO v1.0.2 - Mundial 2026 Edition</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  darkHeader: { backgroundColor: '#1E293B', borderBottomWidth: 0 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  backButton: { padding: 8 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 12, marginLeft: 5, letterSpacing: 1 },
  card: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 15, marginBottom: 25, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  darkCard: { backgroundColor: '#1E293B' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { padding: 8, borderRadius: 10, marginRight: 12 },
  rowText: { fontSize: 16, fontWeight: '500', color: '#1E293B' },
  valueText: { color: '#64748B', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#f1f5f9', opacity: 0.6 },
  flagIcon: { fontSize: 28, marginRight: 15 },
  langLabel: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  langDesc: { fontSize: 12, color: '#94a3b8' },
  textWhite: { color: '#fff' },
  footerNote: { textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 10, marginBottom: 30 }
});
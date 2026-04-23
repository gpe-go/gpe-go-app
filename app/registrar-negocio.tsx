import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategoriasAPI, getMisLugares, registrarComercio, subirFotoLugar } from '../src/api/api';
import { useAuth } from '../src/context/AuthContext';

type Categoria = { id: number; nombre: string };
type Lugar = { id: number; nombre: string; estado: string; direccion?: string };

export default function RegistrarNegocioScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [idCategoria, setIdCategoria] = useState<number | null>(null);
  const [fotos, setFotos] = useState<string[]>([]);

  // Datos externos
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [misLugares, setMisLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Inicia sesión',
        'Necesitas iniciar sesión para registrar un negocio.',
        [{ text: 'Ir al login', onPress: () => router.replace('/login') }]
      );
      return;
    }
    cargarDatos();
  }, [isAuthenticated, router]);

  const cargarDatos = async () => {
    try {
      const [catRes, lugaresRes] = await Promise.all([
        getCategoriasAPI(),
        getMisLugares(),
      ]);
      if (catRes.success) setCategorias(catRes.data);
      if (lugaresRes.success) setMisLugares(lugaresRes.data);
    } catch {
      // sin conexión, continúa con listas vacías
    } finally {
      setLoadingDatos(false);
    }
  };

  const MAX_FOTOS = 4;

  const agregarFoto = async () => {
    if (fotos.length >= MAX_FOTOS) {
      Alert.alert('Límite alcanzado', `Máximo ${MAX_FOTOS} fotos por negocio`);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para agregar fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const mime = result.assets[0].mimeType || 'image/jpeg';
      const base64 = `data:${mime};base64,${result.assets[0].base64}`;
      setFotos(prev => [...prev, base64]);
    }
  };

  const quitarFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleRegistrar = async () => {
    if (!isAuthenticated) {
      Alert.alert('Inicia sesión', 'Tu sesión expiró. Inicia sesión nuevamente.', [
        { text: 'Ir al login', onPress: () => router.replace('/login') },
      ]);
      return;
    }
    if (!nombre.trim()) {
      Alert.alert('Campo requerido', 'El nombre del negocio es obligatorio');
      return;
    }
    if (!idCategoria) {
      Alert.alert('Campo requerido', 'Selecciona una categoría');
      return;
    }
    setLoading(true);
    try {
      const res = await registrarComercio({
        nombre: nombre.trim(),
        id_categoria: idCategoria,
        descripcion: descripcion.trim() || undefined,
        direccion: direccion.trim() || undefined,
        telefono: telefono.trim() || undefined,
      });
      if (res.success) {
        // Subir fotos si hay
        const idLugar = res.data?.id;
        if (idLugar && fotos.length > 0) {
          await Promise.all(
            fotos.map((foto, i) => subirFotoLugar(idLugar, foto, i + 1).catch(() => null))
          );
        }
        Alert.alert(
          '¡Negocio registrado!',
          'Tu comercio está pendiente de aprobación. El equipo de GuadalupeGO lo revisará pronto.',
          [{ text: 'Entendido', onPress: () => { cargarDatos(); limpiarForm(); } }]
        );
      } else {
        Alert.alert('Error', res.error?.mensaje || 'No se pudo registrar el negocio');
      }
    } catch (e: any) {
      const msg = e.response?.data?.error?.mensaje || 'Error de conexión';
      if (msg.toLowerCase().includes('autenticación')) {
        Alert.alert('Sesión expirada', 'Tu sesión ha expirado. Inicia sesión nuevamente.', [
          { text: 'Ir al login', onPress: () => router.replace('/login') },
        ]);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const limpiarForm = () => {
    setNombre('');
    setDescripcion('');
    setDireccion('');
    setTelefono('');
    setIdCategoria(null);
    setFotos([]);
  };

  const estadoColor = (estado: string) => {
    if (estado === 'aprobado') return '#22c55e';
    if (estado === 'rechazado') return '#ef4444';
    return '#f59e0b';
  };

  const estadoLabel = (estado: string) => {
    if (estado === 'aprobado') return 'Aprobado';
    if (estado === 'rechazado') return 'Rechazado';
    return 'Pendiente';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Mi negocio</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* MIS NEGOCIOS REGISTRADOS */}
        {misLugares.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mis negocios</Text>
            {misLugares.map((lugar) => (
              <View key={lugar.id} style={styles.lugarCard}>
                <View style={styles.lugarInfo}>
                  <Ionicons name="storefront-outline" size={20} color="#E96928" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.lugarNombre}>{lugar.nombre}</Text>
                    {lugar.direccion ? (
                      <Text style={styles.lugarDir}>{lugar.direccion}</Text>
                    ) : null}
                  </View>
                </View>
                <View style={[styles.estadoBadge, { backgroundColor: estadoColor(lugar.estado) + '22' }]}>
                  <Text style={[styles.estadoText, { color: estadoColor(lugar.estado) }]}>
                    {estadoLabel(lugar.estado)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* FORMULARIO NUEVO NEGOCIO */}
        <Text style={styles.sectionTitle}>Registrar nuevo negocio</Text>

        {loadingDatos ? (
          <ActivityIndicator color="#E96928" style={{ marginTop: 30 }} />
        ) : (
          <View style={styles.card}>

            {/* Nombre */}
            <Text style={styles.fieldLabel}>Nombre del negocio <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="storefront-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Ej. Taquería El Rey"
                value={nombre}
                onChangeText={setNombre}
                placeholderTextColor="#94a3b8"
                editable={!loading}
              />
            </View>

            {/* Categoría */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Categoría <Text style={styles.required}>*</Text></Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categorias.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[styles.catChip, idCategoria === cat.id && styles.catChipActive]}
                  onPress={() => setIdCategoria(cat.id)}
                >
                  <Text style={[styles.catChipText, idCategoria === cat.id && styles.catChipTextActive]}>
                    {cat.nombre}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Descripción */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Descripción</Text>
            <View style={[styles.inputWrapper, { height: 90, alignItems: 'flex-start', paddingTop: 14 }]}>
              <Ionicons name="document-text-outline" size={20} color="#94a3b8" />
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Describe brevemente tu negocio..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                placeholderTextColor="#94a3b8"
                editable={!loading}
              />
            </View>

            {/* Dirección */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Dirección</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Ej. Av. Benito Juárez 123"
                value={direccion}
                onChangeText={setDireccion}
                placeholderTextColor="#94a3b8"
                editable={!loading}
              />
            </View>

            {/* Teléfono */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Teléfono</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Ej. 8112345678"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
                editable={!loading}
              />
            </View>

            {/* Fotos */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
              Fotos del negocio ({fotos.length}/{MAX_FOTOS})
            </Text>
            <Text style={styles.fotosHint}>Agrega hasta {MAX_FOTOS} fotos para mostrar tu negocio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
              {fotos.map((foto, i) => (
                <View key={i} style={styles.fotoWrapper}>
                  <Image source={{ uri: foto }} style={styles.fotoThumb} />
                  <Pressable style={styles.fotoRemove} onPress={() => quitarFoto(i)}>
                    <Ionicons name="close-circle" size={22} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
              {fotos.length < MAX_FOTOS && (
                <Pressable style={styles.fotoAdd} onPress={agregarFoto}>
                  <Ionicons name="camera-outline" size={28} color="#E96928" />
                  <Text style={styles.fotoAddText}>Agregar</Text>
                </Pressable>
              )}
            </ScrollView>

            {/* Botón registrar */}
            <Pressable
              style={[styles.submitButton, loading && { opacity: 0.6 }]}
              onPress={handleRegistrar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Enviar para aprobación</Text>
                </>
              )}
            </Pressable>

            <Text style={styles.hint}>
              Tu negocio será revisado por el equipo de GuadalupeGO antes de publicarse.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  lugarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    elevation: 1,
  },
  lugarInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  lugarNombre: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  lugarDir: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  estadoBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  estadoText: { fontSize: 12, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    elevation: 3,
    marginBottom: 20,
  },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
  required: { color: '#E96928' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0f172a' },
  catScroll: { marginBottom: 4 },
  catChip: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F8FAFC',
  },
  catChipActive: { borderColor: '#E96928', backgroundColor: '#FFF3ED' },
  catChipText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  catChipTextActive: { color: '#E96928' },
  fotosHint: { fontSize: 12, color: '#94a3b8', marginBottom: 10 },
  fotoWrapper: { position: 'relative', marginRight: 10 },
  fotoThumb: { width: 90, height: 90, borderRadius: 12 },
  fotoRemove: { position: 'absolute', top: -6, right: -6 },
  fotoAdd: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F5',
  },
  fotoAddText: { fontSize: 11, color: '#E96928', marginTop: 4, fontWeight: '600' },
  submitButton: {
    backgroundColor: '#E96928',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    elevation: 4,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
});

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registrarConPassword, registrarUsuario, solicitarCodigo } from '../src/api/api';

type Metodo = 'password' | 'codigo';

export default function Registro() {
  const router = useRouter();
  const [metodo, setMetodo] = useState<Metodo>('password');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegistro = async () => {
    if (!nombre.trim() || !email.trim()) {
      Alert.alert('Error', 'Completa todos los campos'); return;
    }

    setLoading(true);
    try {
      if (metodo === 'password') {
        if (!password.trim()) { Alert.alert('Error', 'Ingresa una contraseña'); setLoading(false); return; }
        if (password.length < 6) { Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres'); setLoading(false); return; }
        if (password !== confirmar) { Alert.alert('Error', 'Las contraseñas no coinciden'); setLoading(false); return; }

        const res = await registrarConPassword(nombre.trim(), email.trim(), password);
        if (res.success) {
          await AsyncStorage.setItem('token', res.data.token);
          await AsyncStorage.setItem('usuario', JSON.stringify(res.data.usuario));
          router.replace('/(tabs)');
        } else {
          Alert.alert('Error', res.error?.mensaje || 'No se pudo crear la cuenta');
        }
      } else {
        const res = await registrarUsuario(nombre.trim(), email.trim());
        if (res.success) {
          const resCodigo = await solicitarCodigo(email.trim());
          router.replace({ pathname: '/codigo', params: { email: email.trim(), codigoDesarrollo: resCodigo.data?.codigo } });
        } else {
          Alert.alert('Error', res.error?.mensaje || 'No se pudo crear la cuenta');
        }
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Únete a GuadalupeGO</Text>

        {/* Selector de método */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, metodo === 'password' && styles.tabActive]}
            onPress={() => setMetodo('password')}
          >
            <Text style={[styles.tabText, metodo === 'password' && styles.tabTextActive]}>Con contraseña</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, metodo === 'codigo' && styles.tabActive]}
            onPress={() => setMetodo('codigo')}
          >
            <Text style={[styles.tabText, metodo === 'codigo' && styles.tabTextActive]}>Solo email</Text>
          </TouchableOpacity>
        </View>

        {/* Nombre */}
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#94a3b8" />
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor="#94a3b8"
            autoCapitalize="words"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#94a3b8" />
          <TextInput
            style={styles.input}
            placeholder="email@ejemplo.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Contraseña (solo en modo password) */}
        {metodo === 'password' && (
          <>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Contraseña (mín. 6 caracteres)"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                value={confirmar}
                onChangeText={setConfirmar}
              />
            </View>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleRegistro} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.buttonText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/login')}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia sesión</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  inner: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 28 },
  tabs: {
    flexDirection: 'row', backgroundColor: '#f1f5f9',
    borderRadius: 12, padding: 4, marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 },
  tabText: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  tabTextActive: { color: '#E96928' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 14, height: 54, marginBottom: 14,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B' },
  button: {
    backgroundColor: '#E96928', borderRadius: 12,
    height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 4,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  loginButton: { marginTop: 24, alignItems: 'center' },
  loginText: { fontSize: 14, color: '#64748b' },
  loginLink: { color: '#E96928', fontWeight: '600' },
});

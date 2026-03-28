import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { solicitarCodigo, verificarCodigo, registrarUsuario } from '../../src/api/api';

type Step = 'login' | 'registro' | 'codigo';

export default function PerfilScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('usuario').then((data) => {
      if (data) setUsuario(JSON.parse(data));
    });
  }, []);

  const handleSolicitarCodigo = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    try {
      const res = await solicitarCodigo(email.trim().toLowerCase());
      if (res.success) {
        if (res.data?.codigo) {
          Alert.alert('Código (dev)', `Tu código es: ${res.data.codigo}`);
        } else {
          Alert.alert('Código enviado', 'Revisa tu correo electrónico');
        }
        setStep('codigo');
      } else {
        Alert.alert('Error', res.error?.mensaje || 'No se pudo enviar el código');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error?.mensaje || 'Error de conexión';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async () => {
    if (!nombre.trim() || !email.trim()) {
      Alert.alert('Error', 'Ingresa tu nombre y correo');
      return;
    }
    setLoading(true);
    try {
      const res = await registrarUsuario(nombre.trim(), email.trim().toLowerCase());
      if (res.success) {
        Alert.alert('Cuenta creada', 'Ahora te enviaremos un código de verificación');
        await handleSolicitarCodigo();
      } else {
        Alert.alert('Error', res.error?.mensaje || 'No se pudo crear la cuenta');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error?.mensaje || 'Error de conexión';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigo.trim()) {
      Alert.alert('Error', 'Ingresa el código de verificación');
      return;
    }
    setLoading(true);
    try {
      const res = await verificarCodigo(email.trim().toLowerCase(), codigo.trim());
      if (res.success) {
        await AsyncStorage.setItem('token', res.data.token);
        await AsyncStorage.setItem('usuario', JSON.stringify(res.data.usuario));
        setUsuario(res.data.usuario);
      } else {
        Alert.alert('Error', res.error?.mensaje || 'Código incorrecto');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error?.mensaje || 'Error de conexión';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarSesion = async () => {
    await AsyncStorage.multiRemove(['token', 'usuario']);
    setUsuario(null);
    setStep('login');
    setEmail('');
    setNombre('');
    setCodigo('');
  };

  // ===================== USUARIO LOGUEADO =====================
  if (usuario) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={26} color="#94a3b8" />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color="white" />
            </View>
            <Text style={styles.welcomeText}>{usuario.nombre}</Text>
            <Text style={styles.instructionText}>{usuario.email}</Text>
          </View>

          <Pressable style={styles.logoutButton} onPress={handleCerrarSesion}>
            <Ionicons name="log-out-outline" size={20} color="#E96928" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ===================== PASO: CÓDIGO =====================
  if (step === 'codigo') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={26} color="#94a3b8" />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.avatarCircle}>
              <Ionicons name="key" size={36} color="white" />
            </View>
            <Text style={styles.welcomeText}>Verificar código</Text>
            <Text style={styles.instructionText}>
              Ingresa el código enviado a {email}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={codigo}
                  onChangeText={setCodigo}
                  placeholderTextColor="#94a3b8"
                  editable={!loading}
                />
              </View>

              <Pressable
                style={[styles.loginButton, loading && { opacity: 0.6 }]}
                onPress={handleVerificarCodigo}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Verificar</Text>
                )}
              </Pressable>

              <Pressable onPress={handleSolicitarCodigo} disabled={loading}>
                <Text style={styles.forgotText}>Reenviar código</Text>
              </Pressable>

              <Pressable onPress={() => { setStep('login'); setCodigo(''); }}>
                <Text style={styles.forgotText}>Cambiar correo</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ===================== PASO: REGISTRO =====================
  if (step === 'registro') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={26} color="#94a3b8" />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-add" size={36} color="white" />
            </View>
            <Text style={styles.welcomeText}>Crear cuenta</Text>
            <Text style={styles.instructionText}>
              Regístrate para guardar favoritos y recibir noticias.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  autoCapitalize="words"
                  value={nombre}
                  onChangeText={setNombre}
                  placeholderTextColor="#94a3b8"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#94a3b8"
                  editable={!loading}
                />
              </View>

              <Pressable
                style={[styles.loginButton, loading && { opacity: 0.6 }]}
                onPress={handleRegistro}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Crear cuenta</Text>
                )}
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.registerContainer} onPress={() => setStep('login')}>
            <Text style={styles.registerText}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.orangeLink}>Iniciar sesión</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ===================== PASO: LOGIN (EMAIL) =====================
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#94a3b8" />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={styles.welcomeText}>Bienvenido</Text>
          <Text style={styles.instructionText}>
            Accede a tu cuenta para guardar eventos favoritos y recibir noticias exclusivas.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#94a3b8"
                editable={!loading}
              />
            </View>

            <Pressable
              style={[styles.loginButton, loading && { opacity: 0.6 }]}
              onPress={handleSolicitarCodigo}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Enviar código</Text>
              )}
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.registerContainer} onPress={() => setStep('registro')}>
          <Text style={styles.registerText}>
            ¿No tienes cuenta?{' '}
            <Text style={styles.orangeLink}>Crear cuenta</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E96928',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 6,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
  },
  instructionText: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 25,
    elevation: 8,
  },
  form: {
    gap: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingHorizontal: 18,
    height: 58,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#0f172a',
  },
  loginButton: {
    backgroundColor: '#E96928',
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
  },
  forgotText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#E96928',
    fontSize: 14,
    fontWeight: '600',
  },
  registerContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  registerText: {
    color: '#64748b',
    fontSize: 15,
  },
  orangeLink: {
    color: '#E96928',
    fontWeight: '800',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 18,
    height: 55,
    borderWidth: 1,
    borderColor: '#E96928',
  },
  logoutText: {
    color: '#E96928',
    fontSize: 16,
    fontWeight: '700',
  },
});

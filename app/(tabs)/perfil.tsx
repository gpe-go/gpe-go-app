import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable,
  ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPerfil } from '../../src/api/api';

export default function PerfilScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      const res = await getPerfil();
      if (res.success) setUsuario(res.data);
    } catch {
      // sin sesión
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarSesion = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
    setUsuario(null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E96928" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#94a3b8" />
        </Pressable>

        {usuario ? (
          // === SESIÓN ACTIVA ===
          <View>
            <View style={styles.header}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={40} color="white" />
              </View>
              <Text style={styles.welcomeText}>{usuario.nombre}</Text>
              <Text style={styles.emailText}>{usuario.email}</Text>
              <View style={styles.rolBadge}>
                <Text style={styles.rolText}>{usuario.rol}</Text>
              </View>
            </View>

            <Pressable style={styles.logoutButton} onPress={handleCerrarSesion}>
              <Ionicons name="log-out-outline" size={20} color="#E96928" />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </Pressable>
          </View>
        ) : (
          // === SIN SESIÓN ===
          <View>
            <View style={styles.header}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={40} color="white" />
              </View>
              <Text style={styles.welcomeText}>Bienvenido</Text>
              <Text style={styles.instructionText}>
                Accede a tu cuenta para guardar favoritos y recibir noticias exclusivas.
              </Text>
            </View>

            <Pressable style={styles.loginButton} onPress={() => router.push('/login')}>
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
            </Pressable>

            <Pressable style={styles.registerContainer} onPress={() => router.push('/registro')}>
              <Text style={styles.registerText}>
                ¿No tienes cuenta?{' '}
                <Text style={styles.orangeLink}>Crear cuenta</Text>
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  closeButton: { alignSelf: 'flex-end' },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#E96928', justifyContent: 'center',
    alignItems: 'center', marginBottom: 15, elevation: 6,
  },
  welcomeText: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
  emailText: { fontSize: 15, color: '#64748b', marginTop: 4 },
  rolBadge: {
    marginTop: 10, backgroundColor: '#fff3ec', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 4,
  },
  rolText: { color: '#E96928', fontWeight: '700', fontSize: 13 },
  instructionText: {
    fontSize: 15, color: '#64748b', marginTop: 8,
    textAlign: 'center', lineHeight: 22, paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: '#E96928', height: 58, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  loginButtonText: { color: 'white', fontSize: 17, fontWeight: '800' },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderColor: '#E96928', borderRadius: 18,
    height: 52, marginTop: 10,
  },
  logoutText: { color: '#E96928', fontWeight: '700', fontSize: 16 },
  registerContainer: { marginTop: 24, alignItems: 'center' },
  registerText: { color: '#64748b', fontSize: 15 },
  orangeLink: { color: '#E96928', fontWeight: '800' },
});

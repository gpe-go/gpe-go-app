import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verificarCodigo } from '../src/api/api';

export default function Codigo() {
  const router = useRouter();
  const { email, codigoDesarrollo } = useLocalSearchParams<{ email: string; codigoDesarrollo?: string }>();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerificar = async () => {
    if (!codigo.trim()) {
      Alert.alert('Error', 'Ingresa el código');
      return;
    }

    setLoading(true);
    try {
      const res = await verificarCodigo(email, codigo.trim());

      if (res.success) {
        await AsyncStorage.setItem('token', res.data.token);
        await AsyncStorage.setItem('usuario', JSON.stringify(res.data.usuario));
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', res.error?.mensaje || 'Código incorrecto');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Verifica tu correo</Text>
        <Text style={styles.subtitle}>
          Ingresa el código enviado a{'\n'}<Text style={styles.email}>{email}</Text>
        </Text>

        {codigoDesarrollo && (
          <View style={styles.devBox}>
            <Text style={styles.devText}>Código (desarrollo): {codigoDesarrollo}</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="123456"
          placeholderTextColor="#94a3b8"
          keyboardType="number-pad"
          maxLength={6}
          value={codigo}
          onChangeText={setCodigo}
        />

        <TouchableOpacity style={styles.button} onPress={handleVerificar} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verificar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Cambiar correo</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  email: {
    color: '#E96928',
    fontWeight: '600',
  },
  devBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  devText: {
    color: '#92400e',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
    fontSize: 20,
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 6,
  },
  button: {
    backgroundColor: '#E96928',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    color: '#64748b',
    fontSize: 14,
  },
});

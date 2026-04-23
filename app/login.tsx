import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { solicitarCodigo, verificarCodigo } from '../src/api/api';

type Step = 'email' | 'codigo';

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSolicitarCodigo = async () => {
    if (!email.trim()) {
      Alert.alert('Error', t('login_error_no_email'));
      return;
    }

    setLoading(true);
    try {
      const res = await solicitarCodigo(email.trim().toLowerCase());

      if (res.success) {
        // En modo desarrollo, la API retorna el código
        if (res.data?.codigo) {
          Alert.alert(t('login_code_dev_title'), t('login_code_dev_msg', { code: res.data.codigo }));
        } else {
          Alert.alert(t('login_code_sent_title'), t('login_code_sent_msg'));
        }
        setStep('codigo');
      } else {
        Alert.alert('Error', res.error?.mensaje || t('login_error_send_code'));
      }
    } catch (error: any) {
      const msg = error.response?.data?.error?.mensaje || t('login_error_connection');
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigo.trim()) {
      Alert.alert('Error', t('login_error_no_code'));
      return;
    }

    setLoading(true);
    try {
      const res = await verificarCodigo(email.trim().toLowerCase(), codigo.trim());

      if (res.success) {
        await AsyncStorage.setItem('token', res.data.token);
        await AsyncStorage.setItem('usuario', JSON.stringify(res.data.usuario));
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', res.error?.mensaje || t('login_error_wrong_code'));
      }
    } catch (error: any) {
      const msg = error.response?.data?.error?.mensaje || t('login_error_connection');
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.orangeIconBg}>
            <Ionicons name="location" size={20} color="white" />
          </View>
          <Text style={styles.logoText}>
            Guadalupe<Text style={{ color: '#E96928' }}>GO</Text>
          </Text>
        </View>

        {step === 'email' ? (
          <>
            <Text style={styles.title}>{t('login_title')}</Text>
            <Text style={styles.subtitle}>{t('login_email_subtitle')}</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSolicitarCodigo}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{t('login_send_code')}</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.title}>{t('login_verify_title')}</Text>
            <Text style={styles.subtitle}>{t('login_verify_subtitle', { email })}</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor="#aaa"
                keyboardType="number-pad"
                maxLength={6}
                value={codigo}
                onChangeText={setCodigo}
                editable={!loading}
              />
            </View>

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerificarCodigo}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{t('login_verify_btn')}</Text>
              )}
            </Pressable>

            <Pressable onPress={() => { setStep('email'); setCodigo(''); }} disabled={loading}>
              <Text style={styles.linkText}>{t('login_change_email')}</Text>
            </Pressable>

            <Pressable onPress={handleSolicitarCodigo} disabled={loading}>
              <Text style={styles.linkText}>{t('login_resend_code')}</Text>
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  orangeIconBg: {
    backgroundColor: '#E96928',
    padding: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1E293B',
  },
  button: {
    backgroundColor: '#E96928',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkText: {
    color: '#E96928',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
});

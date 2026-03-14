import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BOTÓN CERRAR */}
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#94a3b8" />
        </Pressable>

        {/* HEADER PREMIUM */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color="white" />
          </View>

          <Text style={styles.welcomeText}>Bienvenido</Text>
          <Text style={styles.instructionText}>
            Accede a tu cuenta para guardar eventos favoritos y recibir noticias exclusivas.
          </Text>
        </View>

        {/* CARD FORMULARIO */}
        <View style={styles.card}>
          <View style={styles.form}>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Pressable style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </Pressable>

            <Pressable>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </View>
        </View>

        {/* DIVIDER */}
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>o continúa con</Text>
          <View style={styles.line} />
        </View>

        {/* SOCIAL */}
        <View style={styles.socialButtons}>
          <Pressable style={[styles.socialBtn, styles.googleBtn]}>
            <FontAwesome5 name="google" size={18} color="#ea4335" />
            <Text style={styles.socialBtnText}>Google</Text>
          </Pressable>

          <Pressable style={[styles.socialBtn, styles.appleBtn]}>
            <Ionicons name="logo-apple" size={22} color="white" />
            <Text style={[styles.socialBtnText, { color: 'white' }]}>
              Apple
            </Text>
          </Pressable>
        </View>

        <Pressable style={styles.registerContainer}>
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
    color: '#64748b',
    fontSize: 14,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 35,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },

  dividerText: {
    marginHorizontal: 15,
    color: '#94a3b8',
    fontSize: 14,
  },

  socialButtons: {
    gap: 15,
  },

  socialBtn: {
    flexDirection: 'row',
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  googleBtn: {
    backgroundColor: '#ffffff',
  },

  appleBtn: {
    backgroundColor: '#000000',
  },

  socialBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
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
});

/* ====================== Cuando exista backend reemplazar ===================== */

// import { getUsuario } from "@/src/api/api";
// const [usuario, setUsuario] = useState(USUARIO_DATA);

/*
import { useEffect } from "react";

useEffect(() => {

  const cargarUsuario = async () => {
    try {
      const data = await getUsuario();
      setUsuario(data);
    } catch (error) {
      console.log("Usando datos locales");
    }
  };

  cargarUsuario();

}, []);
*/

/* ============================================================================ */
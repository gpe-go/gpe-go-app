import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, StatusBar } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

export default function PerfilScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts);

  const router = useRouter();

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        <Pressable style={s.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={colors.subtext} />
        </Pressable>

        <View style={s.header}>
          <View style={s.avatarCircle}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={s.welcomeText}>{t('welcome')}</Text>
          <Text style={s.instructionText}>{t('Per')}</Text>
        </View>

        <View style={s.card}>
          <View style={s.form}>
            <View style={s.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.subtext} />
              <TextInput
                style={s.input}
                placeholder={t('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.subtext}
              />
            </View>

            <View style={s.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.subtext} />
              <TextInput
                style={s.input}
                placeholder="Contraseña"
                secureTextEntry
                placeholderTextColor={colors.subtext}
              />
            </View>

            <Pressable style={s.loginButton}>
              <Text style={s.loginButtonText}>{t('confirm')}</Text>
            </Pressable>

            <Pressable>
              <Text style={s.forgotText}>{t('back')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={s.divider}>
          <View style={s.line} />
          <Text style={s.dividerText}>{t('all')}</Text>
          <View style={s.line} />
        </View>

        <View style={s.socialButtons}>
          <Pressable style={[s.socialBtn, s.googleBtn]}>
            <FontAwesome5 name="google" size={18} color="#ea4335" />
            <Text style={s.socialBtnText}>Google</Text>
          </Pressable>

          <Pressable style={[s.socialBtn, s.appleBtn]}>
            <Ionicons name="logo-apple" size={22} color="white" />
            <Text style={[s.socialBtnText, { color: 'white' }]}>Apple</Text>
          </Pressable>
        </View>

        <Pressable style={s.registerContainer}>
          <Text style={s.registerText}>
            ¿No tienes cuenta?{' '}
            <Text style={s.orangeLink}>{t('see_more')}</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: c.background },
  scrollContent: { padding: 24, paddingBottom: 40 },
  closeButton:   { alignSelf: 'flex-end' },

  header: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#E96928', justifyContent: 'center', alignItems: 'center',
    marginBottom: 15, elevation: 6,
  },
  welcomeText:     { fontSize: f['2xl'], fontWeight: '900', color: c.text },
  instructionText: { fontSize: f.base, color: c.subtext, marginTop: 8, textAlign: 'center', lineHeight: f.base * 1.5, paddingHorizontal: 10 },

  card: { backgroundColor: c.card, borderRadius: 25, padding: 25, elevation: 8, borderWidth: 1, borderColor: c.border },
  form: { gap: 18 },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.inputBackground, borderRadius: 18,
    paddingHorizontal: 18, height: 58,
    borderWidth: 1, borderColor: c.border,
  },
  input: { flex: 1, marginLeft: 10, fontSize: f.base, color: c.text },

  loginButton:     { backgroundColor: '#E96928', height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 4 },
  loginButtonText: { color: 'white', fontSize: f.md, fontWeight: '800' },
  forgotText:      { textAlign: 'center', marginTop: 8, color: c.subtext, fontSize: f.sm },

  divider:    { flexDirection: 'row', alignItems: 'center', marginVertical: 35 },
  line:        { flex: 1, height: 1, backgroundColor: c.border },
  dividerText: { marginHorizontal: 15, color: c.subtext, fontSize: f.sm },

  socialButtons: { gap: 15 },
  socialBtn:     { flexDirection: 'row', height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: c.border },
  googleBtn:     { backgroundColor: c.card },
  appleBtn:      { backgroundColor: '#000000' },
  socialBtnText: { fontSize: f.base, fontWeight: '700', color: c.text },

  registerContainer: { marginTop: 40, alignItems: 'center' },
  registerText:      { color: c.subtext, fontSize: f.base },
  orangeLink:        { color: '#E96928', fontWeight: '800' },
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
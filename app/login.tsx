import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StatusBar, StyleSheet,
  Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { colors, fonts, isDark } = useTheme();
  const { t } = useTranslation();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorEmail,   setErrorEmail]   = useState(false);
  const [errorPass,    setErrorPass]    = useState(false);

  const esEmailValido = (mail: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

  const handleLogin = () => {
    const emailErr = !esEmailValido(email);
    const passErr  = password.length < 6;
    setErrorEmail(emailErr);
    setErrorPass(passErr);
    if (emailErr || passErr) return;
    console.log("Login:", email, password);
  };

  const puedeLogin = esEmailValido(email) && password.length >= 6;

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ══ BANNER ══════════════════════════════════ */}
          <LinearGradient
            colors={["#E96928", "#c4511a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.banner}
          >
            <View style={s.circle1} />
            <View style={s.circle2} />

            <Pressable style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </Pressable>

            <View style={s.bannerContent}>
              <View style={s.bannerIconWrap}>
                <Ionicons name="location" size={24} color="#E96928" />
              </View>
              <View>
                <Text style={[s.bannerTitle, { fontSize: fonts.xl }]}>
                  {t('app_name')}
                </Text>
                <Text style={[s.bannerSub, { fontSize: fonts.xs }]}>
                  {t('profile_login')}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* ══ FORMULARIO ══════════════════════════════ */}
          <View style={s.formCard}>

            <Text style={[s.formTitle, { fontSize: fonts['2xl'] }]}>
              {t('welcome')} 👋
            </Text>
            <Text style={[s.formSub, { fontSize: fonts.sm }]}>
              {t('login_sub')}
            </Text>

            {/* Email */}
            <View style={s.fieldGroup}>
              <Text style={[s.label, { fontSize: fonts.xs }]}>
                {t('email')}
              </Text>
              <View style={[s.inputWrap, errorEmail && s.inputError]}>
                <View style={[s.inputIcon, errorEmail && { backgroundColor: "rgba(239,68,68,0.1)" }]}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={errorEmail ? colors.danger : "#E96928"}
                  />
                </View>
                <TextInput
                  style={[s.input, { fontSize: fonts.base }]}
                  placeholder="email@ejemplo.com"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrorEmail(false); }}
                />
                {email.length > 0 && esEmailValido(email) && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                )}
              </View>
              {errorEmail && (
                <View style={s.errorRow}>
                  <Ionicons name="alert-circle-outline" size={13} color={colors.danger} />
                  <Text style={[s.errorText, { fontSize: fonts.xs }]}>
                    {t('login_email_error')}
                  </Text>
                </View>
              )}
            </View>

            {/* Contraseña */}
            <View style={s.fieldGroup}>
              <Text style={[s.label, { fontSize: fonts.xs }]}>
                {t('profile_password')}
              </Text>
              <View style={[s.inputWrap, errorPass && s.inputError]}>
                <View style={[s.inputIcon, errorPass && { backgroundColor: "rgba(239,68,68,0.1)" }]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={errorPass ? colors.danger : "#E96928"}
                  />
                </View>
                <TextInput
                  style={[s.input, { fontSize: fonts.base }]}
                  placeholder={t('login_pass_placeholder')}
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrorPass(false); }}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={colors.subtext}
                  />
                </Pressable>
              </View>
              {errorPass && (
                <View style={s.errorRow}>
                  <Ionicons name="alert-circle-outline" size={13} color={colors.danger} />
                  <Text style={[s.errorText, { fontSize: fonts.xs }]}>
                    {t('login_pass_error')}
                  </Text>
                </View>
              )}
            </View>

            {/* Olvidé mi contraseña */}
            <Pressable style={s.forgotBtn}>
              <Text style={[s.forgotText, { fontSize: fonts.xs }]}>
                {t('profile_forgot')}
              </Text>
            </Pressable>

            {/* Botón login */}
            <Pressable
              style={({ pressed }) => [
                s.loginBtn,
                !puedeLogin && s.loginBtnDisabled,
                { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
              onPress={handleLogin}
            >
              <LinearGradient
                colors={puedeLogin ? ["#E96928", "#c4511a"] : [colors.border, colors.border]}
                style={s.loginBtnGradient}
              >
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color={puedeLogin ? "#fff" : colors.subtext}
                />
                <Text style={[
                  s.loginBtnText,
                  { fontSize: fonts.base },
                  !puedeLogin && { color: colors.subtext },
                ]}>
                  {t('profile_login')}
                </Text>
              </LinearGradient>
            </Pressable>

          </View>

          {/* ══ DIVISOR ═════════════════════════════════ */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <View style={s.dividerBadge}>
              <Text style={[s.dividerText, { fontSize: fonts.xs }]}>
                {t('login_or_continue')}
              </Text>
            </View>
            <View style={s.dividerLine} />
          </View>

          {/* ══ REDES SOCIALES ══════════════════════════ */}
          <View style={s.socialButtons}>
            <Pressable
              style={({ pressed }) => [s.socialBtn, s.googleBtn, { opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={s.socialIconWrap}>
                <FontAwesome5 name="google" size={16} color="#ea4335" />
              </View>
              <Text style={[s.socialBtnText, { fontSize: fonts.sm, color: colors.text }]}>
                {t('profile_google')}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.socialBtn, s.appleBtn, { opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={[s.socialIconWrap, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                <Ionicons name="logo-apple" size={18} color="#fff" />
              </View>
              <Text style={[s.socialBtnText, { fontSize: fonts.sm, color: "#fff" }]}>
                {t('profile_apple')}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
            </Pressable>
          </View>

          {/* ══ REGISTRO ════════════════════════════════ */}
          <Pressable
            style={s.registerRow}
            onPress={() => router.push("/perfil")}
          >
            <Text style={[s.registerText, { fontSize: fonts.sm }]}>
              {t('profile_no_account')}{" "}
              <Text style={s.registerLink}>{t('profile_register')}</Text>
            </Text>
          </Pressable>

          {/* ══ FOOTER ══════════════════════════════════ */}
          <View style={s.footer}>
            <View style={s.footerLogoRow}>
              <View style={s.footerLogoIcon}>
                <Ionicons name="location" size={10} color="#fff" />
              </View>
              <Text style={[s.footerLogo, { fontSize: fonts.sm }]}>
                Guadalupe<Text style={{ color: "#E96928" }}>GO</Text>
              </Text>
            </View>
            <Text style={[s.footerSub, { fontSize: fonts.xs }]}>
              {t('app_version')}
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: c.background },
  scrollContent: { paddingBottom: 40 },
  banner: {
    paddingHorizontal: 22, paddingTop: 16,
    paddingBottom: 28, overflow: "hidden",
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    marginBottom: 4,
  },
  circle1: {
    position: "absolute", width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.07)", top: -50, right: -50,
  },
  circle2: {
    position: "absolute", width: 110, height: 110, borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.05)", bottom: -20, left: -30,
  },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8, borderRadius: 12, marginBottom: 18,
  },
  bannerContent:  { flexDirection: "row", alignItems: "center", gap: 14 },
  bannerIconWrap: {
    width: 50, height: 50, borderRadius: 15, backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
  },
  bannerTitle: { color: "#fff", fontWeight: "900", letterSpacing: -0.5 },
  bannerSub:   { color: "rgba(255,255,255,0.8)", marginTop: 2, fontWeight: "500" },
  formCard: {
    marginHorizontal: 20, marginTop: 24,
    backgroundColor: c.card,
    borderRadius: 26, padding: 22,
    borderWidth: 1, borderColor: c.border,
    elevation: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 10,
  },
  formTitle: { fontWeight: "900", color: c.text, letterSpacing: -0.5, marginBottom: 4 },
  formSub:   { color: c.subtext, marginBottom: 24, fontWeight: "500" },
  fieldGroup: { marginBottom: 16 },
  label:      { color: c.subtext, fontWeight: "600", marginBottom: 8 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: c.inputBackground,
    borderRadius: 16, height: 56,
    borderWidth: 1.5, borderColor: c.border,
    paddingHorizontal: 12, gap: 10,
  },
  inputError: { borderColor: c.danger },
  inputIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: isDark ? "rgba(233,105,40,0.15)" : "rgba(233,105,40,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  input:  { flex: 1, color: c.text },
  eyeBtn: { padding: 4 },
  errorRow:  { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  errorText: { color: c.danger, fontWeight: "500" },
  forgotBtn:  { alignSelf: "flex-end", marginBottom: 20, marginTop: 4 },
  forgotText: { color: "#E96928", fontWeight: "700" },
  loginBtn: {
    borderRadius: 16, overflow: "hidden",
    elevation: 5,
    shadowColor: "#E96928", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  loginBtnDisabled: { elevation: 0, shadowOpacity: 0 },
  loginBtnGradient: {
    height: 56, flexDirection: "row",
    justifyContent: "center", alignItems: "center", gap: 8,
  },
  loginBtnText: { color: "#fff", fontWeight: "800" },
  divider: {
    flexDirection: "row", alignItems: "center",
    marginVertical: 22, paddingHorizontal: 20,
  },
  dividerLine:  { flex: 1, height: 1, backgroundColor: c.border },
  dividerBadge: {
    marginHorizontal: 12,
    backgroundColor: c.card,
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: c.border,
  },
  dividerText: { color: c.subtext, fontWeight: "600" },
  socialButtons: { paddingHorizontal: 20, gap: 12 },
  socialBtn: {
    height: 54, borderRadius: 16,
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, gap: 12,
    borderWidth: 1,
  },
  googleBtn:      { backgroundColor: c.card, borderColor: c.border },
  appleBtn:       { backgroundColor: "#000", borderColor: "#000" },
  socialIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "rgba(234,67,53,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  socialBtnText: { flex: 1, fontWeight: "700" },
  registerRow:  { marginTop: 24, alignItems: "center" },
  registerText: { color: c.subtext },
  registerLink: { color: "#E96928", fontWeight: "800" },
  footer:        { alignItems: "center", marginTop: 32, gap: 4 },
  footerLogoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerLogoIcon: {
    width: 18, height: 18, borderRadius: 5,
    backgroundColor: "#E96928",
    justifyContent: "center", alignItems: "center",
  },
  footerLogo: { fontWeight: "800", color: c.text },
  footerSub:  { color: c.subtext },
});
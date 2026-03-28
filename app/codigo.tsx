import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Pressable, StatusBar, StyleSheet,
  Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";

const CODE_LENGTH = 6;

export default function Codigo() {
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  const [code, setCode]       = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError]     = useState(false);
  const inputs                = useRef<(TextInput | null)[]>([]);

  // ── Manejar input por celda ────────────────────────────
  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return; // solo números
    setError(false);

    const next = [...code];
    next[index] = text.slice(-1);    // un solo dígito
    setCode(next);

    // Avanzar al siguiente input
    if (text && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const codigoCompleto = code.every((d) => d !== "");

  const verificar = () => {
    const valor = code.join("");
    if (valor.length < CODE_LENGTH) {
      setError(true);
      return;
    }
    // TODO: validar con backend
    console.log("Código ingresado:", valor);
    // router.replace("/(tabs)");
  };

  const limpiar = () => {
    setCode(Array(CODE_LENGTH).fill(""));
    setError(false);
    inputs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* ══ BANNER ════════════════════════════════════════ */}
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
            <Ionicons name="keypad-outline" size={24} color="#E96928" />
          </View>
          <View>
            <Text style={[s.bannerTitle, { fontSize: fonts.xl }]}>
              Verificación
            </Text>
            <Text style={[s.bannerSub, { fontSize: fonts.xs }]}>
              Ingresa el código de 6 dígitos
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ══ CONTENIDO ═════════════════════════════════════ */}
      <View style={s.content}>

        <Text style={[s.hint, { fontSize: fonts.sm }]}>
          Te enviamos un código de verificación a tu correo o número de teléfono registrado.
        </Text>

        {/* ── Celdas del código ── */}
        <View style={s.codeRow}>
          {Array(CODE_LENGTH).fill(0).map((_, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputs.current[i] = ref; }}
              style={[
                s.codeCell,
                code[i] && s.codeCellFilled,
                error     && s.codeCellError,
              ]}
              value={code[i]}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor="#E96928"
              returnKeyType="next"
            />
          ))}
        </View>

        {/* Error */}
        {error && (
          <View style={s.errorRow}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
            <Text style={[s.errorText, { fontSize: fonts.xs }]}>
              Por favor completa los 6 dígitos
            </Text>
          </View>
        )}

        {/* ── Botón verificar ── */}
        <Pressable
          style={({ pressed }) => [
            s.verifyBtn,
            !codigoCompleto && s.verifyBtnDisabled,
            { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          onPress={verificar}
          disabled={!codigoCompleto}
        >
          <LinearGradient
            colors={codigoCompleto ? ["#E96928", "#c4511a"] : [colors.border, colors.border]}
            style={s.verifyBtnGradient}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={codigoCompleto ? "#fff" : colors.subtext}
            />
            <Text style={[
              s.verifyBtnText,
              { fontSize: fonts.base },
              !codigoCompleto && { color: colors.subtext },
            ]}>
              Verificar código
            </Text>
          </LinearGradient>
        </Pressable>

        {/* ── Limpiar ── */}
        {code.some((d) => d !== "") && (
          <Pressable style={s.clearBtn} onPress={limpiar}>
            <Ionicons name="refresh-outline" size={15} color={colors.subtext} />
            <Text style={[s.clearBtnText, { fontSize: fonts.xs }]}>
              Limpiar
            </Text>
          </Pressable>
        )}

        {/* ── Reenviar código ── */}
        <View style={s.resendRow}>
          <Text style={[s.resendText, { fontSize: fonts.sm }]}>
            ¿No recibiste el código?
          </Text>
          <Pressable>
            <Text style={[s.resendLink, { fontSize: fonts.sm }]}>
              Reenviar
            </Text>
          </Pressable>
        </View>

        {/* ── Info ── */}
        <View style={s.infoCard}>
          <Ionicons name="information-circle-outline" size={16} color="#4A90E2" />
          <Text style={[s.infoText, { fontSize: fonts.xs }]}>
            El código expira en 10 minutos. Revisa tu carpeta de spam si no lo encuentras.
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: c.background },

  // ── Banner ─────────────────────────────────────────────
  banner: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
    overflow: "hidden",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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

  // ── Contenido ──────────────────────────────────────────
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 28 },

  hint: {
    color: c.subtext, textAlign: "center",
    lineHeight: f.sm * 1.6, marginBottom: 32,
  },

  // ── Celdas del código ──────────────────────────────────
  codeRow: {
    flexDirection: "row", justifyContent: "center",
    gap: 10, marginBottom: 8,
  },
  codeCell: {
    width: 46, height: 56,
    borderRadius: 14,
    backgroundColor: c.inputBackground,
    borderWidth: 2, borderColor: c.border,
    fontSize: 22, fontWeight: "800", color: c.text,
    textAlign: "center",
  },
  codeCellFilled: {
    borderColor: "#E96928",
    backgroundColor: isDark ? "rgba(233,105,40,0.12)" : "rgba(233,105,40,0.06)",
  },
  codeCellError: {
    borderColor: c.danger,
    backgroundColor: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.06)",
  },

  // Error
  errorRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 5,
    marginBottom: 16,
  },
  errorText: { color: c.danger, fontWeight: "600" },

  // ── Botón verificar ────────────────────────────────────
  verifyBtn: {
    borderRadius: 16, overflow: "hidden", marginTop: 20,
    elevation: 5,
    shadowColor: "#E96928", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8,
  },
  verifyBtnDisabled: { elevation: 0, shadowOpacity: 0 },
  verifyBtnGradient: {
    height: 56, flexDirection: "row",
    justifyContent: "center", alignItems: "center", gap: 8,
  },
  verifyBtnText: { color: "#fff", fontWeight: "800" },

  // ── Limpiar ────────────────────────────────────────────
  clearBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 5,
    marginTop: 14,
  },
  clearBtnText: { color: c.subtext, fontWeight: "600" },

  // ── Reenviar ───────────────────────────────────────────
  resendRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    marginTop: 28,
  },
  resendText: { color: c.subtext },
  resendLink: { color: "#E96928", fontWeight: "800" },

  // ── Info card ──────────────────────────────────────────
  infoCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: isDark ? "rgba(74,144,226,0.12)" : "rgba(74,144,226,0.08)",
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: isDark ? "rgba(74,144,226,0.25)" : "rgba(74,144,226,0.2)",
    marginTop: 28,
  },
  infoText: { flex: 1, color: c.subtext, lineHeight: f.xs * 1.6 },
});
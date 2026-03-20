import React from 'react';
import {
  View, Text, StyleSheet,
  Platform, Dimensions, TouchableOpacity,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import CustomDrawer from '../../components/CustomDrawer';
import { useTheme } from '../../src/context/ThemeContext';

const { width } = Dimensions.get('window');

// ─── Punto de notificación ─────────────────────────────
function NotifDot() {
  return (
    <View style={{
      position: 'absolute', top: 4, right: 4,
      width: 8, height: 8, borderRadius: 4,
      backgroundColor: '#E96928',
      borderWidth: 1.5, borderColor: '#fff',
    }} />
  );
}

// ─── Botón del header ──────────────────────────────────
function HeaderBtn({
  icon, onPress, badge = false, color, bg,
}: {
  icon: any; onPress: () => void; badge?: boolean;
  color: string; bg: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        width: 36, height: 36,
        backgroundColor: bg,
        justifyContent: 'center', alignItems: 'center',
      }}
    >
      <Ionicons name={icon} size={20} color={color} />
      {badge && <NotifDot />}
    </TouchableOpacity>
  );
}

export default function Layout() {
  const router = useRouter();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        // El CustomDrawer ahora maneja su propio estado activo
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: true,
          drawerType: 'slide',
          drawerStyle: {
            width: width * 0.72,
            backgroundColor: '#E96928', // naranja sólido — CustomDrawer lo cubre
          },
          overlayColor: colors.overlay,

          // Ocultamos el drawer nativo — CustomDrawer maneja todo
          drawerItemStyle: { display: 'none' },
          drawerLabelStyle: { display: 'none' },

          // ── HEADER ──────────────────────────────────────
          header: ({ navigation }) => (
            <View style={s.headerWrapper}>
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
              <View style={s.accentLine} />

              {/* Logo — absolute sobre todo el headerWrapper → centrado perfecto */}
              <View style={s.logoAbsolute} pointerEvents="none">
                <View style={s.logoWrapper}>
                  <View style={s.logoIconBg}>
                    <Ionicons name="location" size={11} color="#fff" />
                  </View>
                  <Text style={s.logoText}>
                    Guadalupe<Text style={s.logoAccent}>GO</Text>
                  </Text>
                </View>
              </View>

              <View style={s.headerInner}>
                {/* Menú */}
                <TouchableOpacity
                  onPress={() => navigation.openDrawer()}
                  activeOpacity={0.7}
                  style={s.menuBtn}
                >
                  <Ionicons name="menu-outline" size={26} color="#E96928" />
                </TouchableOpacity>

                {/* Spacer para empujar acciones a la derecha */}
                <View style={{ flex: 1 }} />

                {/* Acciones */}
                <View style={s.actionsRow}>
                  <HeaderBtn
                    icon="settings-outline"
                    color="#E96928"
                    bg="transparent"
                    onPress={() => router.push('/configuracion')}
                  />
                  <HeaderBtn
                    icon="person-outline"
                    color="#E96928"
                    bg="transparent"
                    onPress={() => router.push('/perfil')}
                    badge
                  />
                </View>
              </View>
            </View>
          ),
        }}
      >
        {/* Registramos las screens para el router — sin opciones visuales */}
        <Drawer.Screen name="index" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="noticias" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="eventos" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="directorio" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="explorar" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="favoritos" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="contacto" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="perfil" options={{ drawerItemStyle: { display: 'none' }, headerShown: false }} />
        <Drawer.Screen name="configuracion" options={{ drawerItemStyle: { display: 'none' }, headerShown: false }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const HEADER_H = Platform.OS === 'ios' ? 96 : 82;
const TOP_PAD = Platform.OS === 'ios' ? 48 : 32;

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  headerWrapper: {
    height: HEADER_H,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.08,
    shadowRadius: 8,
    elevation: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  accentLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2.5, backgroundColor: '#E96928', opacity: 0.85,
  },
  headerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: TOP_PAD,
    paddingBottom: 8,
  },
  menuBtn: {
    width: 38, height: 38,
    justifyContent: 'center', alignItems: 'center',
  },
  // Logo centrado con absolute — no afecta el layout de los extremos
  logoAbsolute: {
    position: 'absolute',
    left: 0, right: 0,
    top: TOP_PAD, height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  logoWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
  },
  logoIconBg: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: '#E96928',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#E96928',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.55, shadowRadius: 4, elevation: 4,
  },
  logoText: {
    fontSize: f.xl, fontWeight: '900',
    color: c.text, letterSpacing: -0.5,
  },
  logoAccent: { color: '#E96928' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
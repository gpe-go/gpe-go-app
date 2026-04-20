import React from 'react';
import {
  View, Text, StyleSheet,
  Dimensions, TouchableOpacity, Image,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomDrawer from '../../components/CustomDrawer';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useNotificaciones } from '../../src/context/NotificacionesContext';

const { width } = Dimensions.get('window');

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

function ProfileBtn({
  onPress, fotoPerfil, isAuthenticated, color, bg,
}: {
  onPress: () => void;
  fotoPerfil: string | null;
  isAuthenticated: boolean;
  color: string;
  bg: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}
    >
      {isAuthenticated && fotoPerfil ? (
        <Image
          source={{ uri: fotoPerfil }}
          style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#E96928' }}
        />
      ) : (
        <Ionicons name="person-outline" size={20} color={color} />
      )}
      {!isAuthenticated && <NotifDot />}
    </TouchableOpacity>
  );
}

function HeaderBtn({
  icon, onPress, color,
}: {
  icon: any; onPress: () => void; color: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}
    >
      <Ionicons name={icon} size={20} color={color} />
    </TouchableOpacity>
  );
}

function BellBtn({ onPress, color, unread }: { onPress: () => void; color: string; unread: number }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}
    >
      <Ionicons name={unread > 0 ? 'notifications' : 'notifications-outline'} size={20} color={color} />
      {unread > 0 && (
        <View style={{
          position: 'absolute', top: 4, right: 4,
          minWidth: 14, height: 14, borderRadius: 7,
          backgroundColor: '#E96928',
          borderWidth: 1.5, borderColor: '#fff',
          justifyContent: 'center', alignItems: 'center',
          paddingHorizontal: 2,
        }}>
          <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800', lineHeight: 10 }}>
            {unread > 9 ? '9+' : unread}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const HEADER_CONTENT_H = 52;

export default function Layout() {
  const router = useRouter();
  const { colors, fonts, isDark } = useTheme();
  const { fotoPerfil, isAuthenticated } = useAuth();
  const { unread } = useNotificaciones();
  const insets = useSafeAreaInsets();
  const STATUS_BAR_H = insets.top;
  const HEADER_H     = STATUS_BAR_H + HEADER_CONTENT_H;

  const s = makeStyles(colors, fonts, isDark, STATUS_BAR_H, HEADER_H);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: true,
          drawerType: 'slide',
          drawerStyle: {
            width: width * 0.72,
            backgroundColor: '#E96928',
          },
          overlayColor: colors.overlay,
          drawerItemStyle: { display: 'none' },
          drawerLabelStyle: { display: 'none' },

          header: ({ navigation }) => (
            <View style={s.headerWrapper}>
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
              <View style={s.accentLine} />

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
                <TouchableOpacity
                  onPress={() => navigation.openDrawer()}
                  activeOpacity={0.7}
                  style={s.menuBtn}
                >
                  <Ionicons name="menu-outline" size={26} color="#E96928" />
                </TouchableOpacity>

                <BellBtn
                  color="#E96928"
                  unread={isAuthenticated ? unread : 0}
                  onPress={() => router.push('/(stack)/notificaciones' as any)}
                />

                <View style={{ flex: 1 }} />

                <View style={s.actionsRow}>
                  <HeaderBtn
                    icon="settings-outline"
                    color="#E96928"
                    onPress={() => router.push('/(stack)/configuracion')}
                  />
                  <ProfileBtn
                    fotoPerfil={fotoPerfil}
                    isAuthenticated={isAuthenticated}
                    color="#E96928"
                    bg="transparent"
                    onPress={() => router.push('/(stack)/perfil')}
                  />
                </View>
              </View>
            </View>
          ),
        }}
      >
        <Drawer.Screen name="index"         options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="noticias"      options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="eventos"       options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="directorio"    options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="explorar"      options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="favoritos"     options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="contacto"      options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="detalleNoticia" options={{ drawerItemStyle: { display: 'none' }, headerShown: false }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean, STATUS_BAR_H: number, HEADER_H: number) =>
  StyleSheet.create({
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
      position: 'absolute',
      left: 0, right: 0,
      top: STATUS_BAR_H,
      height: HEADER_CONTENT_H,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    menuBtn: {
      width: 38, height: 38,
      justifyContent: 'center', alignItems: 'center',
    },
    logoAbsolute: {
      position: 'absolute',
      left: 0, right: 0,
      top: STATUS_BAR_H,
      height: HEADER_CONTENT_H,
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

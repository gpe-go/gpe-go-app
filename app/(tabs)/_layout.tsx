import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import CustomDrawer from '../../components/CustomDrawer';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useNotificaciones } from '../../src/context/NotificacionesContext';
import i18n, {
  AppLanguage,
  cambiarIdioma,
  LANGUAGE_LIST,
} from '../../src/i18n/i18n';

const { width } = Dimensions.get('window');

// ─── NotifDot ────────────────────────────────────────────────────────────────
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

// ─── ProfileBtn ──────────────────────────────────────────────────────────────
function ProfileBtn({
  onPress, fotoPerfil, isAuthenticated, color,
}: {
  onPress: () => void;
  fotoPerfil: string | null;
  isAuthenticated: boolean;
  color: string;
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

// ─── HeaderBtn ───────────────────────────────────────────────────────────────
function HeaderBtn({ icon, onPress, color }: { icon: any; onPress: () => void; color: string }) {
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

// ─── BellBtn ─────────────────────────────────────────────────────────────────
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

// ─── LangBtn — bandera del idioma activo ─────────────────────────────────────
function LangBtn({ onPress, flag }: { onPress: () => void; flag: string }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        width: 36, height: 36,
        justifyContent: 'center', alignItems: 'center',
      }}
    >
      {/* Flag emoji */}
      <Text style={{ fontSize: 22, lineHeight: 26 }}>{flag}</Text>
    </TouchableOpacity>
  );
}

// ─── LanguageSheet — bottom sheet modal ──────────────────────────────────────
function LanguageSheet({
  visible,
  onClose,
  currentLang,
  onSelect,
  colors,
  fonts,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  currentLang: AppLanguage;
  onSelect: (code: AppLanguage) => void;
  colors: any;
  fonts: any;
  isDark: boolean;
}) {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 68,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
        }}
        onPress={onClose}
      />
      <Animated.View
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          backgroundColor: colors.card,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingBottom: Platform.OS === 'ios' ? 34 : 20,
          maxHeight: '75%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.5 : 0.14,
          shadowRadius: 18,
          elevation: 24,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Handle */}
        <View style={{
          width: 40, height: 4, borderRadius: 2,
          backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)',
          alignSelf: 'center',
          marginTop: 12, marginBottom: 4,
        }} />

        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 22,
          paddingVertical: 14,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        }}>
          <View style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: 'rgba(233,105,40,0.12)',
            justifyContent: 'center', alignItems: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="globe-outline" size={20} color="#E96928" />
          </View>
          <Text style={{
            flex: 1,
            fontSize: fonts.lg,
            fontWeight: '800',
            color: colors.text,
            letterSpacing: -0.3,
          }}>
            {t('select_language')}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={14} activeOpacity={0.7}>
            <View style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Ionicons name="close" size={18} color={colors.subtext} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Language list */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {LANGUAGE_LIST.map((item) => {
            const selected = currentLang === item.code;
            return (
              <Pressable
                key={item.code}
                onPress={() => onSelect(item.code)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 22,
                  paddingVertical: 13,
                  backgroundColor: selected
                    ? (isDark ? 'rgba(233,105,40,0.15)' : 'rgba(233,105,40,0.08)')
                    : 'transparent',
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                })}
              >
                {/* Flag */}
                <Text style={{ fontSize: 26, marginRight: 14, lineHeight: 32 }}>
                  {item.flag}
                </Text>

                {/* Label */}
                <Text style={{
                  flex: 1,
                  fontSize: fonts.base,
                  color: selected ? '#E96928' : colors.text,
                  fontWeight: selected ? '700' : '500',
                }}>
                  {item.label}
                </Text>

                {/* Check */}
                {selected && (
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: '#E96928',
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── HEADER HEIGHT ────────────────────────────────────────────────────────────
const HEADER_CONTENT_H = 52;

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function Layout() {
  const router = useRouter();
  const { colors, fonts, isDark } = useTheme();
  const { fotoPerfil, isAuthenticated } = useAuth();
  const { unread } = useNotificaciones();
  const insets = useSafeAreaInsets();

  const STATUS_BAR_H = insets.top;
  const HEADER_H     = STATUS_BAR_H + HEADER_CONTENT_H;
  const s = makeStyles(colors, fonts, isDark, STATUS_BAR_H, HEADER_H);

  // ── Language state ──────────────────────────────────────────────────────────
  const [langModal, setLangModal] = useState(false);
  const [currentLang, setCurrentLang] = useState<AppLanguage>(
    (i18n.language ?? 'es') as AppLanguage
  );

  // Keep in sync when language changes (e.g. from configuracion screen)
  useEffect(() => {
    const onLangChange = (lng: string) => setCurrentLang(lng as AppLanguage);
    i18n.on('languageChanged', onLangChange);
    return () => i18n.off('languageChanged', onLangChange);
  }, []);

  const currentFlag =
    LANGUAGE_LIST.find((l) => l.code === currentLang)?.flag ?? '🌐';

  const handleSelectLang = async (code: AppLanguage) => {
    await cambiarIdioma(code);
    setCurrentLang(code);
    setLangModal(false);
  };

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

              {/* Logo centered */}
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
                {/* Left: menu + bell */}
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

                {/* Right: lang + settings + profile */}
                <View style={s.actionsRow}>
                  <LangBtn flag={currentFlag} onPress={() => setLangModal(true)} />
                  <HeaderBtn
                    icon="settings-outline"
                    color="#E96928"
                    onPress={() => router.push('/(stack)/configuracion')}
                  />
                  <ProfileBtn
                    fotoPerfil={fotoPerfil}
                    isAuthenticated={isAuthenticated}
                    color="#E96928"
                    onPress={() => router.push('/(stack)/perfil')}
                  />
                </View>
              </View>
            </View>
          ),
        }}
      >
        <Drawer.Screen name="index"          options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="noticias"       options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="eventos"        options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="directorio"     options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="explorar"       options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="favoritos"      options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="contacto"       options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="detalleNoticia" options={{ drawerItemStyle: { display: 'none' }, headerShown: false }} />
      </Drawer>

      {/* Language picker bottom sheet — rendered outside Drawer so it overlays correctly */}
      <LanguageSheet
        visible={langModal}
        onClose={() => setLangModal(false)}
        currentLang={currentLang}
        onSelect={handleSelectLang}
        colors={colors}
        fonts={fonts}
        isDark={isDark}
      />
    </GestureHandlerRootView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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

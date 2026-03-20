import React from 'react';
import {
  View, Text, StyleSheet, ImageBackground,
  Image, TouchableOpacity,
} from 'react-native';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

// ── Menú de items del drawer ───────────────────────────
const MENU_ITEMS = [
  { name: 'index',      icon: 'home-outline',      labelKey: 'tab_home'      },
  { name: 'noticias',   icon: 'newspaper-outline',  labelKey: 'tab_news'      },
  { name: 'eventos',    icon: 'calendar-outline',   labelKey: 'tab_events'    },
  { name: 'directorio', icon: 'business-outline',   labelKey: 'tab_directory' },
  { name: 'explorar',   icon: 'compass-outline',    labelKey: 'tab_explore'   },
  { name: 'favoritos',  icon: 'heart-outline',      labelKey: 'tab_favorites' },
  { name: 'contacto',   icon: 'mail-outline',       labelKey: 'tab_contact'   },
] as const;

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const { fonts } = useTheme();
  const router = useRouter();

  // Obtener la ruta activa
  const activeRoute = props.state.routes[props.state.index]?.name ?? 'index';

  const navigate = (name: string) => {
    props.navigation.closeDrawer();
    router.push(`/${name === 'index' ? '' : name}` as any);
  };

  return (
    <View style={styles.root}>
      {/* ── CABECERA con imagen de fondo ────────────────── */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1000&auto=format&fit=crop' }}
        style={styles.headerBg}
      >
        <View style={styles.headerOverlay}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
            style={styles.avatar}
          />
          <Text style={[styles.userName, { fontSize: fonts.md }]}>
            Usuario Guadalupe
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={13} color="#fff" />
            <Text style={[styles.locationText, { fontSize: fonts.xs }]}>
              Nuevo León, MX
            </Text>
          </View>
        </View>
      </ImageBackground>

      {/* ── LISTA DE ITEMS ───────────────────────────────── */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {MENU_ITEMS.map((item) => {
          const isActive = activeRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => navigate(item.name)}
              activeOpacity={0.8}
              style={[
                styles.item,
                isActive && styles.itemActive,
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={22}
                color={isActive ? '#E96928' : '#fff'}
                style={styles.itemIcon}
              />
              <Text style={[
                styles.itemLabel,
                { fontSize: fonts.base },
                isActive && styles.itemLabelActive,
              ]}>
                {t(item.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>

      {/* ── FOOTER FIJO ─────────────────────────────────── */}
      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={[styles.footerText, { fontSize: fonts.xs }]}>
          Versión 1.0.2 · 2026
        </Text>
      </View>
    </View>
  );
}

const ORANGE = '#E96928';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ORANGE,
  },

  // ── Header ──────────────────────────────────────────
  headerBg: {
    height: 210,
    justifyContent: 'flex-end',
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(233,105,40,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10,
  },
  userName: {
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    color: 'rgba(255,255,255,0.9)',
  },

  // ── Items ────────────────────────────────────────────
  scrollContent: {
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 4,
  },
  itemActive: {
    backgroundColor: '#fff',
  },
  itemIcon: {
    marginRight: 14,
  },
  itemLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  itemLabelActive: {
    color: ORANGE,
    fontWeight: '700',
  },

  // ── Footer ───────────────────────────────────────────
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 10,
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useNotificaciones } from '../src/context/NotificacionesContext';
import { useAuth } from '../src/context/AuthContext';

const MENU_ITEMS = [
  { name: 'index',      icon: 'home-outline',          labelKey: 'drawer_nav_home'      },
  { name: 'noticias',   icon: 'newspaper-outline',      labelKey: 'drawer_nav_news'      },
  { name: 'eventos',    icon: 'calendar-outline',       labelKey: 'drawer_nav_events'    },
  { name: 'directorio', icon: 'business-outline',       labelKey: 'drawer_nav_directory' },
  { name: 'explorar',   icon: 'compass-outline',        labelKey: 'drawer_nav_explore'   },
  { name: 'favoritos',  icon: 'heart-outline',          labelKey: 'drawer_nav_favorites' },
  { name: 'contacto',   icon: 'mail-outline',           labelKey: 'drawer_nav_contact'   },
] as const;

function getClimaInfo(code: number): { desc: string; icon: string } {
  if (code === 0)               return { desc: 'Despejado',       icon: 'sunny-outline'        };
  if (code <= 2)                return { desc: 'Parcial nublado', icon: 'partly-sunny-outline' };
  if (code === 3)               return { desc: 'Nublado',         icon: 'cloud-outline'        };
  if (code >= 45 && code <= 48) return { desc: 'Niebla',          icon: 'cloud-outline'        };
  if (code >= 51 && code <= 67) return { desc: 'Llovizna',        icon: 'rainy-outline'        };
  if (code >= 71 && code <= 77) return { desc: 'Nieve',           icon: 'snow-outline'         };
  if (code >= 80 && code <= 82) return { desc: 'Lluvia',          icon: 'rainy-outline'        };
  if (code >= 95 && code <= 99) return { desc: 'Tormenta',        icon: 'thunderstorm-outline' };
  return                               { desc: 'Variable',        icon: 'cloudy-outline'       };
}

function getSaludoIcon(): string {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'sunny-outline';
  if (h >= 12 && h < 19) return 'partly-sunny-outline';
  return 'moon-outline';
}

function getSaludoKey(): string {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'drawer_greeting_morning';
  if (h >= 12 && h < 19) return 'drawer_greeting_afternoon';
  return 'drawer_greeting_evening';
}

type Clima = {
  temp: number; sensacion: number;
  humedad: number; viento: number;
  desc: string; icon: string; ciudad: string;
};

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const { fonts, isDark } = useTheme();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { unread } = useNotificaciones();

  const [saludoIcon, setSaludoIcon] = useState(getSaludoIcon());
  const [saludoKey,  setSaludoKey]  = useState(getSaludoKey());
  const [clima,        setClima]        = useState<Clima | null>(null);
  const [loadingClima, setLoadingClima] = useState(true);

  const activeRoute = props.state.routes[props.state.index]?.name ?? 'index';

  useEffect(() => {
    const interval = setInterval(() => {
      setSaludoIcon(getSaludoIcon());
      setSaludoKey(getSaludoKey());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const fetchClima = useCallback(async () => {
    try {
      setLoadingClima(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      let lat: number;
      let lon: number;
      let ciudad = t('drawer_city');

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
        const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        if (geo.length > 0) {
          ciudad = geo[0].city ?? geo[0].subregion ?? geo[0].region ?? t('drawer_city');
        }
      } else {
        lat    = 25.6751;
        lon    = -100.2496;
        ciudad = 'Guadalupe';
      }

      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
        `&timezone=America%2FMonterrey`;

      const res  = await fetch(url);
      const data = await res.json();
      const c    = data.current;
      const info = getClimaInfo(c.weather_code);

      setClima({
        temp:      Math.round(c.temperature_2m),
        sensacion: Math.round(c.apparent_temperature),
        humedad:   c.relative_humidity_2m,
        viento:    Math.round(c.wind_speed_10m),
        desc:      info.desc,
        icon:      info.icon,
        ciudad,
      });
    } catch {
      setClima(null);
    } finally {
      setLoadingClima(false);
    }
  }, [t]);

  useEffect(() => {
    fetchClima();
    const interval = setInterval(fetchClima, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchClima]);

  const navigate = (name: string) => {
    props.navigation.closeDrawer();
    router.push(`/${name === 'index' ? '' : name}` as any);
  };

  const itemActiveBg         = isDark ? '#1e1e1e' : '#fff';
  const itemActiveLabelColor = '#E96928';
  const itemActiveIconColor  = '#E96928';
  const itemActiveIconBg     = isDark ? 'rgba(233,105,40,0.12)' : 'rgba(233,105,40,0.1)';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ══ HERO ════════════════════════════════════════ */}
      <LinearGradient
        colors={['#E96928', '#c4511a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.saludoRow}>
          <Ionicons name={saludoIcon as any} size={18} color="rgba(255,255,255,0.85)" />
          <Text style={[styles.saludoText, { fontSize: fonts.sm }]}>
            {t(saludoKey)}
          </Text>
        </View>

        <View style={styles.cityRow}>
          <View style={styles.cityIconBg}>
            <Ionicons name="location" size={20} color="#E96928" />
          </View>
          <View>
            <Text style={[styles.cityName, { fontSize: fonts.xl }]}>
              {clima?.ciudad ?? t('drawer_city')}
            </Text>
            <Text style={[styles.cityState, { fontSize: fonts.xs }]}>
              Nuevo León, México
            </Text>
          </View>
        </View>

        {loadingClima ? (
          <View style={styles.climaLoading}>
            <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
            <Text style={[styles.climaLoadingText, { fontSize: fonts.xs }]}>
              {t('loading')}
            </Text>
          </View>
        ) : clima ? (
          <View style={styles.climaCard}>
            <View style={styles.climaTop}>
              <View style={styles.climaIconWrap}>
                <Ionicons name={clima.icon as any} size={28} color="#fff" />
              </View>
              <View style={styles.climaTempBlock}>
                <Text style={[styles.climaTemp, { fontSize: fonts['2xl'] ?? 28 }]}>
                  {clima.temp}°C
                </Text>
                <Text style={[styles.climaDesc, { fontSize: fonts.xs }]}>
                  {clima.desc}
                </Text>
              </View>
            </View>
            <View style={styles.climaDetails}>
              <View style={styles.climaDetailItem}>
                <Ionicons name="thermometer-outline" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={[styles.climaDetailText, { fontSize: fonts.xs }]}>
                  Sens. {clima.sensacion}°
                </Text>
              </View>
              <View style={styles.climaDetailDot} />
              <View style={styles.climaDetailItem}>
                <Ionicons name="water-outline" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={[styles.climaDetailText, { fontSize: fonts.xs }]}>
                  {clima.humedad}%
                </Text>
              </View>
              <View style={styles.climaDetailDot} />
              <View style={styles.climaDetailItem}>
                <Ionicons name="speedometer-outline" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={[styles.climaDetailText, { fontSize: fonts.xs }]}>
                  {clima.viento} km/h
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.climaError}>
            <Ionicons name="cloud-offline-outline" size={18} color="rgba(255,255,255,0.5)" />
            <Text style={[styles.climaErrorText, { fontSize: fonts.xs }]}>
              {t('no_results')}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* ══ MENU ITEMS ══════════════════════════════════ */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
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
                isActive && { backgroundColor: itemActiveBg },
              ]}
            >
              {isActive && <View style={styles.activeBar} />}

              <View style={[
                styles.itemIconWrap,
                isActive
                  ? { backgroundColor: itemActiveIconBg }
                  : styles.itemIconWrapInactive,
              ]}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={isActive ? itemActiveIconColor : 'rgba(255,255,255,0.75)'}
                />
              </View>

              <Text style={[
                styles.itemLabel,
                { fontSize: fonts.base },
                isActive
                  ? { color: itemActiveLabelColor, fontWeight: '700' }
                  : { color: '#fff', fontWeight: '600' },
              ]}>
                {t(item.labelKey)}
              </Text>

              {isActive && (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#E96928"
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </TouchableOpacity>
          );
        })}

        {/* ── Separador + Notificaciones ── */}
        <View style={styles.drawerSeparator} />
        <TouchableOpacity
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/(stack)/notificaciones' as any);
          }}
          activeOpacity={0.8}
          style={styles.item}
        >
          <View style={[styles.itemIconWrap, styles.itemIconWrapInactive]}>
            <Ionicons
              name={isAuthenticated && unread > 0 ? 'notifications' : 'notifications-outline'}
              size={20}
              color="rgba(255,255,255,0.75)"
            />
          </View>
          <Text style={[styles.itemLabel, { fontSize: fonts.base, color: '#fff', fontWeight: '600' }]}>
            {t('drawer_nav_notificaciones')}
          </Text>
          {isAuthenticated && unread > 0 && (
            <View style={styles.drawerBadge}>
              <Text style={[styles.drawerBadgeText, { fontSize: fonts.xs }]}>
                {unread > 9 ? '9+' : unread}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </DrawerContentScrollView>

      {/* ══ FOOTER ══════════════════════════════════════ */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.footerAccent} />
        <View style={styles.footerTop}>
          <View style={styles.footerLogoRow}>
            <View style={styles.footerLogoIcon}>
              <Ionicons name="location" size={12} color="#fff" />
            </View>
            <Text style={[styles.footerLogo, { fontSize: fonts.md }]}>
              Guadalupe<Text style={styles.footerLogoAccent}>GO</Text>
            </Text>
          </View>
          <View style={styles.versionBadge}>
            <Text style={[styles.versionText, { fontSize: fonts.xs }]}>
              {t('drawer_version')}
            </Text>
          </View>
        </View>
      </View>

    </View>
  );
}

const ORANGE = '#E96928';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#c4511a' },
  hero: {
    paddingHorizontal: 22, paddingTop: 20, paddingBottom: 22, overflow: 'hidden',
  },
  circle1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -40,
  },
  circle2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: 10, left: -30,
  },
  saludoRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  saludoText: { color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  cityRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  cityIconBg: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
  },
  cityName:  { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
  cityState: { color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  climaCard: {
    backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  climaTop:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  climaIconWrap:  {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  climaTempBlock: { flex: 1 },
  climaTemp:      { color: '#fff', fontWeight: '900', letterSpacing: -1 },
  climaDesc:      { color: 'rgba(255,255,255,0.75)', marginTop: 2, fontWeight: '500' },
  climaDetails: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 10, gap: 8,
  },
  climaDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' },
  climaDetailText: { color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  climaDetailDot:  { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  climaLoading: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 14, padding: 12,
  },
  climaLoadingText: { color: 'rgba(255,255,255,0.7)' },
  climaError: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 14, padding: 12,
  },
  climaErrorText: { color: 'rgba(255,255,255,0.5)' },
  scrollContent: {
    paddingTop: 12, paddingHorizontal: 12, paddingBottom: 20,
    backgroundColor: '#E96928',
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 14, marginBottom: 3, position: 'relative',
  },
  activeBar: {
    position: 'absolute', left: 0, top: 10, bottom: 10,
    width: 3.5, borderRadius: 2, backgroundColor: ORANGE,
  },
  itemIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 13,
  },
  itemIconWrapInactive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  itemLabel: { fontWeight: '600' },
  drawerSeparator: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 14, marginVertical: 8,
  },
  drawerBadge: {
    marginLeft: 'auto',
    backgroundColor: '#fff',
    minWidth: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 5,
  },
  drawerBadgeText: {
    color: '#E96928', fontWeight: '800',
  },
  footer: {
    paddingHorizontal: 20,
    backgroundColor: '#c4511a',
  },
  footerAccent: {
    height: 1, borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 14,
  },
  footerTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLogoRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerLogoIcon:   {
    width: 24, height: 24, borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  footerLogo:       { color: '#fff', fontWeight: '900', letterSpacing: -0.3 },
  footerLogoAccent: { color: 'rgba(255,255,255,0.5)' },
  versionBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  versionText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
});

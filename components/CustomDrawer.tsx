import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Easing, Platform, View, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text } from './Text';
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

const MENU_ITEMS = [
  { name: 'index',      icon: 'home-outline',          labelKey: 'drawer_nav_home'      },
  { name: 'noticias',   icon: 'newspaper-outline',      labelKey: 'drawer_nav_news'      },
  { name: 'eventos',    icon: 'calendar-outline',       labelKey: 'drawer_nav_events'    },
  { name: 'directorio', icon: 'business-outline',       labelKey: 'drawer_nav_directory' },
  { name: 'explorar',   icon: 'compass-outline',        labelKey: 'drawer_nav_explore'   },
  { name: 'favoritos',  icon: 'heart-outline',          labelKey: 'drawer_nav_favorites' },
  { name: 'contacto',   icon: 'mail-outline',           labelKey: 'drawer_nav_contact'   },
] as const;

function getClimaInfo(code: number): { descKey: string; icon: string } {
  if (code === 0)               return { descKey: 'weather_clear',         icon: 'sunny-outline'        };
  if (code <= 2)                return { descKey: 'weather_partly_cloudy', icon: 'partly-sunny-outline' };
  if (code === 3)               return { descKey: 'weather_cloudy',        icon: 'cloud-outline'        };
  if (code >= 45 && code <= 48) return { descKey: 'weather_fog',           icon: 'cloud-outline'        };
  if (code >= 51 && code <= 67) return { descKey: 'weather_drizzle',       icon: 'rainy-outline'        };
  if (code >= 71 && code <= 77) return { descKey: 'weather_snow',          icon: 'snow-outline'         };
  if (code >= 80 && code <= 82) return { descKey: 'weather_rain',          icon: 'rainy-outline'        };
  if (code >= 95 && code <= 99) return { descKey: 'weather_storm',         icon: 'thunderstorm-outline' };
  return                               { descKey: 'weather_variable',      icon: 'cloudy-outline'       };
}

/**
 * Icono del clima con animación específica según el tipo.
 *  - Soleado     → rotación lenta continua (los rayos giran)
 *  - Parc. nubl. → pulso suave de escala
 *  - Nubl./Niebla→ flotación horizontal lenta
 *  - Llovizna    → bob vertical sutil
 *  - Lluvia      → bob vertical más marcado
 *  - Tormenta    → flash de opacidad + leve shake horizontal
 *  - Nieve       → rotación lenta + bob
 *
 * Usa native driver para que los 60fps salgan sin pasar por el JS thread
 * (la app puede estar haciendo otros trabajos cuando el drawer está
 * abierto, así nunca se nota un jank).
 */
function WeatherAnimatedIcon({
  code,
  size = 28,
  color = '#fff',
}: {
  code: number;
  size?: number;
  color?: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  // Tipo de animación derivado del código de Open-Meteo
  const tipo =
    code === 0
      ? 'sun'
      : code <= 2
      ? 'partly'
      : code === 3
      ? 'cloud'
      : code >= 45 && code <= 48
      ? 'fog'
      : code >= 51 && code <= 67
      ? 'drizzle'
      : code >= 71 && code <= 77
      ? 'snow'
      : code >= 80 && code <= 82
      ? 'rain'
      : code >= 95 && code <= 99
      ? 'storm'
      : 'cloud';

  // Icono Ionicons asociado
  const iconName: any =
    tipo === 'sun'      ? 'sunny'
    : tipo === 'partly' ? 'partly-sunny'
    : tipo === 'cloud'  ? 'cloud'
    : tipo === 'fog'    ? 'cloud'
    : tipo === 'drizzle'? 'rainy'
    : tipo === 'snow'   ? 'snow'
    : tipo === 'rain'   ? 'rainy'
    : tipo === 'storm'  ? 'thunderstorm'
    : 'cloudy';

  // Duración + curva por tipo (algunos loops, otros sequence)
  useEffect(() => {
    anim.setValue(0);
    let loop: Animated.CompositeAnimation;

    if (tipo === 'sun') {
      loop = Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
    } else if (tipo === 'partly') {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      );
    } else if (tipo === 'storm') {
      // Flash + shake: 0→1 rápido (flash), 1→0.6 rebote, 0.6→0 calma
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1,   duration: 120,  useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.6, duration: 120,  useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0,   duration: 1800, useNativeDriver: true }),
        ]),
      );
    } else {
      // cloud / fog / drizzle / rain / snow → loop suave en seno
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      );
    }

    loop.start();
    return () => loop.stop();
  }, [tipo, anim]);

  // Estilo transformado en base al tipo
  let transform: any[] = [];
  let opacity: any = 1;

  if (tipo === 'sun') {
    transform = [
      {
        rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
      },
    ];
  } else if (tipo === 'partly') {
    transform = [
      {
        scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.08] }),
      },
    ];
  } else if (tipo === 'cloud' || tipo === 'fog') {
    transform = [
      {
        translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-3, 3] }),
      },
    ];
    if (tipo === 'fog') opacity = 0.7;
  } else if (tipo === 'drizzle' || tipo === 'rain') {
    transform = [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, tipo === 'rain' ? 4 : 2],
        }),
      },
    ];
  } else if (tipo === 'snow') {
    transform = [
      {
        rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] }),
      },
      {
        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-1, 2] }),
      },
    ];
  } else if (tipo === 'storm') {
    // El flash sube la opacidad del relámpago + un mini shake horizontal
    opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.75, 1, 0.9] });
    transform = [
      {
        translateX: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -1.5, 1.5] }),
      },
    ];
  }

  return (
    <Animated.View style={{ opacity, transform }}>
      <Ionicons name={iconName} size={size} color={color} />
    </Animated.View>
  );
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
  descKey: string; icon: string; ciudad: string;
  /** Código original de Open-Meteo — necesario para el icono animado. */
  code: number;
};

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const { t, i18n } = useTranslation();
  const { fonts, isDark } = useTheme();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [saludoIcon, setSaludoIcon] = useState(getSaludoIcon());
  const [saludoKey,  setSaludoKey]  = useState(getSaludoKey());
  const [clima,        setClima]        = useState<Clima | null>(null);
  const [loadingClima, setLoadingClima] = useState(true);

  // Fahrenheit solo para inglés americano (en)
  const useFahrenheit = i18n.language === 'en';

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
        `&timezone=America%2FMonterrey` +
        (useFahrenheit ? `&temperature_unit=fahrenheit` : ``);

      const res  = await fetch(url);
      const data = await res.json();
      const c    = data.current;
      const info = getClimaInfo(c.weather_code);

      setClima({
        temp:      Math.round(c.temperature_2m),
        sensacion: Math.round(c.apparent_temperature),
        humedad:   c.relative_humidity_2m,
        viento:    Math.round(c.wind_speed_10m),
        descKey:   info.descKey,
        icon:      info.icon,
        ciudad,
        code:      c.weather_code,
      });
    } catch {
      setClima(null);
    } finally {
      setLoadingClima(false);
    }
  }, [t, useFahrenheit]);

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
  const itemActiveLabelColor = '#F97613';
  const itemActiveIconColor  = '#F97613';
  const itemActiveIconBg     = isDark ? 'rgba(249,118,19,0.12)' : 'rgba(249,118,19,0.1)';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ══ HERO ════════════════════════════════════════ */}
      <LinearGradient
        colors={['#F97613', '#F97613']}
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
            <Ionicons name="location" size={20} color="#F97613" />
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
                <WeatherAnimatedIcon code={clima.code} size={32} color="#fff" />
              </View>
              <View style={styles.climaTempBlock}>
                <Text style={[styles.climaTemp, { fontSize: fonts['2xl'] ?? 28 }]}>
                  {clima.temp}°{useFahrenheit ? 'F' : 'C'}
                </Text>
                <Text style={[styles.climaDesc, { fontSize: fonts.xs }]}>
                  {t(clima.descKey)}
                </Text>
              </View>
            </View>

            {/* Stats en 3 columnas con icono + valor + label apilados.
                Antes era una sola fila con dots → la columna de
                "Sens. 37°C" quedaba apretada al cuadrar con flex:1. */}
            <View style={styles.climaStatsRow}>
              <View style={styles.climaStat}>
                <Ionicons name="thermometer-outline" size={14} color="rgba(255,255,255,0.85)" />
                <Text style={[styles.climaStatValue, { fontSize: fonts.sm }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} allowFontScaling={false}>
                  {clima.sensacion}°{useFahrenheit ? 'F' : 'C'}
                </Text>
                <Text style={[styles.climaStatLabel, { fontSize: fonts.xs }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} allowFontScaling={false}>
                  {t('weather_feels_like')}
                </Text>
              </View>

              <View style={styles.climaStatDivider} />

              <View style={styles.climaStat}>
                <Ionicons name="water-outline" size={14} color="rgba(255,255,255,0.85)" />
                <Text style={[styles.climaStatValue, { fontSize: fonts.sm }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} allowFontScaling={false}>
                  {clima.humedad}%
                </Text>
                <Text style={[styles.climaStatLabel, { fontSize: fonts.xs }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} allowFontScaling={false}>
                  {t('weather_humidity', { defaultValue: 'Humedad' })}
                </Text>
              </View>

              <View style={styles.climaStatDivider} />

              <View style={styles.climaStat}>
                <Ionicons name="speedometer-outline" size={14} color="rgba(255,255,255,0.85)" />
                <Text style={[styles.climaStatValue, { fontSize: fonts.sm }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} allowFontScaling={false}>
                  {clima.viento} km/h
                </Text>
                <Text style={[styles.climaStatLabel, { fontSize: fonts.xs }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} allowFontScaling={false}>
                  {t('weather_wind', { defaultValue: 'Viento' })}
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

      {/* Línea divisoria — separa el bloque del clima del menú,
          espejo simétrico de la que tenemos arriba del footer. */}
      <View style={styles.headerDivider} />

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
                  color="#F97613"
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </TouchableOpacity>
          );
        })}

      </DrawerContentScrollView>

      {/* ══ FOOTER ══════════════════════════════════════ */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.footerAccent} />
        <View style={styles.footerTop}>
          <View style={styles.footerLogoRow}>
            <Image
              source={require('../assets/images/gpego-logo.png')}
              style={styles.footerLogoImg}
              resizeMode="contain"
            />
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              style={[styles.footerLogo, { fontSize: 14 }]}
            >
              Guadalupe<Text style={styles.footerLogoAccent}>GO</Text>
            </Text>
          </View>
          <View style={styles.versionBadge}>
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              style={[styles.versionText, { fontSize: 11 }]}
            >
              {t('drawer_version')}
            </Text>
          </View>
        </View>
      </View>

    </View>
  );
}

const ORANGE = '#F97613';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F97613' },
  hero: {
    paddingHorizontal: 22, paddingTop: 20, paddingBottom: 10, overflow: 'hidden',
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
  // Layout viejo (conservado por compatibilidad de algunos snapshots).
  climaDetails: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 10, gap: 8,
  },
  climaDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' },
  climaDetailText: { color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  climaDetailDot:  { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },

  // Stats 3 columnas — el layout actual del widget.
  climaStatsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    paddingTop: 12,
    marginTop: 2,
  },
  climaStat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 3,
    paddingHorizontal: 4,
  },
  climaStatValue: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  climaStatLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '500',
    textTransform: 'lowercase',
  },
  climaStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 2,
    alignSelf: 'stretch',
  },
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
  // Diseño por plataforma:
  //   • iOS  → spacing fijo, los 7 items ya caben bien.
  //   • Android → `flexGrow: 1` + `justifyContent: 'space-evenly'` en el
  //     contentContainer del ScrollView para que los items se distribuyan
  //     verticalmente y llenen TODO el espacio disponible. Así "Contacto"
  //     queda visible y no se nota un hueco vacío abajo. El padding de
  //     cada item es ligeramente más compacto para que en pantallas muy
  //     cortas siga cabiendo sin scrollear.
  scrollContent: Platform.select({
    ios: { paddingTop: 12, paddingHorizontal: 12, paddingBottom: 20, backgroundColor: '#F97613' },
    default: {
      flexGrow: 1,
      justifyContent: 'space-evenly',
      paddingTop: 6, paddingHorizontal: 12, paddingBottom: 12,
      backgroundColor: '#F97613',
    },
  }) as any,
  item: Platform.select({
    ios: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 12, paddingHorizontal: 14,
      borderRadius: 14, marginBottom: 3, position: 'relative',
    },
    default: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 10, paddingHorizontal: 14,
      borderRadius: 14, position: 'relative',
    },
  }) as any,
  activeBar: Platform.select({
    ios: {
      position: 'absolute', left: 0, top: 10, bottom: 10,
      width: 3.5, borderRadius: 2, backgroundColor: ORANGE,
    },
    default: {
      position: 'absolute', left: 0, top: 8, bottom: 8,
      width: 3.5, borderRadius: 2, backgroundColor: ORANGE,
    },
  }) as any,
  itemIconWrap: Platform.select({
    ios: {
      width: 34, height: 34, borderRadius: 10,
      justifyContent: 'center', alignItems: 'center', marginRight: 13,
    },
    default: {
      width: 32, height: 32, borderRadius: 10,
      justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
  }) as any,
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
    color: '#F97613', fontWeight: '800',
  },
  // Misma estética que `footerAccent` para que la simetría del drawer
  // sea consistente arriba y abajo del menú.
  headerDivider: {
    height: 1.5,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: '#F97613',
  },
  footerAccent: {
    height: 1.5, borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
  },
  footerTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  footerLogoRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 },
  // Logo oficial pequeño del municipio en el footer del drawer.
  // 24×24 con resizeMode="contain" en la <Image>. Sin shadow para
  // evitar el glow naranja de iOS.
  footerLogoImg: {
    width: 24,
    height: 24,
    // Nudge: el PNG del logo tiene un poco de whitespace abajo-izquierda,
    // así que lo levantamos y movemos a la derecha para alinearlo
    // visualmente con el baseline del texto "GuadalupeGO".
    transform: [{ translateY: -3 }, { translateX: 6 }],
  },
  footerLogo:       { color: '#fff', fontWeight: '900', letterSpacing: -0.3 },
  footerLogoAccent: { color: 'rgba(255,255,255,0.5)' },
  versionBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  versionText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
});

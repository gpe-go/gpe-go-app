import React, { useEffect, useRef } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { useNotificaciones, type Notificacion } from '../../src/context/NotificacionesContext';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// ─── Icono por tipo ─────────────────────────────────────────────────────────
function tipoIcon(tipo: string): { name: IoniconName; color: string; bg: string } {
  switch (tipo) {
    case 'negocio_aprobado':  return { name: 'checkmark-circle', color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  };
    case 'negocio_rechazado': return { name: 'close-circle',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  };
    case 'nuevo_evento':      return { name: 'calendar',         color: '#E96928', bg: 'rgba(233,105,40,0.12)' };
    case 'nuevo_lugar':       return { name: 'location',         color: '#E96928', bg: 'rgba(233,105,40,0.12)' };
    case 'nueva_noticia':     return { name: 'newspaper',        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
    case 'bienvenida':        return { name: 'hand-left',        color: '#E96928', bg: 'rgba(233,105,40,0.12)' };
    default:                  return { name: 'notifications',    color: '#E96928', bg: 'rgba(233,105,40,0.12)' };
  }
}

// ─── Fecha relativa ──────────────────────────────────────────────────────────
function formatRelative(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'Ahora';
  if (mins  < 60) return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours} h`;
  if (days  < 7)  return `Hace ${days} d`;
  return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

// ─── Estilos estáticos de tarjeta ───────────────────────────────────────────
const cardSt = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 14, borderRadius: 16, borderWidth: 1,
    position: 'relative', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  dot: {
    position: 'absolute', top: 14, right: 14,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#E96928',
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  body:   { flex: 1, gap: 3 },
  title:  { fontWeight: '600', lineHeight: 20 },
  cuerpo: { lineHeight: 18 },
  time:   { marginTop: 2 },
});

// ─── Tarjeta de notificación ─────────────────────────────────────────────────
function NotifCard({
  item, index, colors, fonts, onPress,
}: {
  item: Notificacion; index: number; colors: any; fonts: any;
  onPress: (n: Notificacion) => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const icon = tipoIcon(item.tipo);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: 350, delay: index * 55, useNativeDriver: true,
    }).start();
  }, [anim, index]);

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [18,0] }) }],
    }}>
      <Pressable
        onPress={() => onPress(item)}
        style={({ pressed }) => [
          cardSt.wrap,
          {
            backgroundColor: colors.card,
            borderColor: item.leida ? colors.border : '#E96928' + '40',
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          },
        ]}
      >
        {!item.leida && <View style={cardSt.dot} />}

        <View style={[cardSt.iconWrap, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name} size={22} color={icon.color} />
        </View>

        <View style={cardSt.body}>
          <Text
            style={[cardSt.title, { color: colors.text, fontSize: fonts.base },
              !item.leida && { fontWeight: '700' }]}
            numberOfLines={2}
          >
            {item.titulo}
          </Text>
          {!!item.cuerpo && (
            <Text style={[cardSt.cuerpo, { color: colors.subtext, fontSize: fonts.sm }]} numberOfLines={2}>
              {item.cuerpo}
            </Text>
          )}
          <Text style={[cardSt.time, { color: colors.subtext, fontSize: fonts.xs }]}>
            {formatRelative(item.created_at)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Pantalla ────────────────────────────────────────────────────────────────
export default function NotificacionesScreen() {
  const { t }                     = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const router                    = useRouter();
  const { notificaciones, unread, loading, refresh, marcarLeida, marcarTodas } =
    useNotificaciones();

  const bannerAnim = useRef(new Animated.Value(0)).current;
  const listAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(bannerAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(listAnim,   { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [bannerAnim, listAnim]);

  const handlePress = async (n: Notificacion) => {
    if (!n.leida) await marcarLeida(n.id);
  };

  const s = makeStyles(colors, fonts, isDark);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#E96928" />

      {/* ── Banner ── */}
      <Animated.View style={{
        opacity: bannerAnim,
        transform: [{ translateY: bannerAnim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }],
      }}>
        <LinearGradient
          colors={['#E96928', '#C4511A']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.banner}
        >
          <View style={s.circle1} />
          <View style={s.circle2} />

          <View style={s.bannerRow}>
            {/* Atrás */}
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [s.backBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>

            {/* Centro */}
            <View style={s.bannerCenter}>
              <View style={s.bannerIconWrap}>
                <Ionicons name="notifications" size={26} color="#E96928" />
              </View>
              <Text style={[s.bannerTitle, { fontSize: fonts['2xl'] }]}>
                {t('notif_title')}
              </Text>
              {unread > 0 && (
                <View style={s.unreadBadge}>
                  <Text style={[s.unreadBadgeText, { fontSize: fonts.xs }]}>{unread}</Text>
                </View>
              )}
            </View>

            {/* Leer todo */}
            {unread > 0 ? (
              <Pressable
                onPress={marcarTodas}
                style={({ pressed }) => [s.readAllBtn, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={[s.readAllText, { fontSize: fonts.xs }]}>{t('notif_mark_all')}</Text>
              </Pressable>
            ) : (
              <View style={{ width: 60 }} />
            )}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── Lista ── */}
      <Animated.View style={{
        flex: 1,
        opacity: listAnim,
        transform: [{ translateY: listAnim.interpolate({ inputRange: [0,1], outputRange: [16,0] }) }],
      }}>
        {notificaciones.length === 0 && !loading ? (
          <View style={s.empty}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="notifications-off-outline" size={40} color={colors.subtext} />
            </View>
            <Text style={[s.emptyText, { color: colors.text, fontSize: fonts.md }]}>
              {t('notif_empty')}
            </Text>
            <Text style={[s.emptySubtext, { color: colors.subtext, fontSize: fonts.sm }]}>
              {t('notif_empty_sub')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={notificaciones}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refresh}
                tintColor="#E96928"
                colors={['#E96928']}
              />
            }
            renderItem={({ item, index }) => (
              <NotifCard
                item={item}
                index={index}
                colors={colors}
                fonts={fonts}
                onPress={handlePress}
              />
            )}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Estilos de pantalla ─────────────────────────────────────────────────────
const makeStyles = (c: any, f: any, isDark: boolean) =>
  StyleSheet.create({
    banner: {
      paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, overflow: 'hidden',
    },
    circle1: {
      position: 'absolute', width: 180, height: 180, borderRadius: 90,
      backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40,
    },
    circle2: {
      position: 'absolute', width: 100, height: 100, borderRadius: 50,
      backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30,
    },
    bannerRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    backBtn:   { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
    bannerCenter: { alignItems: 'center', gap: 6 },
    bannerIconWrap: {
      width: 52, height: 52, borderRadius: 16, backgroundColor: '#fff',
      justifyContent: 'center', alignItems: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
    },
    bannerTitle:     { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
    unreadBadge: {
      backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 2,
      borderRadius: 20, marginTop: 2,
    },
    unreadBadgeText: { color: '#E96928', fontWeight: '800' },
    readAllBtn:      { width: 60, alignItems: 'flex-end', justifyContent: 'center' },
    readAllText:     { color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
    list:            { padding: 16, paddingBottom: 40 },
    empty: {
      alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 32,
    },
    emptyIconWrap: {
      width: 72, height: 72, borderRadius: 22,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      justifyContent: 'center', alignItems: 'center',
    },
    emptyText:    { fontWeight: '700', letterSpacing: -0.3 },
    emptySubtext: { textAlign: 'center' },
  });

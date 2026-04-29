/**
 * MundialWidget.tsx
 * Sección FIFA World Cup 2026 para la pantalla principal de GuadalupeGO.
 * Diseño premium con colores oficiales FIFA 2026, countdown en vivo,
 * carrusel de partidos y ficha del Estadio BBVA.
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ESTADIO_BBVA,
  PARTIDOS_BBVA,
  Partido,
  TORNEO,
  formatFechaCorta,
  formatFechaLarga,
  formatHora,
  toMatchDate,
  toTorneoStartDate,
} from '../src/data/mundial2026';

// ── FIFA 2026 Design Tokens ───────────────────────────────────────────────────
const F = {
  bg:         '#04071B',   // fondo principal
  card:       '#0B1430',   // tarjeta oscura
  cardMid:    '#111D3C',   // tarjeta media
  cardLight:  '#162447',   // tarjeta clara
  gold:       '#F0B429',   // dorado FIFA
  goldDim:    'rgba(240,180,41,0.14)',
  goldBorder: 'rgba(240,180,41,0.32)',
  goldGlow:   'rgba(240,180,41,0.06)',
  red:        '#D42B2B',   // rojo FIFA
  redDim:     'rgba(212,43,43,0.18)',
  green:      '#00A551',   // verde césped
  greenDim:   'rgba(0,165,81,0.18)',
  white:      '#FFFFFF',
  textSub:    'rgba(255,255,255,0.52)',
  textMid:    'rgba(255,255,255,0.75)',
  border:     'rgba(255,255,255,0.07)',
  borderGold: 'rgba(240,180,41,0.22)',
};

// ── Helpers internos ──────────────────────────────────────────────────────────

type Countdown = { dias: number; horas: number; mins: number; segs: number };

function calcCountdown(target: Date): Countdown {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    dias:  Math.floor(diff / 86_400_000),
    horas: Math.floor((diff % 86_400_000) / 3_600_000),
    mins:  Math.floor((diff % 3_600_000) / 60_000),
    segs:  Math.floor((diff % 60_000) / 1000),
  };
}

const pad2 = (n: number) => String(n).padStart(2, '0');

function getFaseColor(fase: Partido['fase']): string {
  if (fase === 'Ronda de 32')        return '#7C3AED';
  if (fase === 'Cuartos de Final')   return '#2563EB';
  if (fase === 'Semifinal')          return '#D97706';
  if (fase === 'Final')              return F.gold;
  return F.green; // Fase de Grupos
}

// ── Sub-componente: Dígito del countdown ─────────────────────────────────────
const CountUnit = React.memo(({ value, label }: { value: number; label: string }) => (
  <View style={cu.wrap}>
    <LinearGradient colors={['#1B2B54', F.cardMid]} style={cu.box}>
      <Text style={cu.num}>{pad2(value)}</Text>
    </LinearGradient>
    <Text style={cu.label}>{label}</Text>
  </View>
));
CountUnit.displayName = 'CountUnit';

const cu = StyleSheet.create({
  wrap:  { alignItems: 'center', gap: 4 },
  box:   {
    width: 62, height: 62, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: F.goldBorder,
  },
  num:   { color: F.gold, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  label: { color: F.textSub, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
});

// ── Sub-componente: Tarjeta de partido (nuevo diseño estilo FIFA) ─────────────
const MatchCard = React.memo(({ partido }: { partido: Partido }) => {
  const fColor   = getFaseColor(partido.fase);
  const hasResult = partido.resultado !== null;
  const isLive    = partido.estado === 'en_vivo';

  return (
    <View style={mc.card}>
      {/* ── Banner superior con flags y VS ─────────────────────────────────── */}
      <LinearGradient
        colors={['#071428', '#0C2A18', '#071428']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={mc.banner}
      >
        {/* Decoración de fondo */}
        <View style={mc.bannerCircle1} />
        <View style={mc.bannerCircle2} />

        {/* Equipo izquierdo */}
        <View style={mc.bannerTeam}>
          <Text style={mc.bannerFlag}>{partido.equipo1.bandera}</Text>
          <Text style={mc.bannerAbrev}>{partido.equipo1.abrev}</Text>
        </View>

        {/* Centro: VS / score + live */}
        <View style={mc.bannerCenter}>
          {isLive && (
            <View style={mc.livePill}>
              <View style={mc.liveDot} />
              <Text style={mc.liveText}>EN VIVO</Text>
            </View>
          )}
          {hasResult ? (
            <View style={mc.scoreRow}>
              <Text style={mc.scoreNum}>{partido.resultado!.g1}</Text>
              <Text style={mc.scoreSep}>-</Text>
              <Text style={mc.scoreNum}>{partido.resultado!.g2}</Text>
            </View>
          ) : (
            <Text style={mc.vsText}>VS</Text>
          )}
          <Text style={mc.bannerMatchNum}>#{partido.matchNum}</Text>
        </View>

        {/* Equipo derecho */}
        <View style={mc.bannerTeam}>
          <Text style={mc.bannerFlag}>{partido.equipo2.bandera}</Text>
          <Text style={mc.bannerAbrev}>{partido.equipo2.abrev}</Text>
        </View>

        {/* Branding FIFA en la parte baja del banner */}
        <View style={mc.bannerBranding}>
          <Text style={mc.bannerBrandingText}>⚽  FIFA WORLD CUP 2026™  ·  MONTERREY</Text>
        </View>
      </LinearGradient>

      {/* ── Info inferior ──────────────────────────────────────────────────── */}
      <View style={mc.info}>
        {/* Badge de grupo — centrado, sin estado */}
        <View style={mc.groupRow}>
          <View style={[mc.groupBadge, { backgroundColor: fColor + '20', borderColor: fColor + '50' }]}>
            <View style={[mc.groupDot, { backgroundColor: fColor }]} />
            <Text style={[mc.groupText, { color: fColor }]}>
              {partido.grupo
                ? `${partido.grupo} · J${partido.jornada}`
                : partido.fase}
            </Text>
          </View>
        </View>

        {/* Nombres completos */}
        <Text style={mc.matchTitle} numberOfLines={1}>
          {partido.equipo1.nombreCorto} vs {partido.equipo2.nombreCorto}
        </Text>

        {/* Fecha y hora */}
        <View style={mc.dateRow}>
          <Ionicons name="calendar-outline" size={11} color={F.textSub} />
          <Text style={mc.dateText}>{formatFechaCorta(partido.fecha)}</Text>
          <View style={mc.dateDot} />
          <Ionicons name="time-outline" size={11} color={F.textSub} />
          <Text style={mc.dateText}>{formatHora(partido.hora)}</Text>
        </View>
      </View>
    </View>
  );
});
MatchCard.displayName = 'MatchCard';

const mc = StyleSheet.create({
  card: {
    width: 236,
    backgroundColor: F.card,
    borderRadius: 20,
    marginRight: 14,
    borderWidth: 1,
    borderColor: F.border,
    overflow: 'hidden',
  },

  // ── Banner
  banner: {
    height: 132,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 22,   // espacio para el branding
    position: 'relative',
    overflow: 'hidden',
  },
  bannerCircle1: {
    position: 'absolute',
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(0,165,81,0.08)',
    top: -40, left: -30,
  },
  bannerCircle2: {
    position: 'absolute',
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(240,180,41,0.06)',
    bottom: -30, right: -20,
  },
  bannerTeam: {
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  bannerFlag: {
    fontSize: 40,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  bannerAbrev: {
    color: F.white,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  bannerCenter: {
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: F.red,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 2,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff', fontWeight: '900', fontSize: 8, letterSpacing: 1,
  },
  vsText: {
    color: F.gold,
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 2,
    textShadowColor: 'rgba(240,180,41,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  scoreRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  scoreNum: {
    color: F.gold, fontWeight: '900', fontSize: 26,
  },
  scoreSep: {
    color: F.textSub, fontWeight: '700', fontSize: 18,
  },
  bannerMatchNum: {
    color: F.textSub, fontSize: 9, fontWeight: '600',
  },
  bannerBranding: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  bannerBrandingText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // ── Info
  info: {
    padding: 12,
    gap: 7,
  },
  groupRow: {
    alignItems: 'center',
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  groupDot: {
    width: 5, height: 5, borderRadius: 3,
  },
  groupText: {
    fontSize: 10, fontWeight: '800', letterSpacing: 0.5,
  },
  matchTitle: {
    color: F.white,
    fontWeight: '800',
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dateText: {
    color: F.textSub, fontSize: 10, fontWeight: '600',
  },
  dateDot: {
    width: 3, height: 3, borderRadius: 2,
    backgroundColor: F.textSub,
    marginHorizontal: 2,
  },
});

// ── Componente principal ──────────────────────────────────────────────────────
export default function MundialWidget() {
  const router = useRouter();

  // ── Próximo partido ────────────────────────────────────────────────────────
  const proximoPartido = useMemo(() => {
    const ahora = Date.now();
    return PARTIDOS_BBVA.find(
      (p) =>
        p.estado !== 'finalizado' &&
        toMatchDate(p.fecha, p.hora).getTime() >= ahora - 2 * 3_600_000,
    ) ?? null;
  }, []);

  // ── Countdown ──────────────────────────────────────────────────────────────
  const targetDate = useMemo(
    () => (proximoPartido ? toMatchDate(proximoPartido.fecha, proximoPartido.hora) : null),
    [proximoPartido],
  );
  const torneoStartDate = useMemo(() => toTorneoStartDate(), []);

  const [countdown, setCountdown] = useState<Countdown>(
    targetDate ? calcCountdown(targetDate) : { dias: 0, horas: 0, mins: 0, segs: 0 },
  );
  const [countdownTorneo, setCountdownTorneo] = useState<Countdown>(
    calcCountdown(torneoStartDate),
  );

  useEffect(() => {
    const id = setInterval(() => {
      if (targetDate) setCountdown(calcCountdown(targetDate));
      setCountdownTorneo(calcCountdown(torneoStartDate));
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate, torneoStartDate]);

  // ── Animaciones ────────────────────────────────────────────────────────────
  // Breathing glow en elementos dorados
  const glowAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]),
    ).start();
  }, [glowAnim]);
  const goldOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });

  // Pulso del balón
  const ballScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ballScale, { toValue: 1.14, duration: 850, useNativeDriver: true }),
        Animated.timing(ballScale, { toValue: 1,    duration: 850, useNativeDriver: true }),
      ]),
    ).start();
  }, [ballScale]);

  // Entrada del widget
  const enterAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enterAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }).start();
  }, [enterAnim]);
  const enterStyle = {
    opacity: enterAnim,
    transform: [{ translateY: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
  };

  // ── Abrir FIFA oficial ─────────────────────────────────────────────────────
  const abrirFIFA = useCallback(() => {
    Linking.openURL(TORNEO.fifaUrl).catch(() => {});
  }, []);

  // ── Abrir Estadio BBVA oficial ─────────────────────────────────────────────
  const abrirBBVA = useCallback(() => {
    Linking.openURL('https://estadio-bbva.mx/').catch(() => {});
  }, []);

  // ── Abrir noticia clasificatorio ───────────────────────────────────────────
  const abrirNoticia = useCallback(() => {
    Linking.openURL('https://estadio-bbva.mx/noticias/estadio-monterreyl-primer-partido-clasificatorio').catch(() => {});
  }, []);

  return (
    <Animated.View style={[s.root, enterStyle]}>

      {/* ════════════════════════════════════════════════════════════════════
          HERO BANNER
      ════════════════════════════════════════════════════════════════════ */}
      <LinearGradient
        colors={['#04071B', '#0D1B3E', '#04071B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        {/* Líneas decorativas de fondo */}
        <View style={s.heroDeco1} />
        <View style={s.heroDeco2} />

        {/* Bandera de sede */}
        <View style={s.heroTop}>
          <View style={s.sedes}>
            <Text style={s.sedeFlag}>🇺🇸</Text>
            <Text style={s.sedeFlag}>🇨🇦</Text>
            <Text style={s.sedeFlag}>🇲🇽</Text>
          </View>
          <View style={s.sedeLabelWrap}>
            <Text style={s.sedeLabel}>3 PAÍSES · 16 SEDES</Text>
          </View>
        </View>

        {/* Balón animado + título */}
        <View style={s.heroCenter}>
          <Animated.Text style={[s.heroBall, { transform: [{ scale: ballScale }] }]}>
            ⚽
          </Animated.Text>

          <View style={s.heroTitleWrap}>
            <Text style={s.heroEyebrow}>FIFA WORLD CUP</Text>
            <Animated.Text style={[s.heroYear, { opacity: goldOpacity }]}>
              2026
            </Animated.Text>
            <Text style={s.heroSub}>Estadio BBVA · Guadalupe, NL</Text>
          </View>
        </View>

        {/* Chips de stats del torneo */}
        <View style={s.heroStats}>
          <View style={s.statChip}>
            <Text style={s.statNum}>{TORNEO.equipos}</Text>
            <Text style={s.statLbl}>EQUIPOS</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statChip}>
            <Text style={s.statNum}>{TORNEO.partidos}</Text>
            <Text style={s.statLbl}>PARTIDOS</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statChip}>
            <Text style={s.statNum}>{PARTIDOS_BBVA.length}</Text>
            <Text style={s.statLbl}>EN BBVA</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statChip}>
            <Text style={s.statNum}>{ESTADIO_BBVA.capacidadMundial.toLocaleString('es')}</Text>
            <Text style={s.statLbl}>AFORO</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ════════════════════════════════════════════════════════════════════
          COUNTDOWN TORNEO — siempre visible hasta que empiece el mundial
      ════════════════════════════════════════════════════════════════════ */}
      {Date.now() < torneoStartDate.getTime() && (
        <View style={s.countSectionTorneo}>
          <View style={s.countHeader}>
            <View style={s.countHeaderLeft}>
              <Text style={s.countTorneoIcon}>🌍</Text>
              <Text style={s.countTitleTorneo}>EL MUNDIAL EMPIEZA EN</Text>
            </View>
            <View style={[s.liveDot, { backgroundColor: F.green }]} />
          </View>
          <Text style={s.countTorneoSub}>
            11 Jun · México vs Sudáfrica · Estadio Azteca
          </Text>
          <View style={s.countUnits}>
            <CountUnit value={countdownTorneo.dias}  label="DÍAS"  />
            <Text style={s.countColon}>:</Text>
            <CountUnit value={countdownTorneo.horas} label="HORAS" />
            <Text style={s.countColon}>:</Text>
            <CountUnit value={countdownTorneo.mins}  label="MIN"   />
            <Text style={s.countColon}>:</Text>
            <CountUnit value={countdownTorneo.segs}  label="SEG"   />
          </View>
        </View>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          COUNTDOWN BBVA — próximo partido en el estadio local
      ════════════════════════════════════════════════════════════════════ */}
      {proximoPartido ? (
        <View style={s.countSection}>
          {/* Header countdown */}
          <View style={s.countHeader}>
            <View style={s.countHeaderLeft}>
              <Ionicons name="timer-outline" size={16} color={F.gold} />
              <Text style={s.countTitle}>
                {proximoPartido.estado === 'en_vivo'
                  ? '🔴  PARTIDO EN CURSO'
                  : 'PRÓXIMO PARTIDO EN BBVA'}
              </Text>
            </View>
            <View style={s.liveDot} />
          </View>

          {/* Equipos del próximo partido */}
          <View style={s.countMatch}>
            <Text style={s.countTeam}>
              {proximoPartido.equipo1.bandera} {proximoPartido.equipo1.abrev}
            </Text>
            <View style={s.countVsDivider}>
              <Text style={s.countVs}>VS</Text>
            </View>
            <Text style={s.countTeam}>
              {proximoPartido.equipo2.abrev} {proximoPartido.equipo2.bandera}
            </Text>
          </View>

          {/* Fecha larga */}
          <Text style={s.countDateLabel}>
            {formatFechaLarga(proximoPartido.fecha)} · {formatHora(proximoPartido.hora)}
          </Text>

          {/* Dígitos */}
          {proximoPartido.estado !== 'en_vivo' ? (
            <View style={s.countUnits}>
              <CountUnit value={countdown.dias}  label="DÍAS"  />
              <Text style={s.countColon}>:</Text>
              <CountUnit value={countdown.horas} label="HORAS" />
              <Text style={s.countColon}>:</Text>
              <CountUnit value={countdown.mins}  label="MIN"   />
              <Text style={s.countColon}>:</Text>
              <CountUnit value={countdown.segs}  label="SEG"   />
            </View>
          ) : (
            <View style={s.enVivoWrap}>
              <View style={s.enVivoPulse} />
              <Text style={s.enVivoText}>PARTIDO EN VIVO · Sigue en FIFA.com</Text>
            </View>
          )}
        </View>
      ) : (
        // Todos los partidos terminaron
        <View style={s.torneoFinWrap}>
          <Text style={s.torneoFinText}>🏆 ¡Todos los partidos en BBVA han concluido!</Text>
        </View>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SECCIÓN TÍTULO: CALENDARIO
      ════════════════════════════════════════════════════════════════════ */}
      <View style={s.sectionHeader}>
        <View style={s.sectionAccent} />
        <Text style={s.sectionTitle}>Calendario Estadio BBVA</Text>
        <Pressable
          onPress={abrirBBVA}
          style={({ pressed }) => [s.bbvaLinkBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={s.bbvaLinkText}>estadio-bbva.mx</Text>
          <Ionicons name="open-outline" size={11} color={F.gold} />
        </Pressable>
      </View>

      {/* ════════════════════════════════════════════════════════════════════
          CARRUSEL DE PARTIDOS
      ════════════════════════════════════════════════════════════════════ */}
      <FlatList
        horizontal
        data={PARTIDOS_BBVA}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.carousel}
        renderItem={({ item }) => (
          <MatchCard partido={item} />
        )}
      />

      {/* ════════════════════════════════════════════════════════════════════
          TARJETA ESTADIO BBVA
      ════════════════════════════════════════════════════════════════════ */}
      <View style={s.sectionHeader}>
        <View style={s.sectionAccent} />
        <Text style={s.sectionTitle}>El Estadio</Text>
      </View>

      <LinearGradient
        colors={[F.cardMid, F.card]}
        style={s.stadiumCard}
      >
        {/* Borde dorado izquierdo */}
        <View style={s.stadiumAccentBar} />

        {/* Header del estadio */}
        <View style={s.stadiumHeader}>
          <View>
            <Text style={s.stadiumName}>{ESTADIO_BBVA.nombre}</Text>
            <Text style={s.stadiumAlias}>"{ESTADIO_BBVA.alias}"</Text>
          </View>
          <Text style={s.stadiumEmoji}>🏟️</Text>
        </View>

        {/* Línea divisora */}
        <View style={s.stadiumDivider} />

        {/* Stats en grid */}
        <View style={s.stadiumGrid}>
          <View style={s.stadiumStat}>
            <MaterialCommunityIcons name="account-group" size={18} color={F.gold} />
            <Text style={s.stadiumStatVal}>
              {ESTADIO_BBVA.capacidadMundial.toLocaleString('es')}
            </Text>
            <Text style={s.stadiumStatLbl}>Aforo Mundial</Text>
          </View>
          <View style={s.stadiumStatDivider} />
          <View style={s.stadiumStat}>
            <MaterialCommunityIcons name="calendar-check" size={18} color={F.gold} />
            <Text style={s.stadiumStatVal}>{ESTADIO_BBVA.inaugurado}</Text>
            <Text style={s.stadiumStatLbl}>Inaugurado</Text>
          </View>
          <View style={s.stadiumStatDivider} />
          <View style={s.stadiumStat}>
            <MaterialCommunityIcons name="soccer" size={18} color={F.gold} />
            <Text style={s.stadiumStatVal}>Rayados</Text>
            <Text style={s.stadiumStatLbl}>Equipo local</Text>
          </View>
        </View>

        {/* Dirección */}
        <View style={s.stadiumAddrRow}>
          <Ionicons name="location" size={14} color={F.gold} />
          <Text style={s.stadiumAddr}>
            {ESTADIO_BBVA.ciudad}, {ESTADIO_BBVA.pais}
          </Text>
        </View>

        {/* Botón ver en mapa */}
        <Pressable
          style={({ pressed }) => [s.mapBtn, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          onPress={() =>
            router.push({
              pathname: '/(stack)/mapaCompleto',
              params: {
                latitude:  String(ESTADIO_BBVA.latitud),
                longitude: String(ESTADIO_BBVA.longitud),
                pinLat:    String(ESTADIO_BBVA.latitud),
                pinLng:    String(ESTADIO_BBVA.longitud),
                pinLabel:  ESTADIO_BBVA.nombre,
                pinSub:    `${ESTADIO_BBVA.ciudad} · FIFA World Cup 2026`,
              },
            })
          }
        >
          <Ionicons name="map" size={16} color="#fff" />
          <Text style={s.mapBtnText}>Ver ubicación en mapa</Text>
        </Pressable>
      </LinearGradient>

      {/* ════════════════════════════════════════════════════════════════════
          NOTICIA: PRIMER PARTIDO CLASIFICATORIO
      ════════════════════════════════════════════════════════════════════ */}
      <View style={s.sectionHeader}>
        <View style={s.sectionAccent} />
        <Text style={s.sectionTitle}>Noticias BBVA</Text>
      </View>

      <Pressable
        style={({ pressed }) => [s.noticiaCard, { opacity: pressed ? 0.9 : 1 }]}
        onPress={abrirNoticia}
      >
        <LinearGradient
          colors={['#0E1F3A', '#071428']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.noticiaGradient}
        >
          {/* Acento izquierdo */}
          <View style={s.noticiaAccent} />

          {/* Badge */}
          <View style={s.noticiaBadge}>
            <Text style={s.noticiaBadgeText}>⚽ CLASIFICATORIO</Text>
          </View>

          {/* Título */}
          <Text style={s.noticiaTitle}>
            ¡Estadio Monterrey fue sede del primer partido clasificatorio al Mundial 2026!
          </Text>

          {/* Resumen */}
          <Text style={s.noticiaDesc} numberOfLines={3}>
            Bolivia vs Surinam se enfrentaron en el Play-Off Intercontinental para
            definir el último boleto al FIFA World Cup 2026. Un adelanto mundialista
            en el Estadio BBVA.
          </Text>

          {/* Footer */}
          <View style={s.noticiaFooter}>
            <View style={s.noticiaSource}>
              <Ionicons name="globe-outline" size={12} color={F.textSub} />
              <Text style={s.noticiaSourceText}>estadio-bbva.mx</Text>
            </View>
            <View style={s.noticiaReadMore}>
              <Text style={s.noticiaReadMoreText}>Leer más</Text>
              <Ionicons name="arrow-forward" size={12} color={F.gold} />
            </View>
          </View>
        </LinearGradient>
      </Pressable>

      {/* ════════════════════════════════════════════════════════════════════
          NOTA + LINK OFICIAL FIFA
      ════════════════════════════════════════════════════════════════════ */}
      <View style={s.fifaSection}>
        {/* Nota de datos */}
        <View style={s.notaWrap}>
          <Ionicons name="information-circle-outline" size={14} color={F.textSub} />
          <Text style={s.notaText}>
            Calendario basado en el sorteo oficial FIFA (dic. 2025). Horarios en CST (UTC-6).
            El calendario y resultados pueden actualizarse.
          </Text>
        </View>

        {/* Botón oficial FIFA */}
        <Pressable
          style={({ pressed }) => [
            s.fifaBtn,
            { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          onPress={abrirFIFA}
        >
          <LinearGradient
            colors={[F.gold, '#D4940A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.fifaBtnGradient}
          >
            <MaterialCommunityIcons name="soccer-field" size={20} color="#000" />
            <Text style={s.fifaBtnText}>FIFA.com — Calendario Oficial</Text>
            <Ionicons name="open-outline" size={16} color="#000" />
          </LinearGradient>
        </Pressable>

        {/* FIFA branding footer */}
        <View style={s.brandingRow}>
          <Text style={s.brandingText}>⚽  FIFA WORLD CUP 2026™</Text>
          <Text style={s.brandingText}>🇺🇸 🇨🇦 🇲🇽</Text>
        </View>
      </View>

    </Animated.View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  root: {
    backgroundColor: F.bg,
    marginTop: 20,
    marginHorizontal: 0,
    paddingBottom: 8,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    // Sombra superior sutil
    ...Platform.select({
      ios: {
        shadowColor: F.gold,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  hero: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    gap: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  heroDeco1: {
    position: 'absolute',
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(240,180,41,0.04)',
    top: -80, right: -60,
  },
  heroDeco2: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(0,165,81,0.05)',
    bottom: -40, left: -30,
  },
  heroTop: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  sedes: {
    flexDirection: 'row', gap: 4,
  },
  sedeFlag: { fontSize: 20 },
  sedeLabelWrap: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  sedeLabel: {
    color: F.textMid, fontSize: 10, fontWeight: '800', letterSpacing: 1.2,
  },
  heroCenter: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  heroBall: {
    fontSize: 64,
    textShadowColor: 'rgba(0,165,81,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  heroTitleWrap: { flex: 1 },
  heroEyebrow: {
    color: F.textSub, fontSize: 11, fontWeight: '800', letterSpacing: 2.5, marginBottom: 2,
  },
  heroYear: {
    color: F.gold,
    fontSize: 58,
    fontWeight: '900',
    letterSpacing: -3,
    lineHeight: 60,
    textShadowColor: 'rgba(240,180,41,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  heroSub: {
    color: F.textMid, fontSize: 12, fontWeight: '600', marginTop: 2,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1, borderColor: F.border,
  },
  statChip: { flex: 1, alignItems: 'center', gap: 2 },
  statNum:  { color: F.white, fontWeight: '900', fontSize: 15 },
  statLbl:  { color: F.textSub, fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  statDivider: { width: 1, height: 28, backgroundColor: F.border },

  // ── Countdown ───────────────────────────────────────────────────────────────
  countSectionTorneo: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#0A1F14',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,165,81,0.35)',
    gap: 10,
  },
  countTorneoIcon: {
    fontSize: 15,
  },
  countTitleTorneo: {
    color: F.green,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  countTorneoSub: {
    color: F.textSub,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  countSection: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: F.cardMid,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: F.borderGold,
    gap: 12,
  },
  countHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  countHeaderLeft: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  countTitle: {
    color: F.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.2,
  },
  liveDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: F.red,
  },
  countMatch: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  countTeam: {
    color: F.white, fontSize: 18, fontWeight: '900', letterSpacing: -0.3, flex: 1,
    textAlign: 'center',
  },
  countVsDivider: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: F.goldDim,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: F.goldBorder,
  },
  countVs: {
    color: F.gold, fontWeight: '900', fontSize: 11, letterSpacing: 1,
  },
  countDateLabel: {
    color: F.textSub, fontSize: 11, fontWeight: '600', textAlign: 'center',
  },
  countUnits: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'center', gap: 6,
  },
  countColon: {
    color: F.gold, fontWeight: '900', fontSize: 22, marginTop: 10,
  },
  enVivoWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    justifyContent: 'center',
    backgroundColor: F.redDim, borderRadius: 10, padding: 10,
  },
  enVivoPulse: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: F.red,
  },
  enVivoText: {
    color: F.red, fontWeight: '800', fontSize: 12, letterSpacing: 0.3,
  },
  torneoFinWrap: {
    marginHorizontal: 20, marginTop: 16, padding: 14,
    backgroundColor: F.goldDim, borderRadius: 16,
    borderWidth: 1, borderColor: F.goldBorder,
    alignItems: 'center',
  },
  torneoFinText: { color: F.gold, fontWeight: '700', fontSize: 13 },

  // ── Section headers ─────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, marginTop: 22, marginBottom: 12,
  },
  sectionAccent: {
    width: 4, height: 20, borderRadius: 2, backgroundColor: F.gold,
  },
  sectionTitle: {
    color: F.white, fontWeight: '800', fontSize: 16, letterSpacing: -0.2, flex: 1,
  },
  sectionCount: {
    color: F.textSub, fontSize: 11, fontWeight: '600',
    backgroundColor: F.cardLight,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
  },

  // ── Carousel ────────────────────────────────────────────────────────────────
  carousel: {
    paddingHorizontal: 20, paddingRight: 28, paddingBottom: 4,
  },

  // ── Stadium card ─────────────────────────────────────────────────────────────
  stadiumCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: F.borderGold,
    gap: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  stadiumAccentBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 4,
    backgroundColor: F.gold,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  stadiumHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingLeft: 8,
  },
  stadiumName: {
    color: F.white, fontWeight: '900', fontSize: 20, letterSpacing: -0.4,
  },
  stadiumAlias: {
    color: F.gold, fontWeight: '600', fontSize: 12, marginTop: 2,
  },
  stadiumEmoji: { fontSize: 38 },
  stadiumDivider: {
    height: 1, backgroundColor: F.border, marginHorizontal: 8,
  },
  stadiumGrid: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8,
  },
  stadiumStat: {
    flex: 1, alignItems: 'center', gap: 4,
  },
  stadiumStatVal: {
    color: F.white, fontWeight: '900', fontSize: 14,
  },
  stadiumStatLbl: {
    color: F.textSub, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center',
  },
  stadiumStatDivider: {
    width: 1, height: 36, backgroundColor: F.border,
  },
  stadiumAddrRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8,
  },
  stadiumAddr: {
    color: F.textMid, fontSize: 12, fontWeight: '600',
  },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1A2E5E',
    borderRadius: 12, paddingVertical: 11, paddingHorizontal: 16,
    borderWidth: 1, borderColor: F.goldBorder,
    marginHorizontal: 8,
  },
  mapBtnText: {
    color: F.gold, fontWeight: '700', fontSize: 13,
  },

  // ── FIFA section ─────────────────────────────────────────────────────────────
  fifaSection: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 14,
  },
  notaWrap: {
    flexDirection: 'row', gap: 6, alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: F.border,
  },
  notaText: {
    color: F.textSub, fontSize: 10, fontWeight: '500', lineHeight: 15, flex: 1,
  },
  fifaBtn: {
    borderRadius: 16, overflow: 'hidden',
  },
  fifaBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 15, paddingHorizontal: 20,
  },
  fifaBtnText: {
    color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: -0.2, flex: 1,
    textAlign: 'center',
  },
  brandingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 4,
  },
  brandingText: {
    color: F.textSub, fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
  },

  // ── Header link BBVA ────────────────────────────────────────────────────────
  bbvaLinkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: F.goldDim,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: F.goldBorder,
  },
  bbvaLinkText: {
    color: F.gold, fontSize: 9, fontWeight: '700',
  },

  // ── Noticia card ─────────────────────────────────────────────────────────────
  noticiaCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  noticiaGradient: {
    padding: 16,
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  noticiaAccent: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 3,
    backgroundColor: F.gold,
  },
  noticiaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(240,180,41,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: F.goldBorder,
    marginLeft: 8,
  },
  noticiaBadgeText: {
    color: F.gold, fontSize: 9, fontWeight: '800', letterSpacing: 1,
  },
  noticiaTitle: {
    color: F.white,
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.2,
    paddingLeft: 8,
  },
  noticiaDesc: {
    color: F.textMid,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    paddingLeft: 8,
  },
  noticiaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 8,
    marginTop: 2,
  },
  noticiaSource: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  noticiaSourceText: {
    color: F.textSub, fontSize: 10, fontWeight: '500',
  },
  noticiaReadMore: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: F.goldDim,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: F.goldBorder,
  },
  noticiaReadMoreText: {
    color: F.gold, fontSize: 11, fontWeight: '700',
  },
});

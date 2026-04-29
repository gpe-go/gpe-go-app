/**
 * mundialService.ts
 * Servicio de datos en vivo para el widget del Mundial 2026.
 * Fuente: API-Football v3 (api-sports.io) — plan gratuito 100 req/día.
 *
 * Estrategia de caché conservadora para no superar el límite diario:
 *   • Sin partido hoy   → 4 horas
 *   • Día de partido    → 30 minutos
 *   • Partido en vivo   → 2 minutos
 *
 * Si la API falla, devuelve los datos estáticos de mundial2026.ts como fallback.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import {
  Equipo,
  FaseMundial,
  Partido,
  PARTIDOS_BBVA,
  toMatchDate,
} from '../data/mundial2026';

// ── API Config ────────────────────────────────────────────────────────────────
const API_KEY   = '855d7a073e2fee434348701154cb329f';
const BASE_URL  = 'https://v3.football.api-sports.io';
const LEAGUE_ID = 1;      // FIFA World Cup en API-Football
const SEASON    = 2026;

// ── Cache ─────────────────────────────────────────────────────────────────────
const CACHE_KEY         = '@gpe_mundial_v2';
const TTL_NORMAL_MS     = 4 * 60 * 60 * 1000;   // 4 h — días sin partido
const TTL_MATCHDAY_MS   = 30 * 60 * 1000;        // 30 min — día de partido
const TTL_LIVE_MS       = 2 * 60 * 1000;         // 2 min — partido en vivo

type CachePayload = {
  ts: number;
  partidos: Partido[];
  hasLive: boolean;
};

// ── Base de equipos (nombre API-Football → Equipo en español) ─────────────────
const TEAM_DB: Record<string, Equipo> = {
  // ── Grupo A ────────────────────────────────────────────────────────────────
  Mexico:         { nombre: 'México',        nombreCorto: 'México',     abrev: 'MEX', bandera: '🇲🇽', colorPrimario: '#006847', colorSecundario: '#FFFFFF' },
  'South Africa': { nombre: 'Sudáfrica',     nombreCorto: 'Sudáfrica',  abrev: 'RSA', bandera: '🇿🇦', colorPrimario: '#007A4D', colorSecundario: '#FFB81C' },
  'South Korea':  { nombre: 'Corea del Sur', nombreCorto: 'Corea del Sur', abrev: 'KOR', bandera: '🇰🇷', colorPrimario: '#C60C30', colorSecundario: '#003478' },
  'Czech Republic':{ nombre: 'Rep. Checa',  nombreCorto: 'R. Checa',   abrev: 'CZE', bandera: '🇨🇿', colorPrimario: '#D7141A', colorSecundario: '#FFFFFF' },
  // ── Grupo F ────────────────────────────────────────────────────────────────
  Netherlands:    { nombre: 'Países Bajos',  nombreCorto: 'P. Bajos',   abrev: 'NED', bandera: '🇳🇱', colorPrimario: '#FF6600', colorSecundario: '#FFFFFF' },
  Sweden:         { nombre: 'Suecia',        nombreCorto: 'Suecia',     abrev: 'SWE', bandera: '🇸🇪', colorPrimario: '#006AA7', colorSecundario: '#FECC02' },
  Tunisia:        { nombre: 'Túnez',         nombreCorto: 'Túnez',      abrev: 'TUN', bandera: '🇹🇳', colorPrimario: '#E70013', colorSecundario: '#FFFFFF' },
  Japan:          { nombre: 'Japón',         nombreCorto: 'Japón',      abrev: 'JPN', bandera: '🇯🇵', colorPrimario: '#BC002D', colorSecundario: '#FFFFFF' },
  // ── Europa ─────────────────────────────────────────────────────────────────
  France:         { nombre: 'Francia',       nombreCorto: 'Francia',    abrev: 'FRA', bandera: '🇫🇷', colorPrimario: '#003189', colorSecundario: '#FFFFFF' },
  Germany:        { nombre: 'Alemania',      nombreCorto: 'Alemania',   abrev: 'GER', bandera: '🇩🇪', colorPrimario: '#FFFFFF', colorSecundario: '#000000' },
  Spain:          { nombre: 'España',        nombreCorto: 'España',     abrev: 'ESP', bandera: '🇪🇸', colorPrimario: '#AA151B', colorSecundario: '#F1BF00' },
  Portugal:       { nombre: 'Portugal',      nombreCorto: 'Portugal',   abrev: 'POR', bandera: '🇵🇹', colorPrimario: '#006600', colorSecundario: '#FF0000' },
  England:        { nombre: 'Inglaterra',    nombreCorto: 'Inglaterra', abrev: 'ENG', bandera: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', colorPrimario: '#FFFFFF', colorSecundario: '#CF091B' },
  Italy:          { nombre: 'Italia',        nombreCorto: 'Italia',     abrev: 'ITA', bandera: '🇮🇹', colorPrimario: '#0066CC', colorSecundario: '#FFFFFF' },
  Belgium:        { nombre: 'Bélgica',       nombreCorto: 'Bélgica',    abrev: 'BEL', bandera: '🇧🇪', colorPrimario: '#EF3340', colorSecundario: '#000000' },
  Croatia:        { nombre: 'Croacia',       nombreCorto: 'Croacia',    abrev: 'CRO', bandera: '🇭🇷', colorPrimario: '#FF0000', colorSecundario: '#FFFFFF' },
  Serbia:         { nombre: 'Serbia',        nombreCorto: 'Serbia',     abrev: 'SRB', bandera: '🇷🇸', colorPrimario: '#C6363C', colorSecundario: '#0C4076' },
  Poland:         { nombre: 'Polonia',       nombreCorto: 'Polonia',    abrev: 'POL', bandera: '🇵🇱', colorPrimario: '#FFFFFF', colorSecundario: '#DC143C' },
  Denmark:        { nombre: 'Dinamarca',     nombreCorto: 'Dinamarca',  abrev: 'DEN', bandera: '🇩🇰', colorPrimario: '#C60C30', colorSecundario: '#FFFFFF' },
  Switzerland:    { nombre: 'Suiza',         nombreCorto: 'Suiza',      abrev: 'SUI', bandera: '🇨🇭', colorPrimario: '#FF0000', colorSecundario: '#FFFFFF' },
  Austria:        { nombre: 'Austria',       nombreCorto: 'Austria',    abrev: 'AUT', bandera: '🇦🇹', colorPrimario: '#ED2939', colorSecundario: '#FFFFFF' },
  Turkey:         { nombre: 'Turquía',       nombreCorto: 'Turquía',    abrev: 'TUR', bandera: '🇹🇷', colorPrimario: '#E30A17', colorSecundario: '#FFFFFF' },
  Ukraine:        { nombre: 'Ucrania',       nombreCorto: 'Ucrania',    abrev: 'UKR', bandera: '🇺🇦', colorPrimario: '#FFCC00', colorSecundario: '#005BBB' },
  Romania:        { nombre: 'Rumanía',       nombreCorto: 'Rumanía',    abrev: 'ROU', bandera: '🇷🇴', colorPrimario: '#002B7F', colorSecundario: '#FCD116' },
  Slovakia:       { nombre: 'Eslovaquia',    nombreCorto: 'Eslovaquia', abrev: 'SVK', bandera: '🇸🇰', colorPrimario: '#003DA5', colorSecundario: '#FFFFFF' },
  Hungary:        { nombre: 'Hungría',       nombreCorto: 'Hungría',    abrev: 'HUN', bandera: '🇭🇺', colorPrimario: '#CE2939', colorSecundario: '#FFFFFF' },
  Norway:         { nombre: 'Noruega',       nombreCorto: 'Noruega',    abrev: 'NOR', bandera: '🇳🇴', colorPrimario: '#EF2B2D', colorSecundario: '#FFFFFF' },
  Scotland:       { nombre: 'Escocia',       nombreCorto: 'Escocia',    abrev: 'SCO', bandera: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', colorPrimario: '#003078', colorSecundario: '#FFFFFF' },
  Greece:         { nombre: 'Grecia',        nombreCorto: 'Grecia',     abrev: 'GRE', bandera: '🇬🇷', colorPrimario: '#0D5EAF', colorSecundario: '#FFFFFF' },
  // ── América ────────────────────────────────────────────────────────────────
  'United States': { nombre: 'Estados Unidos', nombreCorto: 'EE.UU.', abrev: 'USA', bandera: '🇺🇸', colorPrimario: '#002868', colorSecundario: '#BF0A30' },
  USA:             { nombre: 'Estados Unidos', nombreCorto: 'EE.UU.', abrev: 'USA', bandera: '🇺🇸', colorPrimario: '#002868', colorSecundario: '#BF0A30' },
  Canada:          { nombre: 'Canadá',      nombreCorto: 'Canadá',     abrev: 'CAN', bandera: '🇨🇦', colorPrimario: '#FF0000', colorSecundario: '#FFFFFF' },
  Brazil:          { nombre: 'Brasil',      nombreCorto: 'Brasil',     abrev: 'BRA', bandera: '🇧🇷', colorPrimario: '#009C3B', colorSecundario: '#FFDF00' },
  Argentina:       { nombre: 'Argentina',   nombreCorto: 'Argentina',  abrev: 'ARG', bandera: '🇦🇷', colorPrimario: '#74ACDF', colorSecundario: '#FFFFFF' },
  Colombia:        { nombre: 'Colombia',    nombreCorto: 'Colombia',   abrev: 'COL', bandera: '🇨🇴', colorPrimario: '#FCD116', colorSecundario: '#003087' },
  Ecuador:         { nombre: 'Ecuador',     nombreCorto: 'Ecuador',    abrev: 'ECU', bandera: '🇪🇨', colorPrimario: '#FFD100', colorSecundario: '#034A8A' },
  Uruguay:         { nombre: 'Uruguay',     nombreCorto: 'Uruguay',    abrev: 'URU', bandera: '🇺🇾', colorPrimario: '#75AADB', colorSecundario: '#FFFFFF' },
  Chile:           { nombre: 'Chile',       nombreCorto: 'Chile',      abrev: 'CHI', bandera: '🇨🇱', colorPrimario: '#D52B1E', colorSecundario: '#FFFFFF' },
  Peru:            { nombre: 'Perú',        nombreCorto: 'Perú',       abrev: 'PER', bandera: '🇵🇪', colorPrimario: '#D91023', colorSecundario: '#FFFFFF' },
  Venezuela:       { nombre: 'Venezuela',   nombreCorto: 'Venezuela',  abrev: 'VEN', bandera: '🇻🇪', colorPrimario: '#CF142B', colorSecundario: '#FFD700' },
  Paraguay:        { nombre: 'Paraguay',    nombreCorto: 'Paraguay',   abrev: 'PAR', bandera: '🇵🇾', colorPrimario: '#D52B1E', colorSecundario: '#FFFFFF' },
  Bolivia:         { nombre: 'Bolivia',     nombreCorto: 'Bolivia',    abrev: 'BOL', bandera: '🇧🇴', colorPrimario: '#D52B1E', colorSecundario: '#007934' },
  'Costa Rica':    { nombre: 'Costa Rica',  nombreCorto: 'Costa Rica', abrev: 'CRC', bandera: '🇨🇷', colorPrimario: '#002B7F', colorSecundario: '#FFFFFF' },
  Honduras:        { nombre: 'Honduras',    nombreCorto: 'Honduras',   abrev: 'HON', bandera: '🇭🇳', colorPrimario: '#0073CF', colorSecundario: '#FFFFFF' },
  Panama:          { nombre: 'Panamá',      nombreCorto: 'Panamá',     abrev: 'PAN', bandera: '🇵🇦', colorPrimario: '#DA121A', colorSecundario: '#005293' },
  Jamaica:         { nombre: 'Jamaica',     nombreCorto: 'Jamaica',    abrev: 'JAM', bandera: '🇯🇲', colorPrimario: '#000000', colorSecundario: '#FED100' },
  // ── África ─────────────────────────────────────────────────────────────────
  Morocco:         { nombre: 'Marruecos',   nombreCorto: 'Marruecos',  abrev: 'MAR', bandera: '🇲🇦', colorPrimario: '#C1272D', colorSecundario: '#006233' },
  Senegal:         { nombre: 'Senegal',     nombreCorto: 'Senegal',    abrev: 'SEN', bandera: '🇸🇳', colorPrimario: '#00853F', colorSecundario: '#FDEF42' },
  Nigeria:         { nombre: 'Nigeria',     nombreCorto: 'Nigeria',    abrev: 'NGA', bandera: '🇳🇬', colorPrimario: '#008751', colorSecundario: '#FFFFFF' },
  Egypt:           { nombre: 'Egipto',      nombreCorto: 'Egipto',     abrev: 'EGY', bandera: '🇪🇬', colorPrimario: '#CE1126', colorSecundario: '#FFFFFF' },
  Cameroon:        { nombre: 'Camerún',     nombreCorto: 'Camerún',    abrev: 'CMR', bandera: '🇨🇲', colorPrimario: '#007A5E', colorSecundario: '#CE1126' },
  Ghana:           { nombre: 'Ghana',       nombreCorto: 'Ghana',      abrev: 'GHA', bandera: '🇬🇭', colorPrimario: '#006B3F', colorSecundario: '#FCD116' },
  "Côte d'Ivoire": { nombre: 'Costa de Marfil', nombreCorto: 'C. Marfil', abrev: 'CIV', bandera: '🇨🇮', colorPrimario: '#F77F00', colorSecundario: '#009A44' },
  'Ivory Coast':   { nombre: 'Costa de Marfil', nombreCorto: 'C. Marfil', abrev: 'CIV', bandera: '🇨🇮', colorPrimario: '#F77F00', colorSecundario: '#009A44' },
  Algeria:         { nombre: 'Argelia',     nombreCorto: 'Argelia',    abrev: 'ALG', bandera: '🇩🇿', colorPrimario: '#006233', colorSecundario: '#FFFFFF' },
  Mali:            { nombre: 'Mali',        nombreCorto: 'Mali',       abrev: 'MLI', bandera: '🇲🇱', colorPrimario: '#009A00', colorSecundario: '#FCD116' },
  'DR Congo':      { nombre: 'R.D. Congo',  nombreCorto: 'R.D. Congo', abrev: 'COD', bandera: '🇨🇩', colorPrimario: '#007FFF', colorSecundario: '#F7D618' },
  Angola:          { nombre: 'Angola',      nombreCorto: 'Angola',     abrev: 'ANG', bandera: '🇦🇴', colorPrimario: '#CC0000', colorSecundario: '#000000' },
  Tanzania:        { nombre: 'Tanzania',    nombreCorto: 'Tanzania',   abrev: 'TAN', bandera: '🇹🇿', colorPrimario: '#1EB53A', colorSecundario: '#FCD116' },
  Zambia:          { nombre: 'Zambia',      nombreCorto: 'Zambia',     abrev: 'ZAM', bandera: '🇿🇲', colorPrimario: '#198A00', colorSecundario: '#EF7D00' },
  // ── Asia / Oceanía ─────────────────────────────────────────────────────────
  'Saudi Arabia':  { nombre: 'Arabia Saudita', nombreCorto: 'Arabia S.', abrev: 'KSA', bandera: '🇸🇦', colorPrimario: '#006C35', colorSecundario: '#FFFFFF' },
  Iran:            { nombre: 'Irán',        nombreCorto: 'Irán',       abrev: 'IRN', bandera: '🇮🇷', colorPrimario: '#239F40', colorSecundario: '#FFFFFF' },
  Australia:       { nombre: 'Australia',   nombreCorto: 'Australia',  abrev: 'AUS', bandera: '🇦🇺', colorPrimario: '#FFD700', colorSecundario: '#006400' },
  Qatar:           { nombre: 'Qatar',       nombreCorto: 'Qatar',      abrev: 'QAT', bandera: '🇶🇦', colorPrimario: '#8D1B3D', colorSecundario: '#FFFFFF' },
  'China PR':      { nombre: 'China',       nombreCorto: 'China',      abrev: 'CHN', bandera: '🇨🇳', colorPrimario: '#DE2910', colorSecundario: '#FFDE00' },
  China:           { nombre: 'China',       nombreCorto: 'China',      abrev: 'CHN', bandera: '🇨🇳', colorPrimario: '#DE2910', colorSecundario: '#FFDE00' },
  Indonesia:       { nombre: 'Indonesia',   nombreCorto: 'Indonesia',  abrev: 'IDN', bandera: '🇮🇩', colorPrimario: '#CE1126', colorSecundario: '#FFFFFF' },
  Uzbekistan:      { nombre: 'Uzbekistán',  nombreCorto: 'Uzbekistán', abrev: 'UZB', bandera: '🇺🇿', colorPrimario: '#1EB53A', colorSecundario: '#FFFFFF' },
  Jordan:          { nombre: 'Jordania',    nombreCorto: 'Jordania',   abrev: 'JOR', bandera: '🇯🇴', colorPrimario: '#007A3D', colorSecundario: '#000000' },
  Iraq:            { nombre: 'Irak',        nombreCorto: 'Irak',       abrev: 'IRQ', bandera: '🇮🇶', colorPrimario: '#CE1126', colorSecundario: '#000000' },
  'New Zealand':   { nombre: 'Nueva Zelanda', nombreCorto: 'N. Zelanda', abrev: 'NZL', bandera: '🇳🇿', colorPrimario: '#000000', colorSecundario: '#FFFFFF' },
};

// Grupos conocidos por equipo (para etiquetar fase de grupos)
const EQUIPO_GRUPO: Record<string, string> = {
  Mexico: 'Grupo A', 'South Africa': 'Grupo A', 'South Korea': 'Grupo A', 'Czech Republic': 'Grupo A',
  Netherlands: 'Grupo F', Sweden: 'Grupo F', Tunisia: 'Grupo F', Japan: 'Grupo F',
};

// FIFA match numbers conocidos (por combinación de equipos)
const KNOWN_MATCH_NUMS: Array<{ t1: string; t2: string; num: number }> = [
  { t1: 'Sweden',       t2: 'Tunisia',      num: 12 },
  { t1: 'Tunisia',      t2: 'Japan',        num: 36 },
  { t1: 'South Africa', t2: 'South Korea',  num: 54 },
  { t1: 'TBD',          t2: 'TBD',          num: 75 },
];

// ── Helpers de mapeo ──────────────────────────────────────────────────────────

/** Estado API-Football → nuestro tipo */
function mapEstado(short: string): Partido['estado'] {
  const LIVE = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT', 'LIVE'];
  const DONE = ['FT', 'AET', 'PEN'];
  if (LIVE.includes(short)) return 'en_vivo';
  if (DONE.includes(short)) return 'finalizado';
  return 'programado';
}

/** Round string → FaseMundial */
function mapFase(round: string): FaseMundial {
  const r = round.toLowerCase();
  if (r.includes('group'))   return 'Fase de Grupos';
  if (r.includes('32'))      return 'Ronda de 32';
  if (r.includes('quarter')) return 'Cuartos de Final';
  if (r.includes('semi'))    return 'Semifinal';
  if (r.includes('final'))   return 'Final';
  return 'Fase de Grupos';
}

/** Extrae jornada del string "Group Stage - 2" → 2 */
function mapJornada(round: string): number | null {
  const m = round.match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Construye un Equipo desde la respuesta de la API.
 * Si el equipo está en TEAM_DB, usa los datos en español con bandera.
 * Si no, genera un fallback legible usando nombre y abreviatura del API.
 */
function buildEquipo(apiTeam: { id: number; name: string; code: string | null; logo: string }): Equipo {
  const known = TEAM_DB[apiTeam.name];
  if (known) return known;

  // Para equipos TBD o desconocidos: construir con lo que da la API
  if (!apiTeam.id || apiTeam.name === 'TBD' || !apiTeam.name) {
    return {
      nombre: 'Por definir', nombreCorto: 'Por definir', abrev: 'TBD',
      bandera: '🏳️', colorPrimario: '#374151', colorSecundario: '#6B7280',
    };
  }

  return {
    nombre:        apiTeam.name,
    nombreCorto:   apiTeam.name,
    abrev:         apiTeam.code ?? apiTeam.name.substring(0, 3).toUpperCase(),
    bandera:       '🏳️',
    colorPrimario: '#374151',
    colorSecundario: '#6B7280',
  };
}

/** Convierte un fixture de la API a nuestro tipo Partido */
function mapFixture(f: any, idx: number): Partido {
  const t1Name: string = f.teams?.home?.name ?? '';
  const t2Name: string = f.teams?.away?.name ?? '';

  const equipo1 = buildEquipo(f.teams?.home ?? { id: 0, name: '', code: null, logo: '' });
  const equipo2 = buildEquipo(f.teams?.away ?? { id: 0, name: '', code: null, logo: '' });

  const fase      = mapFase(f.league?.round ?? '');
  const jornada   = fase === 'Fase de Grupos' ? mapJornada(f.league?.round ?? '') : null;
  const grupo     = EQUIPO_GRUPO[t1Name] ?? EQUIPO_GRUPO[t2Name] ?? null;
  const estado    = mapEstado(f.fixture?.status?.short ?? 'NS');

  // Fecha y hora local CST (la API devuelve ISO con timezone)
  const rawDate: string = f.fixture?.date ?? '';
  let fecha = '1970-01-01';
  let hora  = '00:00';
  if (rawDate) {
    // Convertir a fecha local de Monterrey (UTC-6)
    const d = new Date(rawDate);
    const local = new Date(d.getTime() - 6 * 3_600_000); // UTC-6
    fecha = local.toISOString().split('T')[0];
    hora  = local.toISOString().split('T')[1].substring(0, 5);
  }

  // Resultado
  const g1 = f.goals?.home;
  const g2 = f.goals?.away;
  const resultado = (g1 !== null && g1 !== undefined && g2 !== null && g2 !== undefined)
    ? { g1: g1 as number, g2: g2 as number }
    : null;

  // Buscar matchNum conocido
  const knownMatch = KNOWN_MATCH_NUMS.find(k =>
    (k.t1 === t1Name && k.t2 === t2Name) ||
    (k.t2 === t1Name && k.t1 === t2Name),
  );
  const matchNum = knownMatch?.num ?? (f.fixture?.id ?? idx + 1);

  return {
    id:       `api-${f.fixture?.id ?? idx}`,
    matchNum,
    fase,
    grupo,
    jornada,
    fecha,
    hora,
    equipo1,
    equipo2,
    resultado,
    estado,
  };
}

// ── Lógica de caché ───────────────────────────────────────────────────────────

function getCacheTTL(partidos: Partido[]): number {
  const ahora = Date.now();
  const hasLive = partidos.some(p => p.estado === 'en_vivo');
  if (hasLive) return TTL_LIVE_MS;

  // ¿Hay algún partido hoy?
  const hoy = new Date().toISOString().split('T')[0];
  const matchToday = partidos.some(p => p.fecha === hoy);
  return matchToday ? TTL_MATCHDAY_MS : TTL_NORMAL_MS;
}

async function getCache(): Promise<CachePayload | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachePayload;
  } catch {
    return null;
  }
}

async function setCache(partidos: Partido[]): Promise<void> {
  try {
    const payload: CachePayload = {
      ts:       Date.now(),
      partidos,
      hasLive:  partidos.some(p => p.estado === 'en_vivo'),
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('[MundialService] Error guardando caché:', e);
  }
}

// Equipos que juegan en el BBVA (para filtro alternativo si falla por venue)
const BBVA_TEAM_MATCHES: Array<[string, string]> = [
  ['Sweden',       'Tunisia'],
  ['Tunisia',      'Japan'],
  ['South Africa', 'South Korea'],
];

// ── Buscar league ID correcto para WC 2026 ────────────────────────────────────

async function findWCLeagueId(): Promise<number> {
  try {
    const { data } = await axios.get(`${BASE_URL}/leagues`, {
      headers: { 'x-apisports-key': API_KEY },
      params:  { type: 'Cup', season: SEASON },
      timeout: 10_000,
    });
    if (!Array.isArray(data?.response)) return LEAGUE_ID;

    // Buscar "World Cup" en el nombre
    const wc = (data.response as any[]).find((l: any) => {
      const name = (l.league?.name ?? '').toLowerCase();
      return name.includes('world cup') || name.includes('mundial');
    });
    if (wc) {
      console.log(`[MundialService] WC 2026 league encontrada: id=${wc.league.id} name="${wc.league.name}"`);
      return wc.league.id as number;
    }

    // Log primeras 10 ligas para diagnóstico
    const names = (data.response as any[]).slice(0, 10).map((l: any) =>
      `id=${l.league?.id} "${l.league?.name}"`
    );
    console.warn('[MundialService] Ligas Copa 2026 disponibles:\n' + names.join('\n'));
  } catch (e) {
    console.warn('[MundialService] No se pudo buscar league ID:', e);
  }
  return LEAGUE_ID;
}

// ── Llamada a la API ──────────────────────────────────────────────────────────

async function fetchFromAPI(): Promise<Partido[]> {
  // Primer intento con league ID configurado
  const leagueId = await findWCLeagueId();

  const { data } = await axios.get(`${BASE_URL}/fixtures`, {
    headers: { 'x-apisports-key': API_KEY },
    params:  { league: leagueId, season: SEASON },
    timeout: 12_000,
  });

  // Log de errores de la API si los hay
  if (data?.errors && Object.keys(data.errors).length > 0) {
    console.warn('[MundialService] Errores de API:', JSON.stringify(data.errors));
  }

  if (!Array.isArray(data?.response)) {
    throw new Error(`Respuesta inesperada de la API. Errors: ${JSON.stringify(data?.errors)}`);
  }

  const all = data.response as any[];
  console.log(`[MundialService] Total fixtures WC2026 (league=${leagueId}): ${all.length}`);

  // ── Fallback inmediato si la API no tiene datos ────────────────────────────
  if (all.length === 0) {
    console.warn('[MundialService] API sin fixtures para WC2026. Usando datos estáticos.');
    return PARTIDOS_BBVA;
  }

  // ── Intento 1: filtrar por nombre/ciudad del estadio ─────────────────────
  let bbvaFixtures = all.filter((f) => {
    const venue = (f.fixture?.venue?.name ?? '').toLowerCase();
    const city  = (f.fixture?.venue?.city ?? '').toLowerCase();
    return (
      venue.includes('bbva') ||
      venue.includes('bancomer') ||
      city.includes('guadalupe') ||
      city.includes('monterrey') ||
      city.includes('nuevo leon') ||
      city.includes('nuevo león')
    );
  });

  // ── Si no encontró por venue: log + intento 2 por equipos ─────────────────
  if (bbvaFixtures.length === 0) {
    const uniqueVenues = [...new Set(
      all.map((f) => `"${f.fixture?.venue?.name ?? '?'}" — ${f.fixture?.venue?.city ?? '?'}`)
    )].slice(0, 30);
    console.warn('[MundialService] Venues en la API:\n' + uniqueVenues.join('\n'));

    bbvaFixtures = all.filter((f) => {
      const h = f.teams?.home?.name ?? '';
      const a = f.teams?.away?.name ?? '';
      return BBVA_TEAM_MATCHES.some(
        ([t1, t2]) => (h === t1 && a === t2) || (h === t2 && a === t1),
      );
    });

    if (bbvaFixtures.length > 0) {
      console.log(`[MundialService] ${bbvaFixtures.length} partidos encontrados por equipos.`);
    } else {
      console.warn('[MundialService] Sin partidos BBVA por venue ni equipos. Usando datos estáticos.');
      return PARTIDOS_BBVA;
    }
  }

  // Ordenar por fecha
  bbvaFixtures.sort((a, b) =>
    new Date(a.fixture?.date).getTime() - new Date(b.fixture?.date).getTime(),
  );

  return bbvaFixtures.map(mapFixture);
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Obtiene los partidos del BBVA.
 * - Si el caché es fresco → devuelve caché (sin consumir petición API)
 * - Si expiró → llama a la API, actualiza caché y devuelve datos frescos
 * - Si la API falla → devuelve caché expirado si existe, si no los datos estáticos
 *
 * @param forceRefresh  Si true, ignora el caché y fuerza una nueva petición
 */
export async function getBBVAPartidos(forceRefresh = false): Promise<{
  partidos: Partido[];
  fromCache: boolean;
  lastUpdated: number | null;
}> {
  const cached = await getCache();

  if (!forceRefresh && cached) {
    const ttl = getCacheTTL(cached.partidos);
    if (Date.now() - cached.ts < ttl) {
      return { partidos: cached.partidos, fromCache: true, lastUpdated: cached.ts };
    }
  }

  try {
    const partidos = await fetchFromAPI();
    await setCache(partidos);
    return { partidos, fromCache: false, lastUpdated: Date.now() };
  } catch (err) {
    console.warn('[MundialService] Error de API:', err);
    // Fallback: caché expirado o datos estáticos
    if (cached) {
      return { partidos: cached.partidos, fromCache: true, lastUpdated: cached.ts };
    }
    return { partidos: PARTIDOS_BBVA, fromCache: true, lastUpdated: null };
  }
}

/** Limpia el caché (útil para debug o settings) */
export async function clearCache(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
}

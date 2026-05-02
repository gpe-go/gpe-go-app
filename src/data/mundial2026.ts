/**
 * mundial2026.ts
 * Datos del FIFA World Cup 2026 — Partidos en Estadio BBVA, Guadalupe NL.
 *
 * Fuente: Sorteo oficial FIFA (dic. 2025) + calendario publicado FIFA.com
 * Horarios en Tiempo Central Estándar (CST · UTC-6, Nuevo León permanente).
 * Verifica el calendario actualizado en:
 * https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026
 */

import i18n from '../i18n/i18n';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type Equipo = {
  nombre: string;
  nombreCorto: string;
  abrev: string;    // 3 letras FIFA
  bandera: string;  // emoji
  colorPrimario: string;
  colorSecundario: string;
};

export type Partido = {
  id: string;
  matchNum: number;            // Número de partido FIFA oficial
  fase: FaseMundial;
  grupo: string | null;        // "Grupo A", "Grupo F", etc. — null en eliminatoria
  jornada: number | null;      // 1, 2, 3 en fase de grupos
  fecha: string;               // "YYYY-MM-DD"
  hora: string;                // "HH:MM" horario CST (UTC-6)
  equipo1: Equipo;
  equipo2: Equipo;
  resultado: { g1: number; g2: number } | null;
  estado: 'programado' | 'en_vivo' | 'finalizado';
};

export type FaseMundial =
  | 'Fase de Grupos'
  | 'Ronda de 32'
  | 'Cuartos de Final'
  | 'Semifinal'
  | 'Final';

// ── Equipos ───────────────────────────────────────────────────────────────────

// Grupo F: Países Bajos · Japón · Suecia · Túnez
// Grupo A: México · Sudáfrica · Corea del Sur · República Checa

const SWE: Equipo = {
  nombre: 'Suecia',
  nombreCorto: 'Suecia',
  abrev: 'SWE',
  bandera: '🇸🇪',
  colorPrimario: '#006AA7',
  colorSecundario: '#FECC02',
};
const TUN: Equipo = {
  nombre: 'Túnez',
  nombreCorto: 'Túnez',
  abrev: 'TUN',
  bandera: '🇹🇳',
  colorPrimario: '#E70013',
  colorSecundario: '#FFFFFF',
};
const JPN: Equipo = {
  nombre: 'Japón',
  nombreCorto: 'Japón',
  abrev: 'JPN',
  bandera: '🇯🇵',
  colorPrimario: '#BC002D',
  colorSecundario: '#FFFFFF',
};
const RSA: Equipo = {
  nombre: 'Sudáfrica',
  nombreCorto: 'Sudáfrica',
  abrev: 'RSA',
  bandera: '🇿🇦',
  colorPrimario: '#007A4D',
  colorSecundario: '#FFB81C',
};
const KOR: Equipo = {
  nombre: 'Corea del Sur',
  nombreCorto: 'Corea del Sur',
  abrev: 'KOR',
  bandera: '🇰🇷',
  colorPrimario: '#C60C30',
  colorSecundario: '#003478',
};
const TBD: Equipo = {
  nombre: 'Por definir',
  nombreCorto: 'Por definir',
  abrev: 'TBD',
  bandera: '🏳️',
  colorPrimario: '#374151',
  colorSecundario: '#6B7280',
};

// ── Partidos en Estadio BBVA ──────────────────────────────────────────────────
//  Grupo F: Países Bajos · Japón · Suecia · Túnez
//  Grupo A: México · Sudáfrica · Corea del Sur · República Checa
//  Sorteo oficial FIFA dic. 2025. Actualiza `resultado` y `estado` conforme
//  avancen los partidos.

export const PARTIDOS_BBVA: Partido[] = [
  // ── Grupo F — Jornada 1 ────────────────────────────────────────────────────
  {
    id: 'm1',
    matchNum: 12,
    fase: 'Fase de Grupos',
    grupo: 'Grupo F',
    jornada: 1,
    fecha: '2026-06-14',
    hora: '20:00',
    equipo1: SWE,
    equipo2: TUN,
    resultado: null,
    estado: 'programado',
  },
  // ── Grupo F — Jornada 2 ────────────────────────────────────────────────────
  {
    id: 'm2',
    matchNum: 36,
    fase: 'Fase de Grupos',
    grupo: 'Grupo F',
    jornada: 2,
    fecha: '2026-06-20',
    hora: '22:00',
    equipo1: TUN,
    equipo2: JPN,
    resultado: null,
    estado: 'programado',
  },
  // ── Grupo A — Jornada 3 (simultáneas) ─────────────────────────────────────
  {
    id: 'm3',
    matchNum: 54,
    fase: 'Fase de Grupos',
    grupo: 'Grupo A',
    jornada: 3,
    fecha: '2026-06-24',
    hora: '19:00',
    equipo1: RSA,
    equipo2: KOR,
    resultado: null,
    estado: 'programado',
  },
  // ── Ronda de 32 ────────────────────────────────────────────────────────────
  {
    id: 'm4',
    matchNum: 75,
    fase: 'Ronda de 32',
    grupo: null,
    jornada: null,
    fecha: '2026-06-29',
    hora: '19:00',
    equipo1: TBD,   // 1° Grupo F
    equipo2: TBD,   // 2° Grupo C
    resultado: null,
    estado: 'programado',
  },
];

// ── Info del estadio ──────────────────────────────────────────────────────────

export const ESTADIO_BBVA = {
  nombre: 'Estadio BBVA',
  alias: 'Gigante de Acero',
  ciudad: 'Guadalupe, Nuevo León',
  pais: 'México',
  capacidadMundial: 53_500,
  inaugurado: 2015,
  equipo: 'CF Monterrey (Rayados)',
  latitud: 25.6692,
  longitud: -100.2444,
};

// ── Datos del torneo ──────────────────────────────────────────────────────────

export const TORNEO = {
  nombre: 'FIFA World Cup 2026™',
  edicion: '23ª edición',
  sedes: ['Estados Unidos', 'México', 'Canadá'],
  equipos: 48,
  partidos: 104,
  inicioFase: '2026-06-11',  // Partido inaugural: México vs Sudáfrica (Estadio Azteca)
  inicioHora: '13:00',       // 1:00 PM CST (UTC-6)
  finalFase:  '2026-07-19',  // Gran Final (MetLife Stadium, NY/NJ)
  mascota: 'Peaks',
  balon: 'Adidas Merlin',
  fifaUrl: 'https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026',
};

// ── Helpers exportados ────────────────────────────────────────────────────────

/**
 * Mapa de idioma corto → código BCP-47 que usa Intl.DateTimeFormat.
 * Si el idioma no está en el mapa, cae a 'es-MX' por defecto.
 */
const LOCALE_MAP: Record<string, string> = {
  es: 'es-MX', en: 'en-US', fr: 'fr-FR', pt: 'pt-BR', de: 'de-DE',
  ja: 'ja-JP', ar: 'ar-EG', af: 'af-ZA', ko: 'ko-KR', nl: 'nl-NL',
  uk: 'uk-UA', sv: 'sv-SE', pl: 'pl-PL', sq: 'sq-AL',
};

/** Devuelve el locale actual para Intl, basado en el idioma activo de i18n */
function getCurrentLocale(): string {
  const lang = (i18n.language || 'es').slice(0, 2).toLowerCase();
  return LOCALE_MAP[lang] || 'es-MX';
}

/** Capitaliza la primera letra (algunos locales devuelven en minúsculas) */
function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Devuelve la fecha de inicio del partido como objeto Date (CST = UTC-6).
 * Nota: Nuevo León permanece en UTC-6 todo el año (sin cambio de horario).
 */
export function toMatchDate(fecha: string, hora: string): Date {
  return new Date(`${fecha}T${hora}:00-06:00`);
}

/** Fecha de inicio del torneo completo (partido inaugural) */
export function toTorneoStartDate(): Date {
  return new Date(`${TORNEO.inicioFase}T${TORNEO.inicioHora}:00-06:00`);
}

/**
 * Formatea "2026-06-14" → "Dom 14 Jun 2026" (es) / "Sun 14 Jun 2026" (en) / etc.
 * El idioma se toma automáticamente del idioma activo de i18n.
 */
export function formatFechaLarga(fecha: string): string {
  const d = new Date(`${fecha}T12:00:00`);
  const locale = getCurrentLocale();
  try {
    const dia = cap(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d));
    const num = d.getDate();
    const mes = cap(new Intl.DateTimeFormat(locale, { month: 'short' }).format(d).replace('.', ''));
    const year = d.getFullYear();
    return `${dia} ${num} ${mes} ${year}`;
  } catch {
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
}

/**
 * Formatea "2026-06-14" → "14 Jun" (es) / "Jun 14" (en, según locale).
 * Usa solo día + mes corto, en el formato natural del idioma.
 */
export function formatFechaCorta(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12);
  const locale = getCurrentLocale();
  try {
    return cap(
      new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
        .format(date)
        .replace('.', ''),
    );
  } catch {
    return `${d}/${m}`;
  }
}

/** Convierte hora "17:00" → "17:00 CST" (CST es estándar internacional) */
export function formatHora(hora: string): string {
  return `${hora} CST`;
}

/** Devuelve el siguiente partido no finalizado, o null si ya terminó el torneo */
export function getProximoPartido(): Partido | null {
  const ahora = Date.now();
  return (
    PARTIDOS_BBVA.find(
      (p) =>
        p.estado !== 'finalizado' &&
        toMatchDate(p.fecha, p.hora).getTime() >= ahora - 2 * 3_600_000,
    ) ?? null
  );
}

/** Cuenta cuántos partidos quedan por jugarse */
export function partidosPendientes(): number {
  const ahora = Date.now();
  return PARTIDOS_BBVA.filter(
    (p) => p.estado !== 'finalizado' && toMatchDate(p.fecha, p.hora).getTime() > ahora,
  ).length;
}

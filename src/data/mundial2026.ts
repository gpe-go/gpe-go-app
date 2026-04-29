/**
 * mundial2026.ts
 * Datos del FIFA World Cup 2026 — Partidos en Estadio BBVA, Guadalupe NL.
 *
 * Fuente: Sorteo oficial FIFA (5 dic. 2024) + calendario publicado FIFA.com
 * Horarios en Tiempo del Centro (CDT · UTC-5, horario de verano).
 * Verifica el calendario actualizado en: https://www.fifa.com/es/fifaworldcup/2026
 */

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
  hora: string;                // "HH:MM" horario CDT (UTC-5)
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

const ARG: Equipo = {
  nombre: 'Argentina',
  nombreCorto: 'Argentina',
  abrev: 'ARG',
  bandera: '🇦🇷',
  colorPrimario: '#74ACDF',
  colorSecundario: '#FFFFFF',
};
const MAR: Equipo = {
  nombre: 'Marruecos',
  nombreCorto: 'Marruecos',
  abrev: 'MAR',
  bandera: '🇲🇦',
  colorPrimario: '#C1272D',
  colorSecundario: '#006233',
};
const ECU: Equipo = {
  nombre: 'Ecuador',
  nombreCorto: 'Ecuador',
  abrev: 'ECU',
  bandera: '🇪🇨',
  colorPrimario: '#FFD100',
  colorSecundario: '#034A8A',
};
const KSA: Equipo = {
  nombre: 'Arabia Saudita',
  nombreCorto: 'Arabia Saudita',
  abrev: 'KSA',
  bandera: '🇸🇦',
  colorPrimario: '#006C35',
  colorSecundario: '#FFFFFF',
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
//  Grupo F: Argentina · Marruecos · Ecuador · Arabia Saudita
//  Nota: asignaciones de grupo verificadas en sorteo FIFA dic. 2024.
//  Actualiza el campo `resultado` y `estado` conforme avancen los partidos.

export const PARTIDOS_BBVA: Partido[] = [
  // ── Jornada 1 ──────────────────────────────────────────────────────────────
  {
    id: 'm1',
    matchNum: 8,
    fase: 'Fase de Grupos',
    grupo: 'Grupo F',
    jornada: 1,
    fecha: '2026-06-12',
    hora: '17:00',
    equipo1: ARG,
    equipo2: MAR,
    resultado: null,
    estado: 'programado',
  },
  {
    id: 'm2',
    matchNum: 10,
    fase: 'Fase de Grupos',
    grupo: 'Grupo F',
    jornada: 1,
    fecha: '2026-06-13',
    hora: '14:00',
    equipo1: ECU,
    equipo2: KSA,
    resultado: null,
    estado: 'programado',
  },
  // ── Jornada 2 ──────────────────────────────────────────────────────────────
  {
    id: 'm3',
    matchNum: 22,
    fase: 'Fase de Grupos',
    grupo: 'Grupo F',
    jornada: 2,
    fecha: '2026-06-18',
    hora: '20:00',
    equipo1: ARG,
    equipo2: ECU,
    resultado: null,
    estado: 'programado',
  },
  {
    id: 'm4',
    matchNum: 26,
    fase: 'Fase de Grupos',
    grupo: 'Grupo F',
    jornada: 2,
    fecha: '2026-06-19',
    hora: '17:00',
    equipo1: MAR,
    equipo2: KSA,
    resultado: null,
    estado: 'programado',
  },
  // ── Jornada 3 (simultáneas) ────────────────────────────────────────────────
  {
    id: 'm5',
    matchNum: 38,
    fase: 'Fase de Grupos',
    grupo: 'Grupo F',
    jornada: 3,
    fecha: '2026-06-24',
    hora: '17:00',
    equipo1: ARG,
    equipo2: KSA,
    resultado: null,
    estado: 'programado',
  },
  // ── Ronda de 32 ────────────────────────────────────────────────────────────
  {
    id: 'm6',
    matchNum: 67,
    fase: 'Ronda de 32',
    grupo: null,
    jornada: null,
    fecha: '2026-07-02',
    hora: '20:00',
    equipo1: TBD,
    equipo2: TBD,
    resultado: null,
    estado: 'programado',
  },
];

// ── Info del estadio ──────────────────────────────────────────────────────────

export const ESTADIO_BBVA = {
  nombre: 'Estadio BBVA',
  alias: 'La Pandilla',
  ciudad: 'Guadalupe, Nuevo León',
  pais: 'México',
  capacidadMundial: 53_500,
  inaugurado: 2015,
  equipo: 'CF Monterrey (Rayados)',
  latitud: 25.6694,
  longitud: -100.2407,
  // Imagen libre de Wikimedia
  imagenUrl:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Estadio_BBVA_Bancomer_3.jpg/1200px-Estadio_BBVA_Bancomer_3.jpg',
};

// ── Datos del torneo ──────────────────────────────────────────────────────────

export const TORNEO = {
  nombre: 'FIFA World Cup 2026™',
  edicion: '23ª edición',
  sedes: ['Estados Unidos', 'México', 'Canadá'],
  equipos: 48,
  partidos: 104,
  inicioFase: '2026-06-11',  // Partido inaugural
  finalFase:  '2026-07-19',  // Gran Final (MetLife Stadium, NY/NJ)
  mascota: 'Peaks',
  balon: 'Adidas Merlin',
  fifaUrl: 'https://www.fifa.com/es/fifaworldcup/2026',
};

// ── Helpers exportados ────────────────────────────────────────────────────────

const MESES_ES = [
  'Ene','Feb','Mar','Abr','May',
  'Jun','Jul','Ago','Sep','Oct','Nov','Dic',
];
const DIAS_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

/** Devuelve la fecha de inicio del partido como objeto Date (CDT = UTC-5) */
export function toMatchDate(fecha: string, hora: string): Date {
  return new Date(`${fecha}T${hora}:00-05:00`);
}

/** Formatea "2026-06-12" → "Vie 12 Jun 2026" */
export function formatFechaLarga(fecha: string): string {
  const d = new Date(`${fecha}T12:00:00`);
  const dia  = DIAS_ES[d.getDay()];
  const num  = d.getDate();
  const mes  = MESES_ES[d.getMonth()];
  const year = d.getFullYear();
  return `${dia} ${num} ${mes} ${year}`;
}

/** Formatea "2026-06-12" → "12 Jun" */
export function formatFechaCorta(fecha: string): string {
  const [, m, d] = fecha.split('-').map(Number);
  return `${d} ${MESES_ES[m - 1]}`;
}

/** Convierte hora "17:00" → "17:00 CDT" */
export function formatHora(hora: string): string {
  return `${hora} CDT`;
}

/** Devuelve el siguiente partido no finalizado, o null si ya terminó el torneo */
export function getProximoPartido(): Partido | null {
  const ahora = Date.now();
  return (
    PARTIDOS_BBVA.find(
      (p) =>
        p.estado !== 'finalizado' &&
        toMatchDate(p.fecha, p.hora).getTime() >= ahora - 2 * 3_600_000, // hasta 2h antes del inicio
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

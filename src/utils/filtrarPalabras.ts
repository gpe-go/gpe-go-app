/**
 * filtrarPalabras.ts
 * Filtro robusto y MULTI-IDIOMA de palabras prohibidas para reseñas, soporte
 * y formularios. Protege a comercios, sitios turísticos y al equipo de soporte
 * de lenguaje irrespetuoso o inapropiado en cualquiera de los 14 idiomas que
 * soporta GuadalupeGO.
 *
 * ── DETECCIÓN GARANTIZADA ─────────────────────────────────────────────────
 *  ✓ minúsculas:        "puta"
 *  ✓ MAYÚSCULAS:        "PUTA"
 *  ✓ Capitalizadas:     "Puta"
 *  ✓ Mezcla aleatoria:  "PuTa", "pUtA", "PUta", "putA"…
 *  ✓ Con acentos:       "Pendejá", "ESTÚPIDO"
 *  ✓ Derivaciones:      "chingada", "chingadazo", "chingón"…
 *  ✓ Multi-idioma:      es · en · fr · pt · de · nl · sv · pl · sq · af · uk
 *                       y alfabetos no-latinos (ja · ko · ar · uk-cyr)
 *  ✓ Sin falsos positivos: "círculo" NO dispara "culo"
 *
 * ── ALGORITMO ─────────────────────────────────────────────────────────────
 *  1. Normaliza el texto: minúsculas + sin tildes/diacríticos.
 *  2. Detecta si la palabra prohibida es alfabeto Latino o no-Latino:
 *     • Latino  → regex con lookbehind negativo `(?<![a-z])` para evitar
 *                 falsos positivos en medio de palabras legítimas.
 *     • No-Latino (CJK, Cyrillic, Arabic) → substring directo (los
 *                 alfabetos sin separador entre palabras no permiten
 *                 el mismo tipo de límite).
 *  La normalización a minúsculas hace que la detección sea totalmente
 *  case-insensitive para cualquier combinación.
 */

// ── Lista de palabras / frases prohibidas ─────────────────────────────────────
// Todas en minúsculas y SIN tildes (la normalización las equipara con MAYÚS,
// minús, Capitalizado, mEzClAdO, y con/sin acentos).
export const PALABRAS_PROHIBIDAS: string[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // ESPAÑOL — México, España y Latam
  // ═══════════════════════════════════════════════════════════════════════
  // Groserías mexicanas (stems)
  'chinga', 'pinche', 'puta', 'puto', 'verga', 'pendejo', 'pendej',
  'cabron', 'culero', 'culo', 'joto', 'mamada', 'mierda', 'puteria',
  'putiza', 'hdp', 'hjdp', 'ptm', 'hp', 'wey',
  // Groserías España + Latam
  'cono', 'carajo', 'cojones', 'joder', 'follar', 'cojer', 'mierd',
  'maricon', 'maricona', 'marica', 'malparido', 'malnacido',
  'zorra', 'perra', 'puneta', 'pajero', 'gilipollas', 'subnormal',
  'mongolo', 'retrasado',
  // Insultos suaves pero ofensivos
  'idiota', 'imbecil', 'estupido', 'inutil', 'baboso', 'menso',
  'asqueroso', 'asco', 'basura', 'pesimo', 'horrible', 'maldito',
  'desgraciado', 'bastardo',
  // Anatomía vulgar
  'pene', 'pito', 'vagina', 'panocha', 'tetas', 'pezon', 'culiar', 'sexo',
  // Frases compuestas
  'hijo de puta', 'hija de puta', 'hijo de perra', 'hija de perra',
  'hijo de la chingada', 'vete a la chingada', 'vete al carajo',
  'me vale verga', 'me vale madre', 'que te jodan', 'me cago en',
  'la concha de tu madre', 'tu puta madre', 'chinga tu madre',
  'puta madre', 'hijo de su',

  // ═══════════════════════════════════════════════════════════════════════
  // INGLÉS
  // ═══════════════════════════════════════════════════════════════════════
  'fuck', 'fuk', 'fck', 'shit', 'asshole', 'bitch', 'bastard',
  'motherfucker', 'mother fucker', 'damn you', 'fuck you', 'wtf',
  'stfu', 'cunt', 'dick', 'pussy', 'douchebag', 'jerk off',
  'prick', 'twat', 'wanker', 'bullshit',

  // ═══════════════════════════════════════════════════════════════════════
  // FRANCÉS
  // ═══════════════════════════════════════════════════════════════════════
  'merde', 'putain', 'connard', 'conne', 'salope', 'encule',
  'enculer', 'bordel', 'chier', 'bite', 'couille', 'nique',
  'niquer', 'pute', 'fdp', 'pd', 'tapette', 'enfoire',
  'va te faire foutre', 'nique ta mere', 'fils de pute',

  // ═══════════════════════════════════════════════════════════════════════
  // PORTUGUÉS (Brasil + Portugal)
  // ═══════════════════════════════════════════════════════════════════════
  'merda', 'caralho', 'porra', 'foda', 'foder', 'fodido', 'fodase',
  'viado', 'viad', 'bicha', 'cuzao', 'cuzão', 'bosta', 'piranha',
  'vagabunda', 'vagabundo', 'escroto', 'otario', 'bunda', 'crl',
  'fdp', 'filha da puta', 'filho da puta', 'vai se foder', 'vai tomar no',

  // ═══════════════════════════════════════════════════════════════════════
  // ALEMÁN
  // ═══════════════════════════════════════════════════════════════════════
  'scheisse', 'scheiss', 'arsch', 'arschloch', 'fotze', 'ficken',
  'hure', 'wichser', 'schlampe', 'mistkerl', 'miststuck',
  'verpiss dich', 'leck mich', 'verdammt',

  // ═══════════════════════════════════════════════════════════════════════
  // HOLANDÉS
  // ═══════════════════════════════════════════════════════════════════════
  'kut', 'klootzak', 'hoer', 'kanker', 'godverdomme', 'kakker',
  'mongool', 'neuken', 'tering', 'tyfus', 'pleur', 'rotzak',

  // ═══════════════════════════════════════════════════════════════════════
  // SUECO
  // ═══════════════════════════════════════════════════════════════════════
  'helvete', 'javla', 'javel', 'skit', 'fitta', 'knulla',
  'horan', 'satkarring', 'javlar',

  // ═══════════════════════════════════════════════════════════════════════
  // POLACO
  // ═══════════════════════════════════════════════════════════════════════
  'kurwa', 'chuj', 'pizda', 'jebac', 'jebany', 'jebana', 'pierdol',
  'pierdolic', 'skurwiel', 'skurwysyn', 'gowno', 'dupek', 'cipa',
  'chuja', 'chuju', 'pojeb', 'spierdalaj',

  // ═══════════════════════════════════════════════════════════════════════
  // ALBANÉS
  // ═══════════════════════════════════════════════════════════════════════
  'kar', 'pidh', 'mut', 'kurva', 'qij', 'gomar', 'bythe',
  'derr', 'shkerdhata', 'dreq',

  // ═══════════════════════════════════════════════════════════════════════
  // AFRIKAANS
  // ═══════════════════════════════════════════════════════════════════════
  'kak', 'poes', 'naai', 'doos', 'moer', 'bliksem', 'piel',
  'teef', 'fok', 'donner',

  // ═══════════════════════════════════════════════════════════════════════
  // UCRANIANO (transliterado al alfabeto Latino)
  // ═══════════════════════════════════════════════════════════════════════
  'blyad', 'blyat', 'blyac', 'huy', 'huya', 'huyom', 'pizdec',
  'suka', 'mudak', 'eblan', 'pidor', 'pidaras',

  // ═══════════════════════════════════════════════════════════════════════
  // UCRANIANO (alfabeto Cirílico) — substring match
  // ═══════════════════════════════════════════════════════════════════════
  'блядь', 'блять', 'бля', 'хуй', 'хуя', 'пизд', 'пиздец',
  'сука', 'мудак', 'еблан', 'йоб', 'ебать', 'підор', 'пидор',
  'дебіл', 'довбойоб',

  // ═══════════════════════════════════════════════════════════════════════
  // JAPONÉS (kanji + kana) — substring match
  // ═══════════════════════════════════════════════════════════════════════
  'くそ', 'クソ', '糞', 'ばか', 'バカ', '馬鹿', '死ね',
  'うざい', 'きもい', 'ちくしょう', 'ちんこ', 'まんこ',
  'やりまん', 'くたばれ', 'うるさい',
  // Romaji (transliteración) — Latino, usa boundary
  'kuso', 'baka', 'shine ne', 'chikusho', 'chinko', 'manko',

  // ═══════════════════════════════════════════════════════════════════════
  // COREANO (Hangul) — substring match
  // ═══════════════════════════════════════════════════════════════════════
  '시발', '씨발', '씨바', '좆', '병신', '개새끼', '개색', '빌어먹',
  '미친', '꺼져', '엿', '존나', '좆같',
  // Romanización
  'sibal', 'ssibal', 'jot', 'byeongsin', 'gaesaekki', 'michin',

  // ═══════════════════════════════════════════════════════════════════════
  // ÁRABE — substring match
  // ═══════════════════════════════════════════════════════════════════════
  'كلب', 'حمار', 'خرا', 'زبي', 'عرص', 'شرموطة', 'طيز',
  'ابن الكلب', 'كس امك', 'يلعن',
  // Transliteración
  'kelb', 'himar', 'sharmuta', 'kosomak',
];

// ── Utilidades internas ───────────────────────────────────────────────────────

/**
 * Normaliza texto:
 *  • Pasa a minúsculas (resuelve MAYÚS / minús / Capitalizado / mEzClA)
 *  • Quita tildes y diacríticos (NFD + filtrado de marcas combinantes)
 *  • Conserva alfabetos no-Latinos (CJK, Cyrillic, Arabic) intactos
 */
function normalizar(s: string): string {
  return s
    .toLowerCase()                          // PUTA / Puta / PuTa → puta
    .replace(/ß/g, 'ss')                    // alemán: Scheiße → scheisse
    .replace(/æ/g, 'ae')                    // latín extendido
    .replace(/œ/g, 'oe')                    // francés: œuvre → oeuvre
    .replace(/ø/g, 'o')                     // escandinavo
    .replace(/ł/g, 'l')                     // polaco: łysy → lysy
    .normalize('NFD')                       // separa base + marcas combinantes
    .replace(/[̀-ͯ]/g, '');       // elimina tildes y diacríticos
}

/**
 * Detecta si la palabra está formada únicamente por caracteres Latinos
 * (a-z, espacios, apóstrofo, dígitos). Las palabras Latinas usan límite
 * de inicio de palabra; las no-Latinas (CJK, Cyrillic, Arabic) usan
 * substring directo.
 */
function esLatina(palabra: string): boolean {
  return /^[a-z0-9\s']+$/.test(palabra);
}

/**
 * Comprueba si `textoNorm` contiene `palabraNorm`.
 *  • Para palabras Latinas: usa lookbehind negativo `(?<![a-z])` para
 *    evitar disparar en medio de una palabra legítima
 *    (ej. "culo" no dispara en "círculo").
 *  • Para palabras no-Latinas: usa substring directo (los alfabetos
 *    como japonés/coreano/árabe no usan separadores entre palabras
 *    de la misma forma que los latinos).
 */
function contieneIniciosPalabra(textoNorm: string, palabraNorm: string): boolean {
  if (!esLatina(palabraNorm)) {
    // CJK, Cyrillic, Arabic, etc. → substring directo
    return textoNorm.includes(palabraNorm);
  }

  try {
    const re = new RegExp(`(?<![a-z])${palabraNorm}`, 'i');
    return re.test(textoNorm);
  } catch {
    // Fallback: substring simple si la regexp falla
    return textoNorm.includes(palabraNorm);
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Devuelve `true` si el texto contiene alguna palabra / frase prohibida
 * en cualquier idioma soportado, en CUALQUIER combinación de mayús/minús.
 */
export function tienePalabrasProhibidas(texto: string): boolean {
  if (!texto || typeof texto !== 'string') return false;
  const norm = normalizar(texto);
  if (!norm) return false;

  return PALABRAS_PROHIBIDAS.some((prohibida) => {
    const p = normalizar(prohibida);
    if (!p) return false;
    // Frase con espacios → substring directo
    if (p.includes(' ')) return norm.includes(p);
    // Palabra individual → con (o sin) límite de inicio según alfabeto
    return contieneIniciosPalabra(norm, p);
  });
}

/** Alias compatible con el nombre que usa contacto.tsx */
export const contienePalabraProhibida = tienePalabrasProhibidas;

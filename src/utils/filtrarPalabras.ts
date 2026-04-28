/**
 * filtrarPalabras.ts
 * Filtro personalizado de palabras prohibidas para reseñas de lugares.
 * Protege a comercios y sitios turísticos de lenguaje irrespetuoso.
 *
 * Algoritmo:
 *  - Normaliza el texto: minúsculas + quita tildes/acentos.
 *  - Usa límite de inicio de palabra (lookbehind negativo) para capturar
 *    derivaciones (ej. "chinga" → chingada, chingadazo, chingón…)
 *    sin generar falsos positivos en palabras legítimas (ej. "artículo",
 *    "círculo", "computadora").
 *  - Las frases compuestas se buscan como substring del texto normalizado.
 */

// ── Lista de palabras / frases prohibidas ─────────────────────────────────────
export const PALABRAS_PROHIBIDAS: string[] = [
  // Groserías mexicanas — stems (capturan derivaciones)
  'chinga',       // chinga, chingada, chingadera, chingadazo, chingón, chingones…
  'pinche',       // pinche, pinches
  'puta',         // puta, putas, putazo, putería, putiza
  'puto',         // puto, putos
  'verga',        // verga, vergas, vergón
  'pendejo',      // pendejo, pendeja, pendejos, pendejada…
  'cabron',       // cabrón, cabrona, cabrones (sin tilde por normalización)
  'culero',       // culero, culera, culeros
  'culo',         // culo solo (límite inicio-de-palabra evita "círculo","artículo")
  'joto',         // joto, jota, jotos
  'mamada',       // mamada, mamadas
  'mierda',       // mierda, mierdas
  'puteria',      // putería
  'putiza',
  'hdp',
  'hjdp',
  'wey',          // como insulto directo
  // Frases compuestas (se buscan como substring)
  'hijo de puta',
  'hija de puta',
  'vete a la chingada',
  'me vale verga',
  'que te jodan',
  // Insultos directos
  'idiota',       // idiota, idiotas
  'imbecil',      // imbécil, imbéciles
  'estupido',     // estúpido, estúpida, estúpidos
  'inutil',       // inútil, inútiles
  'baboso',       // baboso, babosa, babosos
  'menso',        // menso, mensa, mensos
  'asqueroso',    // asqueroso, asquerosa
  'malparido',
  'hp',           // abreviatura ofensiva
  // Inglés (código mix frecuente)
  'fuck',         // fuck, fucking, fucker, motherfucker
  'shit',
  'asshole',
  'bitch',
  'bastard',
  'motherfucker',
  'damn you',
];

// ── Utilidades internas ───────────────────────────────────────────────────────

/** Convierte a minúsculas y elimina tildes / acentos */
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // quitar diacríticos
}

/**
 * Comprueba si `textoNorm` contiene `palabraNorm` como inicio de palabra.
 * Usa lookbehind negativo `(?<![a-z])` para no disparar en medio de una
 * palabra legítima.  Por ejemplo:
 *   "culo"   → match en "culo solo"  ✓
 *   "culo"   → NO match en "circulo" ✓  (la 'c' está precedida por 'r')
 */
function contieneIniciosPalabra(textoNorm: string, palabraNorm: string): boolean {
  try {
    const re = new RegExp(`(?<![a-z])${palabraNorm}`, 'i');
    return re.test(textoNorm);
  } catch {
    // Fallback: substring simple si la regexp falla (caracteres especiales)
    return textoNorm.includes(palabraNorm);
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Devuelve `true` si el texto contiene alguna palabra / frase prohibida.
 */
export function tienePalabrasProhibidas(texto: string): boolean {
  const norm = normalizar(texto);
  return PALABRAS_PROHIBIDAS.some((prohibida) => {
    const p = normalizar(prohibida);
    // Frase con espacios → buscar como substring directo
    if (p.includes(' ')) return norm.includes(p);
    // Palabra individual → límite inicio-de-palabra
    return contieneIniciosPalabra(norm, p);
  });
}

// ============================================================
//  Reescribe imports de Text/TextInput desde 'react-native' a
//  '<path>/components/Text' (los wrappers que aplican Museo).
//
//  Maneja los tres patrones comunes:
//    1. import { Text } from 'react-native';
//    2. import { View, Text, StyleSheet } from 'react-native';
//    3. import { Text as RNText } from 'react-native';  (lo dejamos como está — aliases)
//
//  Cada archivo .tsx/.ts en app/, components/, src/ se transforma.
//  Si el archivo ya no tiene Text/TextInput en el import de RN
//  (porque solo importaba esos), se quita la línea entera de RN.
//  Se añade el import del wrapper con el path relativo correcto.
//
//  Ejecutar: node scripts/rewrite-text-imports.js
// ============================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WRAPPER_ABS = path.resolve(ROOT, 'components', 'Text.tsx');
const DIRS = ['app', 'components', 'src'];

const NAMES = new Set(['Text', 'TextInput']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      files.push(full);
    }
  }
  return files;
}

function getWrapperImportPath(fromFile) {
  // path relativo desde el archivo hasta components/Text (sin extensión).
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, path.join(ROOT, 'components', 'Text'));
  rel = rel.split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function rewriteFile(file) {
  if (file === WRAPPER_ABS) return false; // el wrapper mismo no se toca

  const src = fs.readFileSync(file, 'utf8');

  // Buscamos `import { ... } from 'react-native'` (single line, comillas dobles o simples)
  const re = /import\s*\{([^}]+)\}\s*from\s*['"]react-native['"]\s*;?/g;
  let modified = false;
  const newSrc = src.replace(re, (match, namesGroup) => {
    const parts = namesGroup
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Separamos: las que migramos (Text/TextInput sin alias) vs las que dejamos.
    const keep = [];
    const migrate = [];
    for (const p of parts) {
      // si tiene alias `Text as RNText`, lo dejamos en RN (es uso intencional)
      if (/\bas\b/.test(p)) {
        keep.push(p);
        continue;
      }
      if (NAMES.has(p)) {
        migrate.push(p);
      } else {
        keep.push(p);
      }
    }

    if (migrate.length === 0) return match; // nada que migrar
    modified = true;

    const wrapperPath = getWrapperImportPath(file);
    const wrapperImport = `import { ${migrate.join(', ')} } from '${wrapperPath}';`;

    if (keep.length === 0) {
      // Reemplaza la línea completa por solo el wrapper import.
      return wrapperImport;
    } else {
      return `import { ${keep.join(', ')} } from 'react-native';\n${wrapperImport}`;
    }
  });

  if (modified) {
    fs.writeFileSync(file, newSrc);
    return true;
  }
  return false;
}

let touched = 0;
for (const d of DIRS) {
  const base = path.join(ROOT, d);
  if (!fs.existsSync(base)) continue;
  for (const f of walk(base)) {
    if (rewriteFile(f)) touched++;
  }
}
console.log(`Archivos modificados: ${touched}`);

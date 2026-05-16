// ============================================================
//  Reescribe imports de Alert desde 'react-native' a
//  '<path>/components/Alert' (wrapper que renderiza modal Museo).
//
//  Mismo patrón que rewrite-text-imports.js:
//    1. import { Alert } from 'react-native';        → reemplaza
//    2. import { View, Alert, ... } from '...';      → separa
//    3. import { Alert as RNAlert } from '...';      → respeta alias
// ============================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WRAPPER_ABS = path.resolve(ROOT, 'components', 'Alert.tsx');
const DIRS = ['app', 'components', 'src'];

const NAMES = new Set(['Alert']);

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
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, path.join(ROOT, 'components', 'Alert'));
  rel = rel.split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function rewriteFile(file) {
  if (file === WRAPPER_ABS) return false;

  const src = fs.readFileSync(file, 'utf8');
  const re = /import\s*\{([^}]+)\}\s*from\s*['"]react-native['"]\s*;?/g;
  let modified = false;
  const newSrc = src.replace(re, (match, namesGroup) => {
    const parts = namesGroup.split(',').map(s => s.trim()).filter(Boolean);
    const keep = [];
    const migrate = [];
    for (const p of parts) {
      if (/\bas\b/.test(p)) { keep.push(p); continue; }
      if (NAMES.has(p)) migrate.push(p);
      else keep.push(p);
    }
    if (migrate.length === 0) return match;
    modified = true;

    const wrapperPath = getWrapperImportPath(file);
    const wrapperImport = `import { ${migrate.join(', ')} } from '${wrapperPath}';`;

    if (keep.length === 0) return wrapperImport;
    return `import { ${keep.join(', ')} } from 'react-native';\n${wrapperImport}`;
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

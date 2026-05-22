// Agrega la clave institutional_title (título de la sección Institucional
// en Contacto) a los 14 locales.
const fs = require('fs');
const path = require('path');

const T = {
  es: 'Institucional',
  en: 'Institutional',
  fr: 'Institutionnel',
  pt: 'Institucional',
  de: 'Institutionell',
  ja: '行政機関',
  ar: 'مؤسسي',
  af: 'Institusioneel',
  ko: '기관',
  nl: 'Institutioneel',
  uk: 'Установи',
  sv: 'Institutionell',
  pl: 'Instytucjonalne',
  sq: 'Institucional',
};

const dir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
for (const lang of Object.keys(T)) {
  const file = path.join(dir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!('institutional_title' in data)) {
    data.institutional_title = T[lang];
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`${lang}: + institutional_title`);
  } else {
    console.log(`${lang}: ya existía`);
  }
}

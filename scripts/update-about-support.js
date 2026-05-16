// One-off: cambia `about_support` de "Apoyo en desarrollo" a "Agradecimientos".
const fs = require('fs');
const path = require('path');

const ACK = {
  es: 'Agradecimientos',
  en: 'Acknowledgements',
  fr: 'Remerciements',
  pt: 'Agradecimentos',
  de: 'Danksagungen',
  ja: '謝辞',
  ar: 'شكر وتقدير',
  af: 'Erkenning',
  ko: '감사의 말',
  nl: 'Dankbetuigingen',
  uk: 'Подяки',
  sv: 'Tack',
  pl: 'Podziękowania',
  sq: 'Falënderime',
};

const dir = path.join(__dirname, '..', 'src', 'i18n', 'locales');

for (const lang of Object.keys(ACK)) {
  const file = path.join(dir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.about_support = ACK[lang];
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`${lang}: about_support → "${ACK[lang]}"`);
}

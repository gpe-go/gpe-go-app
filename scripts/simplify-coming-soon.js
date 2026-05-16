// One-off: simplifies "google_signin_coming_soon" / "apple_signin_coming_soon"
// to just "Coming soon." (no technical requirement text), in all locales.
const fs = require('fs');
const path = require('path');

const COMING_SOON = {
  es: 'Próximamente disponible.',
  en: 'Coming soon.',
  fr: 'Bientôt disponible.',
  pt: 'Em breve disponível.',
  de: 'Demnächst verfügbar.',
  ja: '近日公開予定。',
  ar: 'متاح قريباً.',
  af: 'Binnekort beskikbaar.',
  ko: '곧 제공될 예정입니다.',
  nl: 'Binnenkort beschikbaar.',
  uk: 'Незабаром буде доступно.',
  sv: 'Tillgängligt snart.',
  pl: 'Wkrótce dostępne.',
  sq: 'Së shpejti i disponueshëm.',
};

const dir = path.join(__dirname, '..', 'src', 'i18n', 'locales');

for (const lang of Object.keys(COMING_SOON)) {
  const file = path.join(dir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.google_signin_coming_soon = COMING_SOON[lang];
  data.apple_signin_coming_soon = COMING_SOON[lang];
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`${lang}: simplified`);
}

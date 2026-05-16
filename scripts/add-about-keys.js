// One-off: appends/updates "Acerca de" translation keys in every locale file.
// Idempotent — safe to re-run; existing keys are not overwritten.
const fs = require('fs');
const path = require('path');

const SUB = {
  es: 'Equipo, créditos y aliados institucionales',
  en: 'Team, credits and institutional partners',
  fr: 'Équipe, crédits et partenaires institutionnels',
  pt: 'Equipe, créditos e parceiros institucionais',
  de: 'Team, Credits und institutionelle Partner',
  ja: 'チーム、クレジット、提携機関',
  ar: 'الفريق والاعتمادات والشركاء المؤسسيون',
  af: 'Span, krediete en institusionele vennote',
  ko: '팀, 크레딧 및 기관 파트너',
  nl: 'Team, credits en institutionele partners',
  uk: 'Команда, подяки та інституційні партнери',
  sv: 'Team, krediter och institutionella partners',
  pl: 'Zespół, podziękowania i partnerzy instytucjonalni',
  sq: 'Ekipi, kreditë dhe partnerët institucionalë',
};

const dir = path.join(__dirname, '..', 'src', 'i18n', 'locales');

for (const lang of Object.keys(SUB)) {
  const file = path.join(dir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!('settings_about_sub' in data)) {
    data.settings_about_sub = SUB[lang];
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`${lang}: + settings_about_sub`);
  } else {
    console.log(`${lang}: skipped (already present)`);
  }
}

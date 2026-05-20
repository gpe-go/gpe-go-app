// Agrega traducciones de categorías que faltaban en los locales:
// cat_industria, cat_gobierno, cat_turisticos, cat_salud, cat_transporte.
const fs = require('fs');
const path = require('path');

const T = {
  es: { cat_industria: 'Industria y manufactura', cat_gobierno: 'Gobierno e instituciones', cat_turisticos: 'Sitios turísticos', cat_salud: 'Salud y farmacias', cat_transporte: 'Transporte y logística' },
  en: { cat_industria: 'Industry & manufacturing', cat_gobierno: 'Government & institutions', cat_turisticos: 'Tourist sites', cat_salud: 'Health & pharmacies', cat_transporte: 'Transportation & logistics' },
  fr: { cat_industria: 'Industrie et fabrication', cat_gobierno: 'Gouvernement et institutions', cat_turisticos: 'Sites touristiques', cat_salud: 'Santé et pharmacies', cat_transporte: 'Transport et logistique' },
  pt: { cat_industria: 'Indústria e manufatura', cat_gobierno: 'Governo e instituições', cat_turisticos: 'Pontos turísticos', cat_salud: 'Saúde e farmácias', cat_transporte: 'Transporte e logística' },
  de: { cat_industria: 'Industrie und Fertigung', cat_gobierno: 'Regierung und Institutionen', cat_turisticos: 'Sehenswürdigkeiten', cat_salud: 'Gesundheit und Apotheken', cat_transporte: 'Transport und Logistik' },
  ja: { cat_industria: '産業・製造', cat_gobierno: '行政・機関', cat_turisticos: '観光地', cat_salud: '健康・薬局', cat_transporte: '交通・物流' },
  ar: { cat_industria: 'الصناعة والتصنيع', cat_gobierno: 'الحكومة والمؤسسات', cat_turisticos: 'المواقع السياحية', cat_salud: 'الصحة والصيدليات', cat_transporte: 'النقل واللوجستيات' },
  af: { cat_industria: 'Nywerheid en vervaardiging', cat_gobierno: 'Regering en instellings', cat_turisticos: 'Toeristebestemmings', cat_salud: 'Gesondheid en apteke', cat_transporte: 'Vervoer en logistiek' },
  ko: { cat_industria: '산업 및 제조', cat_gobierno: '정부 및 기관', cat_turisticos: '관광 명소', cat_salud: '건강 및 약국', cat_transporte: '교통 및 물류' },
  nl: { cat_industria: 'Industrie en productie', cat_gobierno: 'Overheid en instellingen', cat_turisticos: 'Toeristische plaatsen', cat_salud: 'Gezondheid en apotheken', cat_transporte: 'Transport en logistiek' },
  uk: { cat_industria: 'Промисловість і виробництво', cat_gobierno: 'Уряд та установи', cat_turisticos: 'Туристичні місця', cat_salud: 'Здоров’я та аптеки', cat_transporte: 'Транспорт і логістика' },
  sv: { cat_industria: 'Industri och tillverkning', cat_gobierno: 'Regering och institutioner', cat_turisticos: 'Turistmål', cat_salud: 'Hälsa och apotek', cat_transporte: 'Transport och logistik' },
  pl: { cat_industria: 'Przemysł i produkcja', cat_gobierno: 'Rząd i instytucje', cat_turisticos: 'Atrakcje turystyczne', cat_salud: 'Zdrowie i apteki', cat_transporte: 'Transport i logistyka' },
  sq: { cat_industria: 'Industria dhe prodhimi', cat_gobierno: 'Qeveria dhe institucionet', cat_turisticos: 'Vende turistike', cat_salud: 'Shëndeti dhe farmacitë', cat_transporte: 'Transporti dhe logjistika' },
};

const dir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
for (const lang of Object.keys(T)) {
  const file = path.join(dir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let added = 0;
  for (const [k, v] of Object.entries(T[lang])) {
    if (!(k in data)) { data[k] = v; added++; }
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`${lang}: +${added}`);
}

// Inserta claves nuevas weather_humidity / weather_wind en todos los locales.
const fs = require('fs');
const path = require('path');

const T = {
  es: { weather_humidity: 'Humedad', weather_wind: 'Viento' },
  en: { weather_humidity: 'Humidity', weather_wind: 'Wind' },
  fr: { weather_humidity: 'Humidité', weather_wind: 'Vent' },
  pt: { weather_humidity: 'Umidade', weather_wind: 'Vento' },
  de: { weather_humidity: 'Luftfeuchte', weather_wind: 'Wind' },
  ja: { weather_humidity: '湿度', weather_wind: '風' },
  ar: { weather_humidity: 'الرطوبة', weather_wind: 'الرياح' },
  af: { weather_humidity: 'Humiditeit', weather_wind: 'Wind' },
  ko: { weather_humidity: '습도', weather_wind: '바람' },
  nl: { weather_humidity: 'Vochtigheid', weather_wind: 'Wind' },
  uk: { weather_humidity: 'Вологість', weather_wind: 'Вітер' },
  sv: { weather_humidity: 'Luftfuktighet', weather_wind: 'Vind' },
  pl: { weather_humidity: 'Wilgotność', weather_wind: 'Wiatr' },
  sq: { weather_humidity: 'Lagështia', weather_wind: 'Era' },
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

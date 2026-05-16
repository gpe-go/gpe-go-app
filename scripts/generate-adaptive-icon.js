// ============================================================
//  Generador de gpego-icon-adaptive.png para Android.
//
//  OBJETIVO: que el icono oficial en el launcher Android se vea
//  con su contenido principal (corona + Guadalupe + GO) visible
//  completo sin importar el shape (círculo, squircle, gota, etc)
//  que use el launcher.
//
//  Android adaptive icons recortan el foreground con shapes y la
//  zona "garantizada visible" es el círculo central de ~66% del
//  canvas. Por eso escalamos el icono oficial al 88% — el contenido
//  cae dentro de esa safe zone y el fondo naranja del canvas se
//  funde con el backgroundColor #F97613 declarado en app.config.js.
//
//  Ejecutar manualmente si el icono oficial cambia:
//    node scripts/generate-adaptive-icon.js
// ============================================================

const { Jimp } = require('jimp');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'assets', 'images', 'gpego-icon.png');
const OUT = path.resolve(__dirname, '..', 'assets', 'images', 'gpego-icon-adaptive.png');

// Canvas naranja del municipio — al hacer que el fondo del canvas
// coincida con el naranja del icon oficial, cuando Android recorte
// al shape (squircle/círculo/etc) no quedan bordes blancos parásitos.
const ORANGE_HEX = 0xF97613FF;
const CANVAS = 1024;
const CONTENT_SCALE = 0.88; // gpego-icon.png ocupa 88% del canvas

(async () => {
  const src = await Jimp.read(SRC);

  // Reescalamos el icono oficial al CONTENT_SCALE manteniendo proporción.
  const target = Math.round(CANVAS * CONTENT_SCALE);
  src.resize({ w: target, h: target });

  // Canvas naranja sólido (mismo color que el backgroundColor del
  // adaptive icon → el naranja del icono oficial se funde con el canvas).
  const canvas = new Jimp({ width: CANVAS, height: CANVAS, color: ORANGE_HEX });

  // Centramos el icono.
  const offset = Math.round((CANVAS - target) / 2);
  canvas.composite(src, offset, offset);

  await canvas.write(OUT);
  console.log('OK ->', OUT);
})();

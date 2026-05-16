// Regenera los iconos del launcher (Android + iOS) a partir del logo
// oficial GPE GO.png para que en CUALQUIER launcher (incluido Samsung
// One UI, que usa un squircle más agresivo que stock Android) se vea el
// nombre completo y centrado, igual que Google TV / Telcel / Walmart.
//
// Salidas:
//   - gpego-icon.png           (1024×1024 opaco — legacy Android + iOS)
//   - gpego-icon-adaptive.png  (1024×1024 opaco — Android adaptive fg)
//
// Estrategia:
//   * El logo `GPE GO.png` ya viene en cuadro naranja con esquinas
//     redondeadas. Lo ponemos centrado sobre un canvas más grande del
//     MISMO naranja (#F97613) → las esquinas redondeadas se fusionan
//     con el fondo y desaparecen, dejando un cuadrado limpio.
//   * Para el adaptive (foreground), el logo se escala al 60 % del
//     canvas → queda dentro de la safe zone (66 %) que respetan TODOS
//     los launchers Android, incluido Samsung.
//   * Para el legacy/iOS, escala al 78 % → casi llena el cuadro pero
//     deja respiro visual (como Google TV / Telcel).

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'assets', 'images');
const SRC = path.join(DIR, 'GPE GO.png'); // 512×512 ya optimizado
const ORANGE = { r: 0xF9, g: 0x76, b: 0x13, alpha: 1 };

const TARGETS = [
  // Legacy + iOS: el source ya tiene su cuadro redondeado naranja, así que
  // lo usamos COMO ES (sin canvas extra). iOS aplica su propia mascara
  // exterior y se ve uniforme, igual que Telcel/Walmart en la captura.
  { out: 'gpego-icon.png',          size: 1024, logoPct: 1.00 },
  // Android adaptive: 65 % deja el logo completo dentro de la safe zone
  // (66 % oficial). El fondo del foreground es el mismo naranja que el
  // backgroundColor del adaptiveIcon → cualquier mascara del launcher
  // (squircle de Samsung, círculo de Pixel) recorta orange con orange,
  // sin bordes parásitos.
  { out: 'gpego-icon-adaptive.png', size: 1024, logoPct: 0.65 },
];

(async () => {
  for (const { out, size, logoPct } of TARGETS) {
    const dest = path.join(DIR, out);
    const backup = dest.replace(/\.png$/i, '.orig.png');
    if (fs.existsSync(dest) && !fs.existsSync(backup)) {
      fs.copyFileSync(dest, backup);
    }

    let outBuf;
    if (logoPct >= 1) {
      // Sin canvas extra — solo escalar a `size`.
      outBuf = await sharp(SRC)
        .resize({ width: size, height: size, fit: 'fill' })
        .png({ compressionLevel: 9, effort: 10, palette: false })
        .toBuffer();
    } else {
      const logoSize = Math.round(size * logoPct);
      const logoBuf = await sharp(SRC)
        .resize({ width: logoSize, height: logoSize, fit: 'inside' })
        .toBuffer();
      outBuf = await sharp({
        create: { width: size, height: size, channels: 4, background: ORANGE },
      })
        .composite([{ input: logoBuf, gravity: 'center' }])
        .png({ compressionLevel: 9, effort: 10, palette: false })
        .toBuffer();
    }

    fs.writeFileSync(dest, outBuf);
    console.log(
      `${out}: ${size}×${size}, logo ${Math.round(logoPct * 100)}% → ${(outBuf.length / 1024).toFixed(0)} KB`,
    );
  }
})();

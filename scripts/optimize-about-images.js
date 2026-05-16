// One-off: optimizes the three "Acerca de" images in place.
// Backs up the original to <name>.orig.png the first time, then resizes
// and re-encodes the live file with lossless palette PNG (logos compress
// extremely well with palette-mode + adaptive filter).
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'assets', 'images');

const TARGETS = [
  { file: 'GPE GO.png',                  width: 512 }, // app logo, used up to ~150 px
  { file: 'logocombinadotecnlo.png',     width: 600 }, // partner, displayed ~150 px
  { file: 'LOGOS G1 (1)_page-0001.png',  width: 600 }, // partner, displayed ~150 px
];

(async () => {
  for (const { file, width } of TARGETS) {
    const src = path.join(DIR, file);
    const backup = src.replace(/\.png$/i, '.orig.png');
    if (!fs.existsSync(backup)) {
      fs.copyFileSync(src, backup);
    }
    const beforeBytes = fs.statSync(backup).size;

    const out = await sharp(backup)
      .resize({ width, withoutEnlargement: true })
      .png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })
      .toBuffer();

    fs.writeFileSync(src, out);
    const afterBytes = out.length;
    const pct = ((1 - afterBytes / beforeBytes) * 100).toFixed(1);
    console.log(
      `${file}: ${(beforeBytes / 1024).toFixed(0)} KB → ${(afterBytes / 1024).toFixed(0)} KB (-${pct}%)`,
    );
  }
})();

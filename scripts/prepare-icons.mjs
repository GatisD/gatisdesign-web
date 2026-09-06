import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

/**
 * PNG ikonas no viena avota - public/favicon.svg.
 *
 * apple-touch-icon iepriekš bija tikai <link> galvenē, bet faila nebija: katrs
 * iOS un Safari apmeklējums beidzās ar 404. Tāpēc ikonas tiek ģenerētas ar
 * komandu (`npm run images:icons`), ne zīmētas ar roku, un būves vārti pārbauda,
 * ka katra galvenes atsauce norāda uz reālu failu.
 *
 * Ikonai ir NECAURSPĪDĪGS fons: iOS caurspīdīgumu neatbalsta un aizpilda to ar
 * melnu, kas nesakrīt ar grafīta toni.
 */
const PUBLIC = join(process.cwd(), "public");
const SOURCE = readFileSync(join(PUBLIC, "favicon.svg"));

const SIZES = [
  { file: "apple-touch-icon.png", size: 180 },
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
];

for (const { file, size } of SIZES) {
  const png = await sharp(SOURCE, { density: 600 })
    .resize(size, size, { fit: "contain", background: "#0D0B09" })
    .flatten({ background: "#0D0B09" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(join(PUBLIC, file), png);
  console.log(`${file} ${size}x${size} - ${(png.length / 1024).toFixed(1)} KB`);
}

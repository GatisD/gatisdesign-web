/**
 * Hero un joslu fona kadri: vienāds izmērs, WebP blakus JPG.
 *
 * Šie attēli ir PAGAIDU stock kadri (Unsplash License) - struktūra jau ir
 * gatava video (src/components/direction/HeroMedia.tsx `src`), bet pašu video
 * vēl nav. Tāpēc te ir tikai divi soļi: samazināt līdz 1920 px platumam un
 * uztaisīt WebP versiju, ko <picture> pasniedz pirmo.
 */
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";

const DIR = new URL("../public/media/", import.meta.url).pathname;
const MAX_WIDTH = 1920;

const files = (await readdir(DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));
let converted = 0;

for (const file of files) {
  const src = join(DIR, file);
  const { name } = parse(file);
  const image = sharp(src);
  const meta = await image.metadata();
  const resize = (meta.width ?? 0) > MAX_WIDTH ? { width: MAX_WIDTH } : null;

  if (resize) {
    const buffer = await sharp(src).resize(resize).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    await sharp(buffer).toFile(src);
  }
  await sharp(src).webp({ quality: 78, effort: 5 }).toFile(join(DIR, `${name}.webp`));
  const after = await stat(src);
  const webp = await stat(join(DIR, `${name}.webp`));
  console.log(
    `${file.padEnd(24)} ${String(meta.width).padStart(5)}px -> ${(after.size / 1024).toFixed(0)} KB jpg, ${(webp.size / 1024).toFixed(0)} KB webp`,
  );
  converted += 1;
}
console.log(`Sagatavoti ${converted} kadri`);

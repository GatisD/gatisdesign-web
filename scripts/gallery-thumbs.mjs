/**
 * Režģa varianti kolekcijām, kuras lapā parādās kā daudzu kadru siets.
 *
 * Logo kolekcijā ir 70 attēli. Pilnā izmērā tie kopā ir 2,4 MB WebP - pat ar
 * lazy loading tas ir viss, ko lapa noritinot lejupielādē. 640 px variants
 * režģa kartei pietiek arī 2x ekrānam, un pilno kadru ielādē tikai lightbox.
 *
 * Palaišana: node scripts/gallery-thumbs.mjs
 */
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join, dirname, parse } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public/portfolio");
/** Kolekcijas, kas lapā ir režģis (sk. portfolio.ts layout: "grid"). */
const GRID_DIRS = ["logo-branding"];
const WIDTH = 640;

let count = 0;
let bytes = 0;
for (const dirName of GRID_DIRS) {
  const dir = join(PUB, dirName);
  const files = (await readdir(dir)).filter((f) => /\.jpg$/i.test(f) && !f.includes(`-${WIDTH}.`));
  for (const file of files.sort()) {
    const { name } = parse(file);
    const src = join(dir, file);
    const base = sharp(src).resize({ width: WIDTH, withoutEnlargement: true });
    await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(join(dir, `${name}-${WIDTH}.jpg`));
    await base.clone().webp({ quality: 78, effort: 5 }).toFile(join(dir, `${name}-${WIDTH}.webp`));
    bytes += (await stat(join(dir, `${name}-${WIDTH}.webp`))).size;
    count++;
  }
  console.log(`  ${dirName}: ${files.length} attēli -> ${WIDTH}px varianti`);
}
console.log(`Kopā ${count} variantu, WebP ${(bytes / 1024 / 1024).toFixed(2)} MB (vidēji ${(bytes / count / 1024).toFixed(0)} KB)`);

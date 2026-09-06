/**
 * Portfolio papildinājums no Gata paša Instagram un Facebook arhīva.
 *
 * Adobe Portfolio materiāls repo jau ir (1. un 2. kārta). Šis skripts pievieno
 * TIKAI tos darbus, kuru zīmols kolekcijā vēl nav - dublikāti pret esošajiem
 * failiem atsijāti ar perceptuālo hash un pēc tam pārskatīti ar aci.
 *
 * Avoti: ~/Downloads/gatisdesign-2026-09/portfolio-{ig,fb}/
 * Palaišana: node scripts/ingest-social.mjs
 */
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(process.env.HOME, "Downloads/gatisdesign-2026-09");
const PUB = join(ROOT, "public/portfolio");
const MAX_W = 1920;

/** [avota fails, galamērķa ceļš zem public/portfolio] */
const JOBS = [
  ["portfolio-fb/2014-04-29-956116-891.jpg", "logo-branding/logo-branding-52.jpg"],
  ["portfolio-fb/2014-04-28-648225-891.jpg", "logo-branding/logo-branding-53.jpg"],
  ["portfolio-fb/2014-04-28-648230-891.jpg", "logo-branding/logo-branding-54.jpg"],
  ["portfolio-fb/2014-04-28-648235-891.jpg", "logo-branding/logo-branding-55.jpg"],
  ["portfolio-fb/2014-04-28-972072-891.jpg", "logo-branding/logo-branding-56.jpg"],
  ["portfolio-fb/2014-05-04-453429-891.jpg", "logo-branding/logo-branding-57.jpg"],
  ["portfolio-fb/2014-05-07-334037-800.jpg", "logo-branding/logo-branding-58.jpg"],
  ["portfolio-fb/2014-05-23-834417-891.jpg", "logo-branding/logo-branding-59.jpg"],
  ["portfolio-fb/2014-06-18-803038-1200.jpg", "logo-branding/logo-branding-60.jpg"],
  ["portfolio-fb/2014-08-21-094178-891.jpg", "logo-branding/logo-branding-61.jpg"],
  ["portfolio-fb/2014-09-10-792173-891.jpg", "logo-branding/logo-branding-62.jpg"],
  ["portfolio-fb/2014-11-20-141987-2048.jpg", "logo-branding/logo-branding-63.jpg"],
  ["portfolio-fb/2015-06-21-187482-1360.jpg", "logo-branding/logo-branding-64.jpg"],
  ["portfolio-fb/2015-08-27-711411-891.jpg", "logo-branding/logo-branding-65.jpg"],
  ["portfolio-fb/2018-02-16-773526-800.jpg", "logo-branding/logo-branding-66.jpg"],
  ["portfolio-fb/2018-09-27-489479-800.jpg", "logo-branding/logo-branding-67.jpg"],
  ["portfolio-fb/2022-10-09-220099-1080.jpg", "logo-branding/logo-branding-68.jpg"],
  ["portfolio-ig/2017-05-28-075526-0.jpg", "logo-branding/logo-branding-69.jpg"],
  ["portfolio-ig/2019-02-26-340382-0.jpg", "logo-branding/logo-branding-70.jpg"],
  ["portfolio-ig/2022-10-05-010144-0.jpg", "box-latvia/box-latvia-12.jpg"],
  ["portfolio-ig/2023-06-19-963185-0.jpg", "varloz/varloz-01.jpg"],
];

let total = 0;
for (const [rel, dest] of JOBS) {
  const src = join(SRC, rel);
  const out = join(PUB, dest);
  await mkdir(dirname(out), { recursive: true });
  const meta = await sharp(src).metadata();
  const width = Math.min(MAX_W, meta.width);
  const base = sharp(src).resize({ width, withoutEnlargement: true });
  await base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  await base.clone().webp({ quality: 82, effort: 5 }).toFile(out.replace(/\.jpg$/, ".webp"));
  const j = await stat(out);
  const w = await stat(out.replace(/\.jpg$/, ".webp"));
  total += w.size;
  console.log(`  + ${dest.padEnd(38)} ${width}px  jpg ${(j.size / 1024).toFixed(0)} KB / webp ${(w.size / 1024).toFixed(0)} KB`);
}
console.log(`Pievienoti ${JOBS.length} attēli, WebP kopā ${(total / 1024 / 1024).toFixed(2)} MB`);

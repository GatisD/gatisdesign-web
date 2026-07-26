#!/usr/bin/env node
/**
 * Portfolio vāku sagatavošana.
 *
 * 1) Mājaslapu projektiem: no ~/Downloads/gatisdesign-portfolio/shots/<file>.png
 *    (1440x900 brauzera kadri) taisa 16:9 vākus 1200x675 -> public/portfolio/sites/.
 *    Griež no kadra augšas (apakšējie ~20% tiek nomesti, jo tur parasti sēž
 *    sīkdatņu joslas un peldošie čata burbuļi).
 *
 * 2) Projektiem bez ekrānattēla: logo no ~/rois-sparkle-web/src/assets/clients/
 *    -> public/portfolio/logos/<id>.webp (oriģināls) un tāds pats 16:9 vāks,
 *    logo centrēts uz tā paša fona, kāds tam jau ir (bez svešas krāsas maliņām).
 *
 * 3) Izmēru manifests: public/portfolio galerijām un vākiem -> src/data/image-sizes.json,
 *    lai <img> vienmēr var izlikt width/height (pret CLS).
 *
 * Palaišana: node scripts/prepare-covers.mjs
 */
import sharp from "sharp";
import { mkdir, copyFile, readdir, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOME = process.env.HOME;
const SHOTS = join(HOME, "Downloads/gatisdesign-portfolio/shots");
const LOGOS_SRC = join(HOME, "rois-sparkle-web/src/assets/clients");
const PUB = join(ROOT, "public/portfolio");
const SITES_OUT = join(PUB, "sites");
const LOGOS_OUT = join(PUB, "logos");

const COVER_W = 1200;
const COVER_H = 675; // 16:9
const QUALITY = 82;

/** projekta id -> ekrānattēla fails shots mapē */
const SHOT_BY_ID = {
  estire: "estire.png",
  "rois-lv": "rois.png",
  "universal-solutions": "universalsolutions.png",
  "kugi-kartupelis": "kartupelis.png",
  "mebelu-montaza": "mebelumontaza.png",
  "lucky-punch": "luckypunch.png",
  "lauvas-zobs": "lauvaszobs.png",
  valis: "valis.png",
  "box-latvia-web": "boxlatvia.png",
  "110m2": "110m2.png",
};

/**
 * projekta id -> logo fails. Šie projekti ekrānattēlu nedabū:
 * cafeteria.lv aiz Cloudflare bota pārbaudes, forevolt.com un Green Bay domēns
 * vairs nedzīvo, bet zīmola darbiem (DarbaGuru, Obsidian, Varloz) mājaslapa
 * nemaz nav mans darbs, tāpēc vāks ir logo.
 */
const LOGO_BY_ID = {
  cafeteria: "Cafeteria.webp",
  forevolt: "Forevolt.webp",
  "green-bay": "Greenbay.webp",
  darbaguru: "DarbaGuru.webp",
  obsidian: "Obisdian.webp",
  varloz: "Varloz.webp",
};

/**
 * Cik daudz no kadra augšas paturam. Noklusējums 0.8 nogriež sīkdatņu joslas,
 * bet luckypunch.lv modālis sākas augstāk, tāpēc tur griežam ciešāk.
 */
const KEEP_DEFAULT = 0.8;
const KEEP_BY_ID = { "lucky-punch": 0.74 };

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Kadra augšējā daļa 16:9 formātā - bez apakšas, kur sēž sīkdatņu joslas. */
async function coverFromShot(id, file) {
  const src = join(SHOTS, file);
  if (!(await exists(src))) {
    console.warn(`  ! ${id}: nav faila ${file}`);
    return false;
  }
  const meta = await sharp(src).metadata();
  const keep = Math.round(meta.height * (KEEP_BY_ID[id] ?? KEEP_DEFAULT));
  const height = Math.min(keep, Math.round((meta.width * 9) / 16));
  const width = Math.min(meta.width, Math.round((height * 16) / 9));
  const left = Math.round((meta.width - width) / 2);

  const base = sharp(src)
    .extract({ left, top: 0, width, height })
    .resize(COVER_W, COVER_H, { fit: "cover" });

  await base.clone().webp({ quality: QUALITY }).toFile(join(SITES_OUT, `${id}-cover.webp`));
  await base.clone().jpeg({ quality: QUALITY, mozjpeg: true }).toFile(join(SITES_OUT, `${id}-cover.jpg`));
  console.log(`  + ${id}-cover.{webp,jpg} <- ${file}`);
  return true;
}

/** Vāku fons gaišajiem logo. Tā pati papīra krāsa, kas dizaina sistēmā (--paper). */
const PAPER = { r: 0xef, g: 0xe8, b: 0xdc };

/**
 * Logo centrā uz vāka. Gaišam logo (balts fons) liekam siltu papīra fonu un
 * pārklājam ar multiply, lai baltais nomainās pret papīru un tumšajā lapā
 * neizceļas kā balts plankums. Tumšam logo paliek tā paša faila fona krāsa.
 */
async function coverFromLogo(id, file) {
  const src = join(LOGOS_SRC, file);
  if (!(await exists(src))) {
    console.warn(`  ! ${id}: nav logo faila ${file}`);
    return false;
  }
  await copyFile(src, join(LOGOS_OUT, `${id}.webp`));

  const corner = await sharp(src).extract({ left: 0, top: 0, width: 4, height: 4 }).raw().toBuffer();
  const cornerLuma = 0.299 * corner[0] + 0.587 * corner[1] + 0.114 * corner[2];
  const lightLogoBg = cornerLuma > 128;
  const bg = lightLogoBg ? PAPER : { r: corner[0], g: corner[1], b: corner[2] };

  const logo = await sharp(src)
    .resize(Math.round(COVER_W * 0.52), Math.round(COVER_H * 0.52), {
      fit: "inside",
      withoutEnlargement: false,
    })
    .toBuffer();

  const canvas = sharp({
    create: { width: COVER_W, height: COVER_H, channels: 3, background: bg },
  }).composite([{ input: logo, gravity: "center", blend: lightLogoBg ? "multiply" : "over" }]);

  const flat = await canvas.png().toBuffer();
  await sharp(flat).webp({ quality: QUALITY }).toFile(join(SITES_OUT, `${id}-cover.webp`));
  await sharp(flat).jpeg({ quality: QUALITY, mozjpeg: true }).toFile(join(SITES_OUT, `${id}-cover.jpg`));
  console.log(`  + ${id}-cover.{webp,jpg} <- logo ${file}`);
  return true;
}

/** Visu portfolio attēlu izmēri vienā manifestā (ceļš no /public saknes). */
async function buildSizeManifest() {
  const sizes = {};
  const walk = async (dir, webPrefix) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full, `${webPrefix}/${entry.name}`);
        continue;
      }
      if (!/\.(jpe?g|png)$/i.test(entry.name)) continue;
      const meta = await sharp(full).metadata();
      sizes[`${webPrefix}/${entry.name}`] = { width: meta.width, height: meta.height };
    }
  };
  await walk(PUB, "/portfolio");
  const ordered = Object.fromEntries(Object.keys(sizes).sort().map((k) => [k, sizes[k]]));
  await writeFile(join(ROOT, "src/data/image-sizes.json"), `${JSON.stringify(ordered, null, 2)}\n`, "utf8");
  console.log(`  + src/data/image-sizes.json (${Object.keys(ordered).length} attēli)`);
}

async function main() {
  await mkdir(SITES_OUT, { recursive: true });
  await mkdir(LOGOS_OUT, { recursive: true });

  console.log("Ekrānattēlu vāki:");
  for (const [id, file] of Object.entries(SHOT_BY_ID)) await coverFromShot(id, file);

  console.log("Logo vāki:");
  for (const [id, file] of Object.entries(LOGO_BY_ID)) await coverFromLogo(id, file);

  console.log("Izmēru manifests:");
  await buildSizeManifest();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

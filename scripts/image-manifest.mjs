/**
 * Attēlu izmēru manifests: public/portfolio -> src/data/image-sizes.json.
 *
 * Katram <img> vajag width/height, citādi lapa ielādes laikā lēkā (CLS).
 * Skripts ir atdalīts no prepare-covers.mjs, lai manifestu varētu pārbūvēt bez
 * vāku pārģenerēšanas - vāku avoti (~/Downloads/gatisdesign-portfolio/shots)
 * uz katras mašīnas nav.
 *
 * Platuma varianti (`-640.jpg`) manifestā neiet: tos izvēlas pārlūks pēc
 * srcset, un komponente izmērus ņem no bāzes faila. Sarakstam jāsakrīt ar
 * scripts/gallery-thumbs.mjs - vispārīgs `-\d+` šabloms te nederētu, jo
 * `apmekle-cover-169.jpg` ir kadra proporcija, ne platums.
 *
 * Palaišana: node scripts/image-manifest.mjs
 */
import sharp from "sharp";
import { readdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public/portfolio");

/** Platumi, ko ģenerē scripts/gallery-thumbs.mjs. */
const VARIANT_WIDTHS = [640];
const variantRe = new RegExp(`-(${VARIANT_WIDTHS.join("|")})\\.(jpe?g|png)$`, "i");
/** `logo-branding-01-640.jpg` ir variants, `apmekle-cover-169.jpg` - nav. */
const isWidthVariant = (name) => variantRe.test(name);

const sizes = {};
const walk = async (dir, webPrefix) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, `${webPrefix}/${entry.name}`);
      continue;
    }
    if (!/\.(jpe?g|png)$/i.test(entry.name)) continue;
    if (isWidthVariant(entry.name)) continue;
    const meta = await sharp(full).metadata();
    sizes[`${webPrefix}/${entry.name}`] = { width: meta.width, height: meta.height };
  }
};
await walk(PUB, "/portfolio");
const ordered = Object.fromEntries(Object.keys(sizes).sort().map((k) => [k, sizes[k]]));
await writeFile(join(ROOT, "src/data/image-sizes.json"), `${JSON.stringify(ordered, null, 2)}\n`, "utf8");
console.log(`src/data/image-sizes.json: ${Object.keys(ordered).length} attēli`);

/**
 * Hero un joslu fona kadri: divi platumi, WebP blakus JPG.
 *
 * Divi platumi ir mērījuma rezultāts, ne pieņēmums: ar vienu 1600 px kadru
 * Lighthouse mobilajā rādīja 145 KiB lieku svaru - telefons lejupielādēja
 * datora izmēra attēlu. Tagad `srcset` ļauj pārlūkam izvēlēties.
 *
 * Kadri vairs nav stock: 2026-09-06 visi deviņi aizstāti ar paša ģenerētiem
 * zīmola gaismā (melns, ogle, krēms, vara). Kritērijs katram ir viens un tas
 * pats - kadrā nav priekšmetu, tikai gaisma uz virsmas, un kreisā puse paliek
 * tumša, jo tur guļ virsraksts. Struktūra ir gatava video (HeroMedia `src`),
 * pats video vēl nav uzņemts.
 */
import sharp from "sharp";
import { readdir, stat, unlink } from "node:fs/promises";
import { join, parse } from "node:path";

const DIR = new URL("../public/media/", import.meta.url).pathname;
const WIDTHS = [960, 1600];
// HeroMedia deklarē width=1600 height=900. Līdz 2026-09-06 tie bija meli: stock
// kadri nāca 4:3, 3:2 un viens pat portretā (1600x2841), tāpēc pārlūkam dotā
// proporcija nesakrita ne ar vienu failu. Tagad griežam tieši 16:9, un
// deklarācija ir patiesa - centrēti, lai neaizbīdītu tumšo kreiso pusi.
const RATIO = 16 / 9;

// Piespiedu pelēkošana ar vara toni te bija diviem kadriem, kas stock versijā
// nāca purpura-magenta gaismā - tieši tas anti-paraugs, ko meklē katrs dizaina
// audits. Kopš 2026-09-06 avoti ir ģenerēti zīmola paletē, tāpēc labošanas
// slānis vairs nav vajadzīgs un ir izņemts: kadrs iet cauri tāds, kāds ir.

const all = await readdir(DIR);
// Ģenerētos variantus izmetam, lai atkārtota palaišana nerada variantus no variantiem.
for (const f of all) {
  if (/-\d+\.(jpe?g|webp)$/i.test(f) || /\.webp$/i.test(f)) await unlink(join(DIR, f));
}

const sources = (await readdir(DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));
for (const file of sources) {
  const src = join(DIR, file);
  const { name } = parse(file);
  const meta = await sharp(src).metadata();
  const lines = [];
  for (const w of WIDTHS) {
    const width = Math.min(w, meta.width ?? w);
    const base = sharp(src).resize({ width, height: Math.round(width / RATIO), fit: "cover" });
    await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(join(DIR, `${name}-${w}.jpg`));
    await base.clone().webp({ quality: 76, effort: 5 }).toFile(join(DIR, `${name}-${w}.webp`));
    const j = await stat(join(DIR, `${name}-${w}.jpg`));
    const p = await stat(join(DIR, `${name}-${w}.webp`));
    lines.push(`${w}w ${(j.size / 1024).toFixed(0)}/${(p.size / 1024).toFixed(0)} KB`);
  }
  // Bāzes fails paliek kā rezerve pārlūkiem bez srcset atbalsta.
  const plain = sharp(src).resize({ width: 1600, height: Math.round(1600 / RATIO), fit: "cover" });
  const buf = await plain.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  await sharp(buf).toFile(src);
  console.log(`${file.padEnd(22)} ${lines.join("  ")}`);
}
console.log(`Sagatavoti ${sources.length} kadri x ${WIDTHS.length} platumi`);

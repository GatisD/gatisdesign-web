import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Fontu preload saraksta apgriešana pēc SSG būves.
 *
 * vite-react-ssg katrai lapai izliek `<link rel="preload" as="font">` uz KATRU
 * fontu failu, ko atrod CSS, un konfigurācijas tam nav. Rezultāts bija seši
 * pieprasījumi ar High prioritāti tieši LCP attēla blakus - lai gan DM Mono
 * lapā parādās vienā vietā (etiķetes sānu kolonnā, tabulu galvās, parakstos
 * zem attēliem) un nekad nav tas, ko cilvēks izlasa pirmo.
 *
 * Tāpēc preload paliek TIKAI diviem Epilogue failiem: tie nes virsrakstu un
 * pamattekstu, un tieši tie ir kritiskajā ceļā. DM Mono ielādējas parastā
 * kārtībā pēc CSS - `font-display: swap` nozīmē, ka etiķete uzreiz ir redzama
 * sistēmas monospace fontā un pārzīmējas, kad fonts pienāk.
 *
 * Skripts ir daļa no `npm run build` un iet PIRMS būves vārtiem; vārti pēc tam
 * pārbauda, ka rezultāts ir tieši divi preload uz lapu.
 */

const DIST = join(process.cwd(), "dist");

/** Ko atstājam. Faila vārda sākums, jo Vite pieliek satura jaucējsummu. */
const KEEP = ["epilogue-latin-wght-normal", "epilogue-latin-ext-wght-normal"];

const PRELOAD = /<link\b[^>]*rel="preload"[^>]*as="font"[^>]*>/g;

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

let touched = 0;
let removed = 0;

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, "utf8");
  const next = html.replace(PRELOAD, (tag) => {
    const href = tag.match(/href="([^"]+)"/)?.[1] ?? "";
    const name = href.split("/").pop() ?? "";
    if (KEEP.some((prefix) => name.startsWith(prefix))) return tag;
    removed += 1;
    return "";
  });
  if (next !== html) {
    writeFileSync(file, next);
    touched += 1;
  }
}

console.log(
  `Preload apgriešana: ${removed} lieki fontu preload izņemti ${touched} lapās ` +
    `(paliek ${KEEP.length} uz lapu: ${KEEP.join(", ")})`,
);
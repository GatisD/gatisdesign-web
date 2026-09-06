import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * IndexNow: paziņo Bing, Yandex un Seznam par jaunām vai mainītām adresēm.
 *
 * Kāpēc tas te vispār ir: ChatGPT meklēšana un Copilot balstās uz Bing indeksu.
 * Ja lapas Bing indeksā nav, ne llms.txt, ne schema to neaizstāj - modelim
 * vienkārši nav ko atrast. IndexNow ir vienīgais veids, kā jaunu adresi tur
 * dabūt stundās, ne nedēļās.
 *
 * Palaist TIKAI pēc izvietošanas produkcijā:
 *
 *   node scripts/indexnow.mjs               # visas sitemap adreses
 *   node scripts/indexnow.mjs --dry-run     # tikai parāda, ko sūtītu
 *   node scripts/indexnow.mjs /kontakti /portfolio
 *
 * Atslēgas fails ir `public/<atslēga>.txt`, un tā saturs ir pati atslēga -
 * tā IndexNow pārbauda, ka adreses sūta domēna īpašnieks. Skripts to atrod pats,
 * tāpēc atslēgu nekur nedublē.
 */

const HOST = "gatisdesign.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const ROOT = process.cwd();
const KEY_FILE = /^[0-9a-f]{8,128}\.txt$/;

function findKey() {
  const dir = join(ROOT, "public");
  const file = readdirSync(dir).find((name) => KEY_FILE.test(name));
  if (!file) throw new Error("public/ mapē nav IndexNow atslēgas faila (<atslēga>.txt)");
  const key = readFileSync(join(dir, file), "utf8").trim();
  if (`${key}.txt` !== file) {
    throw new Error(`Atslēgas faila saturs (${key}) nesakrīt ar nosaukumu (${file})`);
  }
  return key;
}

/** Adreses no būvētā sitemap. Sitemap ir vienotais maršrutu avots, ne roku saraksts. */
function urlsFromSitemap() {
  const path = join(ROOT, "dist", "sitemap.xml");
  if (!existsSync(path)) throw new Error("dist/sitemap.xml neeksistē - vispirms npm run build");
  const xml = readFileSync(path, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const explicit = args.filter((a) => a.startsWith("/"));

const key = findKey();
const urlList = explicit.length > 0 ? explicit.map((p) => `https://${HOST}${p}`) : urlsFromSitemap();

// IndexNow pieņem līdz 10 000 adresēm vienā pieprasījumā; mums to ir 32.
if (urlList.length === 0) {
  console.error("Nav nevienas adreses, ko sūtīt");
  process.exit(1);
}
for (const url of urlList) {
  if (!url.startsWith(`https://${HOST}/`) && url !== `https://${HOST}` && url !== `https://${HOST}/`) {
    console.error(`Adrese nav uz ${HOST}: ${url}`);
    process.exit(1);
  }
}

const payload = { host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList };

console.log(`IndexNow: ${urlList.length} adreses, atslēga ${key.slice(0, 6)}...`);
for (const url of urlList) console.log("  -", url);

if (dryRun) {
  console.log("--dry-run: nekas netika nosūtīts");
  process.exit(0);
}

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

// 200 un 202 abi nozīmē pieņemts. 403 = atslēgas fails nav sasniedzams,
// 422 = adreses nesakrīt ar host, 429 = par biežu.
const body = await response.text();
console.log(`Atbilde: ${response.status} ${response.statusText}`, body.slice(0, 200));
if (response.status !== 200 && response.status !== 202) process.exit(1);

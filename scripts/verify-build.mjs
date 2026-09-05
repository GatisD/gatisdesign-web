import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = join(process.cwd(), "dist");
const errors = [];

function read(p) {
  const full = join(DIST, p);
  return existsSync(full) ? readFileSync(full, "utf8") : null;
}

// 1. robots.txt nedrīkst būt pārrakstīts ar noklusējumu
const robots = read("robots.txt");
if (!robots) {
  errors.push("dist/robots.txt neeksistē");
} else {
  // GPTBot ir apmācībai, bet ChatGPT meklēšanas rezultāti nāk no OAI-SearchBot,
  // un AI Overviews - no Google-Extended. Trūkstošs bots nav sintakses kļūda,
  // tāpēc to nepamana neviens cits, kā tikai šie vārti.
  for (const bot of [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "anthropic-ai",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
  ]) {
    if (!robots.includes(bot)) errors.push(`robots.txt trūkst ${bot} sadaļas`);
  }
}

// 2. hreflang: katrā lapā jābūt abām valodām un x-default
for (const page of ["index.html", "kontakti.html", "en/contact.html"]) {
  const html = read(page);
  if (!html) { errors.push(`dist/${page} neeksistē`); continue; }
  if (!html.includes('hreflang="lv"')) errors.push(`${page}: trūkst hreflang lv`);
  if (!html.includes('hreflang="en"')) errors.push(`${page}: trūkst hreflang en`);
  if (!html.includes('hreflang="x-default"')) errors.push(`${page}: trūkst x-default`);
}

// 3. lang atribūts atbilst valodai
const enHtml = read("en/contact.html");
if (enHtml && !/<html[^>]*lang="en"/.test(enHtml)) errors.push("en/contact.html: <html lang> nav en");

// 4. og:image ir absolūts un nedublējas
for (const page of ["index.html", "en/contact.html"]) {
  const html = read(page);
  if (!html) continue;
  const m = [...html.matchAll(/property="og:image"\s+content="([^"]+)"/g)];
  if (m.length === 0) errors.push(`${page}: nav og:image`);
  if (m.length > 1) errors.push(`${page}: og:image dublējas ${m.length}x`);
  for (const [, url] of m) {
    if (!url.startsWith("https://")) errors.push(`${page}: og:image nav absolūts (${url})`);
  }
}

// 5. sitemap satur abu valodu ceļus un neatkārtojas
const sitemap = read("sitemap.xml");
if (!sitemap) errors.push("dist/sitemap.xml neeksistē");
else {
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (new Set(locs).size !== locs.length) errors.push("sitemap satur dublētus URL");
  // Sitemap nedrīkst piedāvāt Google lapu, kas pati sevi aizliedz indeksēt.
  // Šis vārts turēs arī tad, kad EN tulkojums būs gatavs un EN atgriezīsies
  // sitemapā - tad noindex tur vairs nebūs, un vārts nostrādās pats no sevis.
  for (const loc of locs) {
    const p = new URL(loc).pathname.replace(/\/$/, "");
    const file = p === "" ? "index.html" : `${p.slice(1)}.html`;
    const html = read(file) ?? read(`${p.slice(1)}/index.html`);
    if (html && /name="robots"[^>]*content="[^"]*noindex/.test(html)) {
      errors.push(`sitemap satur noindex lapu: ${p}`);
    }
  }

  // 6. Katram sitemap URL jābūt reālam failam. Sitemap ar 404 lapām ir
  // sliktāks par sitemap bez tām - Search Console tās skaita kā kļūdas.
  for (const loc of locs) {
    const p = new URL(loc).pathname.replace(/\/$/, "");
    const file = p === "" ? "index.html" : `${p.slice(1)}.html`;
    if (!existsSync(join(DIST, file)) && !existsSync(join(DIST, p.slice(1), "index.html"))) {
      errors.push(`sitemap norāda uz neeksistējošu lapu: ${p}`);
    }
  }
}

if (errors.length) {
  console.error("Būves vārti KRITA:");
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
console.log("Būves vārti: viss kārtībā");

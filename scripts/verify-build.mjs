import { readFileSync, existsSync, readdirSync, statSync, cpSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { tmpdir } from "node:os";

/**
 * Būves vārti.
 *
 * Noteikums: katram vārtam jābūt tādam, ka to var salauzt un tas to pamana.
 * `node scripts/verify-build.mjs --selftest` paņem dist kopiju, ievieš tajā
 * zināmi sliktus paraugus un pieprasa, lai katrs no tiem KRIT - pozitīvā
 * kontrole (tīra kopija) tajā pašā piegājienā. Vārti, kas nekad nav redzējuši
 * savu kļūdu, ir tikai iekārtas troksnis.
 *
 * Vēsture: iepriekšējā versija pārbaudīja 2 lapas no 66, pielaida vienas
 * `text-label` klases zudumu (skaitīja pa lapu, ne pa elementu) un pavisam
 * nezināja par noteikumu "EN lapa ir noindex, kamēr nav EN satura" - tieši tas
 * vienā lapā no 35 arī bija pazudis.
 */

const ROOT = process.cwd();
const AI_BOTS = [
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
];

/** Visi dist HTML faili, ceļš ar / arī uz Windows. */
function htmlPages(dist) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith(".html")) out.push(relative(dist, full).split(sep).join("/"));
    }
  };
  walk(dist);
  return out.sort();
}

const attr = (html, re) => {
  const m = html.match(re);
  return m ? m[1] : null;
};

const isEnPage = (page) => page === "en.html" || page.startsWith("en/");
const isNotFound = (page) => page === "404.html" || page === "en/404.html";

function checkDist(dist) {
  const errors = [];
  const read = (p) => {
    const full = join(dist, p);
    return existsSync(full) ? readFileSync(full, "utf8") : null;
  };

  // 1. robots.txt: trūkstošs AI bots nav sintakses kļūda, tāpēc to nepamana neviens cits.
  const robots = read("robots.txt");
  if (!robots) errors.push("dist/robots.txt neeksistē");
  else for (const bot of AI_BOTS) {
    if (!robots.includes(bot)) errors.push(`robots.txt trūkst ${bot} sadaļas`);
  }

  const pages = htmlPages(dist);
  if (pages.length < 60) errors.push(`dist satur tikai ${pages.length} HTML lapas - gaidītas vismaz 60`);
  if (!existsSync(join(dist, "404.html"))) errors.push("dist/404.html neeksistē");

  const seen = { title: new Map(), description: new Map(), canonical: new Map() };

  for (const page of pages) {
    const html = read(page);
    if (!html) continue;
    const where = `${page}:`;

    // 2. lang atbilst valodai.
    const lang = attr(html, /<html[^>]*\blang="([^"]+)"/);
    const wantLang = isEnPage(page) ? "en" : "lv";
    if (lang !== wantLang) errors.push(`${where} <html lang> ir ${lang ?? "nav"}, gaidīts ${wantLang}`);

    // 3. hreflang pāri un x-default katrā maršruta lapā.
    if (!isNotFound(page)) {
      for (const tag of ['hreflang="lv"', 'hreflang="en"', 'hreflang="x-default"']) {
        if (!html.includes(tag)) errors.push(`${where} trūkst ${tag}`);
      }
    }

    // 4. og:image absolūts un tikai viens.
    const og = [...html.matchAll(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/g)];
    if (og.length === 0) errors.push(`${where} nav og:image`);
    if (og.length > 1) errors.push(`${where} og:image dublējas ${og.length}x`);
    for (const [, url] of og) {
      if (!url.startsWith("https://")) errors.push(`${where} og:image nav absolūts (${url})`);
    }

    // 5. Mono etiķetes izmērs PA ELEMENTU, ne pa lapu. `text-label` ir mūsu
    //    pašu izmērs, un tailwind-merge to bez konfigurācijas uzskata par krāsu
    //    un izmet. Iepriekšējā skaitīšana pa lapu pielaida vienas etiķetes
    //    zudumu, jo LanguageSwitch atdalītājs lieto `text-label` bez
    //    `font-label` un skaitītājam bija +1 rezerve.
    for (const [, cls] of html.matchAll(/class="([^"]*\bfont-label\b[^"]*)"/g)) {
      // Der `text-label` (12 px tokens) vai apzināti uzstādīts cits izmērs
      // (galvenes vārdzīmē etiķete ir 11 px). Nedrīkst būt tikai fonts bez
      // izmēra - tieši tad tailwind-merge klasi klusi izmet.
      if (!/\btext-label\b/.test(cls) && !/\btext-\[[^\]]+\]/.test(cls)) {
        errors.push(`${where} font-label bez izmēra klases: class="${cls.slice(0, 90)}"`);
      }
    }

    // 6. EN lapas ir noindex, kamēr src/content/en/ nav. Kad EN saturs būs
    //    gatavs, šis vārts jāizņem kopā ar `const noindex = !isLv`.
    const noindex = /name="robots"[^>]*content="[^"]*noindex/.test(html);
    if (isEnPage(page) && !noindex) errors.push(`${where} EN lapa bez noindex`);

    // 7. Virsraksts, apraksts, canonical - katrā lapā, un unikāli starp tām
    //    lapām, kuras Google drīkst indeksēt.
    const title = attr(html, /<title[^>]*>([^<]*)<\/title>/);
    const description = attr(html, /<meta[^>]*name="description"[^>]*content="([^"]*)"/);
    const canonical = attr(html, /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/);
    if (!title || title.length < 10) errors.push(`${where} nav derīga <title>`);
    if (!description || description.length < 50) errors.push(`${where} nav derīga meta description`);
    if (isNotFound(page)) {
      // 404 lapai canonical uz citu lapu ir pretrunīgs signāls: "neindeksē
      // mani" un "īstā lapa ir sākumlapa" vienlaikus.
      if (canonical) errors.push(`${where} 404 lapai ir canonical (${canonical})`);
    } else if (!canonical || !canonical.startsWith("https://")) {
      errors.push(`${where} nav absolūta canonical`);
    }
    if (!noindex && !isNotFound(page)) {
      for (const [field, value] of [["title", title], ["description", description], ["canonical", canonical]]) {
        if (!value) continue;
        const first = seen[field].get(value);
        if (first) errors.push(`${where} ${field} sakrīt ar ${first}`);
        else seen[field].set(value, page);
      }
    }

    // 8. Fontu preload: tikai divi Epilogue faili. vite-react-ssg izliek
    //    preload uz katru fontu failu, ko atrod CSS, un seši preload ar High
    //    prioritāti stāv tieši LCP attēla blakus (sk. scripts/tune-preloads.mjs).
    const preloads = [...html.matchAll(/<link\b[^>]*rel="preload"[^>]*as="font"[^>]*>/g)];
    if (preloads.length !== 2) {
      errors.push(`${where} fontu preload ir ${preloads.length}, gaidīti 2`);
    }
    for (const [tag] of preloads) {
      const href = tag.match(/href="([^"]+)"/)?.[1] ?? "";
      if (!href.endsWith(".woff2")) errors.push(`${where} preload nav woff2: ${href}`);
      if (!/epilogue-latin(-ext)?-wght-normal/.test(href)) {
        errors.push(`${where} preload nav Epilogue teksta fonts: ${href}`);
      }
      if (href.startsWith("/") && !existsSync(join(dist, href.slice(1)))) {
        errors.push(`${where} preload norāda uz neesošu failu: ${href}`);
      }
    }

    // 9. h1 rindas atdala īsta atstarpe. Bez tās `textContent` deva
    //    "Mājaslapuizstrāde" - tieši to redz katrs teksta izvilcējs, kas
    //    nerenderē CSS.
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (!h1) errors.push(`${where} nav <h1>`);
    else {
      const lines = [...h1[1].matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map((m) => m[1]);
      for (let i = 0; i < lines.length - 1; i += 1) {
        if (!/\s$/.test(lines[i])) {
          errors.push(`${where} h1 rindas bez atstarpes: ${JSON.stringify(lines.join(""))}`);
          break;
        }
      }
    }
  }

  // 10. index.html galvas atsauces norāda uz reāliem failiem (apple-touch-icon
  //    404 katram iOS pamana tikai šis vārts).
  const index = read("index.html");
  if (index) {
    const head = index.slice(0, index.indexOf("</head>"));
    for (const [, href] of head.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
      const clean = href.split("?")[0].split("#")[0];
      if (clean.startsWith("//")) continue;
      if (!existsSync(join(dist, clean.slice(1)))) errors.push(`index.html galva norāda uz neesošu failu: ${clean}`);
    }
  }

  // 11. sitemap: bez dublikātiem, bez noindex lapām, bez mirušiem URL.
  const sitemap = read("sitemap.xml");
  if (!sitemap) errors.push("dist/sitemap.xml neeksistē");
  else {
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    if (new Set(locs).size !== locs.length) errors.push("sitemap satur dublētus URL");
    for (const loc of locs) {
      const p = new URL(loc).pathname.replace(/\/$/, "");
      const file = p === "" ? "index.html" : `${p.slice(1)}.html`;
      const html = read(file) ?? read(`${p.slice(1)}/index.html`);
      if (!html) errors.push(`sitemap norāda uz neeksistējošu lapu: ${p}`);
      else if (/name="robots"[^>]*content="[^"]*noindex/.test(html)) {
        errors.push(`sitemap satur noindex lapu: ${p}`);
      }
    }
  }

  // 12. Kontaktu lapā nonāk KATRA satura sadaļa. Pretējais virziens - sadaļa
  //     ir JSON, lapa to nerāda - iepriekš nebija segts ne ar testu, ne ar
  //     vārtiem, un trīs sadaļas klusi nebija lapā.
  const kontakti = read("kontakti.html");
  const contentPath = join(ROOT, "src/content/lv/kontakti.json");
  if (kontakti && existsSync(contentPath)) {
    const text = kontakti
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ");
    const content = JSON.parse(readFileSync(contentPath, "utf8"));
    for (const section of content.sections) {
      const probe = (section.body?.[0] ?? "").slice(0, 60).replace(/\s+/g, " ").trim();
      if (probe && !text.includes(probe)) {
        errors.push(`kontakti.html trūkst sadaļas "${section.heading}" teksta`);
      }
    }
  }

  // 13. Redzamā h1 sakrīt ar satura faila `h1` lauku. Šis lauks gadu bija
  //     deklarēts, aizpildīts un nelasīts nekur, tāpēc meta tabulā ierakstītie
  //     virsrakstu labojumi lapā nekad nenonāca. Tagad tas ir avots, un vārti
  //     to notur.
  for (const [page, file] of Object.entries(H1_SOURCE)) {
    const html = read(page);
    const contentPath = join(ROOT, "src/content/lv", file);
    if (!html || !existsSync(contentPath)) continue;
    const raw = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (!raw) continue; // trūkstošu h1 jau ziņo 9. vārti
    const visible = raw[1]
      .replace(/<[^>]+>/g, "")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
    const expected = JSON.parse(readFileSync(contentPath, "utf8")).h1.replace(/\s+/g, " ").trim();
    if (visible !== expected) {
      errors.push(`${page}: h1 lapā ir "${visible}", satura failā "${expected}"`);
    }
  }

  // 14. llms.txt atbilst llmstxt.org formai: viens H1, saites Markdown formā un
  //     visas sitemap lapas failā. Kails URL pārbaudītājam nav saite - tieši to
  //     ziņoja Chrome Agentic Browsing audits.
  const llms = read("llms.txt");
  if (!llms) errors.push("dist/llms.txt neeksistē");
  else {
    const h1s = llms.split("\n").filter((line) => /^# \S/.test(line));
    if (h1s.length !== 1) errors.push(`llms.txt satur ${h1s.length} H1 rindas, gaidīta 1`);
    const links = [...llms.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+|mailto:[^)]+)\)/g)];
    if (links.length < 40) errors.push(`llms.txt ir ${links.length} Markdown saites, gaidītas vismaz 40`);
    if (/[–— ]/.test(llms)) errors.push("llms.txt satur garo domuzīmi vai cieto atstarpi");
    const inFile = new Set(links.map(([, url]) => url.replace(/\/$/, "")));
    const sitemapLocs = sitemap ? [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]) : [];
    for (const loc of sitemapLocs) {
      if (!inFile.has(loc.replace(/\/$/, ""))) errors.push(`llms.txt trūkst sitemap adreses: ${loc}`);
    }
  }

  // 15. Markdown saite, kas palikusi redzamā tekstā. `[enkurs](/cels)` ir
  //     satura forma, ne izvads: ja rindkopu renderē komponente, kas nelieto
  //     LinkedText, cilvēks lapā redz kvadrātiekavas ar ceļu. Tieši tā notika
  //     sākumlapas kontaktu sadaļā.
  for (const page of pages) {
    const html = read(page);
    if (!html) continue;
    const text = html.replace(/<script[\s\S]*?<\/script>/g, " ");
    const leaks = [...text.matchAll(/\[[^\]\n]{2,80}\]\((\/[a-z0-9/-]+|https:\/\/[^)\s]+)\)/g)];
    for (const [leak] of leaks.slice(0, 3)) {
      errors.push(`${page}: Markdown saite palikusi tekstā: ${leak.slice(0, 70)}`);
    }
  }

  // 16. Darbu skaits tekstā sakrīt ar darbu skaitu datos.
  //
  //     Meta apraksts gadu apgalvoja "23 pabeigti projekti", un pēc tam, kad
  //     4. kārta pievienoja desmit vietnes, lapa rādīja 33. Meta apraksts nāk
  //     no `projects.length`, bet `llms.txt` ir rakstīts ar roku - tāpēc abi
  //     tiek salīdzināti ar to, kas dist mapē tiešām ir.
  {
    const detailPages = pages.filter((page) => /^portfolio\/[^/]+\.html$/.test(page));
    const total = detailPages.length;
    const indexable = sitemap
      ? [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].filter((m) => m[1].includes("/portfolio/")).length
      : 0;

    if (total === 0) errors.push("dist nesatur nevienu projekta lapu");

    const portfolio = read("portfolio.html");
    if (portfolio) {
      const description = attr(portfolio, /<meta[^>]*name="description"[^>]*content="([^"]*)"/) ?? "";
      if (!description.startsWith(`${total} publicēti darbi`)) {
        errors.push(`portfolio.html meta apraksts nesākas ar "${total} publicēti darbi": ${description.slice(0, 40)}`);
      }
    }

    if (llms) {
      for (const claim of [`${total} publicēti darbi`, `${total} published works`]) {
        if (!llms.includes(claim)) errors.push(`llms.txt trūkst apgalvojuma "${claim}"`);
      }
      // Katrs skaitlis pie "publicēti darbi" un "published works", ne tikai
      // pirmais: viena vieta failā var palikt atpakaļ, un tieši tā notiek.
      const counted = /(\d+) (?:publicēti darbi|published works)|Publicētie darbi: (\d+)/g;
      for (const [phrase, a, b] of llms.matchAll(counted)) {
        const count = a ?? b;
        if (Number(count) !== total) {
          errors.push(`llms.txt saka "${phrase}", bet dist satur ${total} projektu lapas`);
        }
      }
      const listed = [...llms.matchAll(/\]\(https:\/\/gatisdesign\.com\/portfolio\/[a-z0-9-]+\)/g)].length;
      if (listed !== indexable) {
        errors.push(`llms.txt uzskaita ${listed} projektu lapas, sitemapā to ir ${indexable}`);
      }
      if (!llms.includes(`uzskaitīti tie ${indexable},`)) {
        errors.push(`llms.txt nesaka, ka uzskaitītas tieši ${indexable} projektu lapas`);
      }
    }
  }

  return errors;
}

/** Lapa dist mapē -> satura fails, no kura nāk tās h1. */
const H1_SOURCE = {
  "index.html": "home.json",
  "zimola-identitate.html": "zimola-identitate.json",
  "majaslapu-izstrade.html": "majaslapu-izstrade.json",
  "ai-agenti.html": "ai-agenti.json",
  "seo-geo-aeo.html": "seo-geo-aeo.json",
  "par-mani.html": "par-mani.json",
  "kontakti.html": "kontakti.json",
};

/* ------------------------------------------------------------------ *
 * Selftests: katram vārtam sava zināmi sliktā kopija.
 * ------------------------------------------------------------------ */

const MUTATIONS = [
  {
    name: "robots.txt bez GPTBot",
    apply: (d) => writeFileSync(join(d, "robots.txt"), readFileSync(join(d, "robots.txt"), "utf8").replace(/GPTBot/g, "NavBot")),
  },
  {
    name: "viena text-label klase pazudusi",
    apply: (d) => {
      const p = join(d, "index.html");
      const html = readFileSync(p, "utf8");
      writeFileSync(p, html.replace(/(class="[^"]*\bfont-label\b[^"]*)\btext-label\b/, "$1"));
    },
  },
  {
    name: "EN lapa bez noindex",
    apply: (d) => {
      const p = join(d, "en/privacy-policy.html");
      writeFileSync(p, readFileSync(p, "utf8").replace(/<meta[^>]*name="robots"[^>]*>/, ""));
    },
  },
  {
    name: "h1 rindas salipušas",
    apply: (d) => {
      const p = join(d, "majaslapu-izstrade.html");
      writeFileSync(p, readFileSync(p, "utf8").replace(/(<h1[^>]*>[\s\S]*?<\/h1>)/, (m) => m.replace(/ <\/span>/g, "</span>")));
    },
  },
  {
    name: "sitemap ar neesošu lapu",
    apply: (d) => {
      const p = join(d, "sitemap.xml");
      writeFileSync(p, readFileSync(p, "utf8").replace("</urlset>", "<url><loc>https://gatisdesign.com/nav-tada</loc></url></urlset>"));
    },
  },
  {
    name: "galvā atsauce uz neesošu failu",
    apply: (d) => {
      const p = join(d, "index.html");
      writeFileSync(p, readFileSync(p, "utf8").replace("<head>", '<head><link rel="icon" href="/nav-tada-ikona.png"/>'));
    },
  },
  {
    name: "kontaktu sadaļa pazudusi no lapas",
    apply: (d) => {
      const p = join(d, "kontakti.html");
      const html = readFileSync(p, "utf8");
      writeFileSync(p, html.replace(/Strādāju viens, tāpēc katru pieteikumu/g, "").replace(/Strādāju viens, tāpēc katru pieprasījumu/g, ""));
    },
  },
  {
    name: "atgriezies lieks fontu preload",
    apply: (d) => {
      const p = join(d, "index.html");
      writeFileSync(
        p,
        readFileSync(p, "utf8").replace(
          "<head>",
          '<head><link rel="preload" as="font" type="font/woff2" href="/assets/dm-mono-latin-400-normal.woff2" crossorigin>',
        ),
      );
    },
  },
  {
    name: "h1 lapā aizgājis no satura faila",
    apply: (d) => {
      const p = join(d, "seo-geo-aeo.html");
      writeFileSync(p, readFileSync(p, "utf8").replace(/(<h1[^>]*>)([\s\S]*?)(<\/h1>)/, "$1<span>Cits virsraksts</span>$3"));
    },
  },
  {
    name: "Markdown saite palikusi redzamā tekstā",
    apply: (d) => {
      const p = join(d, "par-mani.html");
      const html = readFileSync(p, "utf8");
      writeFileSync(p, html.replace("</main>", "<p>Vairāk [par mani](/par-mani) lapā.</p></main>"));
    },
  },
  {
    name: "llms.txt bez Markdown saitēm",
    apply: (d) => {
      const p = join(d, "llms.txt");
      writeFileSync(p, readFileSync(p, "utf8").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$2"));
    },
  },
  {
    name: "darbu skaits tekstā atpalicis no datiem",
    apply: (d) => {
      const p = join(d, "llms.txt");
      writeFileSync(p, readFileSync(p, "utf8").replace(/33 publicēti darbi/g, "23 publicēti darbi"));
    },
  },
  {
    name: "404 lapai uzlikts canonical",
    apply: (d) => {
      const p = join(d, "404.html");
      writeFileSync(p, readFileSync(p, "utf8").replace("<head>", '<head><link rel="canonical" href="https://gatisdesign.com"/>'));
    },
  },
];

function selftest(dist) {
  const base = join(tmpdir(), `verify-build-selftest-${process.pid}`);
  rmSync(base, { recursive: true, force: true });
  let failures = 0;

  const clean = join(base, "clean");
  cpSync(dist, clean, { recursive: true });
  const cleanErrors = checkDist(clean);
  if (cleanErrors.length) {
    failures += 1;
    console.error("  pozitīvā kontrole (tīra kopija) KRITA:");
    for (const e of cleanErrors) console.error("     -", e);
  } else {
    console.log("  pozitīvā kontrole (tīra kopija): iziet, kā jābūt");
  }

  for (const [i, mutation] of MUTATIONS.entries()) {
    const dir = join(base, `bad-${i}`);
    cpSync(dist, dir, { recursive: true });
    mutation.apply(dir);
    const errors = checkDist(dir);
    if (errors.length === 0) {
      failures += 1;
      console.error(`  "${mutation.name}": vārti to NEPAMANĪJA`);
    } else {
      console.log(`  "${mutation.name}": noķerts (${errors.length}) - ${errors[0].slice(0, 90)}`);
    }
    rmSync(dir, { recursive: true, force: true });
  }

  rmSync(base, { recursive: true, force: true });
  return failures;
}

/* ------------------------------------------------------------------ */

const DIST = join(ROOT, "dist");
if (!existsSync(DIST)) {
  console.error("Būves vārti KRITA: dist/ neeksistē");
  process.exit(1);
}

if (process.argv.includes("--selftest")) {
  console.log("Būves vārtu selftests:");
  const failures = selftest(DIST);
  if (failures) {
    console.error(`Selftests KRITA: ${failures} vārti nedara to, ko sola`);
    process.exit(1);
  }
  console.log("Selftests: visi vārti ķer savu kļūdu");
  process.exit(0);
}

const errors = checkDist(DIST);
if (errors.length) {
  console.error("Būves vārti KRITA:");
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
console.log(`Būves vārti: viss kārtībā (${htmlPages(DIST).length} lapas)`);

import { describe, it, expect } from "vitest";
import { serviceContent, priceRangeFor, type ServiceRouteKey } from "./index";
import { ROUTES, pathForPathname } from "@/i18n/routes";
import { h1Lines } from "./h1";
import { SERVICE_HERO } from "@/components/content/serviceHero";

const entries = Object.entries(serviceContent) as [ServiceRouteKey, (typeof serviceContent)[ServiceRouteKey]][];

/** Visi teksti no viena satura faila vienā plakanā sarakstā. */
function allStrings(key: ServiceRouteKey): string[] {
  const content = serviceContent[key];
  const out = [content.title, content.metaTitle, content.metaDescription, content.h1, content.directAnswer];
  if (content.cta) out.push(content.cta);
  for (const section of content.sections) {
    if (section.kicker) out.push(section.kicker);
    out.push(section.heading, ...section.body, ...(section.bullets ?? []));
    for (const step of section.steps ?? []) {
      out.push(step.title, step.text);
      if (step.meta) out.push(step.meta);
    }
    if (section.table) out.push(section.table.caption, ...section.table.columns, ...section.table.rows.flat());
  }
  for (const item of content.faq) out.push(item.q, item.a);
  return out;
}

describe("pakalpojumu saturs", () => {
  it("katram pakalpojumu maršrutam ir saturs", () => {
    const serviceKeys = Object.keys(ROUTES).filter((k) => k.startsWith("services."));
    expect(Object.keys(serviceContent).sort()).toEqual(serviceKeys.sort());
  });

  it.each(entries)("%s: obligātie lauki ir aizpildīti", (_key, content) => {
    expect(content.slug).toMatch(/^[a-z0-9-]+$/);
    expect(content.metaTitle.length).toBeGreaterThan(10);
    expect(content.metaDescription.length).toBeGreaterThan(50);
    expect(content.h1.length).toBeGreaterThan(5);
    expect(content.directAnswer.length).toBeGreaterThan(80);
    expect(content.sections.length).toBeGreaterThan(3);
    expect(content.faq.length).toBeGreaterThan(3);
  });

  it.each(entries)("%s: slug sakrīt ar LV maršrutu", (key, content) => {
    expect(ROUTES[key].lv).toBe(`/${content.slug}`);
  });

  it.each(entries)("%s: tabulās katrā rindā ir tik šūnu, cik kolonnu", (_key, content) => {
    for (const section of content.sections) {
      if (!section.table) continue;
      expect(section.table.caption.length).toBeGreaterThan(0);
      for (const row of section.table.rows) {
        expect(row).toHaveLength(section.table.columns.length);
      }
    }
  });

  it.each(entries)("%s: tekstos ir tikai īsā defise", (key) => {
    for (const text of allStrings(key)) {
      expect(text, text.slice(0, 60)).not.toMatch(/[–—]/);
    }
  });

  it.each(entries)("%s: katram procesa solim ir virsraksts un teksts", (_key, content) => {
    for (const section of content.sections) {
      for (const step of section.steps ?? []) {
        expect(step.title.length, step.title).toBeGreaterThan(2);
        expect(step.text.length, step.title).toBeGreaterThan(20);
        // Numuru zīmē StepFlow (01, 02, ...), tāpēc virsrakstā tā nav.
        expect(step.title, step.title).not.toMatch(/^\d/);
      }
    }
  });

  it.each(entries)("%s: cenu diapazons nāk no cenu tabulas", (_key, content) => {
    const range = priceRangeFor(content);
    expect(range).not.toBeNull();
    expect(range!.low).toBeGreaterThan(0);
    expect(range!.high).toBeGreaterThanOrEqual(range!.low);
  });

  it("cenu diapazonā neiekļauj ikmēneša un stundas likmes", () => {
    // Mājaslapu lapā uzturēšana ir 50-80 EUR/mēn - tā nedrīkst kļūt par zemāko cenu.
    expect(priceRangeFor(serviceContent["services.web"])).toEqual({ low: 500, high: 2500, count: 3 });
    // AI lapā ir gan 100 EUR/mēn, gan 60 EUR/h - abas jāizlaiž.
    expect(priceRangeFor(serviceContent["services.ai"])).toEqual({ low: 400, high: 2500, count: 3 });
  });

  // Šie skaitļi ir nolasīti no cenu tabulām ar roku 2026-09-06 un ir NEATKARĪGS
  // orākuls. Iepriekš te stāvēja tests, kas `priceRangeFor` filtrēšanu uzrakstīja
  // vēlreiz un tad salīdzināja funkciju ar savu kopiju: ja loģika kļūdījās, abas
  // puses kļūdījās vienādi un tests palika zaļš. Tests, kas atkārto testējamo,
  // nepārbauda neko - tas tikai apliecina, ka divas vienādas rindas ir vienādas.
  //
  // Zemākā cena zīmola lapā ir 120, ne 200: tā nāk no drukas materiālu rindas
  // "120-900 EUR", un funkcija ņem VISUS skaitļus derīgā šūnā, ne tikai pirmo.
  const GAIDĪTIE: Record<ServiceRouteKey, { low: number; high: number; count: number }> = {
    "services.web": { low: 500, high: 2500, count: 3 },
    "services.ai": { low: 400, high: 2500, count: 3 },
    "services.brand": { low: 120, high: 3000, count: 6 },
    "services.seo": { low: 300, high: 1200, count: 5 },
  };

  it.each(entries)("%s: cenu diapazons un rindu skaits sakrīt ar tabulu", (key, content) => {
    expect(priceRangeFor(content), key).toEqual(GAIDĪTIE[key]);
  });

  it("gaidīto cenu tabula sedz katru pakalpojumu lapu", () => {
    // Bez šī jauna lapa klusi paliktu bez sava skaitļa, un augšējais tests
    // salīdzinātu ar `undefined`.
    expect(Object.keys(GAIDĪTIE).sort()).toEqual(Object.keys(serviceContent).sort());
  });

  it.each(entries)("%s: h1 rindu lūzums ir teksta robežās", (key, content) => {
    const lines = h1Lines(content.h1, content.h1BreakAfter);
    expect(lines.join(" ")).toBe(content.h1.trim());
    expect(lines[0].length, key).toBeGreaterThan(2);
    expect(lines[1].length, key).toBeGreaterThan(2);
  });

  it.each(entries)("%s: iekšējās saites saturā ved uz esošu ceļu", (key, content) => {
    // `[enkurs](/cels)` saturā ir tikpat lauzta saite, cik `/undefined`, ja
    // ceļa nav ne ROUTES kartē, ne projektu slug sarakstā.
    for (const text of allStrings(key)) {
      for (const [, target] of text.matchAll(/\[[^\]]+\]\((\/[a-z0-9/-]+)\)/g)) {
        expect(pathForPathname(target, "lv"), `${key}: ${target}`).not.toBeNull();
      }
    }
  });
});

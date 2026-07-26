import { describe, it, expect } from "vitest";
import { serviceContent, priceRangeFor, type ServiceRouteKey } from "./index";
import { ROUTES } from "@/i18n/routes";

const entries = Object.entries(serviceContent) as [ServiceRouteKey, (typeof serviceContent)[ServiceRouteKey]][];

/** Visi teksti no viena satura faila vienā plakanā sarakstā. */
function allStrings(key: ServiceRouteKey): string[] {
  const content = serviceContent[key];
  const out = [content.title, content.metaTitle, content.metaDescription, content.h1, content.directAnswer];
  if (content.cta) out.push(content.cta);
  for (const section of content.sections) {
    if (section.kicker) out.push(section.kicker);
    out.push(section.heading, ...section.body, ...(section.bullets ?? []));
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

  it.each(entries)("%s: cenu diapazons nāk no cenu tabulas", (_key, content) => {
    const range = priceRangeFor(content);
    expect(range).not.toBeNull();
    expect(range!.low).toBeGreaterThan(0);
    expect(range!.high).toBeGreaterThanOrEqual(range!.low);
  });

  it("cenu diapazonā neiekļauj ikmēneša un stundas likmes", () => {
    // Mājaslapu lapā uzturēšana ir 50-80 EUR/mēn - tā nedrīkst kļūt par zemāko cenu.
    expect(priceRangeFor(serviceContent["services.web"])).toEqual({ low: 500, high: 2500 });
    // AI lapā ir gan 100 EUR/mēn, gan 60 EUR/h - abas jāizlaiž.
    expect(priceRangeFor(serviceContent["services.ai"])).toEqual({ low: 400, high: 2500 });
  });
});

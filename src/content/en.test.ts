import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * EN saturs pret LV: katram LV failam ir EN fails ar tādu pašu struktūru
 * (tie paši lauki, tikpat sadaļu, punktu, soļu, tabulu rindu un FAQ), tie
 * paši iekšējo saišu mērķi (EN saturā ceļi paliek LV - tos tulko maršrutu
 * karte), tās pašas cenas un derīgs h1 lūzums. Bez šī testa tulkojums var
 * klusi izlaist rindkopu vai saiti, un lapa abās valodās solītu dažādas lietas.
 */
const dir = (locale: string) => new URL(`./${locale}/`, import.meta.url);
const read = (locale: string, file: string) => JSON.parse(readFileSync(new URL(file, dir(locale)), "utf8"));

function shape(o: unknown): unknown {
  if (Array.isArray(o)) return o.map(shape);
  if (o && typeof o === "object") {
    return Object.fromEntries(
      Object.entries(o as Record<string, unknown>)
        .filter(([k]) => k !== "kicker" && k !== "internalLinks")
        .map(([k, v]) => [k, shape(v)]),
    );
  }
  return typeof o;
}
const links = (o: unknown) =>
  [...JSON.stringify(o).matchAll(/\]\((\/[^)]*)\)|-> (\/[^"\s]+)/g)].map((m) => m[1] ?? m[2]).sort();
const prices = (o: unknown) =>
  [...JSON.stringify(o).matchAll(/\b(\d[\d.,]*)\s?EUR/g)].map((m) => m[1].replace(",", ".")).sort();

const files = readdirSync(dir("lv")).filter((f) => f.endsWith(".json"));

describe("EN saturs pret LV", () => {
  it("katram LV failam ir EN fails", () => {
    const en = readdirSync(dir("en")).filter((f) => f.endsWith(".json"));
    expect(en.sort()).toEqual(files.sort());
  });

  it.each(files)("%s: struktūra, saites, cenas un h1 sakrīt", (file) => {
    const lv = read("lv", file);
    const en = read("en", file);
    expect(shape(en)).toEqual(shape(lv));
    expect(links(en)).toEqual(links(lv));
    expect(prices(en)).toEqual(prices(lv));
    expect(/[\u2013\u2014\u00a0]/.test(JSON.stringify(en))).toBe(false);
    if (typeof en.h1 === "string" && typeof en.h1BreakAfter === "number") {
      const words = en.h1.trim().split(/\s+/).length;
      expect(en.h1BreakAfter).toBeGreaterThanOrEqual(1);
      expect(en.h1BreakAfter).toBeLessThan(words);
    }
    if (typeof en.metaDescription === "string") expect(en.metaDescription.length).toBeLessThanOrEqual(165);
  });
});

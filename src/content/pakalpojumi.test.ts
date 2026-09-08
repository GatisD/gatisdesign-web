import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import content from "./lv/pakalpojumi.json";
import { serviceContent, priceRangeFor, type ServiceRouteKey } from "./index";
import { ROUTES, routeKeyForPath } from "@/i18n/routes";

/**
 * /pakalpojumi kartes pret pakalpojumu lapām: katra karte ved uz esošu lapu,
 * un kartes sākuma cena ir tās lapas cenu tabulas zemākā vērtība. Bez šī
 * testa kartes cena un lapas tabula ir divi ar roku rakstīti skaitļi, kas ar
 * laiku izšķiras.
 */
describe("pakalpojumi.json", () => {
  it("četras kartes, katra uz savu pakalpojuma lapu", () => {
    expect(content.cards).toHaveLength(4);
    const keys = content.cards.map((c) => routeKeyForPath(c.target));
    expect(new Set(keys).size).toBe(4);
    for (const key of keys) expect(String(key).startsWith("services.")).toBe(true);
  });

  it("kartes sākuma cena ir tās lapas cenu tabulā", () => {
    // Ne "zemākā tabulas cena": zīmola lapā zemākā rinda ir drukas materiāli
    // 120 EUR, bet kartes cena ir galvenā pakalpojuma (logo) sākums 500 EUR.
    // Invariants ir, ka kartes skaitlis eksistē lapas cenu kolonnā - tad karte
    // un tabula nevar izšķirties klusām.
    for (const card of content.cards) {
      const key = routeKeyForPath(card.target) as ServiceRouteKey;
      const value = card.price.match(/(\d+) EUR$/)?.[1];
      expect(value, card.price).toBeTruthy();
      const cells: string[] = [];
      for (const section of serviceContent[key].sections) {
        const table = section.table;
        if (!table) continue;
        const cols = table.columns.map((c, i) => (/cena/i.test(c) ? i : -1)).filter((i) => i >= 0);
        for (const row of table.rows) for (const i of cols) cells.push(row[i] ?? "");
      }
      expect(cells.some((c) => new RegExp(`\\b${value}\\b`).test(c)), `${key}: ${card.price} nav tabulā`).toBe(true);
      expect(priceRangeFor(serviceContent[key]), key).not.toBeNull();
    }
  });

  it("kadri eksistē, meta ir robežās, defise ir īsā", () => {
    for (const card of content.cards) expect(existsSync(`public${card.poster}`), card.poster).toBe(true);
    expect(content.metaDescription.length).toBeLessThanOrEqual(160);
    expect(content.metaTitle.length).toBeLessThanOrEqual(60);
    expect(/[\u2013\u2014]/.test(JSON.stringify(content))).toBe(false);
    expect(ROUTES.services.lv).toBe(`/${content.slug}`);
  });
});

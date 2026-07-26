import { describe, it, expect } from "vitest";
import { LOCALES, ROUTES, pathFor, alternatesFor, routeKeyForPath } from "./routes";

describe("routes karte", () => {
  it("katram maršrutam ir abas valodas", () => {
    for (const [key, paths] of Object.entries(ROUTES)) {
      expect(paths.lv, `${key}.lv`).toMatch(/^\//);
      expect(paths.en, `${key}.en`).toMatch(/^\/en/);
    }
  });

  it("pathFor atgriež pareizo ceļu", () => {
    expect(pathFor("contact", "lv")).toBe("/kontakti");
    expect(pathFor("contact", "en")).toBe("/en/contact");
    expect(pathFor("home", "lv")).toBe("/");
    expect(pathFor("home", "en")).toBe("/en");
  });

  it("alternatesFor atgriež abas valodas un ir simetrisks", () => {
    const alts = alternatesFor("services.ai");
    expect(alts).toHaveLength(LOCALES.length);
    for (const alt of alts) {
      expect(pathFor("services.ai", alt.locale)).toBe(alt.path);
    }
  });

  it("neviens ceļš neatkārtojas divreiz", () => {
    const all = Object.values(ROUTES).flatMap((p) => [p.lv, p.en]);
    expect(new Set(all).size).toBe(all.length);
  });

  it("routeKeyForPath atrod atslēgu abās valodās", () => {
    expect(routeKeyForPath("/kontakti")).toBe("contact");
    expect(routeKeyForPath("/en/contact")).toBe("contact");
    expect(routeKeyForPath("/en/contact/")).toBe("contact");
    expect(routeKeyForPath("/nav-tadas-lapas")).toBeNull();
  });
});

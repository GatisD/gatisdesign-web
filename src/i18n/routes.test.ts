import { describe, it, expect } from "vitest";
import { LOCALES, ROUTES, pathFor, pathForPathname, alternatesFor, routeKeyForPath } from "./routes";

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

  it("pathForPathname atrod pāri arī projektu lapām", () => {
    // Šīm lapām ROUTES atslēgas nav, un valodas pārslēgs no tām veda uz /en.
    expect(pathForPathname("/portfolio/estire", "en")).toBe("/en/portfolio/estire");
    expect(pathForPathname("/en/portfolio/estire", "lv")).toBe("/portfolio/estire");
    expect(pathForPathname("/portfolio/estire/", "en")).toBe("/en/portfolio/estire");
    // Maršruta lapas iet pa ROUTES, ne pa slug ceļu.
    expect(pathForPathname("/majaslapu-izstrade", "en")).toBe("/en/website-development");
    expect(pathForPathname("/portfolio", "en")).toBe("/en/portfolio");
    // Nezināms ceļš neizdomā pāri.
    expect(pathForPathname("/nav-tadas-lapas", "en")).toBeNull();
    expect(pathForPathname("/portfolio/a/b", "en")).toBeNull();
    // Mērķis nāk no adreses joslas, tāpēc slug formai jābūt stingrai.
    expect(pathForPathname("/portfolio/\\svesa.lv", "en")).toBeNull();
    expect(pathForPathname("/portfolio/..%2Fen", "en")).toBeNull();
    expect(pathForPathname("/portfolio/Estire", "en")).toBeNull();
  });
});

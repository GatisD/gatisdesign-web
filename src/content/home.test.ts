import { describe, it, expect } from "vitest";
import { homeContent, heroCtas, serviceCards, statItems, worksSection } from "./home";
import { ROUTES } from "@/i18n/routes";
import ServiceIcon from "@/components/ui/ServiceIcon";

/**
 * Sākumlapa saturu lasa no home.json ar regulārām izteiksmēm (bullet punktos ir
 * iekodēts mērķa ceļš un cena). Šie testi ir vārti: ja saturs mainās tā, ka
 * parsētājs vairs neder, tas atklājas šeit, nevis tukšā sadaļā uz lapas.
 */
describe("sākumlapas saturs", () => {
  it("obligātie lauki ir aizpildīti", () => {
    expect(homeContent.h1.length).toBeGreaterThan(20);
    expect(homeContent.directAnswer.length).toBeGreaterThan(80);
    expect(homeContent.metaDescription.length).toBeGreaterThan(50);
  });

  it("tekstos ir tikai īsā defise", () => {
    expect(JSON.stringify(homeContent)).not.toMatch(/[–—]/);
  });

  it("hero CTA punkti dod uzrakstu un esošu maršrutu", () => {
    expect(heroCtas).toHaveLength(2);
    expect(heroCtas[0]).toEqual({ label: "Pastāsti par projektu", target: ROUTES.contact.lv });
    expect(heroCtas[1]).toEqual({ label: "Apskati darbus", target: ROUTES.portfolio.lv });
  });

  it("četras pakalpojumu kartes ar cenu, termiņu un dziļo lapu", () => {
    expect(serviceCards).toHaveLength(4);

    const lvServicePaths = Object.entries(ROUTES)
      .filter(([key]) => key.startsWith("services."))
      .map(([, paths]) => paths.lv);

    for (const card of serviceCards) {
      expect(lvServicePaths).toContain(card.target);
      expect(card.title.length).toBeGreaterThan(3);
      expect(card.description.endsWith(".")).toBe(true);
      expect(card.price).toMatch(/\d+ EUR$/);
      expect(card.term).toMatch(/nedēļ/);
      // Cena un termiņš nedrīkst ieķerties aprakstā.
      expect(card.description).not.toMatch(/EUR|->/);
    }

    expect(serviceCards[0].title).toBe("Zīmola identitāte");
    expect(serviceCards[0].price).toBe("No 500 EUR");
    expect(serviceCards[2].price).toBe("Audits no 400 EUR");
  });

  it("skaitļi tiek nolasīti kā skaitlis plus paraksts", () => {
    expect(statItems.map((s) => `${s.value}${s.suffix}`)).toEqual(["18", "100+", "4", "1"]);
    for (const stat of statItems) {
      expect(stat.value).toBeGreaterThan(0);
      expect(stat.label).not.toMatch(/^\d/);
    }
  });

  it("darbu sadaļai ir virsraksts un ievads", () => {
    expect(worksSection.heading.length).toBeGreaterThan(10);
    expect(worksSection.body[0]).toContain(ROUTES.portfolio.lv);
  });

  it("katram pakalpojumam ir sava ikona", () => {
    // ServiceIcon pie nezināma ceļa atgriež null - ikona pazūd klusi, un lapa
    // izskatās vienkārši nedaudz tukšāka. Ja pakalpojuma adresi maina vai
    // pievieno piekto pakalpojumu, to jāpamana šeit, ne acīm pēc mēneša.
    for (const card of serviceCards) {
      expect(ServiceIcon({ target: card.target }), card.target).not.toBeNull();
    }
  });
});

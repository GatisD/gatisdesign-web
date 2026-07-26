import { describe, it, expect } from "vitest";
import { aboutContent, contactContent, contactSections, sectionByHeading } from "./pages";
import type { PageContent } from "./types";

const pages: Array<[string, PageContent]> = [
  ["par-mani", aboutContent],
  ["kontakti", contactContent],
];

/** Visi teksti no viena satura faila vienā plakanā sarakstā. */
function allStrings(content: PageContent): string[] {
  const out = [content.metaTitle, content.metaDescription, content.h1, content.directAnswer];
  if (content.cta) out.push(content.cta);
  for (const section of content.sections) {
    if (section.kicker) out.push(section.kicker);
    out.push(section.heading, ...section.body, ...(section.bullets ?? []));
    for (const step of section.steps ?? []) {
      out.push(step.title, step.text);
      if (step.meta) out.push(step.meta);
    }
  }
  for (const item of content.faq) out.push(item.q, item.a);
  return out;
}

describe("par mani un kontakti saturs", () => {
  it.each(pages)("%s: obligātie lauki ir aizpildīti", (_name, content) => {
    expect(content.metaTitle.length).toBeGreaterThan(10);
    expect(content.metaDescription.length).toBeGreaterThan(50);
    expect(content.h1.length).toBeGreaterThan(5);
    // directAnswer ir GEO elements - AI atbildes citē tieši to, tāpēc tas nedrīkst
    // sarukt līdz vienam teikumam.
    expect(content.directAnswer.length).toBeGreaterThan(80);
    expect(content.sections.length).toBeGreaterThan(3);
    expect(content.faq.length).toBeGreaterThan(3);
  });

  it.each(pages)("%s: tekstos ir tikai īsā defise", (_name, content) => {
    for (const text of allStrings(content)) {
      expect(text, text.slice(0, 60)).not.toMatch(/[–—]/);
    }
  });

  it.each(pages)("%s: katram procesa solim ir virsraksts un teksts", (_name, content) => {
    for (const section of content.sections) {
      for (const step of section.steps ?? []) {
        expect(step.title.length).toBeGreaterThan(2);
        expect(step.text.length).toBeGreaterThan(20);
      }
    }
  });

  it("par mani: procesa soļi ir sadaļā par darba gaitu", () => {
    const withSteps = aboutContent.sections.filter((s) => s.steps?.length);
    expect(withSteps).toHaveLength(1);
    expect(withSteps[0].steps!.length).toBeGreaterThanOrEqual(5);
  });

  it("kontakti: lapai vajadzīgās sadaļas eksistē", () => {
    for (const [role, section] of Object.entries(contactSections)) {
      expect(section.heading, role).toBeTruthy();
    }
    expect(contactSections.steps.steps).toHaveLength(3);
    // Formas ievadam jāpaliek pie formas, ne kaut kur citur lapā.
    expect(contactSections.form.body.length).toBeGreaterThan(0);
  });

  it("sadaļa pēc virsraksta met skaidru kļūdu, ja sadaļas nav", () => {
    expect(() => sectionByHeading(contactContent, /nav tādas sadaļas/)).toThrow(/nav sadaļas/);
  });
});

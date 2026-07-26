import type { ContentSectionData, PageContent } from "./types";
import aboutJson from "./lv/par-mani.json";
import contactJson from "./lv/kontakti.json";

/**
 * Par mani un Kontakti lapu saturs. Teksti nāk no src/content/lv/*.json, kas jau
 * ir izgājuši gramatikas pārbaudi - šis modulis tos tikai padara lasāmus kodam un
 * nekad nepārraksta.
 *
 * Atšķirībā no pakalpojumu lapām šiem failiem nav ne slug, ne title, ne
 * internalLinks - tāpēc tips ir PageContent, ne ServiceContent.
 */
export const aboutContent: PageContent = aboutJson;
export const contactContent: PageContent = contactJson;

/**
 * Sadaļa pēc virsraksta, nevis pēc indeksa: ja saturā mainās secība, lapa
 * joprojām saliek pareizās sadaļas pareizajās vietās, bet, ja sadaļa pazūd,
 * būve krīt ar skaidru kļūdu, nevis klusi izmet gabalu no lapas.
 */
export function sectionByHeading(content: PageContent, pattern: RegExp): ContentSectionData {
  const section = content.sections.find((s) => pattern.test(s.heading));
  if (!section) throw new Error(`Saturā nav sadaļas ar virsrakstu ${pattern}`);
  return section;
}

/**
 * Kontaktu lapas sadaļas pa lomām. Lapa tās liek divās kolonnās (saturs pa kreisi,
 * forma pa labi), tāpēc secība lapā nesakrīt ar secību failā.
 */
export const contactSections = {
  /** Ko rakstīt, lai atbilde būtu noderīga. */
  brief: sectionByHeading(contactContent, /^Ko rakstīt/),
  /** Atbildes laiks. */
  reply: sectionByHeading(contactContent, /^Atbildu/),
  /** Trīs soļi pēc pieteikuma. */
  steps: sectionByHeading(contactContent, /^Kas notiek/),
  /** Formas ievads (pati forma ir ContactForm komponente). */
  form: sectionByHeading(contactContent, /^Pieteikuma forma/),
  /** E-pasts, vieta, valodas. */
  contacts: sectionByHeading(contactContent, /^Kontaktinformācija/),
  /** Ko es nedaru. */
  limits: sectionByHeading(contactContent, /^Ko es nedaru/),
};

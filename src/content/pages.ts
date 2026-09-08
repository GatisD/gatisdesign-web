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
export function contactSectionsFor(content: PageContent) {
  return {
    /** Ko rakstīt, lai atbilde būtu noderīga. */
    brief: sectionByHeading(content, /^(Ko rakstīt|What to write)/),
    /** Atbildes laiks. */
    reply: sectionByHeading(content, /^(Atbildu|I reply)/),
    /** Trīs soļi pēc pieteikuma. */
    steps: sectionByHeading(content, /^(Kas notiek|What happens)/),
    /** Formas ievads (pati forma ir ContactForm komponente). */
    form: sectionByHeading(content, /^(Pieteikuma forma|Request form)/),
    /** E-pasts, vieta, valodas. */
    contacts: sectionByHeading(content, /^(Kontaktinformācija|Contact details)/),
    /** Ko es nedaru. */
    limits: sectionByHeading(content, /^(Ko es nedaru|What I do not do)/),
  };
}

export const contactSections = contactSectionsFor(contactContent);

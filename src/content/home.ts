import homeJson from "./lv/home.json";
import type { ContentSectionData, ServiceContent } from "./types";

/**
 * Sākumlapas saturs. Teksti nāk no src/content/<valoda>/home.json, kas jau ir
 * izgājuši gramatikas pārbaudi - šis modulis tos tikai padara lasāmus kodam un
 * nekad nepārraksta.
 *
 * `buildHome` ir tīra funkcija no JSON uz gatavām sadaļām un kartēm, tāpēc
 * viens un tas pats kods apkalpo LV un EN failu (2026-09-08). Sadaļas meklē
 * pēc kickera ABĀS valodās, ne pēc indeksa: ja saturā mainās secība, lapa
 * joprojām saliek pareizās sadaļas, bet, ja sadaļa pazūd, būve krīt ar skaidru
 * kļūdu. Kolonnas cenu tabulā atrod pēc virsraksta abās valodās.
 *
 * LV atvasinājumi paliek eksportēti ar tiem pašiem vārdiem (heroCtas,
 * serviceCards, statItems ...), jo tos lieto testi un Par mani skaitļu josla.
 */

/** Kickeri abās valodās. Sadaļu atrod pēc jebkura no tiem. */
const KICKERS = {
  hero: ["Sākums", "Home"],
  chain: ["Bez aģentūras", "No agency"],
  services: ["Pakalpojumi", "Services"],
  works: ["Darbi", "Work"],
  stats: ["Skaitļi", "Numbers"],
  about: ["Par mani", "About me"],
  contact: ["Kontakti", "Contact"],
} as const;

export type HomeCta = { label: string; target: string };

export type ServiceCard = {
  title: string;
  description: string;
  price: string;
  term?: string;
  target: string;
};

export type StatItem = {
  value: number;
  suffix: string;
  label: string;
};

export interface HomeData {
  content: ServiceContent;
  heroSection: ContentSectionData;
  chainSection: ContentSectionData;
  servicesSection: ContentSectionData;
  worksSection: ContentSectionData;
  statsSection: ContentSectionData;
  aboutSection: ContentSectionData;
  contactSection: ContentSectionData;
  heroCtas: HomeCta[];
  serviceCards: ServiceCard[];
  statItems: StatItem[];
}

function splitTarget(bullet: string): [string, string] {
  const at = bullet.lastIndexOf("->");
  if (at === -1) throw new Error(`home.json: bullet bez mērķa ceļa: ${bullet}`);
  return [bullet.slice(0, at).trim(), bullet.slice(at + 2).trim()];
}

function sentences(text: string): string[] {
  return text
    .split(/\.\s+/)
    .map((s) => s.replace(/\.$/, "").trim())
    .filter(Boolean);
}

export function buildHome(content: ServiceContent): HomeData {
  const sectionByKicker = (names: readonly string[]): ContentSectionData => {
    const section = content.sections.find((s) => s.kicker !== undefined && names.includes(s.kicker));
    if (!section) throw new Error(`home.json: nav sadaļas ar kickeru ${names.join(" / ")}`);
    return section;
  };

  const heroSection = sectionByKicker(KICKERS.hero);
  const servicesSection = sectionByKicker(KICKERS.services);
  const statsSection = sectionByKicker(KICKERS.stats);

  const heroCtas: HomeCta[] = (heroSection.bullets ?? []).map((bullet) => {
    const [body, target] = splitTarget(bullet);
    const label = body.replace(/^CTA\s+\d+\s*\([^)]*\)\s*:\s*/, "").trim();
    if (!label || label === body) throw new Error(`home.json: neatpazīts CTA punkts: ${bullet}`);
    return { label, target };
  });

  const serviceCards: ServiceCard[] = (() => {
    const table = servicesSection.table;
    const termByPath = new Map<string, string>();
    if (table) {
      const termColumn = table.columns.findIndex((c) => /termiņ|timeline/i.test(c));
      const pathColumn = table.columns.findIndex((c) => /lapa|page/i.test(c));
      if (termColumn >= 0 && pathColumn >= 0) {
        for (const row of table.rows) termByPath.set(row[pathColumn], row[termColumn]);
      }
    }
    return (servicesSection.bullets ?? []).map((bullet) => {
      const [body, target] = splitTarget(bullet);
      const parts = sentences(body);
      const priceAt = parts.findIndex((p) => p.includes("EUR"));
      if (parts.length < 3 || priceAt < 1) {
        throw new Error(`home.json: neatpazīts pakalpojuma punkts: ${bullet}`);
      }
      return {
        title: parts[0],
        description: `${parts.slice(1, priceAt).join(". ")}.`,
        price: parts[priceAt],
        term: termByPath.get(target),
        target,
      };
    });
  })();

  const statItems: StatItem[] = (statsSection.bullets ?? []).map((bullet) => {
    const match = /^(\d+)(\+?)\s+(.+)$/.exec(bullet.trim());
    if (!match) throw new Error(`home.json: neatpazīts skaitļa punkts: ${bullet}`);
    return { value: Number(match[1]), suffix: match[2], label: match[3] };
  });

  return {
    content,
    heroSection,
    chainSection: sectionByKicker(KICKERS.chain),
    servicesSection,
    worksSection: sectionByKicker(KICKERS.works),
    statsSection,
    aboutSection: sectionByKicker(KICKERS.about),
    contactSection: sectionByKicker(KICKERS.contact),
    heroCtas,
    serviceCards,
    statItems,
  };
}

/**
 * Skaitļu josla lapā "Par mani": "1 kontaktpersona" izņemts, to pasaka
 * virsraksts. Dzīvo te, ne komponentē, lai LV un EN lieto vienu filtru.
 */
export const factsFrom = (items: StatItem[]) => items.filter((stat) => !(stat.value === 1 && stat.suffix === ""));

/** LV sākumlapa - noklusējums un testu avots. */
export const homeLv: HomeData = buildHome(homeJson as ServiceContent);
export const homeContent = homeLv.content;
export const heroSection = homeLv.heroSection;
export const chainSection = homeLv.chainSection;
export const servicesSection = homeLv.servicesSection;
export const worksSection = homeLv.worksSection;
export const statsSection = homeLv.statsSection;
export const aboutSection = homeLv.aboutSection;
export const contactSection = homeLv.contactSection;
export const heroCtas = homeLv.heroCtas;
export const serviceCards = homeLv.serviceCards;
export const statItems = homeLv.statItems;

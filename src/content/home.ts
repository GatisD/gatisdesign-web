import homeJson from "./lv/home.json";
import type { ContentSectionData, ServiceContent } from "./types";

/**
 * Sākumlapas saturs. Teksti nāk no src/content/lv/home.json, kas jau ir izgājis
 * gramatikas pārbaudi - šis modulis tos tikai izgriež gabalos, nekad nepārraksta.
 *
 * home.json ir uzrakstīts kā satura specifikācija: kickeri ir redakcionāli
 * marķieri ("Sākums", "Skaitļi"), bullet punktos ir iekodēts mērķa ceļš aiz "->",
 * un pēdējā sadaļa ir redakcijas piezīme, kas lapā nav jārāda. Tāpēc sadaļas
 * šeit tiek meklētas pēc kickera, nevis pēc indeksa: ja saturs mainās, būve
 * krīt ar skaidru kļūdu, nevis klusi izmet sadaļu no lapas.
 */
export const homeContent = homeJson as ServiceContent;

function sectionByKicker(kicker: string): ContentSectionData {
  const section = homeContent.sections.find((s) => s.kicker === kicker);
  if (!section) throw new Error(`home.json: nav sadaļas ar kickeri "${kicker}"`);
  return section;
}

export const heroSection = sectionByKicker("Sākums");
export const chainSection = sectionByKicker("Bez aģentūras");
export const servicesSection = sectionByKicker("Pakalpojumi");
export const worksSection = sectionByKicker("Darbi");
export const statsSection = sectionByKicker("Skaitļi");
export const aboutSection = sectionByKicker("Par mani");
export const contactSection = sectionByKicker("Kontakti");

/** "... -> /kontakti" -> ["...", "/kontakti"] */
function splitTarget(bullet: string): [string, string] {
  const at = bullet.lastIndexOf("->");
  if (at === -1) throw new Error(`home.json: bullet bez mērķa ceļa: ${bullet}`);
  return [bullet.slice(0, at).trim(), bullet.slice(at + 2).trim()];
}

/** Teikumi no viena bullet punkta, bez beigu punkta katrā. */
function sentences(text: string): string[] {
  return text
    .split(/\.\s+/)
    .map((s) => s.replace(/\.$/, "").trim())
    .filter(Boolean);
}

export type HomeCta = { label: string; target: string };

/** Hero bullets: "CTA 1 (primārā): Pastāsti par projektu -> /kontakti" */
export const heroCtas: HomeCta[] = (heroSection.bullets ?? []).map((bullet) => {
  const [body, target] = splitTarget(bullet);
  const label = body.replace(/^CTA\s+\d+\s*\([^)]*\)\s*:\s*/, "").trim();
  if (!label || label === body) throw new Error(`home.json: neatpazīts CTA punkts: ${bullet}`);
  return { label, target };
});

export type ServiceCard = {
  /** Pakalpojuma nosaukums (bullet pirmais teikums). */
  title: string;
  /** Viens teikums par pakalpojumu. */
  description: string;
  /** Sākuma cena tā, kā tā uzrakstīta saturā ("No 500 EUR", "Audits no 400 EUR"). */
  price: string;
  /** Parastais termiņš no cenu tabulas ("2-3 nedēļas"), ja tabulā ir šī lapa. */
  term?: string;
  /** LV ceļš uz dziļo lapu. */
  target: string;
};

/**
 * Pakalpojumu kartes. Nosaukums, apraksts un cena nāk no bullet punkta,
 * termiņš - no tās pašas sadaļas cenu tabulas (savienojums pēc lapas ceļa).
 */
export const serviceCards: ServiceCard[] = (() => {
  const table = servicesSection.table;
  const termByPath = new Map<string, string>();
  if (table) {
    const termColumn = table.columns.findIndex((c) => /termiņ/i.test(c));
    const pathColumn = table.columns.findIndex((c) => /lapa/i.test(c));
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

export type StatItem = {
  value: number;
  /** "+" vai tukšs. */
  suffix: string;
  label: string;
};

/** Skaitļu sadaļas bullets: "100+ pabeigtu projektu: ..." */
export const statItems: StatItem[] = (statsSection.bullets ?? []).map((bullet) => {
  const match = /^(\d+)(\+?)\s+(.+)$/.exec(bullet.trim());
  if (!match) throw new Error(`home.json: neatpazīts skaitļa punkts: ${bullet}`);
  return { value: Number(match[1]), suffix: match[2], label: match[3] };
});

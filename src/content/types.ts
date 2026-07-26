/**
 * Satura tipi pakalpojumu lapām. Apraksta to, kas reāli ir JSON failos
 * src/content/lv/*.json - teksts tur jau ir izgājis gramatikas pārbaudi,
 * tāpēc kods to tikai attēlo, nekad nepārraksta.
 */

/** Īsts tabulas datu bloks: paraksts, kolonnu galvas un rindas. */
export type ContentTable = {
  caption: string;
  columns: string[];
  /** Katrā rindā tikpat šūnu, cik ir `columns`. */
  rows: string[][];
};

export type ContentSectionData = {
  /** Neobligāts - daļai sadaļu kickera nav. */
  kicker?: string;
  heading: string;
  body: string[];
  bullets?: string[];
  table?: ContentTable;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type ServiceContent = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** Atbilde uz lapas galveno jautājumu vienā rindkopā. Tiek izcelta hero blokā. */
  directAnswer: string;
  sections: ContentSectionData[];
  faq: FaqItem[];
  /**
   * Redakcionālas norādes par iekšējām saitēm (enkurs + vieta tekstā), nevis
   * renderējami dati. Lapas iekšējās saites tiek būvētas no ROUTES kartes.
   */
  internalLinks?: string[];
  cta?: string;
};

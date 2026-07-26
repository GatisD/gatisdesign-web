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

/**
 * Viens numurēts procesa solis. `meta` ir īss papildmarķējums pie soļa: laiks
 * ("2-3 darba dienas") vai lomu sadalījums ("Tu: ... Es: ...").
 */
export type ContentStep = {
  title: string;
  text: string;
  meta?: string;
};

export type ContentSectionData = {
  /** Neobligāts - daļai sadaļu kickera nav. */
  kicker?: string;
  heading: string;
  body: string[];
  bullets?: string[];
  table?: ContentTable;
  /** Numurēts process. Tiek attēlots kā plūsmas panelis, ne kā parasts saraksts. */
  steps?: ContentStep[];
};

export type FaqItem = {
  q: string;
  a: string;
};

/**
 * Vienas lapas saturs. `slug`, `title` un `internalLinks` ir tikai pakalpojumu
 * lapu lauki - par-mani.json un kontakti.json tos nesatur, tāpēc bāzes tipā tie
 * ir neobligāti. JSON faili netiek pielāgoti tipam, tips tiek pielāgots saturam.
 */
export type PageContent = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** Atbilde uz lapas galveno jautājumu vienā rindkopā. Tiek izcelta hero blokā. */
  directAnswer: string;
  sections: ContentSectionData[];
  faq: FaqItem[];
  cta?: string;
  /** Tikai pakalpojumu lapām: LV ceļš bez slīpsvītras. */
  slug?: string;
  /** Tikai pakalpojumu lapām: pakalpojuma nosaukums strukturētajiem datiem. */
  title?: string;
  /**
   * Redakcionālas norādes par iekšējām saitēm (enkurs + vieta tekstā), nevis
   * renderējami dati. Lapas iekšējās saites tiek būvētas no ROUTES kartes.
   */
  internalLinks?: string[];
};

/** Pakalpojumu lapai slug un title ir obligāti - no tiem nāk maršruts un schema. */
export type ServiceContent = PageContent & {
  slug: string;
  title: string;
};

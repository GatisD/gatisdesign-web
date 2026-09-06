import type { RouteKey } from "@/i18n/routes";

/**
 * Klientu atsauksmes.
 *
 * Sadaļa ir UZBŪVĒTA, bet IZSLĒGTA: 2026-09-06 Gata lēmums - "atsauksmes
 * pagaidām nebūs, bet darām". Kamēr `TESTIMONIALS_ENABLED` ir `false`,
 * komponente nerenderē neko un lapā nav ne tukša rāmja, ne solījuma, ko lapa
 * nepilda.
 *
 * Kad atsauksmes būs: `TESTIMONIALS_ENABLED = true` un saraksts aizpildīts.
 * Katrai atsauksmei OBLIGĀTI ir vārds, uzņēmums un konkrēts rezultāts -
 * anonīma pateicība ("ļoti profesionāls darbs") nepierāda neko un E-E-A-T
 * ziņā ir vājāka par tās neesamību. To pārbauda tests
 * (src/content/testimonials.test.ts), ne atmiņa.
 *
 * Strukturētajos datos šīs atsauksmes NEDRĪKST likt kā `AggregateRating` par
 * sevi - Google to uzskata par strukturēto datu spamu.
 */
export const TESTIMONIALS_ENABLED = false;

export type Testimonial = {
  /** Klienta paša vārdi. Ne pārstāstīts, ne saīsināts. */
  quote: string;
  name: string;
  /** Amats, lai būtu skaidrs, kas tieši runā. */
  role: string;
  company: string;
  /** Konkrēts iznākums ar skaitli vai faktu, ne sajūta. */
  result: string;
  /** Projekta lapa, uz kuru atsauksme attiecas, ja tāda ir. */
  project?: string;
  /** Pakalpojumu lapa, kurā atsauksme ir vietā. */
  service?: RouteKey;
};

export const testimonials: Testimonial[] = [];

import type { RouteKey } from "@/i18n/routes";
import type { ServiceContent } from "./types";
import majaslapuIzstrade from "./lv/majaslapu-izstrade.json";
import aiAgenti from "./lv/ai-agenti.json";
import seoGeoAeo from "./lv/seo-geo-aeo.json";
import zimolaIdentitate from "./lv/zimola-identitate.json";

/** Tikai pakalpojumu maršruti - pārējām lapām sava satura nav. */
export type ServiceRouteKey = Extract<RouteKey, `services.${string}`>;

/**
 * Saturs pēc maršruta atslēgas, ne pēc slug. Slug var mainīties, atslēga ne.
 * EN saturs vēl nav uzrakstīts, tāpēc karte šobrīd ir vienvalodīga (LV).
 */
export const serviceContent: Record<ServiceRouteKey, ServiceContent> = {
  "services.brand": zimolaIdentitate,
  "services.web": majaslapuIzstrade,
  "services.ai": aiAgenti,
  "services.seo": seoGeoAeo,
};

/** Abonementa un stundas likmes cenu diapazonā neietilpst - tās nav projekta cena. */
const RECURRING = /\/mēn|mēnesī|\/h\b|stundā/i;

/**
 * Cenu diapazons no lapas cenu tabulas. Ņem tikai kolonnas, kuru galvā ir
 * "Cena", un no katras šūnas visus skaitļus (lai "500-700 EUR" dod abus galus).
 *
 * `count` ir cenu RINDU skaits, ne tabulu skaits. Iepriekš `AggregateOffer`
 * lauku `offerCount` rēķināja kā "sadaļas, kurās ir tabula", un dzīvajā HTML
 * `/majaslapu-izstrade` uzrādīja divus piedāvājumus, lai gan cenu tabulā ir
 * piecas rindas.
 */
export function priceRangeFor(
  content: ServiceContent,
): { low: number; high: number; count: number } | null {
  const values: number[] = [];
  let count = 0;

  for (const section of content.sections) {
    const table = section.table;
    if (!table) continue;

    const priceColumns = table.columns
      .map((column, index) => (/cena/i.test(column) ? index : -1))
      .filter((index) => index >= 0);
    if (priceColumns.length === 0) continue;

    for (const row of table.rows) {
      let rowHasPrice = false;
      for (const index of priceColumns) {
        const cell = row[index] ?? "";
        if (!cell.includes("EUR") || RECURRING.test(cell)) continue;
        for (const match of cell.matchAll(/\d+/g)) {
          const value = Number(match[0]);
          if (Number.isFinite(value) && value > 0) {
            values.push(value);
            rowHasPrice = true;
          }
        }
      }
      if (rowHasPrice) count += 1;
    }
  }

  if (values.length === 0) return null;
  return { low: Math.min(...values), high: Math.max(...values), count };
}

export type { ServiceContent, ContentSectionData, ContentTable, FaqItem } from "./types";

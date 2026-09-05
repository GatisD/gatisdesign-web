/**
 * Kontaktformas lauku katalogs - viens patiesības avots.
 *
 * No šejienes nāk gan formas izvēlņu teksti (caur src/i18n/dict.ts), gan
 * serverī sūtīto e-pastu teksti. Tāpēc vērtību saraksts un uzraksti nedrīkst
 * dzīvot divās vietās: ja izvēlni papildina, serveris to pieņem uzreiz.
 *
 * Mape sākas ar "_", tāpēc Vercel to netaisa par atsevišķu funkciju.
 */

export const SERVICE_VALUES = ["zimols", "majaslapas", "ai-agenti", "seo"] as const;
export type ServiceValue = (typeof SERVICE_VALUES)[number];

export const BUDGET_VALUES = ["lidz-1000", "1000-3000", "3000-10000", "vairak", "nezinu"] as const;
export type BudgetValue = (typeof BUDGET_VALUES)[number];

export const FORM_LOCALES = ["lv", "en"] as const;
export type FormLocale = (typeof FORM_LOCALES)[number];

export const SERVICE_LABELS: Record<FormLocale, Record<ServiceValue, string>> = {
  lv: {
    zimols: "Zīmola identitāte",
    majaslapas: "Mājaslapu izstrāde",
    "ai-agenti": "AI aģenti un automatizācija",
    seo: "SEO, GEO un AEO",
  },
  en: {
    zimols: "Brand identity",
    majaslapas: "Website development",
    "ai-agenti": "AI agents and automation",
    seo: "SEO, GEO and AEO",
  },
};

export const BUDGET_LABELS: Record<FormLocale, Record<BudgetValue, string>> = {
  lv: {
    "lidz-1000": "Līdz 1000 EUR",
    "1000-3000": "1000-3000 EUR",
    "3000-10000": "3000-10 000 EUR",
    vairak: "Vairāk nekā 10 000 EUR",
    nezinu: "Vēl nezinu",
  },
  en: {
    "lidz-1000": "Up to 1000 EUR",
    "1000-3000": "1000-3000 EUR",
    "3000-10000": "3000-10,000 EUR",
    vairak: "More than 10,000 EUR",
    nezinu: "Not sure yet",
  },
};

/** Lauku garumi. Tos pašus skaitļus lieto zod shēma abās pusēs. */
export const FIELD_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 200,
  timelineMax: 120,
  messageMin: 10,
  messageMax: 3000,
  /** Neapstrādāta pieprasījuma augšējā robeža baitos (aizsardzība pret spamu). */
  bodyBytesMax: 24_000,
} as const;

export function serviceLabel(value: ServiceValue, locale: FormLocale): string {
  return SERVICE_LABELS[locale][value];
}

export function budgetLabel(value: BudgetValue, locale: FormLocale): string {
  return BUDGET_LABELS[locale][value];
}

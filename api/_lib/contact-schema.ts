import { z } from "zod";
import {
  BUDGET_VALUES,
  FIELD_LIMITS,
  FORM_LOCALES,
  SERVICE_VALUES,
} from "./contact-fields.js";

/**
 * Kontaktformas shēma. VIENA shēma abām pusēm: pārlūks ar to pārbauda formu
 * pirms sūtīšanas, serveris - pēc saņemšanas. Klienta pārbaude ir ērtība,
 * servera pārbaude ir vienīgā, kurai var uzticēties.
 *
 * Kļūdu ziņojumu vietā shēmā ir ATSLĒGAS (piem. "nameShort"). Tekstus abās
 * valodās glabā src/i18n/dict.ts, tāpēc serveris var atgriezt lauku kļūdas,
 * nezinot ne vārda apmeklētāja valodā.
 */
export const contactSchema = z.object({
  name: z
    .string({ required_error: "nameShort", invalid_type_error: "nameShort" })
    .trim()
    .min(FIELD_LIMITS.nameMin, "nameShort")
    .max(FIELD_LIMITS.nameMax, "nameLong"),
  email: z
    .string({ required_error: "emailInvalid", invalid_type_error: "emailInvalid" })
    .trim()
    .max(FIELD_LIMITS.emailMax, "emailInvalid")
    .email("emailInvalid"),
  service: z.enum(SERVICE_VALUES, { errorMap: () => ({ message: "serviceRequired" }) }),
  budget: z.enum(BUDGET_VALUES, { errorMap: () => ({ message: "budgetRequired" }) }),
  timeline: z
    .string({ invalid_type_error: "timelineLong" })
    .trim()
    .max(FIELD_LIMITS.timelineMax, "timelineLong")
    .optional()
    .default(""),
  message: z
    .string({ required_error: "messageShort", invalid_type_error: "messageShort" })
    .trim()
    .min(FIELD_LIMITS.messageMin, "messageShort")
    .max(FIELD_LIMITS.messageMax, "messageLong"),
  consent: z
    .boolean({ required_error: "consentRequired", invalid_type_error: "consentRequired" })
    .refine((value) => value === true, { message: "consentRequired" }),
  locale: z.enum(FORM_LOCALES).optional().default("lv"),
  /** Slazds robotiem. Cilvēks šo lauku neredz, tāpēc tam jāpaliek tukšam. */
  company: z.string().max(200).optional(),
});

/** Formas vērtības pēc parsēšanas (timeline un locale jau ar noklusējumu). */
export type ContactData = z.infer<typeof contactSchema>;

/** Formas vērtības pirms parsēšanas - tās, ar kurām strādā react-hook-form. */
export type ContactFormValues = z.input<typeof contactSchema>;

/** Lauka nosaukums -> kļūdas atslēga, gatavs atdošanai klientam. */
export type FieldErrors = Partial<Record<keyof ContactData | "company", string>>;

export function fieldErrorsFrom(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    if (out[field as keyof FieldErrors]) continue;
    out[field as keyof FieldErrors] = issue.message;
  }
  return out;
}

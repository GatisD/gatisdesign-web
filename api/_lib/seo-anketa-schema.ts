import { z } from "zod";
import {
  ACCESS_STATUSES,
  ACCESS_TOOLS,
  ANKETA_HONEYPOT_FIELD,
  TEXT_FIELDS,
  accessField,
  choiceValues,
  type AccessTool,
  type TextField,
} from "./seo-anketa-fields.js";

/**
 * SEO anketas shēma. Viena abām pusēm, tāpat kā kontaktformai: pārlūks ar to
 * pārbauda pirms sūtīšanas, serveris - pēc saņemšanas.
 *
 * Kļūdu vietā shēmā ir ATSLĒGAS ("required", "tooLong"...). Tekstus dod lapa.
 */

export type AnketaErrorKey =
  | "required"
  | "tooLong"
  | "singleLine"
  | "emailInvalid"
  | "statusRequired"
  | "choiceInvalid"
  | "consentRequired";

/** Tukša virkne vai null no neatzīmētas radio grupas = nav atbildes. */
const blankToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);

function textField(key: TextField) {
  const spec = TEXT_FIELDS[key];
  let base = z
    .string({ required_error: "required", invalid_type_error: "required" })
    .trim()
    .max(spec.max, "tooLong");
  // Vienas rindas laukos rindas pārtraukums nav vajadzīgs nekad, un divi no
  // tiem (uzņēmums, domēns) nonāk e-pasta tēmas rindā.
  if (!spec.multiline) base = base.regex(/^[^\r\n\u2028\u2029\u0085]*$/, "singleLine");
  if (key === "kontaktsEpasts") return base.min(1, "required").email("emailInvalid");
  if (spec.required) return base.min(1, "required");
  return z.preprocess((v) => (v === null || v === undefined ? "" : v), base);
}

function optionalChoice<const T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(
    blankToUndefined,
    z.enum(values, { errorMap: () => ({ message: "choiceInvalid" }) }).optional(),
  );
}

const accessStatus = z.preprocess(
  blankToUndefined,
  z.enum(ACCESS_STATUSES, { errorMap: () => ({ message: "statusRequired" }) }),
);

const textShape = Object.fromEntries(
  (Object.keys(TEXT_FIELDS) as TextField[]).map((key) => [key, textField(key)]),
) as unknown as Record<TextField, z.ZodTypeAny>;

const accessShape = Object.fromEntries(
  ACCESS_TOOLS.map((tool) => [accessField(tool), accessStatus]),
) as Record<`piekluve_${AccessTool}`, typeof accessStatus>;

export const anketaSchema = z.object({
  ...textShape,
  ...accessShape,
  atskaites: optionalChoice(choiceValues("atskaites")),
  ieviesejs: optionalChoice(choiceValues("ieviesejs")),
  vide: optionalChoice(choiceValues("vide")),
  cms: optionalChoice(choiceValues("cms")),
  cenasPublicet: optionalChoice(choiceValues("cenasPublicet")),
  piekrisana: z
    .boolean({ required_error: "consentRequired", invalid_type_error: "consentRequired" })
    .refine((value) => value === true, { message: "consentRequired" }),
  /** Slazds robotiem. Cilvēks šo lauku neredz. */
  [ANKETA_HONEYPOT_FIELD]: z.string().max(200).optional(),
});

/**
 * Dati pēc parsēšanas. Teksta lauki ir tipizēti ar roku, jo shēma tiek būvēta
 * no kataloga cilpā, un zod no `Object.fromEntries` precīzu tipu neizved.
 */
export type AnketaData = Record<TextField, string> &
  Record<`piekluve_${AccessTool}`, (typeof ACCESS_STATUSES)[number]> & {
    atskaites?: string;
    ieviesejs?: string;
    vide?: string;
    cms?: string;
    cenasPublicet?: string;
    piekrisana: boolean;
    [ANKETA_HONEYPOT_FIELD]?: string;
  };

/** Formas vērtības pirms parsēšanas. Neatzīmēta radio grupa ir null. */
export type AnketaFormValues = Record<TextField, string> &
  Record<`piekluve_${AccessTool}`, string | null> & {
    atskaites: string | null;
    ieviesejs: string | null;
    vide: string | null;
    cms: string | null;
    cenasPublicet: string | null;
    piekrisana: boolean;
    [ANKETA_HONEYPOT_FIELD]: string;
  };

export type AnketaFieldErrors = Record<string, AnketaErrorKey>;

export function anketaFieldErrors(error: z.ZodError): AnketaFieldErrors {
  const out: AnketaFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string" || out[field]) continue;
    out[field] = issue.message as AnketaErrorKey;
  }
  return out;
}

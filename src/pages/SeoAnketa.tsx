import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useForm, useWatch, type Control, type Resolver, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Label from "@/components/ui/Label";
import Turnstile, { TURNSTILE_FIELD, turnstileEnabled } from "@/components/Turnstile";
import { useLocale } from "@/i18n/LocaleContext";
import { LV_ONLY_ROUTES } from "@/i18n/routes";
import { cn } from "@/lib/utils";
import {
  ACCESS_CARDS,
  ANKETA_INTRO,
  ANKETA_META_DESCRIPTION,
  ANKETA_TITLE,
  FAILURE_BEFORE_EMAIL,
  HELP,
  KONTAKTPERSONA_LEGEND,
  KONTAKTPERSONA_REQUIRED,
  NOZARE_INTRO,
  BLOGS_INTRO,
  BLOGS_OPENED,
  GITHUB_USER,
  HELP_BLOGS,
  PIEKLUVES_INTRO,
  PIEKLUVES_NOTE,
  REQUIRED_MARK,
  SUBMIT_LABEL,
  SUCCESS,
  TOOL_LINKS,
  UI,
  WHY_PREFIX,
  missingSummary,
  type AccessCard,
} from "@/content/seoAnketa";
import {
  ACCESS_STATUSES,
  ACCESS_STATUS_LABELS,
  ACCESS_TOOLS,
  ACCESS_TOOL_LABELS,
  ANKETA_HONEYPOT_FIELD,
  CHOICES,
  CHOICE_LABELS,
  CONSENT_LABEL,
  CONSENT_LINK,
  GATIS_ACCOUNT,
  SECTIONS,
  TEXT_FIELDS,
  accessField,
  type AccessTool,
  type ChoiceKey,
  type TextField,
} from "../../api/_lib/seo-anketa-fields";
import { anketaSchema, type AnketaErrorKey, type AnketaFormValues } from "../../api/_lib/seo-anketa-schema";

/**
 * /seo-anketa - SEO-GEO sākuma anketa klientam.
 *
 * Tikai LV, `noindex, follow`, nav navigācijā, nav sitemapā, nav EN pāra
 * (sk. LV_ONLY_ROUTES). Teksts: docs/seo-anketa-saturs.md.
 *
 * Garā forma ir viegla trīs veidos:
 *   1) melnraksts saglabājas pārlūkā (localStorage) un atjaunojas PĒC
 *      hidratācijas - serveris un pirmais klienta zīmējums ir identiski;
 *   2) sadaļu josla pielīp zem galvenes un rāda, kur cilvēks ir un kas ir
 *      aizpildīts;
 *   3) pie kļūdas fokuss aiziet uz pirmo kļūdaino lauku lapas secībā.
 *
 * Paroļu, tokenu un API atslēgu lauku NAV un nedrīkst būt.
 */

const DRAFT_KEY = "gatisdesign:seo-anketa:v1";
const DRAFT_SAVE_DELAY_MS = 500;
const TURNSTILE_WAIT_MS = 20_000;

type FieldName = keyof AnketaFormValues;

const CHOICE_KEYS: ChoiceKey[] = ["atskaites", "ieviesejs", "vide", "cms", "cenasPublicet", "blogs", "blogsBiezums"];

function emptyValues(): AnketaFormValues {
  const values: Record<string, unknown> = {};
  for (const key of Object.keys(TEXT_FIELDS)) values[key] = "";
  for (const tool of ACCESS_TOOLS) values[accessField(tool)] = null;
  for (const key of CHOICE_KEYS) values[key] = null;
  values.piekrisana = false;
  values[ANKETA_HONEYPOT_FIELD] = "";
  return values as AnketaFormValues;
}

/**
 * Lauki tieši tādā secībā, kādā tie ir lapā. Pēc tās tiek izvēlēts pirmais
 * kļūdainais lauks, uz kuru pārvietot fokusu.
 */
const FIELD_ORDER: FieldName[] = [
  "uznemums",
  "juridiskais",
  "majaslapa",
  "adrese",
  "talrunis",
  "kontaktsVards",
  "kontaktsAmats",
  "kontaktsEpasts",
  "atskaites",
  "atskaitesCitur",
  "ieviesejs",
  "ieviesejsKontakts",
  "vide",
  ...ACCESS_TOOLS.flatMap((tool): FieldName[] =>
    tool === "cms" ? ["cms", "cmsCita", accessField(tool)] : [accessField(tool)],
  ),
  "tirgi",
  "valodasTagad",
  "valodasPlano",
  "pircejuVardi",
  "zimolaVarianti",
  "svarigakasLapas",
  "nozare1",
  "nozare2",
  "nozare3",
  "nozare4",
  "nozare5",
  "nozare6",
  "profili",
  "cenas",
  "cenasPublicet",
  "atsauksmes",
  "logotipi",
  "blogs",
  "blogsBiezums",
  "blogsAutors",
  "blogsApstiprina",
  "blogsParaugi",
  "blogsFoto",
  "blogsTemas",
  "komentars",
  "piekrisana",
];

type SectionId = (typeof SECTIONS)[number]["id"];

/** Kurā sadaļā lauks ir - kļūdu punktam sadaļu joslā un kopsavilkuma grupām. */
function sectionOf(name: FieldName): SectionId {
  const i = FIELD_ORDER.indexOf(name);
  if (i < 0) return "nosutisana";
  if (i <= FIELD_ORDER.indexOf("vide")) return "uznemums";
  if (i <= FIELD_ORDER.indexOf(accessField("gbp"))) return "piekluves";
  if (i <= FIELD_ORDER.indexOf("svarigakasLapas")) return "tirgus";
  if (i <= FIELD_ORDER.indexOf("nozare6")) return "nozare";
  if (i <= FIELD_ORDER.indexOf("logotipi")) return "materiali";
  if (i <= FIELD_ORDER.indexOf("blogsTemas")) return "blogs";
  return "nosutisana";
}

/** Lauka nosaukums kļūdu kopsavilkumā - tas pats teksts, kas lapā. */
function labelOf(name: FieldName): string {
  if (name.startsWith("piekluve_")) return ACCESS_TOOL_LABELS[name.slice("piekluve_".length) as AccessTool];
  if ((CHOICE_KEYS as string[]).includes(name)) return CHOICE_LABELS[name as ChoiceKey];
  if (name === "piekrisana") return CONSENT_LABEL;
  if (name === "kontaktsVards" || name === "kontaktsAmats" || name === "kontaktsEpasts") {
    return `${KONTAKTPERSONA_LEGEND.split(":")[0]}: ${TEXT_FIELDS[name].label.toLowerCase()}`;
  }
  if (name in TEXT_FIELDS) return TEXT_FIELDS[name as TextField].label;
  return name;
}

/** Lauka DOM id. Radio grupām - pirmā varianta id. */
function domIdFor(name: FieldName): string {
  if (name.startsWith("piekluve_")) return `${name}-${ACCESS_STATUSES[0]}`;
  if ((CHOICE_KEYS as string[]).includes(name)) {
    return `${name}-${Object.keys(CHOICES[name as ChoiceKey])[0]}`;
  }
  return `f-${name}`;
}

/* ------------------------------------------------------------------ *
 * Melnraksts
 * ------------------------------------------------------------------ */

function readDraft(): Partial<AnketaFormValues> | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    // Tikai zināmi lauki un tikai pareizā tipa vērtības: vecs vai sabojāts
    // melnraksts nedrīkst ielikt formā neko, ko shēma nepazīst.
    const known = emptyValues() as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!(key in known) || key === ANKETA_HONEYPOT_FIELD) continue;
      const expected = known[key];
      if (typeof expected === "boolean" && typeof value === "boolean") out[key] = value;
      else if (typeof expected === "string" && typeof value === "string") out[key] = value;
      else if (expected === null && (typeof value === "string" || value === null)) out[key] = value;
    }
    return out as Partial<AnketaFormValues>;
  } catch {
    return null;
  }
}

/**
 * Vērtības, ko cilvēks ievadīja SSR lapā PIRMS hidratācijas.
 *
 * Lapa ir redzama un rakstāma, pirms JS ir ielādējies. Kad React hidratē,
 * react-hook-form `register` ref uzliek katram laukam noklusējuma vērtību ("")
 * un izdzēš to, kas jau ierakstīts - dzīvajā testā pirmais lauks, aizpildīts
 * ~1 s pēc navigācijas, pēc hidratācijas bija tukšs. Tāpēc DOM vērtības tiek
 * nolasītas renderēšanas fāzē, pirms `register` ref pievienojas (commit), un
 * pēc tam apvienotas ar melnrakstu. Uz izvadi tas neietekmē neko, tāpēc
 * hidratācijas neatbilstību nerada.
 */
function readDomValues(): Partial<AnketaFormValues> {
  const out: Record<string, unknown> = {};
  try {
    const known = emptyValues() as Record<string, unknown>;
    // Tikai šīs anketas forma: klienta navigācijā DOM vēl var turēt iepriekšējās lapas formu.
    const form = (document.getElementById("f-uznemums") as HTMLInputElement | null)?.form;
    if (!form) return {};
    const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[name], textarea[name]");
    fields.forEach((el) => {
      const name = el.name;
      if (!(name in known) || name === ANKETA_HONEYPOT_FIELD) return;
      if (el instanceof HTMLInputElement && el.type === "radio") {
        if (el.checked) out[name] = el.value;
      } else if (el instanceof HTMLInputElement && el.type === "checkbox") {
        if (el.checked) out[name] = true;
      } else if (el.value.trim() !== "") {
        out[name] = el.value;
      }
    });
  } catch {
    // Nav DOM vai neparedzēta struktūra - vienkārši nav ko glābt.
  }
  return out as Partial<AnketaFormValues>;
}

function writeDraft(values: AnketaFormValues): boolean {
  try {
    const { [ANKETA_HONEYPOT_FIELD]: _slazds, ...rest } = values;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
    return true;
  } catch {
    // Pilna krātuve, privātais režīms vai bloķēta vietnes krātuve - forma
    // strādā tāpat, tikai bez melnraksta (un bez "Saglabāts" norādes).
    return false;
  }
}

function clearDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Skat. writeDraft.
  }
}

/** Saglabā melnrakstu ar nelielu aizturi. Atsevišķa komponente, lai katrs burts nepārzīmē visu formu. */
function DraftSaver({
  control,
  enabled,
  onSaved,
}: {
  control: Control<AnketaFormValues>;
  enabled: boolean;
  onSaved: (ok: boolean) => void;
}) {
  const values = useWatch({ control }) as AnketaFormValues;
  const skipFirst = useRef(true);
  useEffect(() => {
    if (!enabled) return;
    // Pirmais izsaukums pēc atjaunošanas nav lietotāja izmaiņa - tukšu formu
    // nesaucam par "saglabātu".
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const id = window.setTimeout(() => onSaved(writeDraft(values)), DRAFT_SAVE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [values, enabled, onSaved]);
  return null;
}

/* ------------------------------------------------------------------ *
 * Teksta renderētājs: **treknraksts**, `adrese`, rīku adreses kā saites
 * ------------------------------------------------------------------ */

const LINK_PATTERN = TOOL_LINKS.map((l) => l.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")).join("|");
const RICH = new RegExp(`(\\*\\*[^*]+\\*\\*|\`[^\`]+\`|${LINK_PATTERN})`, "g");

function Rich({ text }: { text: string }) {
  const parts = text.split(RICH).filter((p) => p !== "");
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-paper">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="whitespace-nowrap rounded-[4px] bg-ink-900 px-1.5 py-0.5 font-label text-[0.92em] text-paper">
              {part.slice(1, -1)}
            </code>
          );
        }
        if ((TOOL_LINKS as readonly string[]).includes(part)) {
          return (
            <a
              key={i}
              href={`https://${part}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-line-amber text-paper transition-colors duration-300 hover:text-amber"
            >
              {part}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Kopēšanas poga
 * ------------------------------------------------------------------ */

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Krīt uz rezerves ceļu zemāk (vecs pārlūks, nav atļaujas, http).
  }
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/** Adrese ar lūzuma iespējām pēc "@" un pirms punktiem - lai tā lūzt loģiski, ne vārda vidū. */
function BreakableAddress({ address }: { address: string }) {
  // Bez regex lookbehind: vecāks Safari to neparsē, un krīt viss modulis.
  const parts: string[] = [];
  let current = "";
  for (const ch of address) {
    if (ch === "." && current) {
      parts.push(current);
      current = "";
    }
    current += ch;
    if (ch === "@") {
      parts.push(current);
      current = "";
    }
  }
  if (current) parts.push(current);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 ? <wbr /> : null}
          {part}
        </Fragment>
      ))}
    </>
  );
}

function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-field border border-line bg-ink-900 py-2 pe-2 ps-4">
      {/* Telefonā adrese aizņem visu rindu virs pogas; no sm - blakus pogai. */}
      <code className="min-w-0 basis-full font-label text-[13px] leading-[1.5] text-paper [overflow-wrap:anywhere] sm:flex-1 sm:basis-auto sm:text-[14px]">
        <BreakableAddress address={address} />
      </code>
      <button
        type="button"
        aria-label={`${UI.copyAddress} ${address}`}
        onClick={async () => setCopied(await copyText(address))}
        className="stikls stikls-rams inline-flex min-h-[44px] shrink-0 items-center rounded-full px-4 text-[15px] text-paper active:text-amber"
      >
        <span aria-hidden="true">{copied ? UI.copied : UI.copy}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? UI.copied : ""}
      </span>
    </li>
  );
}

/* ------------------------------------------------------------------ *
 * Lauki
 * ------------------------------------------------------------------ */

const FIELD_BASE =
  "w-full rounded-field border border-line bg-ink-850 px-4 text-[16px] text-paper placeholder:text-paper-faint transition-[border-color,background-color] duration-300 hover:border-line-strong focus:border-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber aria-[invalid=true]:border-[var(--danger)]";
const FIELD_INPUT = cn(FIELD_BASE, "min-h-[52px] py-3");
const FIELD_AREA = cn(FIELD_BASE, "min-h-[112px] resize-y py-3 leading-[1.5]");
const ERROR_TEXT = "text-[14px] leading-[1.35] text-[var(--danger-text)]";

/** Kļūdu krāsa nāk no --danger / --danger-text (src/styles/tokens.css), kopīga ar /kontakti. */
const LABEL_TEXT = "text-[16px] leading-[1.45] text-paper";

type ErrorsMap = Partial<Record<FieldName, { message?: string }>>;

function errorText(key?: string): string {
  const table = UI.errors as Record<string, string>;
  return (key && table[key]) || UI.errors.required;
}

function RequiredMark() {
  return <span className="ms-2 whitespace-nowrap font-label text-label text-paper-faint">{REQUIRED_MARK}</span>;
}

function TextInput({
  name,
  register,
  errors,
  label,
  help,
  number,
  autoComplete,
  type = "text",
  inputMode,
}: {
  name: TextField;
  register: UseFormRegister<AnketaFormValues>;
  errors: ErrorsMap;
  label?: string;
  help?: string;
  number?: number;
  autoComplete?: string;
  type?: "text" | "email" | "tel" | "url";
  inputMode?: "text" | "email" | "tel" | "url";
}) {
  const spec = TEXT_FIELDS[name];
  const id = `f-${name}`;
  const err = errors[name]?.message;
  const describedBy = [help ? `${id}-help` : null, err ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    maxLength: spec.max,
    "aria-required": spec.required ? true : undefined,
    "aria-invalid": err ? true : undefined,
    "aria-describedby": describedBy,
    ...register(name),
  } as const;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={LABEL_TEXT}>
        {number ? <span className="me-2 font-label text-[14px] text-amber">{number}.</span> : null}
        {label ?? spec.label}
        {spec.required ? <RequiredMark /> : null}
      </label>
      {help ? (
        <p id={`${id}-help`} className="text-[14px] leading-[1.5] text-paper-dim">
          {help}
        </p>
      ) : null}
      {spec.multiline ? (
        <textarea rows={3} className={FIELD_AREA} {...common} />
      ) : (
        <input type={type} inputMode={inputMode} autoComplete={autoComplete ?? "off"} className={FIELD_INPUT} {...common} />
      )}
      {err ? (
        <p id={`${id}-error`} className={ERROR_TEXT}>
          {errorText(err)}
        </p>
      ) : null}
    </div>
  );
}

/** Radio grupa kā čipi. Neviens variants nav iepriekš izvēlēts. */
function ChoiceGroup({
  name,
  options,
  legend,
  legendHidden,
  register,
  errors,
  help,
  hint,
  children,
}: {
  name: FieldName;
  options: Array<{ value: string; label: string }>;
  legend: ReactNode;
  legendHidden?: boolean;
  register: UseFormRegister<AnketaFormValues>;
  errors: ErrorsMap;
  help?: string;
  /** Norāde zem variantiem (piem. piekļuves statusam). */
  hint?: ReactNode;
  /** Papildu lauks zem grupas (precizējums "citur", "kontakts"). */
  children?: ReactNode;
}) {
  const err = errors[name]?.message;
  const helpId = help ? `${name}-help` : undefined;
  const hintId = hint ? `${name}-hint` : undefined;
  const errId = err ? `${name}-error` : undefined;
  return (
    <fieldset aria-describedby={[helpId, hintId, errId].filter(Boolean).join(" ") || undefined}>
      <legend className={legendHidden ? "sr-only" : cn(LABEL_TEXT, "mb-2")}>{legend}</legend>
      {help ? (
        <p id={helpId} className="mb-3 text-[14px] leading-[1.5] text-paper-dim">
          {help}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2.5">
        {options.map((opt) => (
          <label
            key={opt.value}
            id={`${name}-${opt.value}-label`}
            className="stikls stikls-rams group inline-flex min-h-[48px] cursor-pointer items-center gap-3 rounded-field px-4 py-2.5 text-[15px] leading-[1.35] text-paper-2 hover:text-paper has-[:checked]:text-amber has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-amber"
          >
            <input
              id={`${name}-${opt.value}`}
              type="radio"
              value={opt.value}
              className="sr-only"
              aria-invalid={err ? true : undefined}
              {...register(name)}
            />
            <span
              aria-hidden="true"
              className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-line-strong group-has-[:checked]:border-amber"
            >
              <span className="h-2 w-2 rounded-full bg-amber opacity-0 group-has-[:checked]:opacity-100" />
            </span>
            {opt.label}
          </label>
        ))}
      </div>
      {hint ? (
        <p id={hintId} className="mt-3 text-[14px] leading-[1.5] text-paper-dim">
          {hint}
        </p>
      ) : null}
      {children}
      {err ? (
        <p id={errId} className={cn("mt-2", ERROR_TEXT)}>
          {errorText(err)}
        </p>
      ) : null}
    </fieldset>
  );
}

function choiceOptions(key: ChoiceKey): Array<{ value: string; label: string }> {
  return Object.entries(CHOICES[key] as Record<string, string>).map(([value, label]) => ({ value, label }));
}

const ACCESS_OPTIONS = ACCESS_STATUSES.map((value) => ({ value, label: ACCESS_STATUS_LABELS[value] }));

/* ------------------------------------------------------------------ *
 * Sadaļu josla
 * ------------------------------------------------------------------ */

const filled = (v: unknown) => (typeof v === "string" ? v.trim() !== "" : v !== null && v !== undefined && v !== false);

/**
 * Vai sadaļa ir "gatava": obligātie aizpildīti. Sadaļām bez obligātiem laukiem
 * (4. un 5.) - kad tajās ir kaut viena atbilde vai kad cilvēks tajās ir bijis:
 * tukšs tur ir atļauts, tāpēc aplītis nedrīkst palikt tukšs uz visiem laikiem.
 */
function sectionDone(id: SectionId, v: AnketaFormValues, visited: boolean): boolean {
  switch (id) {
    case "uznemums":
      return [v.uznemums, v.majaslapa, v.kontaktsVards, v.kontaktsEpasts].every(filled);
    case "piekluves":
      return ACCESS_TOOLS.every((t) => filled(v[accessField(t)]));
    case "tirgus":
      return filled(v.tirgi);
    case "nozare":
      return [v.nozare1, v.nozare2, v.nozare3, v.nozare4, v.nozare5, v.nozare6].some(filled);
    case "materiali":
      return [v.profili, v.cenas, v.cenasPublicet, v.atsauksmes, v.logotipi].some(filled);
    case "blogs":
      return filled(v.blogs);
    case "nosutisana":
      return v.piekrisana === true;
  }
}

/** Pāriet uz sadaļu un pārvietot fokusu uz tās virsrakstu (ne atstāt uz body). */
function goToSection(id: SectionId): void {
  const heading = document.getElementById(`${id}-h`);
  if (!heading) return;
  const kluss = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: kluss ? "auto" : "smooth", block: "start" });
  heading.focus({ preventScroll: true });
}

function ProgressBar({
  control,
  active,
  visited,
  errorSections,
  saved,
}: {
  control: Control<AnketaFormValues>;
  active: SectionId;
  visited: ReadonlySet<SectionId>;
  errorSections: ReadonlySet<SectionId>;
  saved: boolean;
}) {
  const values = useWatch({ control }) as AnketaFormValues;
  const activeTitle = SECTIONS.find((s) => s.id === active)?.title ?? "";
  return (
    <nav aria-label={UI.progressLabel} className="sticky top-[var(--galvene)] z-40 border-y border-line bg-ink-900/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-wrap items-center gap-6 px-1.5 py-2 min-[360px]:px-5 sm:px-8 lg:px-10">
        {/* 7 sadaļas: zem 360 px atkāpes un atstarpes nost, citādi pēdējais aplis nogriežas. */}
        <ol className="flex shrink-0 items-center gap-0 min-[360px]:gap-1">
          {SECTIONS.map((s, i) => {
            const hasError = errorSections.has(s.id);
            const done = !hasError && sectionDone(s.id, values, visited.has(s.id));
            const current = s.id === active;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    goToSection(s.id);
                  }}
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-colors duration-300",
                    current ? "text-paper" : "text-paper-faint hover:text-paper",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border font-label text-[13px]",
                      hasError
                        ? "border-[var(--danger)] text-[var(--danger-text)]"
                        : done
                          ? "border-amber bg-amber text-on-amber"
                          : current
                            ? "border-paper"
                            : "border-line-strong",
                    )}
                  >
                    {done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12.5 10 17.5 19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  {hasError ? (
                    <span
                      aria-hidden="true"
                      className="absolute right-[3px] top-[5px] h-2 w-2 rounded-full bg-[var(--danger)] ring-2 ring-ink-900"
                    />
                  ) : null}
                  <span className="sr-only">
                    {s.title}
                    {hasError ? ` ${UI.sectionHasErrors}` : ""}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
        <p aria-hidden="true" className="hidden min-w-0 flex-1 truncate text-[15px] text-paper-2 md:block">
          {activeTitle}
        </p>
        {saved ? (
          <p className="ms-auto hidden shrink-0 text-[14px] text-paper-faint md:block">{UI.draftSaved}</p>
        ) : null}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ *
 * Sadaļa un piekļuves kartīte
 * ------------------------------------------------------------------ */

function FormSection({ id, title, intro, children }: { id: SectionId; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      data-anketa-section={id}
      className="scroll-mt-[calc(var(--galvene)+76px)] border-t border-line pt-10 md:pt-14"
    >
      {/* tabIndex -1: sadaļu joslas lēciens pārvieto fokusu uz virsrakstu. */}
      <h2
        id={`${id}-h`}
        tabIndex={-1}
        className="scroll-mt-[calc(var(--galvene)+76px)] text-[clamp(1.5rem,3vw,2.1rem)] font-medium leading-[1.1] tracking-[-0.03em] text-paper focus:outline-none focus-visible:outline-none"
      >
        {title}
      </h2>
      {intro ? <div className="mt-4 max-w-[62ch] text-[16px] leading-[1.6] text-paper-2">{intro}</div> : null}
      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </section>
  );
}

/** CMS kartītē rādām tikai izvēlētās sistēmas soli. Wix/Webflow = "Cita sistēma". */
function cmsStepIndexes(cms: string | null): number[] | null {
  switch (cms) {
    case "wordpress":
      return [0];
    case "shopify":
      return [1];
    case "kods":
      return [2];
    case "lovable":
      return [3];
    case "wix":
    case "webflow":
      return [4];
    case "cita":
      return [5];
    case "nezinu":
      return [0, 1, 2, 3, 4, 5, 6]; // visi soļi + norāde, ko darīt
    default:
      return [0, 1, 2, 3, 4, 5]; // nekas nav izvēlēts - visi soļi bez "Nezinu" norādes
  }
}

function AccessCardView({
  card,
  register,
  errors,
  top,
  stepIndexes,
}: {
  card: AccessCard;
  register: UseFormRegister<AnketaFormValues>;
  errors: ErrorsMap;
  /** Saturs kartītes augšā uzreiz aiz "Kāpēc" (CMS izvēle). */
  top?: ReactNode;
  /** Kurus soļus rādīt; null = visus. */
  stepIndexes?: number[] | null;
}) {
  const name = accessField(card.tool);
  const List = card.stepsKind === "numbered" ? "ol" : "ul";
  const err = errors[name]?.message;
  const steps = card.steps
    .map((step, i) => ({ step, i }))
    .filter(({ i }) => !stepIndexes || stepIndexes.includes(i));
  return (
    <article
      aria-labelledby={`${card.tool}-h`}
      className={cn(
        "rounded-card border bg-ink-850 p-5 sm:p-7",
        err ? "border-[rgba(255,107,94,0.55)]" : "border-line",
      )}
    >
      <h3 id={`${card.tool}-h`} className="text-[clamp(1.15rem,2vw,1.35rem)] font-medium tracking-[-0.02em] text-paper">
        {card.title}
      </h3>
      {/* Piebilde atsevišķā rindā, ne virsrakstā: garā GBP piebilde virsrakstā
          lūza zem tā nejaušā vietā. */}
      {card.qualifier ? <p className="mt-1 text-[15px] leading-[1.45] text-paper-faint">{card.qualifier}</p> : null}
      {card.why ? (
        <p className="mt-3 text-[15px] leading-[1.55] text-paper-2">
          <span className="font-semibold text-paper">{WHY_PREFIX}</span> {card.why}
        </p>
      ) : null}

      {top ? <div className="mt-6 flex flex-col gap-6">{top}</div> : null}

      <List className="mt-5 flex list-none flex-col gap-3 text-[15px] leading-[1.55] text-paper-2">
        {steps.map(({ step, i }) => (
          <li key={step.slice(0, 32)} className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-3">
            <span aria-hidden="true" className="pt-px font-label text-[14px] text-amber">
              {card.stepsKind === "numbered" ? `${i + 1}.` : "-"}
            </span>
            <span>
              <Rich text={step} />
            </span>
          </li>
        ))}
      </List>

      <ul className="mt-4 flex flex-col gap-2 sm:ps-[40px]">
        {card.addresses.map((address) => (
          <CopyAddress key={address} address={address} />
        ))}
      </ul>

      {card.note ? <p className="mt-4 text-[14px] leading-[1.55] text-paper-dim">{card.note}</p> : null}

      <div className="mt-6 border-t border-line pt-5">
        <ChoiceGroup
          name={name}
          options={ACCESS_OPTIONS}
          legend={ACCESS_TOOL_LABELS[card.tool]}
          legendHidden
          register={register}
          errors={errors}
          hint={
            <>
              {UI.statusHint}
              <RequiredMark />
            </>
          }
        />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Lapa
 * ------------------------------------------------------------------ */

type Status = { state: "idle" } | { state: "success" } | { state: "error"; code: string };

type ApiResponse =
  | { ok: true }
  | { ok: false; error: string; fields?: Record<string, string>; retryAfter?: number };

const TURNSTILE_CODES = new Set(["turnstile", "turnstile_unavailable"]);

function focusField(name: FieldName): void {
  const el = document.getElementById(domIdFor(name));
  if (!el) return;
  const kluss = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: kluss ? "auto" : "smooth", block: "center" });
  el.focus({ preventScroll: true });
}

export default function SeoAnketa() {
  const { locale, t } = useLocale();
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [draftReady, setDraftReady] = useState(false);
  // Nolasa pirms hidratācijas ierakstīto, kamēr SSR DOM vēl nav aiztikts
  // (sk. readDomValues). Serverī `document` nav - tur paliek null.
  const preHydration = useRef<Partial<AnketaFormValues> | null>(null);
  if (preHydration.current === null && typeof document !== "undefined") {
    preHydration.current = readDomValues();
  }
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState<SectionId>(SECTIONS[0].id);
  const [visited, setVisited] = useState<ReadonlySet<SectionId>>(() => new Set<SectionId>());
  const turnstileToken = useRef("");
  const turnstileWaiter = useRef<((token: string) => void) | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<AnketaFormValues>({
    resolver: zodResolver(anketaSchema) as unknown as Resolver<AnketaFormValues>,
    defaultValues: emptyValues(),
    shouldFocusError: false,
  });

  const [atskaites, ieviesejs, cms, blogs] = useWatch({ control, name: ["atskaites", "ieviesejs", "cms", "blogs"] });

  const onSaved = useCallback((ok: boolean) => {
    if (ok) setSaved(true);
  }, []);

  // Melnraksts: TIKAI pēc hidratācijas. Serveris renderē tukšu formu; ja
  // klients pirmajā zīmējumā ieliktu saglabātās vērtības, React ziņotu par
  // neatbilstību. Saglabāšana ieslēdzas tikai pēc atjaunošanas, lai tukšā
  // sākuma forma nepārrakstītu melnrakstu.
  //
  // Prioritāte: pirms hidratācijas ierakstītais DOM > melnraksts > tukšs.
  // Tiek izsaukts viens reset().
  useEffect(() => {
    const draft = readDraft();
    const typed = preHydration.current ?? {};
    const hasTyped = Object.keys(typed).length > 0;
    if (draft || hasTyped) {
      const merged = { ...emptyValues(), ...(draft ?? {}), ...typed };
      reset(merged);
      // DraftSaver pirmo izmaiņu izlaiž, tāpēc pirms hidratācijas ierakstīto
      // saglabājam uzreiz - citādi tas pazustu, ja cilvēks lapu pārlādē.
      if (hasTyped) writeDraft(merged);
      setSaved(true);
    }
    setDraftReady(true);
  }, [reset]);

  // Kura sadaļa ir redzama - sadaļu joslas izcēlumam un "apmeklēts" stāvoklim.
  useEffect(() => {
    if (status.state === "success" || typeof IntersectionObserver === "undefined") return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-anketa-section]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const id = top.target.getAttribute("data-anketa-section") as SectionId;
        setActive(id);
        setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [status.state]);

  useEffect(() => {
    if (status.state !== "success") return;
    const el = successRef.current;
    if (!el) return;
    const kluss = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: kluss ? "auto" : "smooth", block: "center" });
    el.focus({ preventScroll: true });
  }, [status.state]);

  function focusFirstError(keys: string[]): void {
    const first = FIELD_ORDER.find((name) => keys.includes(name));
    if (first) focusField(first);
  }

  function receiveTurnstileToken(token: string): void {
    turnstileToken.current = token;
    if (token && turnstileWaiter.current) {
      const resolve = turnstileWaiter.current;
      turnstileWaiter.current = null;
      resolve(token);
    }
  }

  function awaitTurnstileToken(ms: number): Promise<string> {
    if (turnstileToken.current) return Promise.resolve(turnstileToken.current);
    return new Promise<string>((resolve) => {
      turnstileWaiter.current = resolve;
      window.setTimeout(() => {
        if (turnstileWaiter.current === resolve) {
          turnstileWaiter.current = null;
          resolve("");
        }
      }, ms);
    });
  }

  async function onSubmit(values: AnketaFormValues) {
    setStatus({ state: "idle" });
    try {
      let token = "";
      if (turnstileEnabled) {
        token = await awaitTurnstileToken(TURNSTILE_WAIT_MS);
        if (!token) {
          setStatus({ state: "error", code: "turnstile" });
          setTurnstileReset((n) => n + 1);
          return;
        }
      }
      const response = await fetch("/api/seo-anketa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...(turnstileEnabled ? { [TURNSTILE_FIELD]: token } : {}) }),
      });
      const data = (await response.json().catch(() => null)) as ApiResponse | null;

      if (response.ok && data?.ok) {
        clearDraft();
        reset(emptyValues());
        setSaved(false);
        setStatus({ state: "success" });
        if (typeof window !== "undefined" && window.dataLayer) {
          window.dataLayer.push({ event: "generate_lead", form_name: "seo_anketa" });
        }
        return;
      }

      const code =
        data && data.ok === false && typeof data.error === "string"
          ? data.error
          : response.status === 429
            ? "rate_limit"
            : "server";

      if (code === "validation" && data && data.ok === false && data.fields) {
        const known = Object.entries(data.fields).filter(([field]) => (FIELD_ORDER as string[]).includes(field));
        for (const [field, key] of known) setError(field as FieldName, { type: "server", message: key });
        focusFirstError(known.map(([field]) => field));
      }
      setStatus({ state: "error", code });
      if (turnstileEnabled) setTurnstileReset((n) => n + 1);
    } catch {
      setStatus({ state: "error", code: "network" });
    }
  }

  const onInvalid = (errs: Record<string, unknown>) => focusFirstError(Object.keys(errs));
  const errs = errors as ErrorsMap;

  // Kļūdainie lauki lapas secībā - kopsavilkumam un sadaļu joslas punktiem.
  const errorFields = FIELD_ORDER.filter((name) => errs[name]);
  const errorSections = new Set(errorFields.map(sectionOf));
  const summaryGroups = SECTIONS.map((s) => ({
    section: s,
    fields: errorFields.filter((name) => sectionOf(name) === s.id),
  })).filter((g) => g.fields.length > 0);

  return (
    <>
      <SEO
        locale={locale}
        noindex
        canonicalPath={LV_ONLY_ROUTES.seoAnketa}
        title={ANKETA_TITLE}
        description={ANKETA_META_DESCRIPTION}
      />

      <div className="flex-1 bg-ink-900 text-paper">
        <header className="mx-auto w-full max-w-wrap px-5 pb-10 pt-[clamp(104px,15vw,180px)] sm:px-8 md:pb-14 lg:px-10">
          <h1 className="max-w-[18ch] text-display-2 font-bold uppercase">{ANKETA_TITLE}</h1>
          <div className="mt-8 flex max-w-[62ch] flex-col gap-4 text-[clamp(1.02rem,1.3vw,1.15rem)] leading-[1.55] text-paper-2">
            {ANKETA_INTRO.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </header>

        {status.state === "success" ? (
          <div className="mx-auto w-full max-w-wrap px-5 pb-20 sm:px-8 md:pb-32 lg:px-10">
            <div
              ref={successRef}
              tabIndex={-1}
              role="status"
              className="max-w-[760px] rounded-card border border-line bg-ink-850 p-6 focus:outline-none md:p-9"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber text-on-amber" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path className="check-draw" d="M5 12.5 10 17.5 19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 className="mt-6 text-[clamp(1.35rem,2.4vw,1.8rem)] font-medium tracking-[-0.02em]">{SUCCESS.title}</h2>
              {SUCCESS.body.map((p) => (
                <p key={p.slice(0, 32)} className="mt-3 max-w-[56ch] text-[16px] leading-[1.5] text-paper-2">
                  {p}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <>
            <ProgressBar
              control={control}
              active={active}
              visited={visited}
              errorSections={errorSections}
              saved={saved}
            />
            <DraftSaver control={control} enabled={draftReady} onSaved={onSaved} />

            <form
              noValidate
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              className="mx-auto flex w-full max-w-wrap flex-col gap-14 px-5 pb-28 pt-10 sm:px-8 md:gap-20 md:pb-32 md:pt-14 lg:px-10"
            >
              <div className="flex max-w-[760px] flex-col gap-14 md:gap-20">
                {/* ============ 1 ============ */}
                <FormSection id="uznemums" title={SECTIONS[0].title}>
                  <TextInput name="uznemums" register={register} errors={errs} autoComplete="organization" />
                  <TextInput name="juridiskais" register={register} errors={errs} />
                  <TextInput name="majaslapa" register={register} errors={errs} type="url" inputMode="url" autoComplete="url" />
                  <TextInput name="adrese" register={register} errors={errs} autoComplete="street-address" />
                  <TextInput name="talrunis" register={register} errors={errs} type="tel" inputMode="tel" autoComplete="tel" />

                  <fieldset className="flex flex-col gap-5">
                    <legend className={cn(LABEL_TEXT, "mb-4")}>
                      {KONTAKTPERSONA_LEGEND}
                      <span className="ms-2 whitespace-nowrap font-label text-label text-paper-faint">{KONTAKTPERSONA_REQUIRED}</span>
                    </legend>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextInput name="kontaktsVards" register={register} errors={errs} autoComplete="name" />
                      <TextInput name="kontaktsAmats" register={register} errors={errs} autoComplete="organization-title" />
                      <div className="sm:col-span-2">
                        <TextInput
                          name="kontaktsEpasts"
                          register={register}
                          errors={errs}
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                        />
                      </div>
                    </div>
                  </fieldset>

                  <ChoiceGroup
                    name="atskaites"
                    legend={CHOICE_LABELS.atskaites}
                    options={choiceOptions("atskaites")}
                    register={register}
                    errors={errs}
                  >
                    {atskaites === "citur" ? (
                      <input
                        id="f-atskaitesCitur"
                        type="text"
                        autoComplete="off"
                        maxLength={TEXT_FIELDS.atskaitesCitur.max}
                        aria-labelledby="atskaites-citur-label"
                        aria-invalid={errs.atskaitesCitur ? true : undefined}
                        className={cn(FIELD_INPUT, "mt-3")}
                        {...register("atskaitesCitur")}
                      />
                    ) : null}
                  </ChoiceGroup>

                  <ChoiceGroup
                    name="ieviesejs"
                    legend={CHOICE_LABELS.ieviesejs}
                    options={choiceOptions("ieviesejs")}
                    register={register}
                    errors={errs}
                    help={HELP.ieviesejs}
                  >
                    {ieviesejs === "programmetajs" ? (
                      <input
                        id="f-ieviesejsKontakts"
                        type="text"
                        autoComplete="off"
                        maxLength={TEXT_FIELDS.ieviesejsKontakts.max}
                        aria-labelledby="ieviesejs-programmetajs-label"
                        aria-invalid={errs.ieviesejsKontakts ? true : undefined}
                        className={cn(FIELD_INPUT, "mt-3")}
                        {...register("ieviesejsKontakts")}
                      />
                    ) : null}
                  </ChoiceGroup>

                  <ChoiceGroup
                    name="vide"
                    legend={CHOICE_LABELS.vide}
                    options={choiceOptions("vide")}
                    register={register}
                    errors={errs}
                  />
                </FormSection>

                {/* ============ 2 ============ */}
                <FormSection id="piekluves" title={SECTIONS[1].title} intro={<p><Rich text={PIEKLUVES_INTRO} /></p>}>
                  {ACCESS_CARDS.map((card) => (
                    <AccessCardView
                      key={card.tool}
                      card={card.tool === "cms" && cms === "kods" ? { ...card, addresses: [GITHUB_USER] } : card}
                      register={register}
                      errors={errs}
                      stepIndexes={card.tool === "cms" ? cmsStepIndexes(cms) : null}
                      top={
                        card.tool === "cms" ? (
                          <>
                            <ChoiceGroup
                              name="cms"
                              legend={CHOICE_LABELS.cms}
                              options={choiceOptions("cms")}
                              register={register}
                              errors={errs}
                            />
                            {cms === "cita" ? <TextInput name="cmsCita" register={register} errors={errs} /> : null}
                          </>
                        ) : undefined
                      }
                    />
                  ))}
                  <p className="max-w-[62ch] border-s border-line ps-5 text-[15px] leading-[1.6] text-paper-dim">{PIEKLUVES_NOTE}</p>
                </FormSection>

                {/* ============ 3 ============ */}
                <FormSection id="tirgus" title={SECTIONS[2].title}>
                  <TextInput name="tirgi" register={register} errors={errs} help={HELP.tirgi} />
                  <TextInput name="valodasTagad" register={register} errors={errs} />
                  <TextInput name="valodasPlano" register={register} errors={errs} />
                  <TextInput name="pircejuVardi" register={register} errors={errs} help={HELP.pircejuVardi} />
                  <TextInput name="zimolaVarianti" register={register} errors={errs} />
                  <TextInput name="svarigakasLapas" register={register} errors={errs} />
                </FormSection>

                {/* ============ 4 ============ */}
                <FormSection id="nozare" title={SECTIONS[3].title} intro={<p>{NOZARE_INTRO}</p>}>
                  {(["nozare1", "nozare2", "nozare3", "nozare4", "nozare5", "nozare6"] as const).map((name, i) => (
                    <TextInput key={name} name={name} number={i + 1} register={register} errors={errs} />
                  ))}
                </FormSection>

                {/* ============ 5 ============ */}
                <FormSection id="materiali" title={SECTIONS[4].title}>
                  <TextInput name="profili" register={register} errors={errs} />
                  <div className="flex flex-col gap-5">
                    <TextInput name="cenas" register={register} errors={errs} />
                    <ChoiceGroup
                      name="cenasPublicet"
                      legend={CHOICE_LABELS.cenasPublicet}
                      options={choiceOptions("cenasPublicet")}
                      register={register}
                      errors={errs}
                    />
                  </div>
                  <TextInput name="atsauksmes" register={register} errors={errs} />
                  <TextInput name="logotipi" register={register} errors={errs} />
                </FormSection>

                {/* ============ 6 ============ */}
                <FormSection id="blogs" title={SECTIONS[5].title} intro={<p>{BLOGS_INTRO}</p>}>
                  <ChoiceGroup
                    name="blogs"
                    legend={CHOICE_LABELS.blogs}
                    options={choiceOptions("blogs")}
                    register={register}
                    errors={errs}
                  />
                  {/* Papildu jautājumi tikai pie "Jā". Pie "Nē" tie netiek rādīti,
                      un vēstule tos izlaiž (sk. seo-anketa-emails.ts). */}
                  <p className="sr-only" aria-live="polite">
                    {blogs === "ja" ? BLOGS_OPENED : ""}
                  </p>
                  {blogs === "ja" ? (
                    <div className="flex flex-col gap-8 border-s border-line ps-5">
                      <ChoiceGroup
                        name="blogsBiezums"
                        legend={CHOICE_LABELS.blogsBiezums}
                        options={choiceOptions("blogsBiezums")}
                        register={register}
                        errors={errs}
                      />
                      <TextInput name="blogsAutors" register={register} errors={errs} help={HELP_BLOGS.autors} />
                      <TextInput name="blogsApstiprina" register={register} errors={errs} help={HELP_BLOGS.apstiprina} />
                      <TextInput name="blogsParaugi" register={register} errors={errs} />
                      <TextInput name="blogsFoto" register={register} errors={errs} inputMode="url" />
                      <TextInput name="blogsTemas" register={register} errors={errs} />
                    </div>
                  ) : null}
                </FormSection>

                {/* ============ 7 ============ */}
                <FormSection id="nosutisana" title={SECTIONS[6].title}>
                  <TextInput name="komentars" register={register} errors={errs} />

                  {/* Slazds robotiem: display:none izņem to arī no autofill redzesloka,
                      nosaukums ir bez nozīmes (sk. ANKETA_HONEYPOT_FIELD). */}
                  <div style={{ display: "none" }} aria-hidden="true">
                    <label htmlFor="f-slazds">{UI.honeypot}</label>
                    <input id="f-slazds" type="text" tabIndex={-1} autoComplete="off" {...register(ANKETA_HONEYPOT_FIELD)} />
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <input
                        id="f-piekrisana"
                        type="checkbox"
                        className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded-[4px] border border-line-strong bg-ink-850 accent-[var(--amber)]"
                        aria-required="true"
                        aria-invalid={errs.piekrisana ? true : undefined}
                        aria-describedby={errs.piekrisana ? "f-piekrisana-error" : undefined}
                        {...register("piekrisana")}
                      />
                      <label htmlFor="f-piekrisana" className="cursor-pointer text-[16px] leading-[1.5] text-paper-2">
                        {CONSENT_LABEL}
                        <RequiredMark />
                      </label>
                    </div>
                    <p className="mt-2 ps-9 text-[15px]">
                      <Link
                        to="/privatuma-politika"
                        className="border-b border-line-amber text-paper transition-colors duration-300 hover:text-amber"
                      >
                        {CONSENT_LINK}
                      </Link>
                    </p>
                    {errs.piekrisana ? (
                      <p id="f-piekrisana-error" className={cn("mt-2 ps-9", ERROR_TEXT)}>
                        {errorText(errs.piekrisana.message)}
                      </p>
                    ) : null}
                  </div>

                  {/* Vieta logrīkam rezervēta no pirmā zīmējuma. Turnstile
                      ieslēdzas formas pirmajā pieskārienā un, ja vieta nav
                      rezervēta, iespraužas virs pogas tieši klikšķa laikā: poga
                      aizbrauc no kursora, un pirmais "Nosūtīt" neko nedara.
                      100 px = logrīka 72 px (nomērīts) + tā 28 px atkāpe. */}
                  {turnstileEnabled ? (
                    <div className="min-h-[100px]">
                      <Turnstile onToken={receiveTurnstileToken} resetSignal={turnstileReset} locale="lv" />
                    </div>
                  ) : null}

                  {status.state === "error" ? (
                    <div
                      role="alert"
                      className="rounded-field border border-[var(--danger)] px-5 py-4 text-[15px] leading-[1.55]"
                    >
                      {TURNSTILE_CODES.has(status.code) ? (
                        <p className="text-paper">{UI.turnstileFailed}</p>
                      ) : (
                        <>
                          <p className="text-paper">
                            {FAILURE_BEFORE_EMAIL}{" "}
                            <a
                              href={`mailto:${GATIS_ACCOUNT}`}
                              className="border-b border-line-amber text-paper transition-colors duration-300 hover:text-amber"
                            >
                              {GATIS_ACCOUNT}
                            </a>
                            .
                          </p>
                          <p className="mt-2.5">
                            <Label>
                              {t.form.failureCode}: {status.code}
                            </Label>
                          </p>
                        </>
                      )}
                    </div>
                  ) : null}

                  {/* Kļūdu kopsavilkums: cik trūkst un kur. Saites fokusē lauku. */}
                  {submitCount > 0 && errorFields.length > 0 ? (
                    <div
                      role="alert"
                      className="rounded-field border border-[var(--danger)] px-5 py-4 text-[15px] leading-[1.55]"
                    >
                      <p className="font-semibold text-paper">{missingSummary(errorFields.length)}</p>
                      <div className="mt-3 flex flex-col gap-3">
                        {summaryGroups.map((g) => (
                          <div key={g.section.id}>
                            <p className="text-[14px] text-paper-dim">{g.section.title}</p>
                            <ul className="mt-1 flex flex-col">
                              {g.fields.map((name) => (
                                <li key={name}>
                                  <a
                                    href={`#${domIdFor(name)}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      focusField(name);
                                    }}
                                    className="inline-flex min-h-[44px] md:min-h-[36px] items-center text-[var(--danger-text)] underline decoration-[var(--danger)] underline-offset-4 hover:text-paper"
                                  >
                                    {labelOf(name)}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                      className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full bg-paper px-8 py-4 text-[17px] font-medium text-ink-900 transition-[background-color,color,opacity,transform] duration-300 hover:bg-amber hover:text-on-amber active:translate-y-px active:bg-amber-soft active:text-on-amber disabled:cursor-not-allowed disabled:opacity-60 md:min-h-16 md:px-9 md:text-[18px]"
                    >
                      {isSubmitting ? (
                        <>
                          <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {t.form.sending}
                        </>
                      ) : (
                        SUBMIT_LABEL
                      )}
                    </button>
                    {saved ? <p className="text-[14px] text-paper-faint">{UI.draftSaved}</p> : null}
                  </div>
                </FormSection>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}

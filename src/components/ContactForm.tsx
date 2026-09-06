import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";
import type { Dict } from "@/i18n/dict";
import Label from "@/components/ui/Label";
import { CONTACT_EMAIL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { BUDGET_VALUES, FIELD_LIMITS, SERVICE_VALUES } from "../../api/_lib/contact-fields";
import { contactSchema, type ContactFormValues } from "../../api/_lib/contact-schema";

/**
 * Kontaktforma.
 *
 * Validāciju veic tā pati zod shēma, ko lieto serveris
 * (api/_lib/contact-schema.ts), tāpēc pārlūkā un serverī nevar sanākt divi
 * dažādi noteikumu komplekti. Kļūdu ziņojumi shēmā ir atslēgas - tekstu abās
 * valodās dod dict.ts.
 *
 * Mikro-interakcijas (Kinetics): pogas stāvokļi idle -> sūta -> nosūtīts,
 * zīmētais ķeksis pēc atbildes un viena 400 ms kratīšana pie validācijas
 * kļūdas. Visas trīs ir atgriezeniskā saite par TIEŠI TO darbību, ko lietotājs
 * veica; pie `prefers-reduced-motion` tās neizpildās (sk. src/index.css).
 *
 * Budžets ir radio čipu grupa <fieldset> iekšienē, un neviens no tiem NAV
 * iepriekš izvēlēts: iepriekš izvēlēts zemākais diapazons izvēlas lietotāja
 * vietā.
 */

type ErrorKey = keyof Dict["form"]["errors"];

type Status =
  | { state: "idle" }
  | { state: "success" }
  | { state: "error"; messageKey: ErrorKey; code: string };

type ApiResponse =
  | { ok: true }
  | { ok: false; error: string; fields?: Record<string, string>; retryAfter?: number };

const FORM_FIELDS = ["name", "email", "service", "budget", "timeline", "message", "consent"] as const;
type FormField = (typeof FORM_FIELDS)[number];

/**
 * `focus:outline-none` te iepriekš nogalināja globālo fokusa gredzenu:
 * `.focus\:outline-none:focus` specifiskums pārspēj `:focus-visible`, un ar
 * tastatūru laukos bija redzama tikai rāmja krāsas maiņa. Gredzens ir
 * skaidri uzlikts atpakaļ.
 */
const FIELD_BASE =
  "w-full rounded-field border border-line bg-ink-850 px-4 text-[16px] text-paper placeholder:text-paper-faint transition-[border-color,background-color] duration-300 hover:border-line-strong focus:border-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber aria-[invalid=true]:border-amber";
const FIELD_INPUT = cn(FIELD_BASE, "min-h-[56px] py-4 md:min-h-16");

/**
 * Kļūdas rinda ir ATVĒLĒTA, ne pieaugoša. Tukšs iesniegums ar sešām kļūdām
 * lapu pagarināja par 151 px, un viss zem formas nolēca lejā tieši tajā brīdī,
 * kad cilvēks skatās, kur radās kļūda. Vieta ir vienmēr; mainās tikai teksts.
 */
const ERROR_SLOT = "min-h-[19px] text-[14px] leading-[1.35] text-amber";

export default function ContactForm({ className }: { className?: string }) {
  const { t, path, locale } = useLocale();
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [shake, setShake] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", timeline: "", message: "", consent: false, company: "" },
  });

  // Viena kratīšana, 400 ms, pie katras jaunas validācijas kļūdas.
  useEffect(() => {
    if (!shake) return;
    const id = window.setTimeout(() => setShake(false), 420);
    return () => window.clearTimeout(id);
  }, [shake]);

  const errorText = (key?: string): string => {
    const table = t.form.errors as Record<string, string>;
    return (key && table[key]) || t.form.errors.server;
  };

  async function onSubmit(values: ContactFormValues) {
    setStatus({ state: "idle" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, locale }),
      });
      const data = (await response.json().catch(() => null)) as ApiResponse | null;

      if (response.ok && data?.ok) {
        setStatus({ state: "success" });
        if (typeof window !== "undefined" && window.dataLayer) {
          window.dataLayer.push({ event: "generate_lead", form_name: "contact" });
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
        const reported = Object.entries(data.fields).filter(([field]) =>
          (FORM_FIELDS as readonly string[]).includes(field),
        ) as Array<[FormField, string]>;
        for (const [field, key] of reported) setError(field, { type: "server", message: key });
        if (reported.length > 0) setFocus(reported[0][0]);
        setStatus({ state: "error", messageKey: "validation", code });
        setShake(true);
        return;
      }

      setStatus({ state: "error", messageKey: code === "rate_limit" ? "rateLimit" : "server", code });
      setShake(true);
    } catch {
      // Tīkls nokrita vai atbilde nepienāca. To parādām kā tīkla kļūdu, nevis
      // slēpjam aiz "forma vēl nav savienota".
      setStatus({ state: "error", messageKey: "network", code: "network" });
      setShake(true);
    }
  }

  if (status.state === "success") {
    return (
      <div className={cn("rounded-card border border-line bg-ink-850 p-6 text-paper md:p-9", className)}>
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full bg-amber text-on-amber"
          aria-hidden="true"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path className="check-draw" d="M5 12.5 10 17.5 19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="mt-6 text-[clamp(1.35rem,2.4vw,1.8rem)] font-medium tracking-[-0.02em]">
          {t.form.successTitle}
        </h3>
        <p className="mt-3 max-w-[52ch] text-[16px] leading-[1.6] text-paper-2">{t.form.successBody}</p>
        <button
          type="button"
          onClick={() => {
            reset();
            setStatus({ state: "idle" });
          }}
          className="mt-7 inline-flex min-h-[52px] items-center rounded-full border border-line-strong px-6 text-[16px] text-paper transition-colors duration-300 hover:border-amber hover:text-amber active:border-amber active:text-amber"
        >
          {t.form.successAgain}
        </button>
      </div>
    );
  }

  const failure = status.state === "error" ? status : null;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit, () => setShake(true))}
      noValidate
      className={cn(shake && "shake", className)}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Field id="name" label={t.form.nameLabel} error={errors.name && errorText(errors.name.message)}>
          <input
            id="name"
            type="text"
            className={FIELD_INPUT}
            placeholder={t.form.namePlaceholder}
            autoComplete="name"
            maxLength={FIELD_LIMITS.nameMax}
            aria-required="true"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
        </Field>

        <Field id="email" label={t.form.emailLabel} error={errors.email && errorText(errors.email.message)}>
          <input
            id="email"
            type="email"
            className={FIELD_INPUT}
            placeholder={t.form.emailPlaceholder}
            autoComplete="email"
            maxLength={FIELD_LIMITS.emailMax}
            aria-required="true"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </Field>

        <div className="md:col-span-2">
          <Field id="service" label={t.form.serviceLabel} error={errors.service && errorText(errors.service.message)}>
            <SelectShell>
              <select
                id="service"
                defaultValue=""
                className={cn(FIELD_INPUT, "appearance-none pe-11")}
                aria-required="true"
                aria-invalid={errors.service ? true : undefined}
                aria-describedby={errors.service ? "service-error" : undefined}
                {...register("service")}
              >
                <option value="" disabled>
                  {t.form.servicePlaceholder}
                </option>
                {SERVICE_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t.form.serviceOptions[value]}
                  </option>
                ))}
              </select>
            </SelectShell>
          </Field>
        </div>

        {/* Budžets: radio čipi bez iepriekšējas izvēles. */}
        <fieldset className="md:col-span-2">
          <legend className="mb-3">
            <Label>{t.form.budgetLabel}</Label>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {BUDGET_VALUES.map((value) => (
              <label
                key={value}
                className="group cursor-pointer rounded-field border border-line px-4 py-3 text-[15px] text-paper-2 transition-[border-color,color,background-color] duration-300 hover:border-line-strong active:border-amber has-[:checked]:border-amber has-[:checked]:bg-amber has-[:checked]:text-on-amber has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-amber"
              >
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  aria-invalid={errors.budget ? true : undefined}
                  aria-describedby={errors.budget ? "budget-error" : undefined}
                  {...register("budget")}
                />
                {t.form.budgetOptions[value]}
              </label>
            ))}
          </div>
          <p id="budget-error" role="alert" className={cn("mt-2", ERROR_SLOT)}>
            {errors.budget ? errorText(errors.budget.message) : ""}
          </p>
        </fieldset>

        <div className="md:col-span-2">
          <Field
            id="timeline"
            label={t.form.timelineLabel}
            optional={t.form.optional}
            error={errors.timeline && errorText(errors.timeline.message)}
          >
            <input
              id="timeline"
              type="text"
              className={FIELD_INPUT}
              placeholder={t.form.timelinePlaceholder}
              maxLength={FIELD_LIMITS.timelineMax}
              aria-invalid={errors.timeline ? true : undefined}
              aria-describedby={errors.timeline ? "timeline-error" : undefined}
              {...register("timeline")}
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field id="message" label={t.form.messageLabel} error={errors.message && errorText(errors.message.message)}>
            <textarea
              id="message"
              rows={5}
              className={cn(FIELD_BASE, "min-h-[150px] resize-y py-3.5 leading-[1.6]")}
              placeholder={t.form.messagePlaceholder}
              maxLength={FIELD_LIMITS.messageMax}
              aria-required="true"
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? "message-error" : undefined}
              {...register("message")}
            />
          </Field>
        </div>
      </div>

      {/* Slazds robotiem. `.sr-only` nozīmē "redzams TIKAI ekrānlasītājam" -
          tieši pretēji slazda nolūkam: redzīgs lietotājs to neredzēja, bet
          ekrānlasītāja lietotājs to dzirdēja un varēja aizpildīt, un tad
          serveris atbild ok, vēstuli nesūtot. `aria-hidden` uz ietinošā div
          izņem to arī no pieejamības koka; `tabindex=-1` jau izņēma no
          tabulācijas. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company" className="sr-only">
          {t.form.honeypotLabel}
        </label>
        <input id="company" className="sr-only" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div className="mt-7 flex items-start gap-3">
        <input
          id="consent"
          type="checkbox"
          className="mt-[3px] h-5 w-5 shrink-0 cursor-pointer rounded-[4px] border border-line-strong bg-ink-850 accent-[var(--amber)]"
          aria-required="true"
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? "consent-error" : undefined}
          {...register("consent")}
        />
        <label htmlFor="consent" className="cursor-pointer text-[14px] leading-[1.55] text-paper-dim">
          {t.form.consentBefore}{" "}
          <Link to={path("privacy")} className="border-b border-line-amber text-paper transition-colors duration-300 hover:text-amber">
            {t.form.consentLink}
          </Link>
          {t.form.consentAfter}
        </label>
      </div>
      <p id="consent-error" role="alert" className={cn("mt-2", ERROR_SLOT)}>
        {errors.consent ? errorText(errors.consent.message) : ""}
      </p>

      {failure ? (
        <div role="alert" className="mt-7 rounded-field border border-amber px-5 py-4 text-[15px]">
          <p className="font-semibold text-paper">{t.form.failureTitle}</p>
          <p className="mt-1.5 text-paper-2">{t.form.errors[failure.messageKey]}</p>
          <p className="mt-2 text-paper-2">
            {t.form.failureFallback}{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${t.form.kicker}: ${getValues("name") || ""}`.trim())}`}
              className="border-b border-line-amber text-paper transition-colors duration-300 hover:text-amber"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2.5">
            <Label>
              {t.form.failureCode}: {failure.code}
            </Label>
          </p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full bg-paper px-8 py-4 text-[17px] font-medium text-ink-900 transition-[background-color,color,opacity,transform] duration-300 hover:bg-amber hover:text-on-amber active:translate-y-px active:bg-amber-soft active:text-on-amber disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0 md:min-h-16 md:px-9 md:py-[18px] md:text-[18px]"
        >
          {isSubmitting ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
              {t.form.sending}
            </>
          ) : (
            t.form.submit
          )}
        </button>
        <span className="text-[14px] text-paper-dim">{t.form.replyTime}</span>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: string;
  error?: string | false;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-label text-label text-paper-faint">
        {label}
        {optional ? <span className="ms-2">({optional})</span> : null}
      </label>
      {children}
      <p id={`${id}-error`} role="alert" className={ERROR_SLOT}>
        {error || ""}
      </p>
    </div>
  );
}

/** Izvēlnei vajag savu bultiņu, jo appearance-none noņem sistēmas bultu. */
function SelectShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-4 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-e border-paper-faint"
      />
    </div>
  );
}

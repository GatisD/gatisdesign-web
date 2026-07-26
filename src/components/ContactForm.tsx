import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import type { Dict } from "@/i18n/dict";
import { CONTACT_EMAIL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { BUDGET_VALUES, FIELD_LIMITS, SERVICE_VALUES } from "../../api/_lib/contact-fields";
import { contactSchema, type ContactFormValues } from "../../api/_lib/contact-schema";

/**
 * Kontaktforma. Validāciju veic tā pati zod shēma, ko lieto serveris
 * (api/_lib/contact-schema.ts), tāpēc pārlūkā un serverī nevar sanākt divi
 * dažādi noteikumu komplekti. Kļūdu ziņojumi shēmā ir atslēgas - tekstu abās
 * valodās dod dict.ts.
 */

type ErrorKey = keyof Dict["form"]["errors"];

type Status =
  | { state: "idle" }
  | { state: "success" }
  | { state: "error"; messageKey: ErrorKey; code: string };

type ApiResponse =
  | { ok: true }
  | { ok: false; error: string; fields?: Record<string, string>; retryAfter?: number };

/** Lauki, kuriem serveris drīkst uzstādīt kļūdu (lai neveidojas fantoma lauki). */
const FORM_FIELDS = [
  "name",
  "email",
  "service",
  "budget",
  "timeline",
  "message",
  "consent",
] as const;
type FormField = (typeof FORM_FIELDS)[number];

const FIELD_BASE =
  "w-full rounded-xl border border-line bg-ink-800 px-4 text-[15px] text-paper placeholder:text-paper-faint transition-colors duration-200 hover:border-line-strong focus:border-amber focus:outline-none aria-[invalid=true]:border-amber/70";
const FIELD_INPUT = cn(FIELD_BASE, "min-h-[48px] py-3");

export default function ContactForm({ className }: { className?: string }) {
  const { t, path, locale } = useLocale();
  const [status, setStatus] = useState<Status>({ state: "idle" });

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
    defaultValues: {
      name: "",
      email: "",
      timeline: "",
      message: "",
      consent: false,
      company: "",
    },
  });

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
        for (const [field, key] of reported) {
          setError(field, { type: "server", message: key });
        }
        if (reported.length > 0) setFocus(reported[0][0]);
        setStatus({ state: "error", messageKey: "validation", code });
        return;
      }

      setStatus({
        state: "error",
        messageKey: code === "rate_limit" ? "rateLimit" : "server",
        code,
      });
    } catch {
      // Tīkls nokrita vai atbilde nepienāca. To parādām kā tīkla kļūdu, nevis
      // slēpjam aiz "forma vēl nav savienota".
      setStatus({ state: "error", messageKey: "network", code: "network" });
    }
  }

  if (status.state === "success") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-line bg-ink-850 p-6 text-paper md:p-8",
          className,
        )}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full bg-amber text-[#1a1206]"
          aria-hidden="true"
        >
          <Check size={22} />
        </div>
        <h3 className="mt-5 text-[clamp(1.25rem,2vw,1.6rem)] font-medium tracking-[-0.02em]">
          {t.form.successTitle}
        </h3>
        <p className="mt-3 max-w-[52ch] text-paper-dim">{t.form.successBody}</p>
        <button
          type="button"
          onClick={() => {
            reset();
            setStatus({ state: "idle" });
          }}
          className="mt-6 min-h-[44px] rounded-full border border-line-strong px-5 text-[14px] text-paper transition-colors duration-200 hover:border-amber hover:text-amber"
        >
          {t.form.successAgain}
        </button>
      </div>
    );
  }

  const failure = status.state === "error" ? status : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn(
        "rounded-2xl border border-line bg-ink-850 p-6 text-paper md:p-8",
        className,
      )}
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

        <Field
          id="service"
          label={t.form.serviceLabel}
          error={errors.service && errorText(errors.service.message)}
        >
          <SelectShell>
            <select
              id="service"
              defaultValue=""
              className={cn(FIELD_INPUT, "appearance-none pr-11")}
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

        <Field
          id="budget"
          label={t.form.budgetLabel}
          error={errors.budget && errorText(errors.budget.message)}
        >
          <SelectShell>
            <select
              id="budget"
              defaultValue=""
              className={cn(FIELD_INPUT, "appearance-none pr-11")}
              aria-required="true"
              aria-invalid={errors.budget ? true : undefined}
              aria-describedby={errors.budget ? "budget-error" : undefined}
              {...register("budget")}
            >
              <option value="" disabled>
                {t.form.budgetPlaceholder}
              </option>
              {BUDGET_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t.form.budgetOptions[value]}
                </option>
              ))}
            </select>
          </SelectShell>
        </Field>

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
          <Field
            id="message"
            label={t.form.messageLabel}
            error={errors.message && errorText(errors.message.message)}
          >
            <textarea
              id="message"
              rows={5}
              className={cn(FIELD_BASE, "min-h-[140px] resize-y py-3 leading-[1.6]")}
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

      {/* Slazds robotiem. Redzams tikai ekrāna lasītājam, tāpēc ar skaidru
          norādi to neaizpildīt; no tabulācijas izņemts ar tabindex -1. */}
      <div className="sr-only">
        <label htmlFor="company">{t.form.honeypotLabel}</label>
        <input id="company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div className="mt-6 flex items-start gap-3">
        <input
          id="consent"
          type="checkbox"
          className="mt-[3px] h-5 w-5 shrink-0 cursor-pointer rounded border border-line-strong bg-ink-800 accent-amber"
          aria-required="true"
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? "consent-error" : undefined}
          {...register("consent")}
        />
        <label htmlFor="consent" className="cursor-pointer text-[14px] leading-[1.55] text-paper-dim">
          {t.form.consentBefore}{" "}
          <Link
            to={path("privacy")}
            className="text-amber underline underline-offset-2 hover:text-amber-soft"
          >
            {t.form.consentLink}
          </Link>
          {t.form.consentAfter}
        </label>
      </div>
      {errors.consent && (
        <p id="consent-error" role="alert" className="mt-2 text-[13px] text-amber-soft">
          {errorText(errors.consent.message)}
        </p>
      )}

      {failure && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-amber/45 bg-amber-glow px-4 py-4 text-[14px]"
        >
          <p className="font-semibold text-paper">{t.form.failureTitle}</p>
          <p className="mt-1 text-paper-2">{t.form.errors[failure.messageKey]}</p>
          <p className="mt-2 text-paper-2">
            {t.form.failureFallback}{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                `${t.form.kicker}: ${getValues("name") || ""}`.trim(),
              )}`}
              className="text-amber underline underline-offset-2 hover:text-amber-soft"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2 text-[12px] text-paper-faint">
            {t.form.failureCode}: {failure.code}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-amber px-6 text-[15px] font-semibold text-[#1a1206] shadow-[0_12px_40px_-14px_rgba(224,114,60,.65)] transition-all duration-300 hover:bg-amber-soft disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? t.form.sending : t.form.submit}
        {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
      </button>
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
      <label htmlFor={id} className="text-[13px] font-medium text-paper-2">
        {label}
        {optional ? (
          <span className="ml-2 font-normal text-[12px] text-paper-faint">({optional})</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-amber-soft">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Izvēlnei vajag savu bultiņu, jo appearance-none noņem sistēmas bultu. */
function SelectShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-paper-faint"
      />
    </div>
  );
}

import { useEffect } from "react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { dict } from "@/i18n/dict";
import { pathFor, type Locale } from "@/i18n/routes";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * Maršruta kļūdu lapa - to React Router rāda, kad lapas renderis, efekts vai
 * atliktās daļas ielāde met kļūdu. Bez tās apmeklētājs redz bibliotēkas
 * noklusējuma "Unexpected Application Error!" ar ziņu angliski un bez izejas.
 *
 * Komponente apzināti NELIETO `useLocale` un citas konteksta atkarīgas
 * daļas: saknes maršruta kļūda notiek ārpus LocaleProvider, un kļūdu lapa,
 * kas pati krīt, ir sliktāka par bibliotēkas noklusējumu. Valoda nāk kā
 * props no maršruta, teksti tieši no vārdnīcas.
 *
 * Tehniskā ziņa ir redzama ar nolūku: tā ir vienīgais, ko apmeklētājs var
 * atsūtīt, un vēstules saite to jau ieliek tekstā kopā ar adresi un pārlūku.
 */
export default function Kluda({ locale, standalone = false }: { locale: Locale; standalone?: boolean }) {
  const error = useRouteError();
  const t = dict[locale].error;

  useEffect(() => {
    console.error("[gatisdesign] maršruta kļūda", error);
  }, [error]);

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`.trim()
    : error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === "string"
        ? error
        : t.unknown;

  const mailBody = [
    message,
    typeof window !== "undefined" ? window.location.href : "",
    typeof navigator !== "undefined" ? navigator.userAgent : "",
  ]
    .filter(Boolean)
    .join("\n");
  const mailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  const saturs = (
    <section className="flex flex-1 items-center bg-ink-900 pb-14 pt-[clamp(120px,18vw,220px)] md:pb-32">
      <div className="mx-auto w-full max-w-wrap px-5 sm:px-8 lg:px-10">
        <p className="mb-6 font-label text-label uppercase text-paper-faint">({t.label})</p>
        <h1 className="max-w-[16ch] text-display-2 font-bold uppercase text-paper">{t.title}</h1>
        <p className="mt-8 max-w-[52ch] text-[clamp(1.02rem,1.4vw,1.25rem)] leading-[1.5] text-paper-2">{t.body}</p>
        <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-paper px-8 py-4 text-[17px] font-medium text-ink-900 transition-colors duration-300 hover:bg-amber"
          >
            {t.reload}
          </button>
          <Link
            to={pathFor("home", locale)}
            className="stikls stikls-rams inline-flex min-h-[56px] items-center justify-center rounded-full px-8 py-4 text-[17px] text-paper"
          >
            {t.home}
          </Link>
          <a
            href={mailHref}
            className="stikls stikls-rams inline-flex min-h-[56px] items-center justify-center rounded-full px-8 py-4 text-[17px] text-paper"
          >
            {t.write}
          </a>
        </div>
        <div className="mt-12 max-w-[72ch]">
          <p className="font-label text-label uppercase text-paper-faint">{t.details}</p>
          <pre className="mt-2 whitespace-pre-wrap break-words rounded-[12px] border border-line bg-ink-800 p-4 font-mono text-[13px] leading-[1.5] text-paper-2">
            {message}
          </pre>
        </div>
      </div>
    </section>
  );

  if (!standalone) return saturs;
  return (
    <div lang={locale} className="flex min-h-screen flex-col bg-ink-900 text-paper">
      <header className="px-5 pt-6 sm:px-8 lg:px-10">
        <Link to={pathFor("home", locale)} className="font-label text-label uppercase text-paper">
          Gatis Design
        </Link>
      </header>
      {saturs}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";

const STORAGE_KEY = "cookie_consent_v1";
const RESET_EVENT = "gd:cookie-settings";

type Consent = "all" | "necessary" | null;

// Window.gtag ir deklarēts src/vite-env.d.ts (viens avots, lai izvairītos no konfliktējošām deklarācijām)

/**
 * Atver joslu no jauna. Izvēle glabājas `localStorage`, ne sīkdatnē, tāpēc
 * privātuma politikas vecais padoms "izdzēs sīkdatnes pārlūkprogrammā" to
 * neatiestatīja - vienīgais ceļš atpakaļ bija tāds, kas nestrādā. Kājenes
 * saite sauc šo funkciju.
 */
export function openCookieSettings(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Privātais režīms vai bloķēta krātuve - josla parādīsies jebkurā gadījumā.
  }
  window.dispatchEvent(new Event(RESET_EVENT));
}

export default function CookieBanner() {
  const { t, path, locale } = useLocale();
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(readStored());
    const onReset = () => setConsent(null);
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, []);

  useEffect(() => {
    if (consent === "all") applyConsent("all");
  }, [consent]);

  function readStored(): Consent {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "all" || stored === "necessary" ? stored : null;
    } catch {
      return null;
    }
  }

  function applyConsent(c: Consent) {
    if (c === "all" && typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      });
    }
  }

  function store(value: Exclude<Consent, null>) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ja krātuve nav pieejama, izvēle paliek spēkā tikai šai lapai.
    }
    setConsent(value);
  }

  if (!mounted || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label={locale === "lv" ? "Sīkdatņu paziņojums" : "Cookie notice"}
      // Necaurspīdīgs fons apzināti: ar bg-ink-900/95 un izpludinājumu virs
      // gaišā hero kadra teksta kontrasts nokrita līdz 1,2:1.
      //
      // Kompakta rinda, ne bloks. Iepriekš josla aizņēma 20% mobilā ekrāna un
      // pie 1280x800 aizsedza kontaktu formas pirmo lauku - lapa prasīja
      // atbildi uz jautājumu par sīkdatnēm, pirms ļāva sākt rakstīt.
      className="fixed inset-x-0 bottom-0 z-[200] border-t border-line-strong bg-ink-950 px-4 py-2.5 md:px-6 md:py-3"
    >
      <div className="mx-auto flex max-w-wrap flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {/* Rindas garums ir ierobežots arī te: pie 1440 px josla bija vienīgā
            vieta lapā, kur teksta rinda pārsniedza 100 zīmes. */}
        <p className="max-w-[68ch] text-[13px] leading-[1.4] text-paper-2 sm:text-[14px] md:text-[15px]">
          {t.cookies.text}{" "}
          <Link
            to={path("privacy")}
            className="border-b border-line-amber text-paper transition-colors duration-300 hover:text-amber"
          >
            {t.cookies.privacyLink}
          </Link>
          .
        </p>
        <div className="flex w-full flex-shrink-0 gap-2 sm:w-auto">
          {/* Abas pogas ir vienlīdz viegli sasniedzamas un vienlīdz saprotamas
              (EDPB 07/2020): atteikums nav paslēpts aiz "Iestatījumi". */}
          <button
            type="button"
            onClick={() => store("necessary")}
            className="min-h-[44px] flex-1 whitespace-nowrap rounded-full border border-line-strong px-4 text-[13px] text-paper transition-colors duration-300 hover:border-amber hover:text-amber active:border-amber active:text-amber sm:flex-initial sm:px-5 sm:text-[14px]"
          >
            {t.cookies.necessaryOnly}
          </button>
          <button
            type="button"
            onClick={() => store("all")}
            className="min-h-[44px] flex-1 whitespace-nowrap rounded-full bg-paper px-4 text-[13px] font-medium text-ink-900 transition-colors duration-300 hover:bg-amber hover:text-on-amber active:bg-amber-soft active:text-on-amber sm:flex-initial sm:px-5 sm:text-[14px]"
          >
            {t.cookies.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}

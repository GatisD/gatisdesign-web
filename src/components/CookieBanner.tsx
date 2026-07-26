import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";

const STORAGE_KEY = "cookie_consent_v1";

type Consent = "all" | "necessary" | null;

// Window.gtag ir deklarēts src/vite-env.d.ts (viens avots, lai izvairītos no konfliktējošām deklarācijām)

export default function CookieBanner() {
  const { t, path, locale } = useLocale();
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "all" || stored === "necessary") {
      setConsent(stored as Consent);
      applyConsent(stored as Consent);
    }
  }, []);

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

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "all");
    setConsent("all");
    applyConsent("all");
  }

  function handleReject() {
    localStorage.setItem(STORAGE_KEY, "necessary");
    setConsent("necessary");
  }

  if (!mounted || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label={locale === "lv" ? "Sīkdatņu paziņojums" : "Cookie notice"}
      className="fixed inset-x-0 bottom-0 z-[200] border-t border-line bg-ink-900/95 p-4 backdrop-blur-md md:p-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="text-sm leading-relaxed text-paper-dim">
          {t.cookies.text}{" "}
          <Link to={path("privacy")} className="text-amber underline underline-offset-2 hover:text-amber-soft">
            {t.cookies.privacyLink}
          </Link>
          .
        </p>
        <div className="flex w-full flex-shrink-0 gap-2 md:w-auto">
          <button
            type="button"
            onClick={handleReject}
            className="min-h-[44px] flex-1 rounded-full border border-line-strong px-4 text-sm text-paper transition-colors duration-200 hover:border-amber hover:text-amber md:flex-initial"
          >
            {t.cookies.necessaryOnly}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="min-h-[44px] flex-1 rounded-full bg-amber px-4 text-sm font-semibold text-[#1a1206] transition-colors duration-200 hover:bg-amber-soft md:flex-initial"
          >
            {t.cookies.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}

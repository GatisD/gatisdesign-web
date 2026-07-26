import { Link, useLocation } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";
import { LOCALES, pathFor, routeKeyForPath, type Locale, type RouteKey } from "@/i18n/routes";
import { cn } from "@/lib/utils";

export default function LanguageSwitch({ routeKey }: { routeKey?: RouteKey }) {
  const { locale, t } = useLocale();
  const { pathname } = useLocation();
  const key = routeKey ?? routeKeyForPath(pathname) ?? "home";
  return (
    <div role="group" aria-label={t.lang.label} className="inline-flex gap-[2px] rounded-full border border-line-strong p-[2px]">
      {LOCALES.map((l: Locale) => (
        <Link
          key={l}
          to={pathFor(key, l)}
          hrefLang={l}
          rel="alternate"
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200",
            l === locale ? "bg-ink-700 text-paper" : "text-paper-faint hover:text-paper-2",
          )}
        >
          {l === "lv" ? t.lang.lv : t.lang.en}
        </Link>
      ))}
    </div>
  );
}

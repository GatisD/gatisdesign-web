import { Link, useLocation } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";
import { LOCALES, pathFor, routeKeyForPath, type Locale, type RouteKey } from "@/i18n/routes";
import { cn } from "@/lib/utils";

/**
 * Valodas pārslēgs. Pāra lapa nāk no ROUTES kartes, ne no URL manipulācijas -
 * tāpēc /majaslapu-izstrade ved uz /en/website-development, ne uz /en/majaslapu-izstrade.
 *
 * `onPaper` maina krāsas kājenes papīra fonam: tumšās virsmas vara tur ir
 * 2,60:1 un neder ne tekstam, ne aktīvajam stāvoklim.
 */
export default function LanguageSwitch({
  routeKey,
  onPaper = false,
}: {
  routeKey?: RouteKey;
  onPaper?: boolean;
}) {
  const { locale, t } = useLocale();
  const { pathname } = useLocation();
  const key = routeKey ?? routeKeyForPath(pathname) ?? "home";
  return (
    <div role="group" aria-label={t.lang.label} className="inline-flex items-center gap-1">
      {LOCALES.map((l: Locale, i) => (
        <span key={l} className="inline-flex items-center">
          {i > 0 ? (
            <span aria-hidden="true" className={cn("px-1.5 text-label", onPaper ? "text-on-paper-dim" : "text-paper-faint")}>
              /
            </span>
          ) : null}
          <Link
            to={pathFor(key, l)}
            hrefLang={l}
            rel="alternate"
            aria-current={l === locale ? "true" : undefined}
            className={cn(
              // 44 px abos virzienos: augstums bija 44, platums 15.
              "inline-flex min-h-[44px] min-w-[44px] items-center justify-center font-label text-label uppercase transition-colors duration-300",
              l === locale
                ? onPaper
                  ? "text-on-paper"
                  : "text-paper"
                : onPaper
                  ? "text-on-paper-dim hover:text-amber-paper"
                  : "text-paper-faint hover:text-amber",
            )}
          >
            {l === "lv" ? t.lang.lv : t.lang.en}
          </Link>
        </span>
      ))}
    </div>
  );
}

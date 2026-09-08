import { Helmet } from "react-helmet-async";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { alternatesFor, type Locale, type RouteKey } from "@/i18n/routes";

type Props = {
  title: string;
  description: string;
  locale: Locale;
  routeKey?: RouteKey;
  /** Projektu lapām, kur ceļš nenāk no ROUTES. */
  alternates?: Array<{ locale: Locale; path: string }>;
  image?: string;
  noindex?: boolean;
};

const abs = (p: string) => (p.startsWith("http") ? p : `${SITE_URL}${p.startsWith("/") ? "" : "/"}${p}`);

export default function SEO({ title, description, locale, routeKey, alternates, image, noindex }: Props) {
  const alts = alternates ?? (routeKey ? alternatesFor(routeKey) : []);
  const self = alts.find((a) => a.locale === locale);
  /**
   * Canonical tikai tad, kad lapai ir savs maršruts. 404 lapai maršruta nav, un
   * agrāk tā izvadīja canonical uz sākumlapu: "neindeksē mani" un "īstā lapa ir
   * sākumlapa" ir divi pretēji signāli par vienu URL.
   */
  const canonical = self ? abs(self.path) : null;
  // Noklusētais koplietošanas attēls. Jauns faila vārds 2026-09-08 ar nolūku:
  // Telegram, Facebook un LinkedIn veco adresi tur kešā nedēļām, un pārģenerēts
  // attēls ar to pašu vārdu tiem paliktu vecais. /og-image.png diskā paliek
  // (tā pati bilde), lai jau nokopētās saites nedotu 404.
  const ogImage = abs(image ?? "/og-gatisdesign.png");
  const lvAlt = alts.find((a) => a.locale === "lv");
  const ogUrl = canonical ?? SITE_URL;

  return (
    <Helmet>
      <html lang={locale} />
      <title>{`${title} | ${SITE_NAME}`}</title>
      <meta name="description" content={description} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {/* Robots vienmēr izrakstīts, ne tikai aizliegumā. Lapas, kurās apraksta
          vēl nav (piecas projektu lapas), paliek indeksējamas apzināti - tas ir
          lēmums, un lēmumam jābūt redzamam pašā lapā, ne tikai sarakstē. */}
      <meta name="robots" content={noindex ? "noindex, follow" : "index, follow"} />

      {alts.map((a) => (
        <link key={a.locale} rel="alternate" hrefLang={a.locale} href={abs(a.path)} />
      ))}
      {lvAlt ? <link rel="alternate" hrefLang="x-default" href={abs(lvAlt.path)} /> : null}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content={locale === "lv" ? "lv_LV" : "en_US"} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}

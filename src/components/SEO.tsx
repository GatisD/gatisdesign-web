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
  const canonical = self ? abs(self.path) : SITE_URL;
  const ogImage = abs(image ?? "/og-image.png");
  const lvAlt = alts.find((a) => a.locale === "lv");

  return (
    <Helmet>
      <html lang={locale} />
      <title>{`${title} | ${SITE_NAME}`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex ? <meta name="robots" content="noindex, follow" /> : null}

      {alts.map((a) => (
        <link key={a.locale} rel="alternate" hrefLang={a.locale} href={abs(a.path)} />
      ))}
      {lvAlt ? <link rel="alternate" hrefLang="x-default" href={abs(lvAlt.path)} /> : null}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content={locale === "lv" ? "lv_LV" : "en_US"} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}

export const LOCALES = ["lv", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "lv";

export const ROUTES = {
  home: { lv: "/", en: "/en" },
  services: { lv: "/pakalpojumi", en: "/en/services" },
  "services.brand": { lv: "/zimola-identitate", en: "/en/brand-identity" },
  "services.web": { lv: "/majaslapu-izstrade", en: "/en/website-development" },
  "services.ai": { lv: "/ai-agenti", en: "/en/ai-agents" },
  "services.seo": { lv: "/seo-geo-aeo", en: "/en/seo-geo-aeo" },
  portfolio: { lv: "/portfolio", en: "/en/portfolio" },
  about: { lv: "/par-mani", en: "/en/about" },
  contact: { lv: "/kontakti", en: "/en/contact" },
  privacy: { lv: "/privatuma-politika", en: "/en/privacy-policy" },
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * Vai LV/EN pārslēgs ir redzams galvenē un kājenē.
 *
 * `false`, kamēr `src/content/en/*.json` nav uzrakstīti. Iemesls ir vienkāršs:
 * pārslēgs bija dzīvs, bet /en rādīja latviešu tekstu ar angļu navigāciju -
 * ārzemju apmeklētājam, kurš nospieda EN, tas lasās kā salauzta lapa. Četri
 * tirgi (LV, EE, LT, ASV) ir viens no trim skaitļiem lapā "Par mani", tāpēc
 * tieši šis apmeklētājs nav rets.
 *
 * EN lapas paliek uzbūvētas ar `noindex` un ārpus sitemap; hreflang pāri
 * paliek, jo lapas eksistē un ir sasniedzamas pēc tiešas adreses. Kad
 * tulkojums ir gatavs: šo uz `true`, `noindex` nost (visur `const noindex =
 * !isLv`) un EN maršruti atpakaļ sitemapā (vite.config.ts).
 */
export const LANGUAGE_SWITCH_VISIBLE = false;

export function pathFor(key: RouteKey, locale: Locale): string {
  return ROUTES[key][locale];
}

export function alternatesFor(key: RouteKey): Array<{ locale: Locale; path: string }> {
  return LOCALES.map((locale) => ({ locale, path: ROUTES[key][locale] }));
}

/** Projektu lapām: id -> slug abās valodās nāk no datiem, ne no string manipulācijas. */
export function projectPath(slug: Record<Locale, string>, locale: Locale): string {
  return `${pathFor("portfolio", locale)}/${slug[locale]}`;
}

/**
 * Pāra lapas ceļš citā valodā - arī tur, kur maršruta atslēgas nav.
 *
 * Projektu lapas (`/portfolio/:slug`) ROUTES kartē neeksistē, tāpēc
 * `routeKeyForPath` tām atgrieza null un valodas pārslēgs no
 * /portfolio/estire veda uz /en (sākumlapu), nevis uz /en/portfolio/estire.
 * Slug abās valodās ir viens un tas pats (sk. ProjectDetail `alternates`),
 * tāpēc prefikss tiek ņemts no ROUTES.portfolio, ne salikts ar rokām.
 */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function pathForPathname(pathname: string, locale: Locale): string | null {
  const clean = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const key = routeKeyForPath(clean);
  if (key) return pathFor(key, locale);
  for (const from of LOCALES) {
    const prefix = `${ROUTES.portfolio[from]}/`;
    if (clean.startsWith(prefix)) {
      const slug = clean.slice(prefix.length);
      // Slug forma ir stingra ar nolūku: šī ir vienīgā vieta, kur saites mērķis
      // nāk no adreses joslas, nevis no ROUTES kartes vai datiem. Bez šī vārta
      // `/portfolio/\\svesa.lv` kļūtu par saiti ar atpakaļsvītru - tieši tas
      // ceļš, ko apraksta react-router atvērtās pāradresācijas brīdinājums.
      if (SLUG.test(slug)) return `${pathFor("portfolio", locale)}/${slug}`;
    }
  }
  return null;
}

/** Meklē maršruta atslēgu pēc ceļa. Vajadzīgs valodas pārslēgam, lai tas zina pāra lapu. */
export function routeKeyForPath(pathname: string): RouteKey | null {
  const clean = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    if (ROUTES[key].lv === clean || ROUTES[key].en === clean) return key;
  }
  return null;
}

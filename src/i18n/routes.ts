export const LOCALES = ["lv", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "lv";

export const ROUTES = {
  home: { lv: "/", en: "/en" },
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
export function pathForPathname(pathname: string, locale: Locale): string | null {
  const clean = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const key = routeKeyForPath(clean);
  if (key) return pathFor(key, locale);
  for (const from of LOCALES) {
    const prefix = `${ROUTES.portfolio[from]}/`;
    if (clean.startsWith(prefix)) {
      const slug = clean.slice(prefix.length);
      if (slug && !slug.includes("/")) return `${pathFor("portfolio", locale)}/${slug}`;
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

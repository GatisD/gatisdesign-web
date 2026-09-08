import type { ComponentType } from "react";
import type { RouteRecord } from "vite-react-ssg";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import { projects } from "@/data/projects";
import { LOCALES, ROUTES, type Locale } from "@/i18n/routes";

/** Ceļš bez valodas prefiksa, jo bērnu maršruti ir relatīvi pret vecāku. */
function childPath(full: string, locale: Locale): string {
  const prefix = locale === "lv" ? "" : "/en";
  return full.slice(prefix.length).replace(/^\//, "");
}

/**
 * Katrai lapai divi gabali - LV un EN - ar savu saturu. Izvēle notiek šeit,
 * maršrutā, ne komponentē: tā LV apmeklētājs nelejupielādē EN tekstu un
 * otrādi, un komponentes paliek bez valodas dakšām saturā.
 */
function pagesFor(locale: Locale): RouteRecord[] {
  const en = locale === "en";
  const lazyOf = (load: () => Promise<{ default: ComponentType }>) => () =>
    load().then((m) => ({ Component: m.default }));
  return [
    en
      ? { index: true, lazy: lazyOf(() => import("./pages/IndexEn")), entry: "src/pages/IndexEn.tsx" }
      : { index: true, Component: Index, entry: "src/pages/Index.tsx" },
    {
      path: childPath(ROUTES.services[locale], locale),
      lazy: lazyOf(() => (en ? import("./pages/PakalpojumiEn") : import("./pages/Pakalpojumi"))),
      entry: en ? "src/pages/PakalpojumiEn.tsx" : "src/pages/Pakalpojumi.tsx",
    },
    {
      path: childPath(ROUTES["services.brand"][locale], locale),
      lazy: lazyOf(() =>
        en ? import("./pages/services/ZimolaIdentitateEn") : import("./pages/services/ZimolaIdentitate"),
      ),
      entry: en ? "src/pages/services/ZimolaIdentitateEn.tsx" : "src/pages/services/ZimolaIdentitate.tsx",
    },
    {
      path: childPath(ROUTES["services.web"][locale], locale),
      lazy: lazyOf(() =>
        en ? import("./pages/services/MajaslapuIzstradeEn") : import("./pages/services/MajaslapuIzstrade"),
      ),
      entry: en ? "src/pages/services/MajaslapuIzstradeEn.tsx" : "src/pages/services/MajaslapuIzstrade.tsx",
    },
    {
      path: childPath(ROUTES["services.ai"][locale], locale),
      lazy: lazyOf(() => (en ? import("./pages/services/AiAgentiEn") : import("./pages/services/AiAgenti"))),
      entry: en ? "src/pages/services/AiAgentiEn.tsx" : "src/pages/services/AiAgenti.tsx",
    },
    {
      path: childPath(ROUTES["services.seo"][locale], locale),
      lazy: lazyOf(() => (en ? import("./pages/services/SeoGeoAeoEn") : import("./pages/services/SeoGeoAeo"))),
      entry: en ? "src/pages/services/SeoGeoAeoEn.tsx" : "src/pages/services/SeoGeoAeo.tsx",
    },
    {
      path: childPath(ROUTES.portfolio[locale], locale),
      lazy: () => import("./pages/Portfolio").then((m) => ({ Component: m.default })),
      entry: "src/pages/Portfolio.tsx",
    },
    {
      path: `${childPath(ROUTES.portfolio[locale], locale)}/:slug`,
      lazy: () => import("./pages/ProjectDetail").then((m) => ({ Component: m.default })),
      entry: "src/pages/ProjectDetail.tsx",
      getStaticPaths: () => projects.map((p) => `${ROUTES.portfolio[locale]}/${p.slug}`),
    },
    {
      path: childPath(ROUTES.about[locale], locale),
      lazy: lazyOf(() => (en ? import("./pages/ParManiEn") : import("./pages/ParMani"))),
      entry: en ? "src/pages/ParManiEn.tsx" : "src/pages/ParMani.tsx",
    },
    {
      path: childPath(ROUTES.contact[locale], locale),
      lazy: lazyOf(() => (en ? import("./pages/KontaktiEn") : import("./pages/Kontakti"))),
      entry: en ? "src/pages/KontaktiEn.tsx" : "src/pages/Kontakti.tsx",
    },
    {
      path: childPath(ROUTES.privacy[locale], locale),
      lazy: () =>
        import("./pages/PrivatumaPolitika").then((m) => ({ Component: m.default })),
      entry: "src/pages/PrivatumaPolitika.tsx",
    },
    {
      path: "404",
      lazy: () => import("./pages/NotFound").then((m) => ({ Component: m.default })),
      entry: "src/pages/NotFound.tsx",
    },
    {
      path: "*",
      lazy: () => import("./pages/NotFound").then((m) => ({ Component: m.default })),
      entry: "src/pages/NotFound.tsx",
    },
  ];
}

export const routes: RouteRecord[] = LOCALES.map((locale) => ({
  path: locale === "lv" ? "/" : "/en",
  element: <Layout locale={locale} />,
  entry: "src/components/Layout.tsx",
  children: pagesFor(locale),
}));

export default routes;

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

function pagesFor(locale: Locale): RouteRecord[] {
  return [
    { index: true, Component: Index, entry: "src/pages/Index.tsx" },
    {
      path: childPath(ROUTES.services[locale], locale),
      lazy: () => import("./pages/Pakalpojumi").then((m) => ({ Component: m.default })),
      entry: "src/pages/Pakalpojumi.tsx",
    },
    {
      path: childPath(ROUTES["services.brand"][locale], locale),
      lazy: () =>
        import("./pages/services/ZimolaIdentitate").then((m) => ({ Component: m.default })),
      entry: "src/pages/services/ZimolaIdentitate.tsx",
    },
    {
      path: childPath(ROUTES["services.web"][locale], locale),
      lazy: () =>
        import("./pages/services/MajaslapuIzstrade").then((m) => ({ Component: m.default })),
      entry: "src/pages/services/MajaslapuIzstrade.tsx",
    },
    {
      path: childPath(ROUTES["services.ai"][locale], locale),
      lazy: () => import("./pages/services/AiAgenti").then((m) => ({ Component: m.default })),
      entry: "src/pages/services/AiAgenti.tsx",
    },
    {
      path: childPath(ROUTES["services.seo"][locale], locale),
      lazy: () => import("./pages/services/SeoGeoAeo").then((m) => ({ Component: m.default })),
      entry: "src/pages/services/SeoGeoAeo.tsx",
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
      lazy: () => import("./pages/ParMani").then((m) => ({ Component: m.default })),
      entry: "src/pages/ParMani.tsx",
    },
    {
      path: childPath(ROUTES.contact[locale], locale),
      lazy: () => import("./pages/Kontakti").then((m) => ({ Component: m.default })),
      entry: "src/pages/Kontakti.tsx",
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

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import sitemap from "vite-plugin-sitemap";
import { ROUTES, type RouteKey } from "./src/i18n/routes";
import { projects, indexableProjects } from "./src/data/projects";

// Sitemap ir vienots patiesības avots: bāzes maršruti nāk no ROUTES (abas valodas),
// portfolio detail lapas (dinamiskās /portfolio/:slug lapas, sk. src/App.tsx
// getStaticPaths) nāk no src/data/projects.ts. Šie divi faili ir vienīgie faktiskie
// maršrutu avoti kodubāzē - roku rakstīts saraksts šeit vairs netiek uzturēts.
// "/" (LV sākumlapa) NETIEK iekļauta: vite-plugin-sitemap pats to atklāj no
// dist/index.html, kas jau eksistē tā closeBundle brīdī (rakstīts Vite
// pamatbūvē pirms SSG daudzlapu rendera). Ja to pievieno arī šeit, sitemap
// satur "/" divreiz. "/en" ŠEIT ir vajadzīgs, jo dist/en/index.html tajā
// brīdī vēl neeksistē.
// Pakalpojumu lapas kopš 2026-07 ir uzbūvētas (sk. pagesFor src/App.tsx), tāpēc
// tās vairs netiek izslēgtas. Ka sitemap nesatur mirušus URL, pārbauda būves
// vārti (scripts/verify-build.mjs) - Search Console 404 lapas sitemap skaita
// kā kļūdas.
// EN maršruti sitemapā IR kopš 2026-09-08: EN saturs ir uzrakstīts, lapas ir
// indeksējamas, un hreflang pāri abos virzienos jau bija. Projektu lapas bez
// apraksta paliek ārpus abās valodās (noindex).
const baseRoutes = Object.values(ROUTES)
  .flatMap((p) => [p.lv, p.en])
  .filter((route) => route !== ROUTES.home.lv);
// Projektu lapas BEZ apraksta sitemapā neiet: tām ir `noindex`, un sitemap ar
// noindex lapām dod Search Console tikpat daudz kļūdu, cik lapu.
const portfolioDetailRoutes = indexableProjects.flatMap((p) => [
  `${ROUTES.portfolio.lv}/${p.slug}`,
  `${ROUTES.portfolio.en}/${p.slug}`,
]);
const dynamicRoutes = [...baseRoutes, ...portfolioDetailRoutes];

// Prioritāte pa maršrutu: sākumlapai augstākā, pakalpojumu un portfolio
// lapām vidēja, pārējām (par mani/kontakti/privātuma politika) zemāka caur "*".
const highPriorityKeys: RouteKey[] = [
  "services",
  "services.brand",
  "services.web",
  "services.ai",
  "services.seo",
  "portfolio",
];
const priorityByRoute: Record<string, number> = {
  "*": 0.5,
  [ROUTES.home.lv]: 1.0,
};
for (const key of highPriorityKeys) {
  priorityByRoute[ROUTES[key].lv] = 0.8;
  priorityByRoute[ROUTES[key].en] = 0.8;
}
for (const p of indexableProjects) {
  priorityByRoute[`${ROUTES.portfolio.lv}/${p.slug}`] = 0.8;
  priorityByRoute[`${ROUTES.portfolio.en}/${p.slug}`] = 0.8;
}

// https://vitejs.dev/config/
export default defineConfig(({ command, isSsrBuild }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    sitemap({
      hostname: "https://gatisdesign.com",
      generateRobotsTxt: false,
      dynamicRoutes,
      changefreq: "monthly",
      priority: priorityByRoute,
      exclude: ["/404"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: isSsrBuild
        ? {}
        : {
            // Katrai atslēgai šeit jābūt reāli instalētai un importētai pakotnei -
            // Rollup krīt, ja manualChunks norāda uz moduli, kura grafā nav.
            // shadcn un Radix pakotņu projektā vairs nav nevienas.
            // Animāciju bibliotēkas šeit nav apzināti: vite-react-ssg
            // maršrutu gabalus priekšielādē KATRĀ lapā, tāpēc framer-motion
            // maksāja 41,5 KB gzip arī tur, kur no tā nekas netika lietots.
            // Atklāsme, vilnis un mikro-interakcijas ir CSS (src/index.css),
            // magnētiskā poga un skaitītājs - viens rAF cikls bez bibliotēkas.
            manualChunks: {
              "react-vendor": ["react", "react-dom", "react-router-dom"],
              scroll: ["lenis"],
              form: ["react-hook-form", "@hookform/resolvers", "zod"],
            },
          },
    },
  },
}));

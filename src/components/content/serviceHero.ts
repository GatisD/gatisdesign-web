import type { ServiceRouteKey } from "@/content";

/**
 * Katras pakalpojumu lapas galvas kadrs un vidusjosla.
 *
 * `breakAfter` ir vienīgais, kas šeit pieder virsrakstam: pēc kura vārda H1
 * lūzt otrajā rindā. Paši vārdi nāk no satura faila `h1` lauka (sk.
 * `src/content/h1.ts`), tāpēc virsrakstu maina saturā, ne kodā.
 *
 * Fona attēli šobrīd ir pagaidu stock kadri: struktūra jau ir gatava video
 * (HeroMedia `video`), bet paša video vēl nav uzņemts.
 */
export type ServiceHero = {
  /** Pēc kura vārda `h1` lūzt otrajā rindā. */
  breakAfter: number;
  poster: string;
  posterPosition?: string;
  band: { poster: string; text: string };
};

export const SERVICE_HERO: Record<ServiceRouteKey, ServiceHero> = {
  "services.brand": {
    // "Logo izveide un | zīmola identitāte"
    breakAfter: 3,
    poster: "/media/hero-brand.jpg",
    posterPosition: "center 40%",
    band: {
      poster: "/media/band-brand.jpg",
      text: "Viena zīme, kas salasāma gan no divdesmit metriem uz kravas auto, gan no trīsdesmit centimetriem uz vizītkartes.",
    },
  },
  "services.web": {
    // "Mājaslapu | izstrāde"
    breakAfter: 1,
    poster: "/media/hero-web.jpg",
    band: {
      poster: "/media/band-craft.jpg",
      text: "Testa adrese ir pieejama no pirmās nedēļas: tu redzi lapu topam, nevis saņem to gatavu prezentācijā.",
    },
  },
  "services.ai": {
    // "AI aģenti un | automatizācija"
    breakAfter: 3,
    poster: "/media/hero-ai.jpg",
    band: {
      poster: "/media/band-console.jpg",
      text: "Kad dati plūst paši, komanda pamana kļūdu pirms klienta, nevis pēc tam.",
    },
  },
  "services.seo": {
    // "SEO, GEO un AEO | optimizācija"
    breakAfter: 4,
    poster: "/media/hero-seo.jpg",
    band: {
      poster: "/media/band-seo.jpg",
      text: "Lai lapu atrastu Google meklēšanā un lai ChatGPT to citētu tad, kad klients jautā tur, nevis meklētājā.",
    },
  },
};

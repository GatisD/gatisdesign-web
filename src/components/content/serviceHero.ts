import type { ServiceRouteKey } from "@/content";

/**
 * Katras pakalpojumu lapas galvas kadrs un vidusjosla.
 *
 * Šeit paliek TIKAI vizuālais: kadrs, tā kadrējums un vidusjoslas teksts.
 * Virsraksts un tā rindas lūzums dzīvo satura failā (`h1`, `h1BreakAfter`),
 * tāpēc virsrakstu maina saturā, un kodam par to nav jāzina.
 *
 * Struktūra jau ir gatava video (HeroMedia `video`), pats video vēl nav uzņemts.
 */
export type ServiceHero = {
  poster: string;
  posterPosition?: string;
  band: { poster: string; text: string };
};

export const SERVICE_HERO: Record<ServiceRouteKey, ServiceHero> = {
  "services.brand": {
    poster: "/media/hero-brand.jpg",
    posterPosition: "center 40%",
    band: {
      poster: "/media/band-brand.jpg",
      text: "Viena zīme, kas salasāma gan no divdesmit metriem uz kravas auto, gan no trīsdesmit centimetriem uz vizītkartes.",
    },
  },
  "services.web": {
    poster: "/media/hero-web.jpg",
    band: {
      poster: "/media/band-craft.jpg",
      text: "Testa adrese ir pieejama no pirmās nedēļas: tu redzi lapu topam, nevis saņem to gatavu prezentācijā.",
    },
  },
  "services.ai": {
    poster: "/media/hero-ai.jpg",
    band: {
      poster: "/media/band-console.jpg",
      text: "Kad dati plūst paši, komanda pamana kļūdu pirms klienta, nevis pēc tam.",
    },
  },
  "services.seo": {
    poster: "/media/hero-seo.jpg",
    band: {
      poster: "/media/band-seo.jpg",
      text: "Lai lapu atrastu Google meklēšanā un lai ChatGPT to citētu tad, kad klients jautā tur, nevis meklētājā.",
    },
  },
};

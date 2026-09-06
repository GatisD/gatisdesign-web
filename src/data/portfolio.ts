export interface PortfolioWork {
  /** Slug - sasaiste ar ierakstu src/content/projects.raw.json. */
  slug: string;
  /**
   * Kolekcijas vāks ir GALERIJAS ORIĢINĀLS, ne iepriekš apgriezts kadrs.
   * Automātiskais kvadrātveida griezums (sharp `position: attention`) nogrieza
   * tieši to, kas kartei dod jēgu: "APMEKLĒ.LV" kļuva par "APMEK". Kadrējumu
   * izlemj karte pēc proporcijas (ProjectCard `fits`), un nekas netiek
   * iegriezts failā uz visiem laikiem.
   */
  cover: string;
  /** Visi galerijas attēli parādīšanas secībā. */
  gallery: string[];
}

/**
 * Septiņas dizaina kolekcijas: vāks un galerija.
 *
 * Pārējie lauki (name, category, year, caption, description, aspect, span,
 * tags) un funkcijas (categories, clientLogos, stats, findWork, neighbours)
 * ir izņemti: tie bija no iepriekšējā dizaina un tos nelietoja neviens fails.
 * Nosaukums, gads, apraksts un loma šodien nāk no src/content/projects.raw.json,
 * kur tie ir izgājuši godīguma pārbaudi (sk. src/data/projects.ts).
 */

/** Ceļu virkne /public/portfolio/<slug>/<slug>-NN.jpg ar `count` attēliem. */
function gallery(slug: string, count: number): string[] {
 return Array.from(
 { length: count },
 (_, i) => `/portfolio/${slug}/${slug}-${String(i + 1).padStart(2, "0")}.jpg`,
 );
}

export const portfolioWorks: PortfolioWork[] = [
 // ─────────── BRAND CASES (Logo & Brand) ───────────
  {
    slug: "box-latvia",
    cover: "/portfolio/box-latvia/box-latvia-01.jpg",
    gallery: gallery("box-latvia", 11),
  },
  {
    slug: "apmekle",
    cover: "/portfolio/apmekle/apmekle-01.jpg",
    gallery: gallery("apmekle", 9),
  },
  {
    slug: "digitalaisdzintars",
    cover: "/portfolio/digitalaisdzintars/digitalaisdzintars-01.jpg",
    gallery: gallery("digitalaisdzintars", 16),
  },

 // ─────────── COLLECTIONS ───────────
  {
    slug: "logo-branding",
    cover: "/portfolio/logo-branding/logo-branding-01.jpg",
    gallery: gallery("logo-branding", 51),
  },
  {
    slug: "web-design",
    cover: "/portfolio/web-design/web-design-01.jpg",
    gallery: gallery("web-design", 3),
  },
  {
    slug: "illustrations",
    cover: "/portfolio/illustrations/illustrations-01.jpg",
    gallery: gallery("illustrations", 8),
  },
  {
    slug: "print",
    cover: "/portfolio/print/print-01.jpg",
    gallery: gallery("print", 5),
  },
];

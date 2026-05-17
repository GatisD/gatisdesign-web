export type PortfolioCategory = "Logo & Brand" | "Web" | "Illustrations" | "Print";

export interface PortfolioWork {
 /** Slug used in /portfolio/:slug detail route */
 slug: string;
 /** Display name on tiles + detail hero */
 name: string;
 category: PortfolioCategory;
 /** Years the work was created (display only) */
 year?: string;
 /** Short caption shown below tile */
 caption?: string;
 /** Long-form description shown on detail page */
 description?: string;
 /** Cover image path relative to /public */
 cover: string;
 /** Aspect ratio of the cover tile */
 aspect?: "square" | "4/3" | "4/5" | "16/9";
 /** Grid span in 12-col layout */
 span?: 4 | 6 | 8;
 /** All gallery images shown on the detail page, in display order */
 gallery: string[];
 /** Optional role tags (Brand identity, Logo, Print, Web, etc.) */
 tags?: string[];
}

/**
 * Build a /public/portfolio/<slug>/<slug>-NN.jpg array of length `count`.
 */
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
 name: "Box Latvia",
 category: "Logo & Brand",
 year: "2023",
 caption: "Brand identity loģistikas zīmolam",
 description:
 "Pilna brand identity sistēma Box Latvia loģistikas servisam - logo, transportlīdzekļu marķējums, drukas materiāli un digitālā prezentācija. Vizuālā valoda balstīta uz dinamisku oranžu kontrastā ar tumšu virsmu, lai zīmols būtu pamanāms gan uz ceļa, gan ekrānā.",
 cover: "/portfolio/box-latvia-cover-43.jpg",
 aspect: "4/3",
 span: 8,
 gallery: gallery("box-latvia", 11),
 tags: ["Brand identity", "Logo", "Print", "Vehicle wrap"],
 },
 {
 slug: "apmekle",
 name: "Apmeklē.lv",
 category: "Logo & Brand",
 year: "2023",
 caption: "Pakalpojumu ekosistēmas zīmols",
 description:
 "Apmeklē.lv ir Latvijā veidota pakalpojumu platforma. Identitāte ir minimālistiska, ar piktogrammu, kas atspoguļo platformas filozofiju - viegli pieejama palīdzība ikdienā. Zaļā akcenta krāsa simbolizē pieejamību un drošību.",
 cover: "/portfolio/apmekle-cover-sq.jpg",
 aspect: "square",
 span: 4,
 gallery: gallery("apmekle", 9),
 tags: ["Brand identity", "Logo", "Iconography"],
 },
 {
 slug: "digitalaisdzintars",
 name: "Digitālais Dzintars",
 category: "Logo & Brand",
 year: "2024",
 caption: "Liepājas kultūras zīmola atjaunošana",
 description:
 "Digitālais Dzintars ir Liepājas pilsētas digitālā kultūras platforma. Zīmola atjaunošana savieno klasisko Liepājas dzintara mantojumu ar mūsdienīgu digitālo estētiku. Plakāti, afišas un identitātes elementi atspoguļo gan kultūras dziļumu, gan tehnoloģisko progresu.",
 cover: "/portfolio/digitalaisdzintars-cover-45.jpg",
 aspect: "4/5",
 span: 4,
 gallery: gallery("digitalaisdzintars", 16),
 tags: ["Brand identity", "Print", "Posters"],
 },

 // ─────────── COLLECTIONS ───────────
 {
 slug: "logo-branding",
 name: "Logo & Brand kolekcija",
 category: "Logo & Brand",
 year: "2008-2026",
 caption: "Atlasītie logo un brand identity darbi",
 description:
 "18 gadu darbā tapuši logo un brand identity projekti dažādās nozarēs - no maziem latviešu uzņēmumiem līdz starptautiskām markām. Šī ir atlasīta kolekcija - vairāk nekā 50 darbi, kas atspoguļo dažādus stilus, pieejas un risinājumus.",
 cover: "/portfolio/logo-branding-cover-sq.jpg",
 aspect: "square",
 span: 4,
 gallery: gallery("logo-branding", 51),
 tags: ["Logo", "Brand identity", "Wordmark", "Symbol"],
 },
 {
 slug: "web-design",
 name: "Web Design kolekcija",
 category: "Web",
 year: "2010-2026",
 caption: "Mājaslapas un digitālie produkti",
 description:
 "Mājaslapas, kas strādā - gan vizuāli, gan biznesa rezultātos. Pievērst uzmanību lietojamībai (UX), tehniskajai veiktspējai (Core Web Vitals) un meklētājprogrammu optimizācijai (SEO). Šeit atlasīti darbi no dažādām nozarēm.",
 cover: "/portfolio/web-design-cover-43.jpg",
 aspect: "4/3",
 span: 8,
 gallery: gallery("web-design", 3),
 tags: ["Web design", "UX", "Landing page"],
 },
 {
 slug: "illustrations",
 name: "Illustrations kolekcija",
 category: "Illustrations",
 year: "2012-2026",
 caption: "Pielāgotas ilustrācijas zīmoliem",
 description:
 "Ilustrāciju kolekcija - no produktu ikonām un t-kreklu drukām līdz pilnām zīmolu ilustrāciju sistēmām. Raksturīgs stils - drosmīgs, ekspresīvs un personīgs.",
 cover: "/portfolio/illustrations-cover-sq.jpg",
 aspect: "square",
 span: 4,
 gallery: gallery("illustrations", 8),
 tags: ["Illustration", "Character design", "Apparel"],
 },
 {
 slug: "print",
 name: "Posters & Flyers kolekcija",
 category: "Print",
 year: "2010-2026",
 caption: "Drukai veidoti dizaini",
 description:
 "Plakāti, afišas, bukleti un drukas materiāli. Drukas dizainā svarīgi visi detali - no tipogrāfijas līdz papīra izvēlei. Šajā kolekcijā atlasīti darbi, kas izdzīvojuši laika pārbaudi.",
 cover: "/portfolio/print-cover-45.jpg",
 aspect: "4/5",
 span: 4,
 gallery: gallery("print", 5),
 tags: ["Print", "Poster", "Brochure"],
 },
];

export const categories: Array<"Visi" | PortfolioCategory> = [
 "Visi",
 "Logo & Brand",
 "Web",
 "Illustrations",
 "Print",
];

export const clientLogos = [
 "ROIS",
 "Tenter",
 "Estire",
 "MLM Cargo",
 "ARM Metals",
 "Tavasdurvis",
 "Box Latvia",
 "Apmeklē.lv",
];

export const stats = [
 { number: 18, label: "GADI" },
 { number: 100, suffix: "+", label: "PROJEKTI" },
 { number: 4, label: "KATEGORIJAS" },
 { number: 5, suffix: "+", label: "GADI ROIS PARTNERIS" },
];

/** Find work by slug (used by detail page) */
export function findWork(slug: string): PortfolioWork | undefined {
 return portfolioWorks.find((w) => w.slug === slug);
}

/** Prev/next neighbours in the same listing order (loops at ends) */
export function neighbours(slug: string): { prev: PortfolioWork; next: PortfolioWork } | null {
 const idx = portfolioWorks.findIndex((w) => w.slug === slug);
 if (idx === -1) return null;
 const total = portfolioWorks.length;
 return {
 prev: portfolioWorks[(idx - 1 + total) % total],
 next: portfolioWorks[(idx + 1) % total],
 };
}

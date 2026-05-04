export type PortfolioCategory = "Logo & Brand" | "Web" | "Illustrations" | "Print";

export interface PortfolioWork {
  id: string;
  name: string;
  category: PortfolioCategory;
  year?: number;
  cover?: string; // path to cover image (in /public when ready)
  aspect?: "square" | "4/3" | "4/5" | "16/9";
  span?: 4 | 6 | 8;
  caption?: string;
}

/**
 * Portfolio darbi.
 * 3 reālie zīmoli + 4 placeholder collection-style ieraksti par katru kategoriju.
 * Klients (Gatis) papildinās covers + reālus case studies vēlāk.
 */
export const portfolioWorks: PortfolioWork[] = [
  {
    id: "box-latvia",
    name: "Box Latvia",
    category: "Logo & Brand",
    caption: "Brand identity",
    cover: "/portfolio/box-latvia.jpg",
    aspect: "4/3",
    span: 8,
  },
  {
    id: "apmekle-lv",
    name: "Apmekle.lv",
    category: "Logo & Brand",
    caption: "Brand identity",
    cover: "/portfolio/apmekle.jpg",
    aspect: "square",
    span: 4,
  },
  {
    id: "digitalaisdzintars",
    name: "Digitalaisdzintars.lv",
    category: "Logo & Brand",
    caption: "Brand identity",
    cover: "/portfolio/digitalaisdzintars.jpg",
    aspect: "4/5",
    span: 4,
  },
  // Collection placeholders — pa vienai katras kategorijas:
  {
    id: "collection-logo",
    name: "Logo & Brand kolekcija",
    category: "Logo & Brand",
    caption: "Atlasītie projekti — 18 gadu darbs",
    cover: "/portfolio/logo-branding.png",
    aspect: "square",
    span: 4,
  },
  {
    id: "collection-web",
    name: "Web Design kolekcija",
    category: "Web",
    caption: "Atlasītie web projekti",
    cover: "/portfolio/web-design.jpg",
    aspect: "4/3",
    span: 8,
  },
  {
    id: "collection-illustrations",
    name: "Illustrations kolekcija",
    category: "Illustrations",
    caption: "Pielāgotas ilustrācijas",
    cover: "/portfolio/illustrations.jpg",
    aspect: "square",
    span: 4,
  },
  {
    id: "collection-print",
    name: "Print Design kolekcija",
    category: "Print",
    caption: "Vizītkartes, plakāti, iepakojums",
    cover: "/portfolio/posters-flyers.jpg",
    aspect: "4/5",
    span: 4,
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
  "Box Latvia",
  "Apmekle.lv",
  "Digitalaisdzintars.lv",
];

export const stats = [
  { number: 18, label: "GADI" },
  { number: 100, suffix: "+", label: "PROJEKTI" },
  { number: 4, label: "KATEGORIJAS" },
  { number: 5, suffix: "+", label: "GADI ROIS PARTNERIS" },
];

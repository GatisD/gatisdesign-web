/**
 * Portfolio dati vienā vietā.
 *
 * Divi avoti:
 *  1. src/content/projects.raw.json - izpētē savāktie mājaslapu un zīmolu projekti.
 *  2. src/data/portfolio.ts - septiņas dizaina kolekcijas ar reālām galerijām
 *     public/portfolio/<slug>/.
 *
 * Godīguma noteikumi, kas te ir iekodēti:
 *  - src/content/projects.draft.json ieraksti NEIET publiskajā sarakstā. Tie gaida
 *    atbildi uz atvērtu jautājumu (klienta piekrišana, neskaidra loma, apturēta sadarbība).
 *  - Ja gads ir minējums (yearEstimated), gads netiek rādīts vispār.
 *  - Ja summaryLv ir tukšs, apraksts paliek tukšs - nekas netiek izdomāts.
 *  - Ja vietne nav dzīva, ārējā saite netiek rādīta.
 *
 * Attēlu izmēri nāk no src/data/image-sizes.json (scripts/prepare-covers.mjs), lai
 * katram <img> būtu width/height un lapa nelēkātu ielādes laikā.
 */
import rawJson from "../content/projects.raw.json";
import draftJson from "../content/projects.draft.json";
import imageSizes from "./image-sizes.json";
import { portfolioWorks } from "./portfolio";
import type { RouteKey } from "../i18n/routes";

export type ProjectCategory = "web" | "brand";
export type ExternalStatus = "live" | "archived" | "none";
export type ServiceKey = "zimols" | "majaslapas" | "seo";
export type RoleKind = "solo" | "rois";

export interface ProjectImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface ProjectRole {
  kind: RoleKind;
  label: string;
}

export interface Project {
  id: string;
  slug: string;
  category: ProjectCategory;
  /** Klients vai "Dažādi klienti" kolekcijām. */
  client: string;
  title: string;
  /** Tukša virkne, ja apraksta vēl nav. Netiek izdomāts. */
  summary: string;
  role: ProjectRole;
  services: ServiceKey[];
  externalUrl?: string;
  externalStatus: ExternalStatus;
  stack?: string[];
  /** Rādāms gads vai gadu diapazons. Nav klāt, ja gads ir tikai minējums. */
  year?: string;
  cover: ProjectImage;
  /** Tikai kolekcijām - pilna darbu galerija. */
  gallery?: ProjectImage[];
}

interface RawProject {
  id: string;
  slug: string;
  category: string;
  client: string;
  year: number | null;
  yearEstimated: boolean;
  yearRange?: string;
  roleKind: string;
  roleLabel: string;
  services: string[];
  externalUrl: string | null;
  externalStatus: string | null;
  stack: string[];
  titleLv: string;
  summaryLv: string | null;
  coverHint: string | null;
  galleryCount?: number;
  needsInput?: string;
}

const raw = rawJson as RawProject[];
const drafts = draftJson as RawProject[];

/** Melnrakstā atliktie projekti. Publiskajā sarakstā tie neparādās. */
export const draftSlugs: string[] = drafts.map((p) => p.slug);
const draftIds = new Set(drafts.map((p) => p.id));

/**
 * Projekti, kuru vāks ir klienta logotips, nevis mājaslapas ekrānuzņēmums
 * (sk. LOGO_BY_ID iekš scripts/prepare-covers.mjs). Vajadzīgs alt tekstam.
 */
const LOGO_COVER_IDS = new Set(["cafeteria", "forevolt", "green-bay", "darbaguru", "obsidian", "varloz"]);

/**
 * Saraksta secība. Mājaslapas, zīmola darbi un kolekcijas mijas, lai režģis
 * nesanāk vienveidīgs un logo vāki nesakrājas cits virs cita.
 */
const ORDER = [
  "box-latvia",
  "estire",
  "digitalaisdzintars",
  "rois-lv",
  "logo-branding",
  "universal-solutions",
  "darbaguru",
  "apmekle",
  "lucky-punch",
  "illustrations",
  "lauvas-zobs",
  "obsidian",
  "print",
  "valis",
  "web-design",
  "mebelu-montaza",
  "varloz",
  "box-latvia-web",
  "kugi-kartupelis",
  "cafeteria",
  "110m2",
  "green-bay",
  "forevolt",
];

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  web: "Mājaslapas",
  brand: "Zīmoli un grafiskais dizains",
};

/** Īsā zīme uz flīzes. */
export const CATEGORY_TAG: Record<ProjectCategory, string> = {
  web: "Mājaslapa",
  brand: "Zīmols un dizains",
};

export const SERVICE_ROUTE_KEY: Record<ServiceKey, RouteKey> = {
  zimols: "services.brand",
  majaslapas: "services.web",
  seo: "services.seo",
};

export const SERVICE_LABEL: Record<ServiceKey, string> = {
  zimols: "Zīmola identitāte",
  majaslapas: "Mājaslapu izstrāde",
  seo: "SEO, GEO un AEO",
};

/** Statusa teksts, kad dzīvas saites nav. Tukšs nozīmē - nerādīt neko. */
export const EXTERNAL_STATUS_NOTE: Record<ExternalStatus, string> = {
  live: "",
  archived: "Mājaslapa vairs nav pieejama",
  none: "",
};

const sizes = imageSizes as Record<string, { width: number; height: number }>;

function image(src: string, alt: string): ProjectImage {
  const size = sizes[src];
  if (!size) throw new Error(`Nav zināms attēla izmērs: ${src}. Palaid scripts/prepare-covers.mjs`);
  return { src, width: size.width, height: size.height, alt };
}

function displayYear(entry: RawProject): string | undefined {
  if (entry.yearRange) return entry.yearRange;
  if (entry.yearEstimated) return undefined;
  return entry.year === null ? undefined : String(entry.year);
}

function toProject(entry: RawProject, cover: ProjectImage, gallery?: ProjectImage[]): Project {
  const project: Project = {
    id: entry.id,
    slug: entry.slug,
    category: entry.category === "brand" ? "brand" : "web",
    client: entry.client,
    title: entry.titleLv,
    summary: entry.summaryLv ?? "",
    role: { kind: entry.roleKind === "rois" ? "rois" : "solo", label: entry.roleLabel },
    services: entry.services.filter((s): s is ServiceKey => s in SERVICE_ROUTE_KEY),
    externalStatus: entry.externalStatus === "live" ? "live" : entry.externalStatus === "archived" ? "archived" : "none",
    cover,
  };
  // Saiti rādām tikai tad, ja vietne tiešām ir dzīva.
  if (entry.externalUrl && project.externalStatus === "live") project.externalUrl = entry.externalUrl;
  if (entry.stack.length > 0) project.stack = entry.stack;
  const year = displayYear(entry);
  if (year) project.year = year;
  if (gallery && gallery.length > 0) project.gallery = gallery;
  return project;
}

/** Mājaslapu un zīmolu projekti no izpētes datiem (bez kolekcijām un melnraksta). */
function buildSiteProjects(): Project[] {
  return raw
    .filter((entry) => !draftIds.has(entry.id) && entry.galleryCount === undefined)
    .map((entry) => {
      // Juridiskā forma alt tekstā nav vajadzīga: "SIA Universal Solutions mājaslapas ..." ir smagi.
      const clientName = entry.client.replace(/^SIA\s+/, "");
      const alt = LOGO_COVER_IDS.has(entry.id)
        ? `${clientName} logotips`
        : `${clientName} mājaslapas ekrānuzņēmums`;
      return toProject(entry, image(`/portfolio/sites/${entry.id}-cover.jpg`, alt));
    });
}

/** Septiņas dizaina kolekcijas: vāks un galerija no portfolio.ts, pārējais no izpētes datiem. */
function buildCollections(): Project[] {
  return portfolioWorks.map((work) => {
    const entry = raw.find((p) => p.slug === work.slug);
    if (!entry) throw new Error(`Kolekcijai ${work.slug} nav ieraksta projects.raw.json`);
    const total = work.gallery.length;
    const gallery = work.gallery.map((src, i) =>
      image(src, `${entry.titleLv} - ${i + 1}. attēls no ${total}`),
    );
    return toProject(entry, image(work.cover, entry.titleLv), gallery);
  });
}

function ordered(list: Project[]): Project[] {
  return [...list].sort((a, b) => {
    const ai = ORDER.indexOf(a.slug);
    const bi = ORDER.indexOf(b.slug);
    return (ai === -1 ? ORDER.length : ai) - (bi === -1 ? ORDER.length : bi);
  });
}

/** Publicētie projekti saraksta secībā. */
export const projects: Project[] = ordered([...buildSiteProjects(), ...buildCollections()]);

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function projectsByCategory(category: ProjectCategory): Project[] {
  return projects.filter((p) => p.category === category);
}

/** Iepriekšējais un nākamais saraksta secībā, ar apli galos. */
export function projectNeighbours(slug: string): { prev: Project; next: Project } | null {
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1 || projects.length < 2) return null;
  const total = projects.length;
  return {
    prev: projects[(idx - 1 + total) % total],
    next: projects[(idx + 1) % total],
  };
}

/** Sākumlapas izlase - piecas flīzes, kā rakstīts home.json darbu sadaļā. */
export const featuredSlugs = {
  columnA: ["box-latvia", "digitalaisdzintars", "web-design"],
  columnB: ["apmekle", "logo-branding"],
};

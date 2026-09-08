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
import { portfolioWorks, galleryPath, type GalleryLayout } from "./portfolio";
import type { Locale, RouteKey } from "../i18n/routes";

export type ProjectCategory = "web" | "brand";
export type ExternalStatus = "live" | "archived" | "development" | "none";
export type ServiceKey = "zimols" | "majaslapas" | "seo";
export type RoleKind = "solo" | "rois";

export interface ProjectImage {
  src: string;
  width: number;
  height: number;
  /** Alt teksts pēc attēla satura (src/data/portfolio.ts). */
  alt: string;
  /** Paraksts no Gata paša ieraksta. Nav klāt, ja avota teksta nav. */
  caption?: string;
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
  /** EN virsraksts un apraksts; ja nav, `localized` atstāj LV. */
  titleEn?: string;
  summaryEn?: string;
  role: ProjectRole;
  services: ServiceKey[];
  externalUrl?: string;
  externalStatus: ExternalStatus;
  stack?: string[];
  /** Rādāms gads vai gadu diapazons. Nav klāt, ja gads ir tikai minējums. */
  year?: string;
  cover: ProjectImage;
  /**
   * Pārlūka kadri: dators 1440x900 un telefons 390x844, uzņemti vienā piegājienā
   * ar to pašu rīku. Ir tikai mājaslapām, kuras var atvērt - zīmola darbiem un
   * arhivētām lapām kadra nav.
   */
  shot?: { desktop: ProjectImage; mobile: ProjectImage; mobileSmall: ProjectImage };
  /** Tikai kolekcijām - pilna darbu galerija. */
  gallery?: ProjectImage[];
  /** Kā galerija izkārtojas lapā. Ir tikai tad, ja galerija ir. */
  galleryLayout?: GalleryLayout;
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
  titleEn?: string;
  summaryEn?: string | null;
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
  // Pirmie desmit ir Gata izvēle 2026-09-08, ne alfabēts un ne datums: saraksta
  // sākums ir vitrīna, un tur stāv tas, ko viņš grib rādīt vispirms.
  "rois-lv",
  "oakabbq",
  "olive-mebeles",
  "videastone",
  "tavasdurvis",
  "termokoksne",
  "sinuuksed",
  "estire",
  "improvement",
  "tenter",

  // Tālāk viss pārējais iepriekšējā secībā; jaunie 08.09 saraksta priekšgalā.
  "mlmcargo",
  "delkors",
  "box-latvia",
  "digitalaisdzintars",
  "logo-branding",
  "universal-solutions",
  "darbaguru",
  "apmekle",
  "illustrations",
  "lauvas-zobs",
  "obsidian",
  "print",
  "valis",
  "mebelu-montaza",
  "varloz",
  "box-latvia-web",
  "kugi-kartupelis",
  "cafeteria",
  "110m2",
  "green-bay",
  "forevolt",
  "globaltac",
  "inovat",
  "laluna",
  "nervostrong-veikals",
  "profdurys",
  "psl",
  "salonsobjekts",
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

/** Īsā zīme filtra pogai. SERVICE_LABEL ir par garu, lai stāvētu uz čipa. */
export const SERVICE_TAG: Record<ServiceKey, string> = {
  majaslapas: "Mājaslapas",
  zimols: "Zīmols",
  seo: "SEO",
};

/**
 * Tehnoloģijas, kas filtrā parādās kā čips.
 *
 * Saraksts ir apzināti īss un rakstīts ar roku. `stack` datos ir arī Vite,
 * Tailwind, TypeScript un Vercel - tie ir godīgi, un darba lapā tie ir
 * redzami, bet neviens klients neizvēlas darbu pēc būves rīka. Filtrā paliek
 * tikai tas, ko cilvēks nosauc pats, kad stāsta, ko viņam vajag.
 *
 * Ka katrs no šiem datos tiešām eksistē, sargā projects.test.ts - pārsaukums
 * datos citādi klusi noņemtu čipu.
 */
export const PLATFORM_TAGS = [
  "WordPress",
  "WooCommerce",
  "Shopify",
  "Elementor",
  "WPML",
  "React",
] as const;

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
  // Izstrādes vidi publiski nesaitējam: adrese mainīsies, un `vercel.app` vai
  // apakšdomēns uz manas lapas klientam neko nepierāda. Piezīme ir tāpēc, ka
  // saite bez paskaidrojuma vienkārši trūkst, un tas izskatās pēc kļūdas.
  development: "Vietne vēl top - publiskā adrese sekos",
  none: "",
};

/* ------------------------------------------------------------------ *
 * EN etiķetes un lokalizācija (2026-09-08).
 *
 * Dati paliek vienā sarakstā ar LV kā pamatu: `titleEn`/`summaryEn` stāv
 * blakus LV laukiem tajā pašā ierakstā, un lomas, kategoriju un pakalpojumu
 * etiķetes ir kartes no LV vērtības uz EN. `localized()` neko nemaina datos -
 * tas atgriež kopiju ar EN tekstu tur, kur tas ir, un LV tur, kur nav, lai
 * lapa nekad nerāda tukšumu.
 * ------------------------------------------------------------------ */
export const CATEGORY_TAG_EN: Record<ProjectCategory, string> = { web: "Website", brand: "Brand and design" };
export const SERVICE_TAG_EN: Record<ServiceKey, string> = { majaslapas: "Websites", zimols: "Brand", seo: "SEO" };
export const SERVICE_LABEL_EN: Record<ServiceKey, string> = {
  zimols: "Brand identity",
  majaslapas: "Website development",
  seo: "SEO, GEO and AEO",
};
export const EXTERNAL_STATUS_NOTE_EN: Record<ExternalStatus, string> = {
  live: "",
  archived: "The website is no longer available",
  development: "The site is still in progress - the public address will follow",
  none: "",
};
/** Lomas etiķete LV -> EN. Nezināma LV etiķete paliek LV, ne tukša. */
export const ROLE_LABEL_EN: Record<string, string> = {
  Dizains: "Design",
  "Dizains un izstrāde": "Design and development",
  "Dizains un izstrāde (demo)": "Design and development (demo)",
  "Izstrāde ROIS komandā": "Development in the ROIS team",
  "Izstrāde un SEO ROIS komandā": "Development and SEO in the ROIS team",
  "Izstrāde un uzturēšana": "Development and maintenance",
  "Logo un brandbook ROIS komandā": "Logo and brand book in the ROIS team",
  "Logo un vizītkartes ROIS komandā": "Logo and business cards in the ROIS team",
  "Mājaslapa, pierakstu sistēma un SEO": "Website, booking system and SEO",
  "Mājaslapas izstrāde, grafiskais dizains, Odoo uzturēšana": "Website development, graphic design, Odoo maintenance",
  "SEO un GEO ROIS komandā": "SEO and GEO in the ROIS team",
  "Tehniskā uzturēšana": "Technical maintenance",
  "Zīmola izstrāde": "Brand development",
  "Zīmola izstrāde ROIS komandā": "Brand development in the ROIS team",
  "Zīmola zīmju izstrāde": "Brand mark design",
  "Zīmols un izstrāde ROIS komandā": "Brand and development in the ROIS team",
  "Zīmols, dizains un izstrāde": "Brand, design and development",
};
export const categoryTag = (locale: Locale) => (locale === "lv" ? CATEGORY_TAG : CATEGORY_TAG_EN);
export const serviceTag = (locale: Locale) => (locale === "lv" ? SERVICE_TAG : SERVICE_TAG_EN);
export const serviceLabel = (locale: Locale) => (locale === "lv" ? SERVICE_LABEL : SERVICE_LABEL_EN);
export const externalStatusNote = (locale: Locale) => (locale === "lv" ? EXTERNAL_STATUS_NOTE : EXTERNAL_STATUS_NOTE_EN);

export function localized(project: Project, locale: Locale): Project {
  if (locale === "lv") return project;
  const title = project.titleEn ?? project.title;
  return {
    ...project,
    title,
    summary: project.summaryEn ?? project.summary,
    role: { ...project.role, label: ROLE_LABEL_EN[project.role.label] ?? project.role.label },
    cover: project.cover.alt === project.title ? { ...project.cover, alt: title } : project.cover,
  };
}

const sizes = imageSizes as Record<string, { width: number; height: number }>;

/** Vai attēls ar šo ceļu ir manifestā (tātad reāli guļ public mapē). */
const hasImage = (src: string) => src in sizes;

function image(src: string, alt: string, caption?: string): ProjectImage {
  const size = sizes[src];
  if (!size) throw new Error(`Nav zināms attēla izmērs: ${src}. Palaid scripts/image-manifest.mjs`);
  const img: ProjectImage = { src, width: size.width, height: size.height, alt };
  if (caption) img.caption = caption;
  return img;
}

/** Galerijas pēc slug. Kolekcijām tā ir visa lapa, projektiem - papildinājums. */
const worksBySlug = new Map(portfolioWorks.map((work) => [work.slug, work]));

function galleryFor(slug: string): { images: ProjectImage[]; layout: GalleryLayout } | null {
  const work = worksBySlug.get(slug);
  if (!work) return null;
  return {
    images: work.gallery.map((item) => image(galleryPath(slug, item.file), item.alt, item.caption)),
    layout: work.layout,
  };
}

function displayYear(entry: RawProject): string | undefined {
  if (entry.yearRange) return entry.yearRange;
  if (entry.yearEstimated) return undefined;
  return entry.year === null ? undefined : String(entry.year);
}

function toProject(entry: RawProject, cover: ProjectImage): Project {
  const project: Project = {
    id: entry.id,
    slug: entry.slug,
    category: entry.category === "brand" ? "brand" : "web",
    client: entry.client,
    title: entry.titleLv,
    summary: entry.summaryLv ?? "",
    ...(entry.titleEn ? { titleEn: entry.titleEn } : {}),
    ...(entry.summaryEn ? { summaryEn: entry.summaryEn } : {}),
    role: { kind: entry.roleKind === "rois" ? "rois" : "solo", label: entry.roleLabel },
    services: entry.services.filter((s): s is ServiceKey => s in SERVICE_ROUTE_KEY),
    externalStatus: entry.externalStatus === "live" ? "live" : entry.externalStatus === "archived" ? "archived" : entry.externalStatus === "development" ? "development" : "none",
    cover,
  };
  // Saiti rādām tikai tad, ja vietne tiešām ir dzīva.
  if (entry.externalUrl && project.externalStatus === "live") project.externalUrl = entry.externalUrl;
  if (entry.stack.length > 0) project.stack = entry.stack;
  const year = displayYear(entry);
  if (year) project.year = year;
  const gallery = galleryFor(entry.slug);
  if (gallery && gallery.images.length > 0) {
    project.gallery = gallery.images;
    project.galleryLayout = gallery.layout;
  }
  return project;
}

/** Mājaslapu un zīmolu projekti no izpētes datiem (bez kolekcijām un melnraksta). */
function buildSiteProjects(): Project[] {
  return raw
    .filter((entry) => !draftIds.has(entry.id) && entry.galleryCount === undefined)
    .map((entry) => {
      // Juridiskā forma alt tekstā nav vajadzīga: "SIA Universal Solutions mājaslapas ..." ir smagi.
      const clientName = entry.client.replace(/^SIA\s+/, "");
      /**
       * Zīmola nosaukums alt tekstā stāv AIZ lietvārda ("Mājaslapa Estire"), ne
       * priekšā: latviski "Estire mājaslapa" ir angļu salikteņa forma, un pareizā
       * "Estires mājaslapa" prasa ģenitīvu, ko svešiem zīmoliem mehāniski
       * atvasināt nevar (PSL, Oak'A BBQ, Sinu Uksed).
       */
      const alt = LOGO_COVER_IDS.has(entry.id)
        ? `${clientName} logotips`
        : `Mājaslapa ${clientName} datora ekrānā`;

      /**
       * Vāks nāk no pārlūka kadra, ja tāds ir. Vecie 16:9 vāki bija griezti no
       * kadra malām, un tieši malās sēž logotips un galvenā poga - Estire
       * kartītē bija nogriezts gan "ESTIRE", gan "ZVANĪT". Pārlūka kadrs 1440x900
       * ir 16:10 un kartītē iet iekšā bez horizontāla griezuma.
       */
      const shotSrc = `/portfolio/shots/${entry.slug}.jpg`;
      const cover = hasImage(shotSrc)
        ? image(shotSrc, alt)
        : image(`/portfolio/sites/${entry.id}-cover.jpg`, alt);
      const project = toProject(entry, cover);

      const mobileSrc = `/portfolio/shots/${entry.slug}-mobile.jpg`;
      const mobileSmallSrc = `/portfolio/shots/${entry.slug}-mobile-sm.jpg`;
      if (hasImage(shotSrc) && hasImage(mobileSrc) && hasImage(mobileSmallSrc)) {
        project.shot = {
          desktop: image(shotSrc, `Mājaslapa ${clientName} datora ekrānā`),
          mobile: image(mobileSrc, `Mājaslapa ${clientName} telefona ekrānā`),
          mobileSmall: image(mobileSmallSrc, `Mājaslapa ${clientName} telefona ekrānā`),
        };
      }
      return project;
    });
}

/**
 * Dizaina kolekcijas: vāks no portfolio.ts, pārējais no izpētes datiem.
 * Kolekciju atšķir `galleryCount` - projektiem, kam galerija ir tikai
 * papildinājums (Varloz), vāks paliek tāds pats kā sarakstā.
 */
function buildCollections(): Project[] {
  return raw
    .filter((entry) => !draftIds.has(entry.id) && entry.galleryCount !== undefined)
    .map((entry) => {
      const work = worksBySlug.get(entry.slug);
      if (!work) throw new Error(`Kolekcijai ${entry.slug} nav galerijas src/data/portfolio.ts`);
      return toProject(entry, image(work.cover, entry.titleLv));
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

/**
 * Cik daudz šai lapai ir ko lasīt. Skaitlis nāk TIKAI no tā, kas datos jau ir -
 * apraksts, gads, tehnoloģijas, galerija, dzīva saite - un no tā, cik daudz
 * satura lapā vispār var salikt. Nekas netiek izdomāts klāt.
 *
 * Lieto divās vietās: sitemap prioritātē (lapa ar tukšu aprakstu nav 0,8 vērta)
 * un testā, kas neļauj sākumlapas izlasē nokļūt lapai bez apraksta.
 */
export function richness(project: Project): number {
  return (
    (project.summary ? 2 : 0) +
    (project.year ? 1 : 0) +
    (project.stack?.length ? 1 : 0) +
    (project.gallery?.length ? 2 : 0) +
    (project.externalUrl ? 1 : 0)
  );
}

/** Lapas, kurās nav neviena paša teikuma par projektu. */
export const thinSlugs: string[] = projects.filter((p) => !p.summary).map((p) => p.slug);

/**
 * Projekti, kurus drīkst piedāvāt meklētājam.
 *
 * Lapa bez apraksta salika teikumu no metadatu laukiem ("Mājaslapa klientam X.
 * Loma: izstrāde ROIS komandā.") - Google acīs tas ir plāns saturs, un AI
 * dzinējiem tur nav ko citēt. Tāpēc tādas lapas paliek sasniedzamas pēc tiešas
 * adreses, bet iet ārā no sitemap un saņem `noindex`.
 *
 * Šis ir NOTEIKUMS, ne saraksts: brīdī, kad `summaryLv` tiek aizpildīts,
 * lapa pati atgriežas indeksā. Izdomāt tekstu, lai lapa "izskatītos pilna",
 * nedrīkst - projects.raw.json godīguma noteikums.
 */
export const indexableProjects: Project[] = projects.filter((p) => Boolean(p.summary));

/**
 * Saistītie darbi: tā pati kategorija un vismaz viens kopīgs pakalpojums,
 * saraksta secībā, bagātākie pa priekšu. Nākamais projekts tiek izlaists - tas
 * lapā jau ir kā atsevišķs bloks, un divas vienādas saites blakus ir tikai
 * atkārtojums.
 */
export function relatedProjects(slug: string, limit = 3): Project[] {
  const current = projectBySlug(slug);
  if (!current) return [];
  const skip = new Set([slug, projectNeighbours(slug)?.next.slug]);
  const score = (p: Project) =>
    p.services.filter((s) => current.services.includes(s)).length * 10 + richness(p);
  return projects
    .filter((p) => !skip.has(p.slug) && p.category === current.category)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
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

/**
 * Sākumlapas izlase - pirmie pieci no ORDER, tajā pašā secībā. Agrāk te bija
 * cits saraksts, kas atkārtoja home.json darbu sadaļas punktus; tie punkti
 * 2026-09-07 tika izdzēsti (nerenderējās nekur), tāpēc atkārtot vairs nav ko.
 * Tagad ir viena patiesība: ja maina ORDER sākumu, mainās arī vitrīna.
 *
 * Režģis tos liek divās rindās (6+6, tad 4+4+4), un rindas iekšienē kadru
 * proporcija ir vienāda: nevienāds augstums rindā lasās kā kļūda, ne kā ritms.
 */
export const featured: string[] = [
  "rois-lv",
  "oakabbq",
  "olive-mebeles",
  "videastone",
  "termokoksne",
];

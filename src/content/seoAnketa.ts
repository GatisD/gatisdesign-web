import {
  GATIS_ACCOUNT,
  SERVICE_ACCOUNT,
  type AccessTool,
} from "../../api/_lib/seo-anketa-fields";

/**
 * /seo-anketa redzamie teksti. Avots: docs/seo-anketa-saturs.md (gramatiski
 * pārbaudīts). Lauku uzraksti dzīvo api/_lib/seo-anketa-fields.ts, jo tos lieto
 * arī vēstule Gatim; šeit ir tikai lapas proza un piekļuvju instrukcijas.
 *
 * Iekšējais formāts: `**treknraksts**` un `` `adrese` `` (monospace). Neko
 * citu renderētājs nepazīst - Markdown saites te nav ar nolūku.
 */

export const ANKETA_TITLE = "SEO-GEO sākuma anketa";

export const ANKETA_INTRO = [
  "Šī anketa aizstāj pirmo zvanu un pusi no e-pastiem. Aizpildīšana aizņem ap 20 minūtēm, un to var darīt pa daļām - ievadītais saglabājas šajā pārlūkā, līdz nosūtāt.",
  "Paroles nav jāsūta. Piekļuves jūs iedodat paši, pievienojot manu kontu savos rīkos - katram solim zemāk ir norādīts, kur tieši klikšķināt.",
  "Ja uz kādu jautājumu atbildes nav, atstājiet tukšu. Tukšs lauks ir labāks par minējumu.",
];

/** Meta apraksts: ievada pirmie divi teikumi, bez jauna teksta. */
export const ANKETA_META_DESCRIPTION =
  "Šī anketa aizstāj pirmo zvanu un pusi no e-pastiem. Aizpildīšana aizņem ap 20 minūtēm.";

export const HELP = {
  ieviesejs:
    "Šis ir svarīgākais jautājums anketā. No atbildes atkarīgs, vai labojumus ieviešu es vai sagatavoju uzdevumu jūsu programmētājam.",
  tirgi: "No šīs atbildes atkarīgs, kur mēru pozīcijas un kādā valodā jāraksta.",
  pircejuVardi:
    "Piemēram, viens un tas pats produkts vienā valstī ir „worktop”, citā - „countertop”. Pierakstiet vārdus, ko dzirdat no klientiem, ne tos, ko lietojat paši.",
} as const;

export const KONTAKTPERSONA_LEGEND = "Kontaktpersona: vārds, amats, e-pasts";
export const KONTAKTPERSONA_REQUIRED = "(obligāts: vārds un e-pasts)";
export const REQUIRED_MARK = "(obligāts)";

export const PIEKLUVES_INTRO =
  "Katram rīkam atzīmējiet vienu: **Izdarīts**, **Šāda rīka nav** vai **Vajag palīdzību**. Adreses var nokopēt ar pogu.";

export const PIEKLUVES_NOTE =
  "DNS, hostinga paneļa, FTP un datubāzes paroles nav vajadzīgas. Ja tās būs vajadzīgas konkrētam labojumam, pajautāšu atsevišķi un pateikšu, kāpēc.";

export const NOZARE_INTRO =
  "Šīs atbildes vajadzīgas, pirms rakstu pirmo teikumu jūsu lapai. Bez tām teksts būs tehniski pareizs, bet nozares cilvēks tajā pamanīs kļūdas.";

export const WHY_PREFIX = "Kāpēc:";

export type AccessCard = {
  tool: AccessTool;
  title: string;
  qualifier?: string;
  why?: string;
  /** Numurēti soļi vai (CMS gadījumā) varianti pa sistēmām. */
  steps: string[];
  stepsKind: "numbered" | "bullets";
  addresses: string[];
  note?: string;
};

export const ACCESS_CARDS: AccessCard[] = [
  {
    tool: "gsc",
    title: "2.1. Google Search Console",
    qualifier: "(obligāts)",
    why: "redzu, pēc kādiem vaicājumiem jūs atrod, un varu parādīt, kas mainījies pirms un pēc izmaiņām.",
    stepsKind: "numbered",
    steps: [
      "Atveriet search.google.com/search-console un izvēlieties savu domēnu.",
      "Kreisajā izvēlnē: Settings → Users and permissions → Add user.",
      "Pievienojiet abas adreses, tiesības **Full**:",
    ],
    addresses: [SERVICE_ACCOUNT, GATIS_ACCOUNT],
    note: "Ja Search Console nav: atzīmējiet „Vajag palīdzību”, izveidosim kopā (jāpievieno DNS ieraksts, tas aizņem ap 10 minūtēm).",
  },
  {
    tool: "ga4",
    title: "2.2. Google Analytics 4",
    why: "pieprasījumi un pirkumi pirms un pēc izmaiņām.",
    stepsKind: "numbered",
    steps: [
      "analytics.google.com → apakšā kreisajā pusē Admin (zobrats).",
      'Property → Property access management → "+" → Add users.',
      "Abas adreses, loma **Viewer**. Ja jāiestata arī konversijas, `gatis.design@gmail.com` - **Editor**.",
    ],
    addresses: [SERVICE_ACCOUNT, GATIS_ACCOUNT],
  },
  {
    tool: "cms",
    title: "2.3. Mājaslapas administrācija",
    why: "virsraksti, apraksti, strukturētie dati un pāradresācijas. Lūdzu, izveidojiet man atsevišķu lietotāju, nevis dodiet savu personīgo kontu.",
    stepsKind: "bullets",
    steps: [
      "**WordPress:** Users → Add New → e-pasts `gatis.design@gmail.com`, loma Administrator (vai Editor, ja SEO spraudnim ir atsevišķas tiesības).",
      "**Shopify:** Settings → Users → Add users (e-pasts `gatis.design@gmail.com`), vai apstipriniet sadarbības partnera pieprasījumu, ko nosūtīšu.",
      "**Cita sistēma:** ierakstiet, kāda tā ir un kā tajā pievieno lietotāju.",
    ],
    addresses: [GATIS_ACCOUNT],
  },
  {
    tool: "gtm",
    title: "2.4. Google Tag Manager",
    qualifier: "(tikai tad, ja jāiestata mērīšana)",
    stepsKind: "numbered",
    steps: [
      'tagmanager.google.com → Admin → User Management → "+" → Add users.',
      "Abas adreses, konteinera tiesības **Publish**.",
    ],
    addresses: [SERVICE_ACCOUNT, GATIS_ACCOUNT],
  },
  {
    tool: "bing",
    title: "2.5. Bing Webmaster Tools",
    why: "ChatGPT un Copilot meklēšana balstās uz Bing indeksu. Bez šī rīka šo daļu nevar izmērīt.",
    stepsKind: "numbered",
    steps: [
      "bing.com/webmasters → pieslēdzieties ar Microsoft vai Google kontu.",
      'Izvēlieties "Import from Google Search Console" - vietne pievienojas 2 minūtēs.',
      "Settings → User management → Add user → `gatis.design@gmail.com`, loma **Administrator**.",
    ],
    addresses: [GATIS_ACCOUNT],
  },
  {
    tool: "gbp",
    title: "2.6. Google Business Profile",
    qualifier: "(tikai tad, ja jums ir veikals vai birojs vai apkalpojat noteiktu reģionu)",
    stepsKind: "numbered",
    steps: [
      "business.google.com → jūsu profils → Business Profile settings → People and access → Add.",
      "`gatis.design@gmail.com`, loma **Manager**.",
    ],
    addresses: [GATIS_ACCOUNT],
  },
];

/** Rīku adreses, kuras renderētājs pārvērš par saitēm (atveras jaunā cilnē). */
export const TOOL_LINKS = [
  "search.google.com/search-console",
  "analytics.google.com",
  "tagmanager.google.com",
  "bing.com/webmasters",
  "business.google.com",
] as const;

export const SUBMIT_LABEL = "Nosūtīt anketu";

export const SUCCESS = {
  title: "Paldies, anketa saņemta.",
  body: [
    "Divu darbadienu laikā pārbaudīšu piekļuves un atbildēšu, ja kaut kā trūks.",
    "Pirms pirmajām izmaiņām lapā fiksēšu sākuma stāvokli - no tā mērīsim rezultātu.",
  ],
};

/** Kļūdas teksts. E-pasta adrese tiek renderēta kā mailto saite. */
export const FAILURE_BEFORE_EMAIL =
  "Neizdevās nosūtīt. Jūsu atbildes ir saglabātas šajā pārlūkā - mēģiniet vēlreiz vai rakstiet uz";

/**
 * JAUNI teksti, kuru nav docs/seo-anketa-saturs.md. Minimāli un visi vienuviet,
 * lai tos var nodot gramatikas pārbaudei vienā sarakstā.
 */
export const UI = {
  copy: "Kopēt",
  copied: "Nokopēts",
  progressLabel: "Anketas sadaļas",
  honeypot: "Šo lauku neaizpildiet",
  errors: {
    required: "Aizpildiet šo lauku.",
    tooLong: "Teksts ir pārāk garš.",
    singleLine: "Ierakstiet vienā rindā.",
    emailInvalid: "Ievadiet derīgu e-pasta adresi.",
    statusRequired: "Atzīmējiet vienu no atbildēm.",
    choiceInvalid: "Izvēlieties vienu no atbildēm.",
    consentRequired: "Bez piekrišanas anketu nevar nosūtīt.",
  },
} as const;

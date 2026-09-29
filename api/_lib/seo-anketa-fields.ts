/**
 * SEO-GEO sākuma anketas lauku katalogs - viens patiesības avots.
 *
 * No šejienes nāk gan formas lauku uzraksti (src/pages/SeoAnketa.tsx), gan
 * vēstule Gatim (seo-anketa-emails.ts), gan shēmas garuma robežas. Teksti ir
 * no docs/seo-anketa-saturs.md un ir gramatiski pārbaudīti - tos nemaina šeit
 * bez tā dokumenta.
 *
 * Anketā NAV neviena paroles, tokena vai API atslēgas lauka, un tādu nedrīkst
 * pievienot: piekļuves klients iedod pats, pievienojot kontu savos rīkos.
 *
 * Mape sākas ar "_", tāpēc Vercel to netaisa par atsevišķu funkciju.
 */

/** Konti, ko klients pievieno savos rīkos. Rāda lapā ar kopēšanas pogu. */
export const SERVICE_ACCOUNT = "rois-auditor@rois-1735811972671.iam.gserviceaccount.com";
export const GATIS_ACCOUNT = "gatis.design@gmail.com";

export const ACCESS_TOOLS = ["gsc", "ga4", "cms", "gtm", "bing", "gbp"] as const;
export type AccessTool = (typeof ACCESS_TOOLS)[number];

export const ACCESS_STATUSES = ["izdarits", "nav", "palidziba"] as const;
export type AccessStatus = (typeof ACCESS_STATUSES)[number];

export const ACCESS_STATUS_LABELS: Record<AccessStatus, string> = {
  izdarits: "Izdarīts",
  nav: "Šāda rīka nav",
  palidziba: "Vajag palīdzību",
};

export const ACCESS_TOOL_LABELS: Record<AccessTool, string> = {
  gsc: "Google Search Console",
  ga4: "Google Analytics 4",
  cms: "Mājaslapas administrācija",
  gtm: "Google Tag Manager",
  bing: "Bing Webmaster Tools",
  gbp: "Google Business Profile",
};

/** Formas lauka nosaukums piekļuves statusam: `piekluve_gsc` utt. */
export function accessField(tool: AccessTool): `piekluve_${AccessTool}` {
  return `piekluve_${tool}`;
}

export const CHOICES = {
  atskaites: { epasts: "E-pastā", citur: "Citur (norādiet)" },
  ieviesejs: {
    pasi: "Paši - mums ir pieeja lapas administrācijai",
    programmetajs: "Mūsu programmētājs vai aģentūra - kontakts:",
    nezinu: "Nezinu",
  },
  vide: { dzivo: "Dzīvo lapu", testa: "Ir testa vide", nezinu: "Nezinu" },
  cms: {
    wordpress: "WordPress",
    shopify: "Shopify",
    wix: "Wix",
    webflow: "Webflow",
    cita: "Cita",
    nezinu: "Nezinu",
  },
  cenasPublicet: { ja: "Jā", tikaiNo: "Tikai „no X EUR”", ne: "Nē" },
} as const;

export type ChoiceKey = keyof typeof CHOICES;

export function choiceValues<K extends ChoiceKey>(key: K): [keyof (typeof CHOICES)[K] & string, ...Array<keyof (typeof CHOICES)[K] & string>] {
  return Object.keys(CHOICES[key]) as [keyof (typeof CHOICES)[K] & string, ...Array<keyof (typeof CHOICES)[K] & string>];
}

/** Izvēles grupu virsraksti (fieldset legend). */
export const CHOICE_LABELS: Record<ChoiceKey, string> = {
  atskaites: "Kur sūtīt atskaites?",
  ieviesejs: "Kas ievieš izmaiņas mājaslapas kodā?",
  vide: "Vai drīkst labot dzīvo lapu, vai ir testa vide?",
  cms: "CMS sistēma",
  cenasPublicet: "Vai drīkst publicēt?",
};

/**
 * Teksta lauki. `multiline` = textarea. `max` ir rakstzīmēs, un to pašu skaitli
 * lieto gan shēma, gan `maxLength` pārlūkā.
 */
export const TEXT_FIELDS = {
  // 1. Uzņēmums un kontaktpersona
  uznemums: { label: "Uzņēmuma nosaukums, kā to redz pircēji", max: 150, required: true, multiline: false },
  juridiskais: { label: "Juridiskais nosaukums un reģistrācijas numurs", max: 200, required: false, multiline: false },
  majaslapa: { label: "Mājaslapas adrese", max: 300, required: true, multiline: false },
  adrese: { label: "Adrese, kā tai jāparādās Google (iela, pilsēta, pasta indekss)", max: 300, required: false, multiline: false },
  talrunis: { label: "Tālrunis vienā formātā, piemēram, +371 20000000", max: 60, required: false, multiline: false },
  kontaktsVards: { label: "Vārds", max: 100, required: true, multiline: false },
  kontaktsAmats: { label: "Amats", max: 100, required: false, multiline: false },
  kontaktsEpasts: { label: "E-pasts", max: 200, required: true, multiline: false },
  atskaitesCitur: { label: "Citur (norādiet)", max: 300, required: false, multiline: false },
  ieviesejsKontakts: { label: "Mūsu programmētājs vai aģentūra - kontakts", max: 300, required: false, multiline: false },

  // 2. Piekļuves
  cmsCita: { label: "Cita sistēma: ierakstiet, kāda tā ir un kā tajā pievieno lietotāju.", max: 800, required: false, multiline: true },

  // 3. Tirgus un valoda
  tirgi: { label: "Kurās valstīs vai pilsētās vēlaties, lai jūs atrastu? Prioritātes secībā.", max: 1500, required: true, multiline: true },
  valodasTagad: { label: "Kādās valodās mājaslapa ir tagad?", max: 300, required: false, multiline: false },
  valodasPlano: { label: "Vai plānojat citas valodas? Kuras, un kas tulkos?", max: 600, required: false, multiline: true },
  pircejuVardi: { label: "Kā pircēji sauc jūsu preci vai pakalpojumu - sarunā un meklētājā? Kurā valodā?", max: 2000, required: false, multiline: true },
  zimolaVarianti: { label: "Jūsu zīmola nosaukums visos rakstības variantos, kā to var meklēt (arī ar kļūdām)", max: 600, required: false, multiline: true },
  svarigakasLapas: { label: "3-7 svarīgākās lapas, pēc kurām mērīsim rezultātu (adreses)", max: 2000, required: false, multiline: true },

  // 4. Par nozari
  nozare1: { label: "Kurus zīmolus jūs pārdodat, un kas ir katra ražotājs vai mātes uzņēmums?", max: 2000, required: false, multiline: true },
  nozare2: { label: "Ko pircēji visbiežāk jautā pa telefonu pirms pirkuma? Pieci biežākie jautājumi.", max: 2000, required: false, multiline: true },
  nozare3: { label: "Ko par jums nedrīkst apgalvot? (Piemēram: ražotājs vai izplatītājs, garantijas, sertifikāti.)", max: 2000, required: false, multiline: true },
  nozare4: { label: "Trīs galvenie konkurenti. Vai kāds no tiem ir arī jūsu partneris vai pārdevējs?", max: 2000, required: false, multiline: true },
  nozare5: { label: "Kādi nozares termini vai saīsinājumi jūsu tekstos pircējam būtu jāpaskaidro?", max: 2000, required: false, multiline: true },
  nozare6: { label: "Vienā teikumā: ko jūs darāt, saviem vārdiem.", max: 600, required: false, multiline: true },

  // 5. Materiāli, ko drīkst izmantot
  profili: { label: "Sociālo tīklu un katalogu profili (Facebook, Instagram, LinkedIn, YouTube, firmas.lv u.c.) - adreses", max: 2000, required: false, multiline: true },
  cenas: { label: "Cenas vai cenu diapazons", max: 1000, required: false, multiline: true },
  atsauksmes: { label: "Atsauksmes, ko drīkst citēt (saite vai teksts)", max: 3000, required: false, multiline: true },
  logotipi: { label: "Klientu logotipi vai projekti, ko drīkst rādīt", max: 2000, required: false, multiline: true },

  // 6. Nosūtīšana
  komentars: { label: "Cits komentārs", max: 3000, required: false, multiline: true },
} as const;

export type TextField = keyof typeof TEXT_FIELDS;

export const CONSENT_LABEL = "Piekrītu, ka šie dati tiks izmantoti sadarbības sagatavošanai.";
export const CONSENT_LINK = "Privātuma politika";

/**
 * Slazda lauka nosaukums. Bez nozīmes ar nolūku: autofill heiristikas
 * pazīst angļu lauku vārdus (company, name, email, url...) un aizpilda tos no
 * kontaktu kartītes. Latvisks vārds bez nozīmes tām netrāpa.
 */
export const ANKETA_HONEYPOT_FIELD = "mezgls" as const;

/** Neapstrādāta pieprasījuma augšējā robeža baitos. Summa no lauku max ar rezervi. */
export const ANKETA_BODY_BYTES_MAX = 96_000;

/** Sadaļas vēstulē un lapā - viena secība. */
export const SECTIONS = [
  { id: "uznemums", title: "1. Uzņēmums un kontaktpersona" },
  { id: "piekluves", title: "2. Piekļuves" },
  { id: "tirgus", title: "3. Tirgus un valoda" },
  { id: "nozare", title: "4. Par nozari" },
  { id: "materiali", title: "5. Materiāli, ko drīkst izmantot" },
  { id: "nosutisana", title: "6. Nosūtīšana" },
] as const;

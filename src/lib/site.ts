export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://gatisdesign.com"
).replace(/\/$/, "");

export const SITE_NAME = "Gatis Design";
export const SITE_TAGLINE = "Brand identity ar 18 gadu pieredzi";
export const CONTACT_EMAIL = "connect@gatisdesign.com";

/**
 * WhatsApp. `wa.me` prasa numuru BEZ plusa, atstarpēm un iekavām - ar tiem
 * saite atveras, bet sarunu neatver, un cilvēks nonāk tukšā WhatsApp logā.
 * `display` ir tas pats numurs cilvēkam lasāmā formā.
 */
export const WHATSAPP = {
  number: "37127112163",
  display: "+371 27112163",
  href: "https://wa.me/37127112163",
};

/**
 * Tālrunis zvanam. Tas pats numurs, kas WhatsApp, bet `tel:` saite - mobilajā
 * izvēlnē "Zvanīt" atver zvanu, ne čatu. Ar plusu un bez atstarpēm: tā `tel:`
 * shēmu saprot visi tālruņi.
 */
export const PHONE = {
  href: "tel:+37127112163",
  display: "+371 27112163",
};

export const SOCIAL = {
  dribbble: "https://dribbble.com/gdesign90",
  facebook: "https://facebook.com/GatisDesign",
  instagram: "https://instagram.com/gatisdesign",
  linkedin: "https://www.linkedin.com/in/gatis-daugavietis-bb5566193",
};

/**
 * Profili strukturētajiem datiem, sadalīti pa entitātēm.
 *
 * Identisks masīvs gan uz `Person`, gan uz `ProfessionalService` mašīnai
 * nozīmē, ka personai un biznesam ir tieši viens profilu komplekts, tātad tie,
 * iespējams, ir viens mezgls. LinkedIn, Instagram un Dribbble adreses ir uz
 * personas vārda; Facebook lapa ir uz zīmola vārda.
 */
export const PERSON_SAME_AS = [SOCIAL.linkedin, SOCIAL.instagram, SOCIAL.dribbble];
export const BUSINESS_SAME_AS = [SOCIAL.facebook];

/**
 * Profesija kā kodēta entitāte, ne kā brīvs teksts. O*NET kods 15-1254.00 ir
 * Web Developers. Rich result no šī nav; ieguvums ir AI citējamībā.
 */
export const PERSON_OCCUPATION = {
  "@type": "Occupation",
  name: "Web dizainers un izstrādātājs",
  occupationalCategory: {
    "@type": "CategoryCode",
    codeValue: "15-1254.00",
    name: "Web Developers",
    inCodeSet: { "@type": "CategoryCodeSet", name: "O*NET-SOC" },
  },
  occupationLocation: { "@type": "City", name: "Rīga" },
  skills: [
    "Mājaslapu dizains un izstrāde",
    "Zīmola identitātes un logo izstrāde",
    "AI aģentu izstrāde un procesu automatizācija",
    "SEO, GEO un AEO optimizācija",
    "Tehniskais audits un lapas ātruma optimizācija",
  ],
};

/**
 * Amats vienā vietā. Četras lapas apraksta VIENU `@id` (`#gatis`); ja tekstu
 * raksta ar roku katrā, parsētājs saņem divus amatus vienam cilvēkam.
 */
export const PERSON_JOB_TITLE = PERSON_OCCUPATION.name;

/** Darba vieta. `nationality` apzināti nav - faktos ir atrašanās vieta, ne pilsonība. */
export const WORK_LOCATION = {
  "@type": "Place",
  address: { "@type": "PostalAddress", addressLocality: "Rīga", addressCountry: "LV" },
};

/**
 * Apkalpotās valstis strukturētajiem datiem.
 *
 * Viena konstante, ne divas: sākumlapā tas bija virkņu masīvs, pakalpojumu
 * lapās - `Country` objekti, un viena entitāte par vienu un to pašu runāja
 * divās formās. `sameAs` uz Wikidata ir tas, kas atšķir vārdu "Latvija" no
 * valsts zināšanu grafā.
 */
export const AREA_SERVED = [
  { "@type": "Country", name: "Latvija", sameAs: "https://www.wikidata.org/wiki/Q211" },
  { "@type": "Country", name: "Igaunija", sameAs: "https://www.wikidata.org/wiki/Q191" },
  { "@type": "Country", name: "Lietuva", sameAs: "https://www.wikidata.org/wiki/Q37" },
  {
    "@type": "Country",
    name: "Amerikas Savienotās Valstis",
    sameAs: "https://www.wikidata.org/wiki/Q30",
  },
];

/** Kompetences mašīnlasāmā formā. Tas, ko entitāte prot, ne tas, ko pārdod. */
export const KNOWS_ABOUT = [
  "Mājaslapu dizains un izstrāde",
  "WordPress mājaslapu izstrāde",
  "Mājaslapu izstrāde ar React un Vite",
  "Interneta veikalu izstrāde",
  "Zīmola identitātes un logo izstrāde",
  "Zīmola grāmatas un drukas materiāli",
  "AI aģenti un procesu automatizācija",
  "Meklētājprogrammu optimizācija (SEO)",
  "Redzamība AI atbildēs (GEO un AEO)",
  "Strukturētie dati (schema markup)",
  "Lapas ātrums un Core Web Vitals",
];

/**
 * Satura pēdējās redakcijas datums strukturētajiem datiem.
 *
 * Konstante, ne `new Date()`: būvē un hidratācijā tam jābūt vienam un tam
 * pašam, un "šodien" nozīmētu, ka lapa katru dienu apgalvo, ka saturs ir
 * atjaunots. Dzīvo šeit, ne schema modulī, lai sākumlapa un "Par mani" to
 * varētu paņemt, neievelkot bundlē visu četru pakalpojumu lapu saturu.
 */
export const CONTENT_MODIFIED = "2026-09-06";

/**
 * Gads kājenes kolofonā. Konstante, ne `new Date().getFullYear()` render laikā:
 * projekta noteikums aizliedz `new Date()` renderā, un izņēmums "gads mainās
 * reizi gadā" nozīmē, ka reizi gadā serverī izrenderētais HTML un pārlūkā
 * hidratētais koks 31. decembra vakarā atšķiras. Atjauno kopā ar
 * CONTENT_MODIFIED.
 */
export const BUILD_YEAR = Number(CONTENT_MODIFIED.slice(0, 4));

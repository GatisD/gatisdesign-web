/**
 * Klientu logotipi joslai zem darbu izlases.
 *
 * Godīguma noteikums, tāds pats kā projektiem: sarakstā ir TIKAI tie klienti,
 * kuriem logotips reāli guļ `public/clients/`. Ja logotipa faila nav, klients
 * šeit neparādās - vārds bez logo joslā ir tukša vieta, ne klients.
 *
 * Faili ir vienkrāsaini papīra silueti (`scripts/`-ārpus sagatavoti no zīmolu
 * oriģināliem): uz grafīta joslas 14 svešu zīmolu paletes savā starpā kliegtu,
 * un tieši tāda logo siena ir cita žanra lapa. Tāpēc krāsu te nav nemaz, un
 * kursors atgriež nevis krāsu, bet pilnu necaurspīdīgumu.
 *
 * Izmēri ir faila īstie pikseļi (2x no rindas augstuma), lai <img> vienmēr var
 * izlikt width/height un josla neraustās ielādes laikā.
 */
export interface ClientLogo {
  slug: string;
  /** Zīmola nosaukums tā, kā tas rakstīts pašā logotipā. */
  name: string;
  width: number;
  height: number;
}

export const clientLogos: ClientLogo[] = [
  { slug: "oakabbq", name: "Oak'A BBQ", width: 210, height: 72 },
  { slug: "estire", name: "Estire", width: 280, height: 65 },
  { slug: "tenter", name: "Tenter Latvija", width: 243, height: 72 },
  { slug: "box-latvia", name: "Box Latvia", width: 280, height: 51 },
  { slug: "improvement", name: "Improvement", width: 280, height: 44 },
  { slug: "universal-solutions", name: "Universal Solutions", width: 280, height: 60 },
  { slug: "lucky-punch", name: "Lucky Punch", width: 244, height: 72 },
  { slug: "mlm-cargo", name: "MLM Cargo", width: 280, height: 30 },
  { slug: "lauvas-zobs", name: "Lauvas Zobs", width: 280, height: 59 },
  { slug: "tavasdurvis", name: "Tavas Durvis", width: 125, height: 72 },
  { slug: "valis", name: "Valis", width: 224, height: 72 },
  { slug: "arm-metals", name: "ARM Metāls", width: 280, height: 58 },
  { slug: "cafeteria", name: "Cafeteria", width: 280, height: 66 },
  { slug: "darbaguru", name: "DarbaGuru", width: 280, height: 60 },
  { slug: "forevolt", name: "Forevolt", width: 280, height: 54 },
];

/** Ceļš uz logotipa failu (PNG; blakus tam ir tāds pats .webp). */
export const clientLogoPath = (slug: string) => `/clients/${slug}.png`;

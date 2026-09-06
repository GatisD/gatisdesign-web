import {
  SITE_URL,
  SITE_NAME,
  CONTACT_EMAIL,
  PERSON_JOB_TITLE,
  PERSON_OCCUPATION,
  PERSON_SAME_AS,
  WORK_LOCATION,
  KNOWS_ABOUT,
} from "@/lib/site";

/**
 * JSON-LD mezgli, kas atkārtojas vairākās lapās - uzbūvēti VIENU reizi.
 *
 * Kāpēc: Person mezgls bija uzrakstīts ar roku četrās vietās un FAQPage
 * kartēšana četrās. Katra kopija ir vieta, kur lauks var atpalikt - un
 * strukturētajos datos atpalikusi kopija nav kosmētika: divi apraksti ar vienu
 * `@id` Google un AI modeļiem nozīmē vienu personu, kas pati sev ir pretrunā,
 * un tieši to 5. kārtas audits atrada ("viens cilvēks, ne divi").
 *
 * Šeit dzīvo tikai forma. Fakti (amats, prasmes, adrese) nāk no `site.ts`.
 */

/**
 * Kopīgie Person lauki BEZ `@context`: to pieliek tikai patstāvīgs mezgls.
 * Iegults mezgls (piem. `ContactPage.mainEntity`) konteksta nesaņem, jo to
 * jau nes vecāks - un dubults konteksts ir kļūda, ne pārliecība.
 */
export const PERSON_BASE = {
  "@type": "Person",
  "@id": `${SITE_URL}/#gatis`,
  name: "Gatis Daugavietis",
  alternateName: SITE_NAME,
  jobTitle: PERSON_JOB_TITLE,
  url: SITE_URL,
  email: CONTACT_EMAIL,
  address: WORK_LOCATION.address,
  hasOccupation: PERSON_OCCUPATION,
  workLocation: WORK_LOCATION,
  knowsAbout: KNOWS_ABOUT,
  sameAs: PERSON_SAME_AS,
} as const;

/**
 * Patstāvīgs Person mezgls. Lapai specifiskie lauki (`description`, `image`,
 * `worksFor`) nāk virsū; kopīgie nedrīkst atšķirties, tāpēc tie ir bāzē.
 */
export function personNode<T extends object>(extras?: T) {
  return { "@context": "https://schema.org", ...PERSON_BASE, ...(extras ?? ({} as T)) };
}

/** Atsauce uz to pašu personu tur, kur pilns apraksts nav vajadzīgs. */
export const personRef = { "@id": `${SITE_URL}/#gatis` } as const;

export type FaqItem = { q: string; a: string };

/**
 * FAQPage no jautājumu saraksta.
 *
 * Saraksts drīkst saturēt arī jautājumus, kas lapā netiek rādīti - tā ir
 * apzināta izvēle (sk. `PageContent.faq` komentāru), un tā paliek zvana pusē,
 * ne šeit.
 */
export function faqPageNode<T extends object>(items: readonly FaqItem[], extras?: T) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(extras ?? ({} as T)),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

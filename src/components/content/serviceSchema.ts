import { SITE_URL, SITE_NAME, CONTACT_EMAIL, CONTENT_MODIFIED, AREA_SERVED } from "@/lib/site";
import { buildBreadcrumbSchema } from "@/components/JsonLd";
import { priceRangeFor } from "@/content";
import type { ServiceContent } from "@/content/types";
import { pathFor, type Locale, type RouteKey } from "@/i18n/routes";

const abs = (p: string) => `${SITE_URL}${p}`;

/**
 * Viena un tā pati persona visos objektos - caur `@id`, ne caur atkārtotu
 * aprakstu. Bez tā Google un AI modeļiem šī ir vairākas dažādas personas ar
 * vienu vārdu.
 */
const provider = {
  // `@context` ir tāpēc, ka šis mezgls masīvā stāv patstāvīgi. Bez konteksta
  // stingrā JSON-LD apstrādē tas zaudē vārdnīcu, un `@type` kļūst par tekstu.
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#gatis`,
  name: "Gatis Daugavietis",
  alternateName: SITE_NAME,
  jobTitle: "Dizainers un izstrādātājs",
  url: SITE_URL,
  email: CONTACT_EMAIL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Rīga",
    addressCountry: "LV",
  },
};

/**
 * Service + FAQPage + BreadcrumbList vienā masīvā. Cenu diapazons nāk no lapas
 * cenu tabulas, nevis no atsevišķa saraksta - tā strukturētie dati un redzamais
 * teksts nevar aiziet viens no otra.
 */
export function buildServiceSchema(
  content: ServiceContent,
  routeKey: RouteKey,
  locale: Locale,
): Record<string, unknown>[] {
  const url = abs(pathFor(routeKey, locale));
  const price = priceRangeFor(content);

  const service: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: content.title,
    serviceType: content.title,
    description: content.metaDescription,
    url,
    provider: { "@id": `${SITE_URL}/#gatis` },
    areaServed: AREA_SERVED,
    availableLanguage: ["lv", "en"],
    dateModified: CONTENT_MODIFIED,
  };

  if (price) {
    service.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: price.low,
      // `highPrice` tikai tad, kad diapazons tiešām ir. Ar vienu cenu tabulā
      // abi gali sanāca vienādi, un mašīnai tas nozīmē "dārgāk nemaksā",
      // lai gan lapa saka "no".
      ...(price.high > price.low ? { highPrice: price.high } : {}),
      offerCount: price.count,
      url,
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#gatis` },
    };
  }

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumb = buildBreadcrumbSchema([
    { name: locale === "lv" ? "Sākums" : "Home", path: pathFor("home", locale) },
    { name: content.title, path: pathFor(routeKey, locale) },
  ]);

  // Persona pilnā aprakstā iet reizi lapā; pārējie objekti uz to atsaucas ar @id.
  return [provider, service, faq, breadcrumb];
}

import { Helmet } from "react-helmet-async";
import { SITE_URL, SITE_NAME, CONTACT_EMAIL, SOCIAL } from "@/lib/site";

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * `<` tiek aizstāts ar `\u003c`. Šodien viss schema saturs nāk no repo, tāpēc
 * XSS te nav; bet `</script>` teksta vidū aizvērtu tagu, un brīdis, kad kāds
 * lauks sāk nākt no ārpuses, ir tieši tas brīdis, kad neviens vairs neatceras
 * pārbaudīt šo rindu.
 */
function safeJson(data: JsonLdProps["data"]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <Helmet>
      <script type="application/ld+json">{safeJson(data)}</script>
    </Helmet>
  );
}

/**
 * Person + ProfessionalService schema apvienojums priekš portfolio.
 * Gatis ir individual freelancer (legal_form: individual), tāpēc Person ir core,
 * ProfessionalService apraksta pakalpojumus.
 */
export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gatis Daugavietis",
  alternateName: "Gatis Design",
  jobTitle: "Brand & Web Designer",
  description:
    "Neatkarīgs brand un web dizainers ar 18 gadu pieredzi. 100+ projekti zīmoliem Latvijā un ārpus.",
  url: SITE_URL,
  email: CONTACT_EMAIL,
  image: `${SITE_URL}/og-image.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Rīga",
    addressCountry: "LV",
  },
  knowsAbout: ["Brand Identity", "Logo Design", "Web Design", "UI/UX", "Print Design", "Illustration"],
  sameAs: [SOCIAL.dribbble, SOCIAL.facebook, SOCIAL.instagram, SOCIAL.linkedin],
};

export const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE_NAME,
  description: "Brand identity, web dizains, ilustrācijas un druka.",
  url: SITE_URL,
  email: CONTACT_EMAIL,
  image: `${SITE_URL}/og-image.png`,
  areaServed: { "@type": "Place", name: "Worldwide" },
  founder: { "@type": "Person", name: "Gatis Daugavietis" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Rīga",
    addressCountry: "LV",
  },
  sameAs: [SOCIAL.dribbble, SOCIAL.facebook, SOCIAL.instagram, SOCIAL.linkedin],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Dizaina pakalpojumi",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Logo & Brand Identity" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Web Design" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Illustrations" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Print Design" },
      },
    ],
  },
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Cik maksā brand identity izstrāde?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Katrs projekts ir unikāls. Pilnu cenu sagatavoju pēc pirmās sarunas, kad saprotu projekta apjomu, termiņus un mērķus.",
      },
    },
    {
      "@type": "Question",
      name: "Cik ilgs ir tipisks projekta process?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Brand identity projekts vidēji aizņem 4-6 nedēļas, web dizains 6-8 nedēļas. Termiņus precizējam, kad sākam strādāt.",
      },
    },
    {
      "@type": "Question",
      name: "Vai strādāju ar starptautiskiem klientiem?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Jā. Bāzēts Rīgā, Latvijā, bet pieejams projektiem visā pasaulē. Komunikācija notiek latviski vai angliski.",
      },
    },
    {
      "@type": "Question",
      name: "Kādus failus saņemšu pēc projekta?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Logo projektos: SVG, PNG, PDF visās vajadzīgajās variācijās plus brand guidelines PDF. Web projektos: Figma fails un izstrādāta mājaslapa.",
      },
    },
    {
      "@type": "Question",
      name: "Vai projekta laikā var iterēt?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Jā. Mans process ietver 2-3 koncepta variantus un iteratīvu noslīpēšanu, balstoties uz tavu atgriezenisko saiti.",
      },
    },
  ],
};

export function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

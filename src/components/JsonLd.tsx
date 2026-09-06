import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/site";

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

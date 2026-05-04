import { Helmet } from "react-helmet-async";
import { SITE_URL, SITE_NAME } from "@/lib/site";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  lastModified?: string;
  ogImage?: string;
}

const DEFAULT_TITLE = "Gatis Design — Brand identity ar 18 gadu pieredzi";
const DEFAULT_DESC =
  "Neatkarīgs brand un web dizainers Rīgā. 100+ projekti zīmoliem Latvijā un ārpus. Logo, mājaslapas, ilustrācijas, druka.";

export default function SEO({ title, description, path = "", lastModified, ogImage }: SEOProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const pageDesc = description || DEFAULT_DESC;
  const url = `${SITE_URL}${path}`;
  const image = ogImage || `${SITE_URL}/og-image.png`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="lv_LV" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={image} />
      {lastModified && <meta name="article:modified_time" content={lastModified} />}
      {lastModified && <meta property="og:updated_time" content={lastModified} />}
    </Helmet>
  );
}

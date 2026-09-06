/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Publiskais lapas URL - canonical, og:url, sitemap, JSON-LD. */
  readonly VITE_SITE_URL?: string;
  /**
   * Google Tag Manager konteinera ID (GTM-XXXXXXX). Publisks identifikators,
   * ne noslēpums. Ja nav uzstādīts, GTM komponente nerenderē neko.
   */
  readonly VITE_GTM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

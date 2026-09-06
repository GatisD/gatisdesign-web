/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Publiskais lapas URL - canonical, og:url, sitemap, JSON-LD. */
  readonly VITE_SITE_URL?: string;
  /**
   * Google Tag Manager konteinera ID (GTM-XXXXXXX). Publisks identifikators,
   * ne noslēpums. Ja nav uzstādīts, GTM komponente nerenderē neko.
   */
  readonly VITE_GTM_ID?: string;
  /**
   * Cloudflare Turnstile publiskā atslēga. Publisks identifikators, ne
   * noslēpums - noslēpums ir TURNSTILE_SECRET_KEY, un tas dzīvo tikai servera
   * vidē. Ja atslēgas nav, forma strādā bez robotu pārbaudes.
   */
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  turnstile?: {
    render: (
      element: HTMLElement,
      options: {
        sitekey: string;
        theme?: "light" | "dark" | "auto";
        action?: string;
        language?: string;
        "response-field"?: boolean;
        callback?: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
      },
    ) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId?: string) => void;
  };
}

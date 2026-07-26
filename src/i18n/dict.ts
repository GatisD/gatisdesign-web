export const dict = {
  lv: {
    nav: {
      home: "Sākums",
      services: "Pakalpojumi",
      portfolio: "Darbi",
      about: "Par mani",
      contact: "Kontakti",
      cta: "Sākt projektu",
      openMenu: "Atvērt izvēlni",
      closeMenu: "Aizvērt izvēlni",
      skipToContent: "Pāriet uz saturu",
    },
    services: {
      brand: "Zīmola identitāte",
      web: "Mājaslapu izstrāde",
      ai: "AI aģenti un automatizācijas",
      seo: "SEO, GEO un AEO",
    },
    lang: { label: "Valodas izvēle", lv: "LV", en: "EN" },
    footer: { rights: "Visas tiesības aizsargātas", privacy: "Privātuma politika" },
    notFound: {
      title: "Šāda lapa neeksistē",
      body: "Iespējams, adrese ir mainīta vai ierakstīta ar kļūdu.",
      cta: "Uz sākumu",
    },
  },
  en: {
    nav: {
      home: "Home",
      services: "Services",
      portfolio: "Work",
      about: "About",
      contact: "Contact",
      cta: "Start a project",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      skipToContent: "Skip to content",
    },
    services: {
      brand: "Brand identity",
      web: "Website development",
      ai: "AI agents and automation",
      seo: "SEO, GEO and AEO",
    },
    lang: { label: "Language", lv: "LV", en: "EN" },
    footer: { rights: "All rights reserved", privacy: "Privacy policy" },
    notFound: {
      title: "This page does not exist",
      body: "The address may have changed or contains a typo.",
      cta: "Go to homepage",
    },
  },
} as const;

/**
 * Struktūras tips ar platinātām (string, ne literal) lapu vērtībām - salīdzina
 * ATSLĒGAS, ne konkrēto tekstu. `typeof dict.lv` viens pats (ar `as const`) nederētu:
 * tas fiksē katru vērtību kā literal tipu (piem. "Sākums"), tāpēc `dict.en`
 * (ar atšķirīgu tekstu "Home") NEKAD nebūtu piešķirams, pat ja visas atslēgas sakrīt.
 */
type DictShape<T> = { [K in keyof T]: T[K] extends string ? string : DictShape<T[K]> };

export type Dict = DictShape<typeof dict.lv>;

// Tipa vārti: ja EN trūkst atslēgas, šī rinda ir TypeScript kļūda, ne klusa problēma.
const _enMatchesLv: Dict = dict.en;
void _enMatchesLv;

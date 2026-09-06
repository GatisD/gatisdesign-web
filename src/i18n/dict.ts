import {
  BUDGET_LABELS,
  SERVICE_LABELS,
} from "../../api/_lib/contact-fields";

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
      ai: "AI aģenti un automatizācija",
      seo: "SEO, GEO un AEO",
    },
    lang: { label: "Valodas izvēle", lv: "LV", en: "EN" },
    footer: {
      rights: "Visas tiesības aizsargātas",
      privacy: "Privātuma politika",
      /** Kājenes portreta vieta. Redzama tikai izstrādē un priekšskatījumā. */
      portraitSlot: "Portrets vai 15 sekunžu video darba vidē - vēl jāuzņem",
      location: "Gatis Daugavietis · Rīga · Latvija",
      backToTop: "Atpakaļ uz augšu",
    },
    notFound: {
      title: "Šādas lapas nav",
      body: "Iespējams, adrese ir mainīta vai ierakstīta ar kļūdu. Sāc no sākumlapas vai apskati darbus.",
      cta: "Uz sākumu",
    },
    cookies: {
      text: "Šajā mājaslapā izmantoju sīkdatnes, lai nodrošinātu lapas darbību un anonīmi analizētu apmeklējumu. Vairāk -",
      privacyLink: "privātuma politikā",
      acceptAll: "Pieņemt visas",
      necessaryOnly: "Tikai nepieciešamās",
    },
    /**
     * Kontaktforma. Izvēlņu uzraksti nāk no api/_lib/contact-fields.ts, jo tos
     * pašus vārdus serveris ieraksta e-pastā - divas kopijas nozīmētu, ka formā
     * un vēstulē kādreiz būs rakstīts dažādi.
     */
    form: {
      kicker: "Projekta pieprasījums",
      title: "Aizpildi formu",
      lede: "Jo konkrētāk aprakstīsi, jo konkrētāka būs pirmā atbilde.",
      optional: "pēc izvēles",
      nameLabel: "Vārds, uzvārds",
      namePlaceholder: "Jānis Bērziņš",
      emailLabel: "E-pasts",
      emailPlaceholder: "janis@uznemums.lv",
      serviceLabel: "Pakalpojums",
      servicePlaceholder: "Izvēlies pakalpojumu",
      serviceOptions: SERVICE_LABELS.lv,
      budgetLabel: "Budžeta diapazons",
      budgetPlaceholder: "Izvēlies diapazonu",
      budgetOptions: BUDGET_LABELS.lv,
      timelineLabel: "Vēlamais termiņš",
      timelinePlaceholder: "Piemēram, divi mēneši vai līdz septembrim",
      messageLabel: "Par projektu",
      messagePlaceholder: "Ko vajag, kam tas domāts un kas jau ir gatavs",
      consentBefore: "Piekrītu, ka mani dati tiek apstrādāti saskaņā ar",
      consentLink: "privātuma politiku",
      consentAfter: ".",
      honeypotLabel: "Uzņēmums (šo lauku neaizpildi)",
      submit: "Nosūtīt pieprasījumu",
      replyTime: "Atbildu vienas darba dienas laikā.",
      sending: "Sūta...",
      successTitle: "Paldies, pieprasījums ir saņemts",
      successBody:
        "Apstiprinājumu nosūtīju uz norādīto e-pastu. Darba dienās atbildu 24 stundu laikā.",
      successAgain: "Nosūtīt vēl vienu pieprasījumu",
      failureTitle: "Neizdevās nosūtīt pieprasījumu",
      failureFallback: "Raksti tieši uz",
      failureCode: "Kļūdas kods",
      errors: {
        nameShort: "Ievadi vārdu - vismaz divas rakstzīmes.",
        nameLong: "Vārds ir pārāk garš - līdz 100 rakstzīmēm.",
        emailInvalid: "Ievadi derīgu e-pasta adresi.",
        serviceRequired: "Izvēlies pakalpojumu.",
        budgetRequired: "Izvēlies budžeta diapazonu.",
        timelineLong: "Termiņa apraksts ir pārāk garš - līdz 120 rakstzīmēm.",
        messageShort: "Apraksts ir par īsu - vismaz 10 rakstzīmes.",
        messageLong: "Ziņa ir pārāk gara - līdz 3000 rakstzīmēm.",
        consentRequired: "Bez piekrišanas datu apstrādei nevaru nosūtīt pieprasījumu.",
        validation: "Pārbaudi iezīmētos laukus.",
        rateLimit: "Pārāk daudz mēģinājumu īsā laikā. Mēģini vēlreiz pēc dažām minūtēm.",
        network: "Neizdevās sazināties ar serveri. Pārbaudi savienojumu un mēģini vēlreiz.",
        server: "Serverī radās kļūda, un vēstule netika nosūtīta.",
      },
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
    footer: {
      rights: "All rights reserved",
      privacy: "Privacy policy",
      portraitSlot: "Portrait or workshop video - still to be shot",
      location: "Gatis Daugavietis · Riga · Latvia",
      backToTop: "Back to top",
    },
    notFound: {
      title: "This page does not exist",
      body: "The address may have changed or contains a typo. Start from the homepage or take a look at the work.",
      cta: "Go to homepage",
    },
    cookies: {
      text: "This site uses cookies for core functionality and anonymous analytics. More in the",
      privacyLink: "privacy policy",
      acceptAll: "Accept all",
      necessaryOnly: "Necessary only",
    },
    form: {
      kicker: "Project request",
      title: "Fill in the form",
      lede: "The more specific your brief, the more specific my first reply.",
      optional: "optional",
      nameLabel: "Full name",
      namePlaceholder: "John Smith",
      emailLabel: "Email",
      emailPlaceholder: "john@company.com",
      serviceLabel: "Service",
      servicePlaceholder: "Choose a service",
      serviceOptions: SERVICE_LABELS.en,
      budgetLabel: "Budget range",
      budgetPlaceholder: "Choose a range",
      budgetOptions: BUDGET_LABELS.en,
      timelineLabel: "Preferred timeline",
      timelinePlaceholder: "For example, two months or by September",
      messageLabel: "About the project",
      messagePlaceholder: "What you need, who it is for and what already exists",
      consentBefore: "I agree that my data is processed according to the",
      consentLink: "privacy policy",
      consentAfter: ".",
      honeypotLabel: "Company (leave this field empty)",
      submit: "Send request",
      replyTime: "I reply within one working day.",
      sending: "Sending...",
      successTitle: "Thank you, your request has arrived",
      successBody:
        "A confirmation was sent to the email you provided. I reply within 24 hours on business days.",
      successAgain: "Send another request",
      failureTitle: "Sending failed",
      failureFallback: "Write directly to",
      failureCode: "Error code",
      errors: {
        nameShort: "Enter your name - at least two characters.",
        nameLong: "That name is too long - up to 100 characters.",
        emailInvalid: "Enter a valid email address.",
        serviceRequired: "Choose a service.",
        budgetRequired: "Choose a budget range.",
        timelineLong: "The timeline note is too long - up to 120 characters.",
        messageShort: "Describe the project in at least 10 characters.",
        messageLong: "The message is too long - up to 3000 characters.",
        consentRequired: "Without consent to data processing I cannot send the request.",
        validation: "A few fields need checking.",
        rateLimit: "Too many attempts in a short time. Try again in a few minutes.",
        network: "Could not reach the server. Check your connection and try again.",
        server: "The server hit an error and the email was not sent.",
      },
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

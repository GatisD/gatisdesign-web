import { useState, useEffect, useRef } from "react";
import { CONSENT_COOKIE_PREFIXES } from "@/lib/consent-cookies";
import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";

const STORAGE_KEY = "cookie_consent_v1";
const RESET_EVENT = "gd:cookie-settings";

type Consent = "all" | "necessary" | null;

// Window.gtag ir deklarēts src/vite-env.d.ts (viens avots, lai izvairītos no konfliktējošām deklarācijām)

/**
 * Domēni, ar kuriem Google Analytics varēja uzstādīt savu sīkdatni.
 *
 * Sīkdatni dzēš TIKAI tas pats domēna un ceļa pāris, ar kuru tā uzstādīta.
 * GA raksta uz reģistrējamā domēna ar punktu priekšā (`.gatisdesign.com`);
 * lokāli un preview vidē domēna atribūta var nebūt vispār. Tāpēc dzēšam pa
 * visiem trim variantiem - lieks `Max-Age=0` neko nesabojā, bet izlaists
 * variants nozīmē, ka sīkdatne paliek.
 */
function gaCookieDomains(host: string): string[] {
  const labels = host.split(".");
  const registrable = labels.length > 2 ? labels.slice(-2).join(".") : host;
  return ["", host, `.${registrable}`];
}

/**
 * Izdzēš sīkdatnes, ko uzstāda ar piekrišanu ielādētie rīki.
 *
 * Prefiksi nāk no `consent-cookies.ts`, ne no šīs funkcijas: to pašu sarakstu
 * lasa arī privātuma politika, tāpēc jauns rīks tiek notīrīts UN aprakstīts,
 * nevis tikai viens no diviem.
 *
 * Bez šī atteikums bija tikai vārdos: nomērīts 2026-09-06, ka pēc "Tikai
 * vajadzīgās" abas GA sīkdatnes palika pārlūkā un turpināja ceļot uz Google ar
 * to pašu pseidonīmo identifikatoru, kas radās piekrišanas laikā.
 */
function clearAnalyticsCookies(): void {
  if (typeof document === "undefined") return;
  const domains = gaCookieDomains(window.location.hostname);
  for (const raw of document.cookie.split(";")) {
    const name = raw.split("=")[0]?.trim();
    if (!name || !CONSENT_COOKIE_PREFIXES.some((pre) => name.startsWith(pre))) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

/**
 * Piekrišanas signāls uz Google - ABOS virzienos.
 *
 * Iepriekš `update` aizgāja tikai ar "granted". Atteikums pēc piekrišanas
 * nesūtīja neko, tāpēc GTM sesijā piekrišana palika spēkā līdz nākamajai lapas
 * ielādei, un divi hiti aizgāja ar `gcs=G111` jau pēc atteikuma.
 */
function applyConsent(consent: Exclude<Consent, null>): void {
  if (typeof window === "undefined") return;
  const value = consent === "all" ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
  // Notikums dataLayer, ne tikai `consent update`.
  //
  // Kāpēc abi: Consent Mode signāls pietiek GA4 birkai, kas piekrišanu apstrādā
  // pati. Pielāgotai HTML birkai ar "vajadzīga papildu piekrišana" ar to NEPIETIEK -
  // tās trigeris (visas lapas) nostrādā, pirms cilvēks ir atbildējis, un pēc
  // atbildes GTM to vairs neatkārto. Nomērīts dzīvajā lapā 2026-09-07: piekrišanas
  // stāvoklis GTM bija `analytics_storage: true`, bet birka neizpildījās ne pirmajā,
  // ne otrajā lapas atvērumā. Šis notikums dod trigeri, kas nostrādā PĒC atbildes.
  if (value === "granted") {
    window.dataLayer?.push({ event: "consent_granted" });
  }
  // Dzēšana iet PĒC signāla: pretējā secībā GA paspēj uzstādīt sīkdatni no jauna.
  if (value === "denied") clearAnalyticsCookies();
}

/**
 * Atver joslu no jauna UN atsauc jau doto piekrišanu. Izvēle glabājas
 * `localStorage`, ne sīkdatnē, tāpēc privātuma politikas vecais padoms "izdzēs
 * sīkdatnes pārlūkprogrammā" to neatiestatīja - vienīgais ceļš atpakaļ bija
 * tāds, kas nestrādā. Kājenes saite sauc šo funkciju.
 *
 * Atiestatīšana ir arī atsaukums, ne tikai jautājuma atkārtošana: cilvēks, kurš
 * spiež "Sīkdatņu iestatījumi", ir izteicis gribu, un līdz jaunai izvēlei
 * pareizais stāvoklis ir "liegts".
 */
export function openCookieSettings(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Privātais režīms vai bloķēta krātuve - josla parādīsies jebkurā gadījumā.
  }
  applyConsent("necessary");
  window.dispatchEvent(new Event(RESET_EVENT));
}

export default function CookieBanner() {
  const { t, path, locale } = useLocale();
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);
  const josla = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setConsent(readStored());
    const onReset = () => setConsent(null);
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, []);

  // Abi virzieni, ne tikai "all": saglabāts atteikums katrā lapas ielādē
  // atkārto `denied` un iztīra to, ko iepriekšēja piekrišana bija uzstādījusi.
  useEffect(() => {
    if (consent !== null) applyConsent(consent);
  }, [consent]);

  function readStored(): Consent {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "all" || stored === "necessary" ? stored : null;
    } catch {
      return null;
    }
  }

  function store(value: Exclude<Consent, null>) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ja krātuve nav pieejama, izvēle paliek spēkā tikai šai lapai.
    }
    setConsent(value);
  }

  // Joslas augstumu publicējam kā `--bottom-bar`: poga uz lapas augšu ceļas
  // virs tās, nevis palien apakšā. Augstums ir mērīts, ne uzminēts - josla ir
  // viena rinda platā ekrānā un divas šaurā.
  useEffect(() => {
    const sakne = document.documentElement;
    const redzama = mounted && consent === null;
    if (!redzama) {
      sakne.style.removeProperty("--bottom-bar");
      return;
    }
    const mers = () => {
      const h = josla.current?.offsetHeight;
      if (h) sakne.style.setProperty("--bottom-bar", `${h}px`);
    };
    mers();
    const ro = new ResizeObserver(mers);
    if (josla.current) ro.observe(josla.current);
    return () => {
      ro.disconnect();
      sakne.style.removeProperty("--bottom-bar");
    };
  }, [mounted, consent]);

  if (!mounted || consent !== null) return null;

  return (
    <div
      ref={josla}
      role="dialog"
      aria-label={locale === "lv" ? "Sīkdatņu paziņojums" : "Cookie notice"}
      // Necaurspīdīgs fons apzināti: ar bg-ink-900/95 un izpludinājumu virs
      // gaišā hero kadra teksta kontrasts nokrita līdz 1,2:1.
      //
      // Kompakta rinda, ne bloks. Iepriekš josla aizņēma 20% mobilā ekrāna un
      // pie 1280x800 aizsedza kontaktu formas pirmo lauku - lapa prasīja
      // atbildi uz jautājumu par sīkdatnēm, pirms ļāva sākt rakstīt.
      className="fixed inset-x-0 bottom-0 z-[200] border-t border-line-strong bg-ink-950 px-4 py-2.5 md:px-6 md:py-3"
    >
      <div className="mx-auto flex max-w-wrap flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {/* Rindas garums ir ierobežots arī te: pie 1440 px josla bija vienīgā
            vieta lapā, kur teksta rinda pārsniedza 100 zīmes. */}
        <p className="max-w-[68ch] text-[13px] leading-[1.4] text-paper-2 sm:text-[14px] md:text-[15px]">
          {t.cookies.text}{" "}
          <Link
            to={path("privacy")}
            className="border-b border-line-amber text-paper transition-colors duration-300 hover:text-amber"
          >
            {t.cookies.privacyLink}
          </Link>
          .
        </p>
        <div className="flex w-full flex-shrink-0 gap-2 sm:w-auto">
          {/* Abas pogas ir vienlīdz viegli sasniedzamas un vienlīdz saprotamas
              (EDPB 07/2020): atteikums nav paslēpts aiz "Iestatījumi". */}
          <button
            type="button"
            onClick={() => store("necessary")}
            className="min-h-[44px] flex-1 whitespace-nowrap rounded-full border border-line-strong px-4 text-[13px] text-paper transition-colors duration-300 hover:border-amber hover:text-amber active:border-amber active:text-amber sm:flex-initial sm:px-5 sm:text-[14px]"
          >
            {t.cookies.necessaryOnly}
          </button>
          <button
            type="button"
            onClick={() => store("all")}
            className="min-h-[44px] flex-1 whitespace-nowrap rounded-full bg-paper px-4 text-[13px] font-medium text-ink-900 transition-colors duration-300 hover:bg-amber hover:text-on-amber active:bg-amber-soft active:text-on-amber sm:flex-initial sm:px-5 sm:text-[14px]"
          >
            {t.cookies.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}

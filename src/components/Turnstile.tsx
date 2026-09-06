import { useEffect, useRef, useState } from "react";

/**
 * Cloudflare Turnstile - robotu pārbaude bez uzdevuma cilvēkam.
 *
 * Šeit nav nekādas animācijas un nekādas atklāšanas: komponente vai nu
 * nerenderē neko, vai rezervē 65 px un tajos ieliek logrīku.
 *
 * Skripts ielādējas TIKAI pēc pirmā pieskāriena formai (fokuss vai klikšķis
 * kādā laukā). Kontaktforma dzīvo lapas apakšā, un ~60 KB no trešās puses
 * domēna nav tas, ko lapa drīkst lejupielādēt hero attēla laikā. Cilvēks, kurš
 * lapu tikai izlasa, Cloudflare nepieprasa nemaz.
 *
 * Ja `VITE_TURNSTILE_SITE_KEY` nav uzstādīts, komponente nerenderē neko un
 * forma strādā tieši tā, kā strādāja iepriekš. Servera pusē tas pats: bez
 * `TURNSTILE_SECRET_KEY` pārbaude tiek izlaista (api/_lib/contact-core.ts).
 */

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";
const SCRIPT_ID = "cf-turnstile";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const TURNSTILE_FIELD = "cf-turnstile-response";
export const turnstileEnabled = SITE_KEY !== "";

let scriptPromise: Promise<void> | null = null;

/** Viens skripts uz lapu, arī tad, ja komponente tiek uzstādīta atkārtoti. */
function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.turnstile) resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile skriptu neizdevās ielādēt"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function Turnstile({
  onToken,
  resetSignal = 0,
  locale,
}: {
  onToken: (token: string) => void;
  /** Skaitītājs: katra maiņa atiestata logrīku pēc neveiksmīga iesnieguma. */
  resetSignal?: number;
  locale: "lv" | "en";
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const tokenRef = useRef(onToken);
  const [armed, setArmed] = useState(false);

  tokenRef.current = onToken;

  // 1. Pirmais pieskāriens formai ieslēdz skriptu. Klausītājs sēž uz formas,
  //    ne uz dokumenta, tāpēc lapas pārējā ritināšana neko neielādē.
  useEffect(() => {
    if (!turnstileEnabled || armed) return;
    const form = hostRef.current?.closest("form");
    if (!form) return;
    const arm = () => setArmed(true);
    form.addEventListener("focusin", arm, { once: true });
    form.addEventListener("pointerdown", arm, { once: true, passive: true });
    return () => {
      form.removeEventListener("focusin", arm);
      form.removeEventListener("pointerdown", arm);
    };
  }, [armed]);

  // 2. Logrīks. Explicit render, lai vieta lapā būtu rezervēta jau iepriekš un
  //    izkārtojums nelēktu (CLS).
  useEffect(() => {
    if (!turnstileEnabled || !armed) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return;
        if (widgetRef.current !== null) return;
        widgetRef.current = window.turnstile.render(hostRef.current, {
          sitekey: SITE_KEY,
          theme: "dark",
          action: "contact",
          language: locale,
          // Pilnvaru padodam paši JSON ķermenī, tāpēc slēptais lauks nav vajadzīgs.
          "response-field": false,
          callback: (token) => tokenRef.current(token),
          "expired-callback": () => tokenRef.current(""),
          "error-callback": () => tokenRef.current(""),
        });
      })
      .catch(() => {
        // Bloķēts skripts nedrīkst nogalināt formu: pilnvaras nebūs, serveris
        // atbildēs ar skaidru kļūdu, un zem tās ir e-pasta ceļš.
        tokenRef.current("");
      });
    return () => {
      cancelled = true;
      // Logrīku noņemam, ne tikai atmetam atsauci. Cloudflare tur savu iekšējo
      // reģistru; bez `remove` katra atgriešanās uz kontaktu lapu atstāj tur
      // vienu mirušu ierakstu un vienu bāreni iframe. Ar klientu puses
      // navigāciju to var izdarīt daudzas reizes vienā sesijā.
      if (widgetRef.current !== null) {
        try {
          window.turnstile?.remove(widgetRef.current);
        } catch {
          // Ja skripts jau ir pazudis, nav ko noņemt - tas nav kļūda.
        }
        widgetRef.current = null;
      }
    };
  }, [armed, locale]);

  // Atiestatīšana pēc neveiksmīga iesnieguma. `resetSignal === 0` pārbaude te
  // bija lieka: pirmajā uzstādīšanā logrīka vēl nav, un `widgetRef.current`
  // to jau sedz. Divi nosacījumi vienam gadījumam slēpj, kurš no tiem strādā.
  useEffect(() => {
    if (widgetRef.current === null) return;
    window.turnstile?.reset(widgetRef.current);
    tokenRef.current("");
  }, [resetSignal]);

  if (!turnstileEnabled) return null;

  return (
    <div className={armed ? "mt-7" : undefined}>
      {/* Vietu rezervējam TIKAI pēc pirmā pieskāriena formai. Iepriekš šeit
          stāvēja tukšs 65 px bloks, un telefonā tas izskatījās pēc cauruma
          starp piekrišanu un pogu. Nobīde pēc lietotāja darbības CLS neskaita. */}
      <div ref={hostRef} className={armed ? "min-h-[65px]" : undefined} />
    </div>
  );
}

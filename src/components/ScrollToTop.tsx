import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleContext";

/**
 * Poga atpakaļ uz lapas augšu.
 *
 * Trīs lēmumi, kas te ir apzināti:
 *
 * 1. PARĀDĀS PĒC PUSOTRA EKRĀNA, ne uzreiz. Īsās lapās (privātuma politika,
 *    404) tā citādi stāvētu visu laiku un būtu troksnis, nevis palīgs.
 *
 * 2. RITINĀŠANU KLAUSĀS AR rAF SLĒDZI. `scroll` notikumu plūsma ir blīva -
 *    `setState` katrā no tiem liktu React strādāt visu ritināšanas laiku.
 *    Šeit stāvokli maina tikai tad, kad tas tiešām mainās.
 *
 * 3. CEĻAS VIRS SĪKDATŅU JOSLAS. Josla ir `fixed bottom-0` ar z-200, tāpēc
 *    poga pie `bottom-6` tai palīstu apakšā. Joslas augstumu nolasa no
 *    `--bottom-bar`, ko tā pati uzstāda; ja joslas nav, mainīgais ir 0.
 *
 * `prefers-reduced-motion` gadījumā lēciens ir tūlītējs: ritināšanas animācija
 * pāri visai lapai ir tieši tas, ko šis iestatījums izslēdz.
 */
export default function ScrollToTop() {
  const { locale } = useLocale();
  const [redzama, setRedzama] = useState(false);
  const gaida = useRef(false);

  useEffect(() => {
    function novertet() {
      gaida.current = false;
      setRedzama(window.scrollY > window.innerHeight * 1.5);
    }
    function onScroll() {
      if (gaida.current) return;
      gaida.current = true;
      window.requestAnimationFrame(novertet);
    }
    novertet();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function uzAugsu() {
    const lens = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: lens ? "auto" : "smooth" });
    // Fokusu atdodam lapas sākumam, lai ar tastatūru nākamais Tab turpinātu
    // no augšas, nevis no vietas, kur poga stāvēja.
    document.getElementById("saturs")?.focus?.();
  }

  const virsraksts = locale === "lv" ? "Atpakaļ uz lapas augšu" : "Back to top";

  return (
    <button
      type="button"
      onClick={uzAugsu}
      aria-label={virsraksts}
      title={virsraksts}
      // `pointer-events-none`, kamēr poga ir caurspīdīga: citādi tā ķertu
      // klikšķus arī tad, kad to neredz.
      className={[
        "fixed right-5 z-[150] grid h-11 w-11 place-items-center rounded-full",
        "border border-line-strong bg-ink-950/90 text-paper backdrop-blur",
        "transition-[opacity,transform] duration-300 ease-dir",
        "hover:bg-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
        redzama ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2",
      ].join(" ")}
      style={{ bottom: "calc(1.5rem + var(--bottom-bar, 0px))" }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 19V5M12 5l-7 7M12 5l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

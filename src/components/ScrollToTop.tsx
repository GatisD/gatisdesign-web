import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { getLenis } from "./SmoothScroll";

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
 * 4. RITINA AR LENIS, NE AR `window.scrollTo`. Lapā strādā Lenis, un tas tur
 *    savu iekšējo pozīciju, kuru katrā kadrā uzraksta logam. `window.scrollTo`
 *    tāpēc zaudē: Lenis nākamajā kadrā uzliek atpakaļ savu.
 *
 *    Tas nebija teorija - mērīts: klikšķis 0-400 ms pēc ritināšanas nenostrādāja
 *    nemaz (5216 -> 5600 px, tas ir, lapa turpināja slīdēt UZ LEJU), un tikai
 *    pēc 1200 ms, kad Lenis inerce jau bija beigusies, poga strādāja. Tieši
 *    tāpēc tā "ne vienmēr" strādāja: tā strādāja tikai tad, ja pirms klikšķa
 *    biji nogaidījis.
 *
 *    To pašu jau zināja `ScrollManager` un rīkojās pareizi; poga bija palikusi
 *    bez šī labojuma.
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
    const lenis = getLenis();
    if (lenis) {
      // `force` - arī tad, ja instance ir apturēta (atvērta mobilā izvēlne).
      // `lock` NAV: ja cilvēks ceļā pagriež ritenīti, viņš pārņem vadību, un
      // tas ir pareizi. Salauzts bija tikai gadījums, kad neviens neko negrieza
      // un poga tāpat nestrādāja.
      lenis.scrollTo(0, { force: true, duration: lens ? 0 : 0.9 });
    } else {
      // Lenis nav, kad lietotājam ir prefers-reduced-motion.
      window.scrollTo({ top: 0, behavior: lens ? "auto" : "smooth" });
    }
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
        // Akcenta pildījums, tumša bultiņa. Uz dzeltenā #1A1206 ir 9,50:1;
        // pati poga pret grafīta lapu ir 9,50:1, tāpēc malas tai vairs
        // nevajag - uz tumša fona dzeltens aplis ir robeža pats par sevi.
        "bg-amber text-on-amber [box-shadow:0_10px_30px_-12px_rgb(30_215_96_/_0.55)]",
        "transition-[opacity,transform,background-color] duration-300 ease-dir",
        "hover:bg-amber-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper",
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

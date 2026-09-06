import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { getLenis } from "./SmoothScroll";

/**
 * Ritināšanas pozīcija maršruta maiņā.
 *
 * Ar Lenis vien `window.scrollTo(0, 0)` nepietiek: Lenis tur savu iekšējo
 * pozīciju un nākamajā kadrā to atgriež atpakaļ, tāpēc pēc pārejas uz citu
 * sadaļu lietotājs palika tur, kur bija - vidū vai pie kājenes. Tāpēc pozīcija
 * tiek likta abās vietās: Lenis (`immediate`, `force` - arī tad, ja instance ir
 * apturēta ar atvērtu mobilo izvēlni) un pašā logā (ja Lenis nav, jo lietotājam
 * ir prefers-reduced-motion).
 *
 * Trīs gadījumi, ne viens:
 *  - jauna lapa (PUSH/REPLACE) -> augša;
 *  - hash saite (#sadaļa) -> uz elementu ar fiksētās galvenes atkāpi;
 *  - pārlūka atpakaļ/uz priekšu (POP) -> tā pozīcija, kur lietotājs bija.
 *
 * `useLayoutEffect` (ne `useEffect`) tāpēc, ka pozīcijai jābūt vietā pirms
 * pirmā kadra - citādi jaunā lapa uz mirkli pazibsni vecajā ritinājumā.
 */

/** Fiksētās galvenes augstums (72 px) plus gaiss, lai virsraksts nelīp pie joslas. */
const HEADER_OFFSET = 96;

/** location.key -> ritinājums. Dzīvo tikai sesijas laikā, kā pati vēsture. */
const positions = new Map<string, number>();

/** SSR laikā layout efekta nav, un React par to brīdina. */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function jumpTo(y: number) {
  const target = Math.max(0, Math.round(y));
  getLenis()?.scrollTo(target, { immediate: true, force: true });
  window.scrollTo(0, target);
}

export default function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const keyRef = useRef(location.key);

  // Pārlūka paša atjaunošana tiek izslēgta: to dara šī komponente, un divi
  // atjaunotāji viens otram traucē.
  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  // Pozīcija tiek pierakstīta ritinot, lai pēc "atpakaļ" tā jau būtu zināma.
  useEffect(() => {
    keyRef.current = location.key;
    const onScroll = () => positions.set(keyRef.current, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      positions.set(keyRef.current, window.scrollY);
      window.removeEventListener("scroll", onScroll);
    };
  }, [location.key]);

  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;

    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const el = document.getElementById(id);
      if (el) {
        jumpTo(el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);
        return;
      }
    }

    if (navType === "POP") {
      const saved = positions.get(location.key);
      if (typeof saved === "number") {
        jumpTo(saved);
        return;
      }
    }

    jumpTo(0);
  }, [location.key, location.hash, navType]);

  return null;
}

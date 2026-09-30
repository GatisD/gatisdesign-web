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
 * Četri gadījumi, ne viens:
 *  - jauna lapa (PUSH/REPLACE) -> augša;
 *  - hash saite (#sadaļa) -> uz elementu ar fiksētās galvenes atkāpi;
 *  - pārlūka atpakaļ/uz priekšu (POP) -> tā pozīcija, kur lietotājs bija;
 *  - pārlāde vai atgriešanās uz izmestu cilni -> pēdējā pozīcija no
 *    `sessionStorage` (sk. komentāru pie `SESIJAS_PREFIKSS`).
 *
 * `useLayoutEffect` (ne `useEffect`) tāpēc, ka pozīcijai jābūt vietā pirms
 * pirmā kadra - citādi jaunā lapa uz mirkli pazibsni vecajā ritinājumā.
 */

/**
 * Fiksētās galvenes augstums plus gaiss, lai virsraksts nelīp pie joslas.
 *
 * Nāk no `--galvene` (76 px telefonā, 92 px no md), ne no konstantes: te stāvēja
 * 96 px, kas bija patiess, kamēr galvene bija 72 px. Pēc logo palielināšanas
 * galvene kļuva 92 px, un hash saite virsrakstu novietoja 4 px zem joslas.
 */
function headerOffset(): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--galvene").trim();
  const px = parseFloat(v);
  return (Number.isFinite(px) ? px : 92) + 24;
}

/** location.key -> ritinājums. Dzīvo tikai sesijas laikā, kā pati vēsture. */
const positions = new Map<string, number>();

/** SSR laikā layout efekta nav, un React par to brīdina. */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function jumpTo(y: number) {
  const target = Math.max(0, Math.round(y));
  getLenis()?.scrollTo(target, { immediate: true, force: true });
  window.scrollTo(0, target);
}

/**
 * Pārlāde un cilnes izmešana.
 *
 * `positions` dzīvo modulī, tāpēc pārlāde to iztukšo, un `scrollRestoration`
 * ir "manual" - pārlūks pozīciju vairs neatjauno pats. Rezultāts bija tāds, ka
 * telefonā, atgriežoties uz cilni, kuru Safari atmiņas trūkuma dēļ bija
 * izmetis, cilvēks nonāca lapas augšā. To ziņoja apmeklētājs 2026-09-29.
 *
 * Tāpēc pozīcija dublējas `sessionStorage`, atslēga ir ADRESE, ne
 * `location.key`: atslēga pārlādi nepārdzīvo, adrese pārdzīvo. `sessionStorage`
 * pārdzīvo gan pārlādi, gan cilnes atjaunošanu, un pazūd līdz ar cilni - tieši
 * tik ilgi, cik šī pozīcija ir aktuāla.
 */
const SESIJAS_PREFIKSS = "gd-ritinajums:";

function sesijasAtslega(): string {
  return `${SESIJAS_PREFIKSS}${window.location.pathname}${window.location.search}`;
}

/** Privātajā režīmā un pie pilnas kvotas `sessionStorage` met kļūdu. Pozīcija
 *  nav tā vērta, lai tās dēļ krīt lapa, tāpēc abas puses ir klusas. */
function pierakstitSesija(y: number): void {
  try {
    window.sessionStorage.setItem(sesijasAtslega(), String(Math.round(y)));
  } catch {
    /* bez pieraksta iztiksim */
  }
}

function nolasitSesija(): number | null {
  try {
    const v = window.sessionStorage.getItem(sesijasAtslega());
    if (v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/**
 * Pārlādē lapa vēl aug: slinkie attēli un fonti ienāk pēc pirmā kadra. Viens
 * lēciens uz 2000 px tiek nogriezts līdz tābrīža dokumenta augstumam, un
 * cilvēks nonāk pusceļā. Tāpēc pozīciju liek atkārtoti, kamēr lapa izaug,
 * bet ne ilgāk par sekundi - pēc tam tā jau būtu cīņa ar paša lietotāja ritinājumu.
 */
function atjaunotPecIelades(y: number): void {
  jumpTo(y);

  let meginajumi = 0;
  const beigt = () => {
    window.clearInterval(id);
    for (const n of NOTIKUMI) window.removeEventListener(n, beigt);
  };

  // Ja cilvēks pats paņem ritentiņu vai pieskaras ekrānam, atjaunošana beidzas
  // uzreiz. Citādi tā vilktu viņu atpakaļ vēl veselu sekundi.
  const NOTIKUMI = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  for (const n of NOTIKUMI) window.addEventListener(n, beigt, { passive: true, once: true });

  const id = window.setInterval(() => {
    meginajumi += 1;
    if (Math.abs(window.scrollY - y) <= 2) {
      beigt();
      return;
    }
    // Lēciens ir jēdzīgs tikai tad, ja lapa jau ir pietiekami gara.
    if (document.documentElement.scrollHeight - window.innerHeight >= y) jumpTo(y);
    if (meginajumi >= 10) beigt();
  }, 100);
}

export default function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const keyRef = useRef(location.key);
  const pirmaIelade = useRef(true);

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

  // Pozīcija tiek pierakstīta ritinot. Klausītājs ir viens uz visu sesiju un
  // lasa atslēgu no ref, tāpēc maršruta maiņa to nepārtrauc.
  //
  // Atmiņā raksta katrā notikumā (tas ir lēts), `sessionStorage` - ne biežāk kā
  // reizi 250 ms, jo tā ir sinhrona rakstīšana uz diska, un ritināšanas
  // notikumi telefonā nāk katrā kadrā.
  useEffect(() => {
    let pedejais = 0;
    const onScroll = () => {
      positions.set(keyRef.current, window.scrollY);
      const tagad = Date.now();
      if (tagad - pedejais >= 250) {
        pedejais = tagad;
        pierakstitSesija(window.scrollY);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pēdējais pieraksts pirms cilne pazūd. `pagehide` ir vienīgais notikums, ko
  // iOS Safari tiešām izsauc, kad cilni izmet vai lietotājs pāriet uz citu
  // programmu; `beforeunload` tur ir neuzticams. `visibilitychange` ķer arī
  // ekrāna nobloķēšanu.
  useEffect(() => {
    const pieraksti = () => pierakstitSesija(window.scrollY);
    const paslepjot = () => {
      if (document.visibilityState === "hidden") pieraksti();
    };
    window.addEventListener("pagehide", pieraksti);
    document.addEventListener("visibilitychange", paslepjot);
    return () => {
      window.removeEventListener("pagehide", pieraksti);
      document.removeEventListener("visibilitychange", paslepjot);
    };
  }, []);

  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // Karogs tiek nodzēsts ŠEIT, ne atjaunošanas zarā. Hash saite un POP zars
    // izlec ar `return`, un, ja karogs paliktu celts, nākamā pāreja uz jaunu
    // lapu vairs neaizvestu uz augšu, bet uz kādu vecu saglabātu pozīciju.
    const irPirmaIelade = pirmaIelade.current;
    pirmaIelade.current = false;

    /**
     * Aizejošās lapas pozīcija tiek nolasīta ŠEIT un pirms jebkura lēciena.
     * Šis efekts izpildās pirms kadra, un logā vēl stāv iepriekšējās lapas
     * ritinājums. Ja to pierakstīja pasīvais efekts (tas iet pēc kadra), tur
     * jau bija jaunās lapas nulle - un "atpakaļ" atgriezās lapas augšā, nevis
     * tur, kur cilvēks bija.
     */
    if (keyRef.current !== location.key) {
      positions.set(keyRef.current, window.scrollY);
      keyRef.current = location.key;
    }

    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const el = document.getElementById(id);
      if (el) {
        jumpTo(el.getBoundingClientRect().top + window.scrollY - headerOffset());
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

    // Pirmā ielāde šajā cilnē: atmiņā nekā nav, bet `sessionStorage` var būt.
    // Tikai pirmajā reizē - vēlāk pārejas starp lapām joprojām ved uz augšu.
    if (irPirmaIelade) {
      const noSesijas = nolasitSesija();
      if (noSesijas !== null) {
        atjaunotPecIelades(noSesijas);
        return;
      }
    }

    jumpTo(0);
  }, [location.key, location.hash, navType]);

  return null;
}

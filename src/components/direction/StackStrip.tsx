import { useEffect, useRef } from "react";
import { stackTools } from "@/data/stack";

/**
 * Rīku slaideris zem hero: kartītes brauc pa viegli viļņotu, raustītu zaļu
 * līniju - "nedaudz kā amerikāņu kalniņi, bet ne daudz" (Gatis, 2026-09-08).
 *
 * KĀPĒC JS, NE CSS MARQUEE. Taisnu celiņu var vilkt ar vienu `transform`
 * animāciju (tā dara klientu logo josla). Viļņotam celiņam kartītes vertikālā
 * vieta ir atkarīga no tās horizontālās vietas, un CSS to nevar sasaistīt
 * atsaucīgi: `offset-path` koordinātas ir absolūti pikseļi, kas nesekotu
 * platumam. Tāpēc viens rAF cikls rēķina katrai kartītei x (lineāri, ar
 * pārnesi) un y = A·sin(2πx/λ), un tas pats sinuss zīmē līniju kā SVG ceļu.
 * Kartītes tāpēc STĀV uz līnijas ar precizitāti līdz pikselim - to pārbauda
 * mērījums, ne acs. Un tās ir līnijai PARALĒLAS: pagrieziens ir pieskares
 * leņķis (atan no atvasinājuma) kartītes centrā, līdz ±10° (Gatis, 08.09.:
 * "lai slīd attiecīgajā leņķī, šobrīd slīd taisni"). Cena: 13 `transform` ieraksti kadrā, bez izkārtojuma; tas
 * ir mazāk nekā ciparu lietus canvas hero fonā.
 *
 * ĢEOMETRIJA. Periods ir N·solis, kur solis = lielākais no (kadrs + divas
 * kartītes) / N un (kartīte + 44 px). Platā ekrānā visas 13 kartītes ir uz
 * ceļa vienlaikus ar vienādu soli; šaurā ekrānā solis paliek vismaz kartīte +
 * 44 px, un daļa kartīšu gaida aiz malas. Abos gadījumos attālums starp
 * kaimiņiem ir vienāds, un cilpai šuves nav: kartīte, kas aiziet pa kreisi
 * aiz aizkara, atgriežas pa labi aiz aizkara.
 *
 * BEZ JS un pirms hidratācijas kartītes stāv tajās pašās vietās pēc tās pašas
 * formulas ar 1200 px platumu - statiska viļņota rinda, ne tukšums. Pēc
 * pirmā mērījuma tās pārceļas uz īsto platumu.
 *
 * Aizkari malās (`.riki-aizkars`, src/index.css): fiksēta platuma laukumi ar
 * blur un grafīta gradientu, kartīšu BRĀĻI, ne vecāki (ligzdots
 * backdrop-filter Chrome zīmē plakanu laukumu, sk. .stikls-blur).
 *
 * BEZ CILVĒKA. Josla nereaģē ne uz ko: nav pogas, nav pauzes uz kursoru, nav
 * pacēluma uz hover, un kursors iet tai cauri (pointer-events: none) - Gata
 * lēmums 2026-09-08: "viņas vienkārši tur slīd bez nekāda interaction".
 * Kustība apstājas tikai tad, kad josla ir aizritināta prom, kad cilne nav
 * redzama, un pavisam pie `prefers-reduced-motion`. WCAG 2.2.2 gribētu
 * apturēšanas mehānismu; tas ir apzināti atlikts, un ja audits to pieprasa,
 * poga ir viena rinda.
 */

/** Ātrums px sekundē. Tas pats, ko deva 48 s marquee cilpa. */
const ATRUMS = 34;
/** Viļņa garums px. Uz 1440 px ir ap 2,5 viļņi - redzams kā vilnis, ne kā zigzags. */
const VILNIS = 560;
/** Viļņa augstums no viduslīnijas px. 16 uz 76 px kartītes ir "nedaudz". */
const AMPLITUDA = 16;
/** Mazākā atstarpe starp kartītēm px. */
const MIN_ATSTARPE = 44;
/** Platums, ar ko rēķina pirms hidratācijas un bez JS. */
const NOKLUSEJUMA_W = 1200;
/** Kartītes izmērs pirms mērījuma (CSS clamp maksimums). */
const NOKLUSEJUMA_FLIZE = 76;

const N = stackTools.length;

function vilnis(x: number): number {
  return AMPLITUDA * Math.sin((2 * Math.PI * x) / VILNIS);
}

/** Līnijas kāpums punktā x (dy/dx) - viļņa atvasinājums. */
function kapums(x: number): number {
  return AMPLITUDA * ((2 * Math.PI) / VILNIS) * Math.cos((2 * Math.PI * x) / VILNIS);
}

/** Kartītes pagrieziens grādos: pieskares leņķis līnijai tās centrā. Ar A=16 un
    λ=560 maksimums ir ±10,2° - vagoniņš seko sliedei, ne pats zvalstās. */
function leņķis(x: number): number {
  return (Math.atan(kapums(x)) * 180) / Math.PI;
}

/** Solis un periods no kadra platuma un kartītes izmēra. */
function geometrija(W: number, flize: number) {
  const pad = flize;
  const solis = Math.max((W + 2 * pad) / N, flize + MIN_ATSTARPE);
  return { pad, solis, periods: solis * N };
}

/** Kartītes centrs uz ceļa pie nobrauktā attāluma `dist` (px, pa kreisi). */
function centrs(i: number, dist: number, W: number, H: number, flize: number) {
  const { pad, solis, periods } = geometrija(W, flize);
  const raw = (i * solis - dist) % periods;
  const x = (raw < 0 ? raw + periods : raw) - pad;
  return { x, y: H / 2 + vilnis(x) };
}

function transformFor(i: number, dist: number, W: number, H: number, flize: number): string {
  const c = centrs(i, dist, W, H, flize);
  // Pagrieziens notiek ap kartītes centru (transform-origin noklusējums), un
  // centrs ar translate jau stāv uz līnijas - tāpēc kartīte gan sēž uz
  // sliedes, gan ir tai paralēla.
  return `translate3d(${(c.x - flize / 2).toFixed(2)}px, ${(c.y - flize / 2).toFixed(2)}px, 0) rotate(${leņķis(c.x).toFixed(2)}deg)`;
}

/** SVG ceļš līnijai: sinuss, ņemts ik pa 6 px. */
function celaD(W: number, H: number): string {
  let d = "";
  for (let x = 0; x <= W + 6; x += 6) d += `${x ? " L" : "M"}${x} ${(H / 2 + vilnis(x)).toFixed(2)}`;
  return d;
}

export default function StackStrip({ heading }: { heading: string }) {
  const josla = useRef<HTMLDivElement>(null);
  const cels = useRef<SVGSVGElement>(null);
  const kartes = useRef<(HTMLLIElement | null)[]>([]);
  const H0 = NOKLUSEJUMA_FLIZE + 2 * AMPLITUDA + 20;

  useEffect(() => {
    const el = josla.current;
    if (!el) return;
    const klusa = window.matchMedia("(prefers-reduced-motion: reduce)");
    let W = NOKLUSEJUMA_W;
    let H = H0;
    let flize = NOKLUSEJUMA_FLIZE;
    let dist = 0;
    let pedejais = 0;
    let redzams = true;
    let raf = 0;

    function zimet() {
      for (let i = 0; i < N; i += 1) {
        const li = kartes.current[i];
        if (li) li.style.transform = transformFor(i, dist, W, H, flize);
      }
    }

    function izmeri() {
      const r = el!.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      // offsetWidth, ne getBoundingClientRect: kartīte ir pagriezta, un tās
      // ietverošais taisnstūris ir platāks par pašu kartīti (52 px kļūst 59 px
      // pie 9°). Ar to solis un centrs nobīdījās par 4 px - mērījums to
      // noķēra, acs to redzētu kā kartīti, kas nesēž uz līnijas.
      flize = kartes.current[0]?.offsetWidth || NOKLUSEJUMA_FLIZE;
      const svg = cels.current;
      if (svg) {
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.firstElementChild?.setAttribute("d", celaD(W, H));
      }
      zimet();
    }

    function cikls(tagad: number) {
      raf = window.requestAnimationFrame(cikls);
      const dt = Math.min(tagad - pedejais, 100) / 1000;
      pedejais = tagad;
      if (!redzams) return;
      dist += ATRUMS * dt;
      zimet();
    }

    izmeri();
    if (!klusa.matches) {
      pedejais = performance.now();
      raf = window.requestAnimationFrame(cikls);
    }

    const izmers = new ResizeObserver(() => izmeri());
    izmers.observe(el);
    const vero = new IntersectionObserver((ieraksti) => {
      redzams = ieraksti.some((e) => e.isIntersecting);
    });
    vero.observe(el);
    const cilne = () => {
      redzams = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", cilne);
    const rezims = () => {
      if (klusa.matches) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        pedejais = performance.now();
        raf = window.requestAnimationFrame(cikls);
      }
    };
    klusa.addEventListener("change", rezims);

    return () => {
      window.cancelAnimationFrame(raf);
      izmers.disconnect();
      vero.disconnect();
      document.removeEventListener("visibilitychange", cilne);
      klusa.removeEventListener("change", rezims);
    };
  }, [H0]);

  return (
    <section className="border-b border-line bg-ink-900 py-[clamp(34px,5vw,64px)]" aria-labelledby="stack-h">
      {/* Virsraksts ir tikai ekrānlasītājam. Redzamais uzraksts "Rīki, ar ko
          strādāju" te bija un ir izņemts: zīmes pašas pasaka, kas tās ir. */}
      <h2 id="stack-h" className="sr-only">
        {heading}
      </h2>

      {/* Pilna platuma josla: konveijers iet līdz ekrāna malai un tur izplūst. */}
      <div ref={josla} className="riki-josla h-[calc(clamp(52px,5.9vw,76px)+52px)]">
        <svg
          ref={cels}
          aria-hidden="true"
          className="riki-cels"
          viewBox={`0 0 ${NOKLUSEJUMA_W} ${H0}`}
          preserveAspectRatio="none"
        >
          {/* 7 px svītra, 9 px atstarpe, akcenta krāsā 55%: līnija, ne otra josla. */}
          <path d={celaD(NOKLUSEJUMA_W, H0)} fill="none" stroke="#1ed760" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="7 9" vectorEffect="non-scaling-stroke" />
        </svg>
        <ul className="absolute inset-0">
          {stackTools.map((tool, i) => (
            <li
              key={tool.slug}
              ref={(n) => {
                kartes.current[i] = n;
              }}
              className="stack-karte absolute left-0 top-0 grid h-[clamp(52px,5.9vw,76px)] w-[clamp(52px,5.9vw,76px)] place-items-center rounded-[clamp(13px,1.6vw,21px)] will-change-transform"
              style={{ transform: transformFor(i, 0, NOKLUSEJUMA_W, H0, NOKLUSEJUMA_FLIZE) }}
            >
              {/* Zīmola SVG nāk gatavs, ar zīmola pašu krāsām. `dangerouslySetInnerHTML`
                  te ir drošs: saturs ir būves laika konstante šajā repo, ne ievade. */}
              <svg
                viewBox={tool.viewBox}
                style={{ width: tool.w, height: tool.h }}
                preserveAspectRatio="xMidYMid meet"
                /* Vercel un Notion kontūra zīmējas ar `currentColor`. Uz gaišas
                   kartes tā ir tumša - tieši tā, kā abi zīmoli to lieto uz balta. */
                color="#0d0b09"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: tool.body }}
              />
              <span className="sr-only">{tool.name}</span>
            </li>
          ))}
        </ul>
        <div aria-hidden="true" className="riki-aizkars riki-aizkars-k" />
        <div aria-hidden="true" className="riki-aizkars riki-aizkars-l" />
      </div>
    </section>
  );
}

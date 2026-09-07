import Label from "@/components/ui/Label";
import { stackTools } from "@/data/stack";

/**
 * Rīku josla zem hero.
 *
 * Kustība ir CSS, ne JS, un tā ir uzbūvēta ap vienu triku: katrai kartei ir
 * NEGATĪVA animācijas aizture. Tas nozīmē, ka nulltajā sekundē katra karte jau
 * stāv citā peldējuma fāzē, un lapa miera stāvoklī - pirmajā kadrā, sīktēlā,
 * koplietotajā saitē - izskatās dzīva, nevis kā divpadsmit kartes vienā līnijā,
 * kas gaida animācijas sākumu.
 *
 * Slīpums un peldēšana ir DIVAS atsevišķas īpašības (`rotate` un `translate`),
 * ne viena `transform`. Tāpēc `prefers-reduced-motion` var apturēt peldēšanu,
 * neiztaisnojot kartes: kam kustība traucē, tas redz to pašu kompozīciju, tikai
 * mierā. Ar vienu `transform` slīpums pazustu kopā ar kustību.
 *
 * Skaitļi nāk no indeksa, ne no `Math.random()`: lapa tiek būvēta statiski, un
 * nejaušība serverī un pārlūkā dotu divus dažādus izkārtojumus, tātad
 * hidratācijas neatbilstību.
 */

/** Slīpums grādos. Neregulārs ritms, ne pieaugoša rinda - tā tā izskatītos pēc vēdekļa. */
const SLIPUMI = [-6, 4, -3, 7, -5, 3, -7, 5, -2, 6, -4, 2];
/** Statiska vertikāla nobīde. Rinda viļņojas, bet paliek lasāma kā rinda. */
const NOBIDES = [0, 14, -8, 10, -12, 6, 16, -6, 8, -10, 12, 0];

export default function StackStrip({ heading }: { heading: string }) {
  return (
    <section className="border-b border-line bg-ink-900 py-[clamp(34px,5vw,64px)]" aria-labelledby="stack-h">
      <div className="mx-auto w-full max-w-wrap px-5 sm:px-8 lg:px-10">
        <h2 id="stack-h" className="sr-only">
          {heading}
        </h2>
        <div className="flex justify-center">
          <Label>{heading}</Label>
        </div>

        <ul className="mt-[clamp(20px,3vw,34px)] flex flex-wrap items-center justify-center gap-[clamp(10px,1.4vw,18px)]">
          {stackTools.map((tool, i) => (
            <li
              key={tool.slug}
              className="stack-karte group grid h-[clamp(52px,6vw,72px)] w-[clamp(52px,6vw,72px)] shrink-0 place-items-center rounded-[clamp(13px,1.5vw,19px)] border border-line bg-ink-card sm:[margin-top:var(--nobide)]"
              style={{
                ["--slipums" as string]: `${SLIPUMI[i % SLIPUMI.length]}deg`,
                ["--nobide" as string]: `${NOBIDES[i % NOBIDES.length]}px`,
                ["--zimols" as string]: tool.hover,
                animationDuration: `${6 + ((i * 7) % 5) * 0.7}s`,
                animationDelay: `${-(i * 0.62)}s`,
              }}
            >
              {tool.path ? (
                <svg
                  viewBox={tool.viewBox}
                  style={{ width: tool.w, height: tool.h }}
                  preserveAspectRatio="xMidYMid meet"
                  fill="currentColor"
                  aria-hidden="true"
                  className="stack-zime text-paper-dim transition-colors duration-300 group-hover:text-[var(--zimols)]"
                >
                  <path d={tool.path} />
                </svg>
              ) : (
                /* Adobe: vārds paša burtveidolā, jo Adobe savu zīmi lūdza neizmantot. */
                <span
                  aria-hidden="true"
                  className="stack-zime text-[clamp(9px,1vw,11px)] font-medium uppercase tracking-[0.06em] text-paper-dim transition-colors duration-300 group-hover:text-[var(--zimols)]"
                >
                  {tool.name}
                </span>
              )}
              {/* Zīme ir `aria-hidden`, nosaukums nāk no šejienes: ekrānlasītājam
                  josla ir divpadsmit rīku saraksts, ne divpadsmit attēli. */}
              <span className="sr-only">{tool.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

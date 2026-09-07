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
const SLIPUMI = [-6, 4, -3, 7, -5, 3, -7, 5, -2, 6, -4, 2, -5];
/** Statiska vertikāla nobīde. Rinda viļņojas, bet paliek lasāma kā rinda. */
const NOBIDES = [0, 14, -8, 10, -12, 6, 16, -6, 8, -10, 12, -4, 0];

export default function StackStrip({ heading }: { heading: string }) {
  return (
    <section className="border-b border-line bg-ink-900 py-[clamp(34px,5vw,64px)]" aria-labelledby="stack-h">
      <div className="mx-auto w-full max-w-wrap px-5 sm:px-8 lg:px-10">
        {/* Virsraksts ir tikai ekrānlasītājam. Redzamais uzraksts "Rīki, ar ko
            strādāju" te bija un ir izņemts: zīmes pašas pasaka, kas tās ir, un
            paraksts virs tām lasījās kā apakšvirsraksts sadaļai, kuras nav. */}
        <h2 id="stack-h" className="sr-only">
          {heading}
        </h2>

        <div className="relative">
          <div aria-hidden="true" className="stack-atspidums pointer-events-none absolute inset-x-0 -inset-y-8" />
        <ul className="relative flex flex-wrap items-center justify-center gap-[clamp(9px,1.25vw,18px)]">
          {stackTools.map((tool, i) => (
            <li
              key={tool.slug}
              className="stack-karte grid h-[clamp(52px,5.9vw,76px)] w-[clamp(52px,5.9vw,76px)] shrink-0 place-items-center rounded-[clamp(13px,1.6vw,21px)] sm:[margin-top:var(--nobide)]"
              style={{
                ["--slipums" as string]: `${SLIPUMI[i % SLIPUMI.length]}deg`,
                ["--nobide" as string]: `${NOBIDES[i % NOBIDES.length]}px`,
                animationDuration: `${6 + ((i * 7) % 5) * 0.7}s`,
                animationDelay: `${-(i * 0.62)}s`,
              }}
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
              {/* Zīme ir `aria-hidden`, nosaukums nāk no šejienes: ekrānlasītājam
                  josla ir divpadsmit rīku saraksts, ne divpadsmit attēli. */}
              <span className="sr-only">{tool.name}</span>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </section>
  );
}

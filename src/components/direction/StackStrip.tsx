import { useState } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { stackTools } from "@/data/stack";

/**
 * Rīku slaideris zem hero.
 *
 * 2026-09-08: bija peldoša, sašķiebta kartīšu rinda; Gatis gribēja, lai zīmes
 * SLĪD pa raustītu zaļu līniju kā slaideris - ģeometriski vienmērīgi, ar
 * lielāku atstarpi, un malās izplūst, kad aiziet. Tā tas ir tagad: krelles uz
 * auklas, kas lēni brauc pa kreisi.
 *
 * Kustība ir tā pati, kas klientu logo joslai (sk. ClientMarquee): divi
 * identiski saraksti cits aiz cita un celiņš, kas pārvietojas tieši par pusi
 * sava platuma, tāpēc šuve nav redzama. Viss notiek ar `transform` uz
 * kompozitora - galvenais pavediens kadru nezīmē, un tas ir vienīgais
 * iemesls, kāpēc slaideris lapai maksā tik maz, cik maksā. Otrais saraksts
 * ir `aria-hidden`: ekrānlasītājam tie ir trīspadsmit rīki, ne divdesmit seši.
 *
 * Malas izplūst ar diviem aizkariem (`.riki-aizkars`, src/index.css): katrs ir
 * fiksēta platuma laukums ar backdrop-filter blur un grafīta gradientu, kas
 * beigās kļūst necaurspīdīgs - zīme, kas tuvojas malai, kļūst gan neskaidra,
 * gan tumša, un tieši tā izskatās "aiziet". Aizkari ir kartīšu BRĀĻI, ne
 * vecāki: ligzdots backdrop-filter Chrome zīmē plakanu laukumu (sk. .stikls),
 * un maska uz vecāka kartīšu stiklam atņemtu fonu.
 *
 * Apturēšana trijos veidos, un tikai pirmais strādā bez peles: poga (WCAG
 * 2.2.2 - kustība ilgst krietni virs piecām sekundēm, tāpēc vajag mehānismu, ne
 * kursoru). Kursors virs joslas aptur arī - tad kartīte var paaugstināties uz
 * hover, nebraucot prom no pirksta. `prefers-reduced-motion` gadījumā celiņš
 * stāv, zīmes aplaužas rindās, dublikāts, aizkari un līnija ir paslēpti.
 */
export default function StackStrip({ heading }: { heading: string }) {
  const { locale } = useLocale();
  const lv = locale === "lv";
  const [paused, setPaused] = useState(false);

  const list = (duplicate: boolean) => (
    <ul
      className="flex shrink-0 items-center gap-[clamp(26px,3.4vw,56px)] pe-[clamp(26px,3.4vw,56px)]"
      aria-hidden={duplicate || undefined}
    >
      {stackTools.map((tool) => (
        <li
          key={tool.slug}
          className="stack-karte grid h-[clamp(52px,5.9vw,76px)] w-[clamp(52px,5.9vw,76px)] shrink-0 place-items-center rounded-[clamp(13px,1.6vw,21px)]"
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
              josla ir rīku saraksts, ne attēlu rinda. */}
          <span className="sr-only">{tool.name}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="border-b border-line bg-ink-900 py-[clamp(34px,5vw,64px)]" aria-labelledby="stack-h">
      {/* Virsraksts ir tikai ekrānlasītājam. Redzamais uzraksts "Rīki, ar ko
          strādāju" te bija un ir izņemts: zīmes pašas pasaka, kas tās ir. */}
      <h2 id="stack-h" className="sr-only">
        {heading}
      </h2>

      {/* Josla ir pilna platuma, ne lapas kolonnas: konveijers, kas beidzas
          pie satura malas, izskatās pēc nogrieztas tabulas; tāds, kas iet līdz
          ekrāna malai un tur izplūst, izskatās pēc kustības cauri kadram. */}
      <div className="riki-josla py-2" data-paused={paused || undefined}>
        <div aria-hidden="true" className="riki-celins" />
        <div className="riki-track flex items-center">
          {list(false)}
          {list(true)}
        </div>
        <div aria-hidden="true" className="riki-aizkars riki-aizkars-k" />
        <div aria-hidden="true" className="riki-aizkars riki-aizkars-l" />
      </div>

      <div className="mx-auto flex w-full max-w-wrap justify-end px-5 pt-3 sm:px-8 lg:px-10">
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          aria-pressed={paused}
          // Lapā ir divas šādas pogas (klientu joslai ir sava). Pilnais
          // nosaukums pasaka, kuru joslu tā aptur; redzamais vārds paliek tā
          // sākumā, lai balss vadība "spied Apturēt" joprojām trāpa.
          aria-label={
            paused ? (lv ? "Turpināt rīku joslu" : "Resume the tools strip") : lv ? "Apturēt rīku joslu" : "Pause the tools strip"
          }
          className="font-label text-label uppercase text-paper-faint underline-offset-4 transition-colors duration-300 hover:text-amber hover:underline focus-visible:text-amber motion-reduce:hidden"
        >
          {paused ? (lv ? "Turpināt" : "Resume") : lv ? "Apturēt" : "Pause"}
        </button>
      </div>
    </section>
  );
}

import type { ReactNode } from "react";
import HeroMedia from "./HeroMedia";
import LineReveal from "@/components/animations/LineReveal";
import Reveal from "@/components/animations/Reveal";
import TableOfContents from "./TableOfContents";

/**
 * Pakalpojumu un iekšējo lapu galva.
 *
 * Izkārtojums ir plūsma, ne absolūtas pozīcijas: virsraksts, ievads un satura
 * rādītājs stāv cits zem cita ar `min-height`, tāpēc pie 1280x800 un pie 390 px
 * ievads paliek virs krokas, nevis uzbrauc uz pogas. Uppercase displejam
 * `line-height` nekad nav zem 1,04 - latviešu garumzīmes sēž virs cap-height un
 * ciešākā rindstarpā skar iepriekšējās rindas bāzes līniju.
 */
export default function PageHero({
  titleLines,
  lede,
  poster,
  video,
  posterPosition,
  toc,
  children,
}: {
  titleLines: string[];
  lede: string;
  poster: string;
  video?: string;
  posterPosition?: string;
  toc?: Array<{ id: string; label: string }>;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate flex min-h-[clamp(520px,72vh,760px)] flex-col justify-end overflow-hidden bg-ink-900 pb-16 md:pb-24 pt-[clamp(96px,16vw,200px)]">
      {/* brightness .45 -> .6: kopā ar veco pārklājumu augšējie 250 px pie
          390 px bija melns laukums ar vāju gaismas svītru, un tur nebija ko
          skatīties. Pārklājuma līkne (--scrim-page) augšā ir gaišāka, apakšā
          gandrīz vienlaidus - ievads sēž uz kadra, un pie kadra gaišākā punkta
          kontrasts bija nokritis līdz 2,5:1. */}
      <HeroMedia className="-z-[2]" poster={poster} src={video} position={posterPosition} eager brightness={0.6} />
      <div aria-hidden="true" className="absolute inset-0 -z-[1]" style={{ background: "var(--scrim-page)" }} />
      <div className="relative mx-auto w-full max-w-wrap px-5 sm:px-8 lg:px-10">
        <LineReveal
          as="h1"
          lines={titleLines}
          className="text-display font-bold uppercase text-paper"
        />
        <Reveal delay={0.18} className="mt-[clamp(20px,3vw,36px)] max-w-[62ch]">
          <p className="text-[clamp(1.02rem,1.4vw,1.25rem)] leading-[1.45] text-paper-2">
            <span aria-hidden="true" className="text-amber">
              &#8627;
            </span>{" "}
            {lede}
          </p>
        </Reveal>
        {children ? (
          <Reveal delay={0.26} className="mt-[clamp(22px,3vw,34px)]">
            {children}
          </Reveal>
        ) : null}
        {toc && toc.length > 0 ? (
          <Reveal delay={0.32} className="mt-[clamp(26px,3.4vw,44px)] border-t border-line pt-5">
            <TableOfContents items={toc} />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Bezgalīga josla. Saraksts tiek dublēts, un cilpa pārvieto sliedi par -50%.
 *
 * Atstarpe ir katra elementa `margin-inline-end`, nevis konteinera `gap`:
 * ar `gap` kopējais platums ir 2N*w + (2N-1)*g, un -50% nesakrīt ar periodu -
 * ik ciklu parādās pusatstarpes lēciens. Ar malu katram elementam periods ir
 * tieši N*(w+g), un šuve nav redzama.
 *
 * Loop dzīvo TIKAI uz `.marquee-track` (CSS animācija); pauze uz hover notiek
 * ar `animation-play-state`, nekad ar JS transform uz tā paša elementa.
 * Dublikāts ir `aria-hidden`, lai ekrānlasītājs sarakstu nenolasa divreiz.
 */
export default function Marquee({
  children,
  className,
  duration = 40,
}: {
  children: ReactNode;
  className?: string;
  /** Cikls sekundēs. Mobilajā lēnāk - mazā ekrānā tas pats ātrums traucē. */
  duration?: number;
}) {
  const items = Children.toArray(children);
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden ? "true" : undefined} className="flex shrink-0 items-center">
      {items.map((child, i) => (
        <li key={`${hidden ? "copy" : "item"}-${i}`} className="me-[clamp(28px,4vw,56px)]">
          {child}
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cn("marquee relative overflow-hidden", className)}>
      <div
        className="marquee-track flex w-max items-center"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "@/components/animations/Reveal";
import Label from "@/components/ui/Label";

type Rhythm = "sm" | "md" | "lg";
type Surface = "ink" | "ink-850" | "ink-950";

/**
 * Ritms konkrētos pikseļos, ne caur CSS mainīgo: mainīgais neļauj ne rīkiem,
 * ne pārlūka inspektoram redzēt, cik atkāpes tur reāli ir.
 */
/**
 * Vertikālais ritms. Telefonā tas ir mazāks nekā uz darbvirsmas: 390 px platā
 * ekrānā divas blakus sekcijas ar py-20 deva 160 px tukšuma, un tas lasās kā
 * caurums, ne kā elpa. Uz darbvirsmas gaisa daudzums nemainās.
 *
 * Skaitļi nāk no mērījuma, ne no gaumes: augšas un apakšas atkāpe saskaitās, un
 * pie py-14 divas blakus `lg` sekcijas telefonā deva 112 px tukšuma. Robeža ir
 * 110 px, tāpēc lielākā atkāpe ir py-12 (48 px): lg+lg = 96, lg+md = 88.
 */
const PAD: Record<Rhythm, string> = {
  sm: "py-8 md:py-16",
  md: "py-10 md:py-24",
  lg: "py-12 md:py-32",
};
const BG: Record<Surface, string> = {
  ink: "bg-ink-900",
  "ink-850": "bg-ink-850",
  "ink-950": "bg-ink-950",
};

/** Ārējais sekcijas ietvars: fons, ritms, platuma ierobežojums. */
export function Section({
  children,
  rhythm = "md",
  surface = "ink",
  className,
  id,
  labelledBy,
  ariaLabel,
}: {
  children: ReactNode;
  rhythm?: Rhythm;
  surface?: Surface;
  className?: string;
  id?: string;
  labelledBy?: string;
  ariaLabel?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      className={cn(BG[surface], PAD[rhythm], className)}
    >
      <div className="mx-auto w-full max-w-wrap px-5 sm:px-8 lg:px-10">{children}</div>
    </section>
  );
}

/**
 * Sekcijas virsraksts. Vienmēr PIRMS jebkuras etiķetes DOM secībā un pilnā
 * platumā virs abām kolonnām - tieši tā, kā to dara references dizains un kā
 * to prasa anti-slop vārti: etiķete virs virsraksta ir kickers.
 */
export function SectionTitle({
  children,
  id,
  size = "h2",
  className,
}: {
  children: ReactNode;
  id?: string;
  size?: "h2" | "giant";
  className?: string;
}) {
  return (
    <Reveal>
      <h2
        id={id}
        className={cn(
          size === "giant" ? "text-giant font-semibold" : "text-h2 font-medium max-w-[18ch]",
          className,
        )}
      >
        {children}
      </h2>
    </Reveal>
  );
}

/**
 * Forma C: etiķete kreisajā kolonnā, saturs labajā (1:2). Virsraksts jau ir
 * padots atsevišķi virs šī bloka, tāpēc etiķete šeit stāv pie satura, ne pie
 * virsraksta. `label` drīkst nebūt - tad kreisā kolonna paliek tukša un rinda
 * saglabā to pašu režģi.
 */
export function LabelRow({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  // Bez etiķetes kolonnu nav vispār. Iepriekš tukšā 1fr kolonna palika, un uz
  // garākajām lapām trešdaļa platuma bija tukša no augšas līdz apakšai -
  // vienpadsmit reižu pēc kārtas. Tukša kolonna nav ritms, tā ir ģeneratora pēda.
  if (!label) {
    return <div className={cn("min-w-0 max-w-[76ch]", className)}>{children}</div>;
  }
  return (
    <div className={cn("grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12", className)}>
      <div className="md:pt-1.5">
        <Label caps>({label})</Label>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Forma A: divas prozas kolonnas zem pilna platuma virsraksta. */
export function ProseColumns({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-x-12 gap-y-6 md:grid-cols-2", className)}>{children}</div>
  );
}

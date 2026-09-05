import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * DM Mono etiķete. Vienīgā vieta, kur lapā parādās monospace: sekcijas etiķete
 * sānu kolonnā, tabulas galva, mērvienība vai paraksts zem attēla.
 *
 * NEKAD virs virsraksta. Etiķete, kas stāv virs h2, ir kickers, un tas ir
 * aizliegts (sk. ~/.claude/agents/_shared/anti-slop-gate.md). Šeit tā vienmēr
 * ir vai nu blakus kolonnā PĒC virsraksta DOM secībā, vai pie datu bloka.
 */
export default function Label({
  children,
  tone = "dim",
  caps = false,
  className,
}: {
  children: ReactNode;
  tone?: "dim" | "amber" | "paper" | "on-paper";
  /** Versāls tiek izvēlēts apzināti, ne pēc teksta garuma. */
  caps?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-label text-label",
        caps && "uppercase",
        tone === "dim" && "text-paper-faint",
        tone === "amber" && "text-amber",
        tone === "paper" && "text-paper",
        tone === "on-paper" && "text-on-paper-dim",
        className,
      )}
    >
      {children}
    </span>
  );
}

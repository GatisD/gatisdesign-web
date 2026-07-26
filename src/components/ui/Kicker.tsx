import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export default function Kicker({ children, dim, className }: { children: ReactNode; dim?: boolean; className?: string }) {
  return (
    <span className={cn("block text-[11.5px] font-semibold uppercase tracking-[0.19em]", dim ? "text-paper-faint" : "text-amber", className)}>
      {children}
    </span>
  );
}

import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  to?: string;
  href?: string;
  type?: "button" | "submit";
  /**
   * `primary` ir vienīgā pill forma lapā - tā apzīmē vienu galveno darbību.
   * `link` ir teksta saite ar vara apakšlīniju; `outline` ir rāmis bez pildījuma.
   */
  variant?: "primary" | "outline" | "link";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
};

/**
 * Pogas. Direction noteikums: pill TIKAI primārajai darbībai, augstums 64 px
 * (52 px mobilajā), lai tā sakrīt ar formas lauku augstumu. Sekundārā darbība
 * nekad nav otra pill - citādi lapā ir divas "galvenās" pogas.
 */
export default function Button({
  children,
  to,
  href,
  type = "button",
  variant = "primary",
  className,
  disabled,
  onClick,
}: Props) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-[background-color,color,border-color,transform] duration-300 ease-dir",
    variant === "primary" &&
      "min-h-[56px] rounded-full bg-paper px-8 py-4 text-[17px] text-ink-900 hover:bg-amber hover:text-on-amber md:min-h-16 md:px-[34px] md:py-[18px] md:text-[18px]",
    variant === "outline" &&
      "min-h-[56px] rounded-full border border-line-strong px-8 py-4 text-[17px] text-paper hover:border-amber hover:text-amber md:min-h-16 md:px-[34px] md:py-[18px] md:text-[18px]",
    variant === "link" &&
      "border-b border-amber py-1.5 text-[17px] text-paper hover:text-amber md:text-[18px]",
    disabled && "pointer-events-none opacity-55",
    className,
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

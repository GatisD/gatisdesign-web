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
 *
 * Trīs stāvokļi, ne viens: hover, `:active` un `:disabled`. Bez `:active`
 * pieskāriens mobilajā nedod nekādu apstiprinājumu - poga izskatās nespiesta,
 * līdz nomainās lapa, un cilvēks spiež otrreiz.
 *
 * `link` variantam apakšsvītra sēž uz PAŠA teksta (iekšējs <span>), bet
 * klikšķa lauks ir 44 px augsts. Ja `border-b` būtu uz ārējā elementa,
 * apakšsvītra pēc lauka palielināšanas nokārtos 12 px zem teksta.
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
      "min-h-[56px] rounded-full bg-paper px-8 py-4 text-[17px] text-ink-900 hover:bg-amber hover:text-on-amber active:translate-y-px active:bg-amber-soft active:text-on-amber md:min-h-16 md:px-[34px] md:py-[18px] md:text-[18px]",
    variant === "outline" &&
      "min-h-[56px] rounded-full border border-line-strong px-8 py-4 text-[17px] text-paper hover:border-amber hover:text-amber active:translate-y-px active:border-amber active:text-amber md:min-h-16 md:px-[34px] md:py-[18px] md:text-[18px]",
    variant === "link" &&
      "min-h-[44px] py-1 text-[17px] text-paper hover:text-amber active:text-amber md:text-[18px]",
    disabled && "pointer-events-none cursor-not-allowed opacity-55",
    className,
  );
  const body = variant === "link" ? <span className="border-b border-amber pb-1.5">{children}</span> : children;
  if (to) {
    return (
      <Link to={to} className={cls} aria-disabled={disabled ? true : undefined}>
        {body}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} aria-disabled={disabled ? true : undefined}>
        {body}
      </a>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {body}
    </button>
  );
}

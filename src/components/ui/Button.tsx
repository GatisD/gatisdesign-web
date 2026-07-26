import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  to?: string;
  href?: string;
  variant?: "primary" | "ghost";
  size?: "md" | "sm";
  className?: string;
  onClick?: () => void;
};

export default function Button({ children, to, href, variant = "primary", size = "md", className, onClick }: Props) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300",
    size === "md" ? "min-h-[50px] px-[26px] text-[15px]" : "min-h-[44px] px-5 text-[14px]",
    variant === "primary"
      ? "bg-amber text-[#1a1206] shadow-[0_12px_40px_-14px_rgba(224,114,60,.65)] hover:bg-amber-soft hover:-translate-y-[2px]"
      : "border border-line-strong text-paper hover:border-amber hover:text-amber hover:-translate-y-[2px]",
    className,
  );
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button type="button" className={cls} onClick={onClick}>{children}</button>;
}

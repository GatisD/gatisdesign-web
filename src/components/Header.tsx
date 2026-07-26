import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";
import { getLenis } from "./SmoothScroll";
import Button from "./ui/Button";
import LanguageSwitch from "./LanguageSwitch";

export default function Header() {
  const { t, path } = useLocale();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const primaryLinks = [
    { to: path("home"), label: t.nav.home, end: true },
    { to: path("services.brand"), label: t.services.brand, end: false },
    { to: path("services.web"), label: t.services.web, end: false },
    { to: path("services.ai"), label: t.services.ai, end: false },
    { to: path("services.seo"), label: t.services.seo, end: false },
    { to: path("portfolio"), label: t.nav.portfolio, end: false },
    { to: path("about"), label: t.nav.about, end: false },
    { to: path("contact"), label: t.nav.contact, end: false },
  ];

  // Lapas maiņa aizver mobilo izvēlni.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Kad izvēlne atvērta: apstādina Lenis smooth scroll (ne tikai body overflow),
  // lai scroll-momentum nenoplūst zem overlay.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      getLenis()?.stop();
    } else {
      document.body.style.overflow = "";
      getLenis()?.start();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Escape aizver izvēlni un atgriež fokusu uz burgera pogu.
  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "whitespace-nowrap text-[13px] font-medium tracking-[0.01em] transition-colors duration-200",
      isActive ? "text-paper" : "text-paper-faint hover:text-paper",
    );

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex min-h-[44px] items-center border-b border-line px-4 py-4 text-2xl transition-colors duration-200",
      isActive ? "text-amber" : "text-paper hover:text-amber",
    );

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-line backdrop-blur-md"
        style={{ backgroundColor: "color-mix(in srgb, var(--ink-900) 78%, transparent)" }}
      >
        <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-4 px-[var(--pad-x)] md:h-24">
          <Link
            to={path("home")}
            className="flex shrink-0 flex-col whitespace-nowrap leading-none"
            aria-label={`${t.nav.home} - Gatis Design`}
          >
            <span className="font-accent text-xl italic text-paper md:text-2xl">Gatis Design</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-paper-faint">Rīga</span>
          </Link>

          <nav className="hidden flex-wrap items-center justify-end gap-x-5 gap-y-1 lg:flex">
            {primaryLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={desktopLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden lg:block">
              <LanguageSwitch />
            </div>
            <div className="hidden lg:block">
              <Button to={path("contact")} size="sm" className="whitespace-nowrap">
                {t.nav.cta}
              </Button>
            </div>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls={menuId}
              className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border border-line-strong text-paper transition-colors duration-200 hover:border-amber hover:text-amber lg:hidden"
            >
              <span className="sr-only">{mobileOpen ? t.nav.closeMenu : t.nav.openMenu}</span>
              {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          id={menuId}
          className="fixed inset-x-0 bottom-0 top-20 z-[100] overflow-y-auto bg-ink-900 md:top-24 lg:hidden"
        >
          <nav className="flex flex-col gap-1 p-6">
            {primaryLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={mobileLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex flex-col gap-6 px-6 pb-10">
            <LanguageSwitch />
            <Button to={path("contact")} className="w-full">
              {t.nav.cta}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

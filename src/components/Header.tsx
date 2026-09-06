import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";
import { getLenis } from "./SmoothScroll";
import LanguageSwitch from "./LanguageSwitch";
import Label from "./ui/Label";
import type { RouteKey } from "@/i18n/routes";

const SERVICE_KEYS: RouteKey[] = ["services.brand", "services.web", "services.ai", "services.seo"];
const SERVICE_LABEL = { "services.brand": "brand", "services.web": "web", "services.ai": "ai", "services.seo": "seo" } as const;

/**
 * Galvene.
 *
 * Fons un apakšlīnija parādās tikai pēc 40 px ritināšanas - virs hero attēla
 * josla ar fonu nogriež kadru, un Direction galva ir daļa no attēla, ne josla
 * virs tā.
 *
 * "Pakalpojumi" ir īsts atklājamais bloks ar četrām saitēm, nevis saite uz
 * lapu, kuras nav. Bez tā četri pakalpojumi navigācijā aizņemtu pusi joslas.
 */
export default function Header() {
  const { t, path } = useLocale();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  // Fons pēc 40 px. Pasīvs klausītājs, bez izkārtojuma mērījumiem render laikā.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Atvērta mobilā izvēlne aptur arī Lenis, ne tikai body overflow - citādi
  // ritināšanas inerce noplūst zem pārklājuma.
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

  useEffect(() => {
    if (!mobileOpen && !servicesOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (mobileOpen) {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
      setServicesOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mobileOpen, servicesOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "nav-underline relative text-[16px] font-medium transition-colors duration-300 active:text-amber",
      isActive ? "text-paper [--underline:1]" : "text-paper-2 hover:text-paper",
    );

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex min-h-[52px] items-center border-b border-line text-[clamp(1.25rem,5vw,1.6rem)] transition-colors duration-300 active:text-amber",
      isActive ? "text-amber" : "text-paper hover:text-amber",
    );

  // Ārējais elements dod 44 px klikšķa lauku, iekšējais - bāzes līnijas
  // līdzinājumu starp 19 px vārdzīmi un 11 px mono pilsētu. Ja abus liktu uz
  // viena elementa, `items-baseline` 44 px kastē vārdzīmi pieceltu augšā.
  const wordmark = (
    <Link
      to={path("home")}
      className="inline-flex min-h-[44px] shrink-0 items-center leading-none transition-colors duration-300 active:text-amber"
    >
      <span className="flex items-baseline gap-1.5">
        <span className="text-[19px] font-bold tracking-[-0.02em] text-paper md:text-[20px]">Gatis Design</span>
        <Label caps className="text-[11px]">
          Rīga
        </Label>
      </span>
    </Link>
  );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-dir",
          scrolled ? "border-b border-line bg-ink-900/85 backdrop-blur-md" : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-wrap items-center justify-between gap-6 px-5 sm:px-8 lg:px-10 md:h-[72px]">
          {wordmark}

          <nav aria-label={t.nav.services} className="hidden items-center gap-8 lg:flex">
            <NavLink to={path("portfolio")} className={linkClass}>
              {t.nav.portfolio}
            </NavLink>

            <div ref={servicesRef} className="relative">
              {/* Saite, ne poga: bez JS <button> neko nedarīja, un četras
                  pakalpojumu lapas bija sasniedzamas tikai no kājenes. Ar JS
                  klikšķis atver sarakstu (preventDefault), bez JS tas aizved uz
                  pirmo pakalpojumu lapu. */}
              <a
                href={path("services.web")}
                aria-expanded={servicesOpen}
                aria-controls={panelId}
                onClick={(e) => {
                  e.preventDefault();
                  setServicesOpen((v) => !v);
                }}
                className={cn(
                  "nav-underline relative cursor-pointer text-[16px] font-medium transition-colors duration-300 active:text-amber",
                  SERVICE_KEYS.some((k) => pathname === path(k))
                    ? "text-paper [--underline:1]"
                    : "text-paper-2 hover:text-paper",
                )}
              >
                {t.nav.services}
              </a>
              {servicesOpen ? (
                <div
                  id={panelId}
                  className="absolute right-0 top-[calc(100%+18px)] z-10 w-[300px] rounded-card border border-line bg-ink-card p-2 [box-shadow:var(--shadow-panel)]"
                >
                  <ul>
                    {SERVICE_KEYS.map((key) => (
                      <li key={key}>
                        <NavLink
                          to={path(key)}
                          className="flex min-h-[48px] items-center rounded-field px-4 text-[16px] text-paper-2 transition-colors duration-200 hover:bg-ink-800 hover:text-amber"
                        >
                          {t.services[SERVICE_LABEL[key as keyof typeof SERVICE_LABEL]]}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <NavLink to={path("about")} className={linkClass}>
              {t.nav.about}
            </NavLink>
            <NavLink
              to={path("contact")}
              className={({ isActive }) =>
                cn(
                  "nav-underline relative text-[16px] font-medium text-amber transition-colors duration-300",
                  isActive && "[--underline:1]",
                )
              }
            >
              {t.nav.contact}
            </NavLink>
            <LanguageSwitch />
          </nav>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            className="-mr-2 inline-flex h-[46px] w-[46px] items-center justify-center text-paper transition-colors duration-300 hover:text-amber lg:hidden"
          >
            <span className="sr-only">{mobileOpen ? t.nav.closeMenu : t.nav.openMenu}</span>
            <span aria-hidden="true" className="flex w-8 flex-col gap-[6px]">
              <span
                className={cn(
                  "h-px w-full bg-current transition-transform duration-300 ease-dir",
                  mobileOpen && "translate-y-[7px] rotate-45",
                )}
              />
              <span className={cn("h-px w-full bg-current transition-opacity duration-200", mobileOpen && "opacity-0")} />
              <span
                className={cn(
                  "h-px w-full bg-current transition-transform duration-300 ease-dir",
                  mobileOpen && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div id={menuId} className="fixed inset-x-0 bottom-0 top-16 z-[100] overflow-y-auto bg-ink-900 md:top-[72px] lg:hidden">
          <nav aria-label={t.nav.services} className="flex flex-col px-5 sm:px-8 lg:px-10 pt-6">
            <NavLink to={path("portfolio")} className={mobileLinkClass}>
              {t.nav.portfolio}
            </NavLink>
            {SERVICE_KEYS.map((key) => (
              <NavLink key={key} to={path(key)} className={mobileLinkClass}>
                {t.services[SERVICE_LABEL[key as keyof typeof SERVICE_LABEL]]}
              </NavLink>
            ))}
            <NavLink to={path("about")} className={mobileLinkClass}>
              {t.nav.about}
            </NavLink>
            <NavLink to={path("contact")} className={mobileLinkClass}>
              {t.nav.contact}
            </NavLink>
          </nav>
          <div className="px-5 sm:px-8 lg:px-10 pb-12 pt-8">
            <LanguageSwitch />
          </div>
        </div>
      ) : null}
    </>
  );
}

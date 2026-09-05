import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LocaleProvider } from "@/i18n/LocaleContext";
import { dict } from "@/i18n/dict";
import type { Locale } from "@/i18n/routes";
import Header from "./Header";
import Footer from "./Footer";
import SmoothScroll from "./SmoothScroll";
import CookieBanner from "./CookieBanner";

function ScrollToTopOnNav() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);
  return null;
}

/**
 * Lapas ietvars.
 *
 * `main` ir bez augšējās atkāpes apzināti: galvene ir caurspīdīga un stāv virs
 * hero attēla (fons tai parādās tikai pēc 40 px ritināšanas), tāpēc atkāpi
 * pārvalda pati lapas galva. Lapas bez media hero (privātuma politika, 404)
 * savu atkāpi pieliek pašas.
 */
export default function Layout({ locale }: { locale: Locale }) {
  // HelmetProvider pievieno vite-react-ssg SSR saknē, tāpēc te to neietin vēlreiz.
  return (
    <LocaleProvider locale={locale}>
      <a
        href="#saturs"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-amber focus:px-4 focus:py-2 focus:text-on-amber"
      >
        {dict[locale].nav.skipToContent}
      </a>
      <TooltipProvider>
        <SmoothScroll />
        <div className="flex min-h-screen flex-col bg-ink-900 text-paper">
          <ScrollToTopOnNav />
          <Header />
          <main id="saturs" className="flex flex-1 flex-col">
            <Outlet />
          </main>
          <Footer />
          <CookieBanner />
        </div>
        <Sonner />
      </TooltipProvider>
    </LocaleProvider>
  );
}

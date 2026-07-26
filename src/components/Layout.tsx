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

export default function Layout({ locale }: { locale: Locale }) {
  // HelmetProvider is injected by vite-react-ssg at the SSR root,
  // so we don't wrap it again here (would create a competing context).
  return (
    <LocaleProvider locale={locale}>
      <a
        href="#saturs"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-amber focus:px-4 focus:py-2 focus:text-[#0d0b09]"
      >
        {dict[locale].nav.skipToContent}
      </a>
      <TooltipProvider>
        <SmoothScroll />
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <ScrollToTopOnNav />
          <Header />
          <main id="saturs" className="flex-1 flex flex-col pt-20 md:pt-24">
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

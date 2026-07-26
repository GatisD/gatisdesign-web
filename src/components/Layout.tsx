import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LocaleProvider } from "@/i18n/LocaleContext";
import type { Locale } from "@/i18n/routes";
import Header from "./Header";
import Footer from "./Footer";
import SmoothScroll from "./SmoothScroll";
import CookieBanner from "./CookieBanner";

const queryClient = new QueryClient();

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
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SmoothScroll />
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <ScrollToTopOnNav />
            <Header />
            <main className="flex-1 flex flex-col pt-20 md:pt-24">
              <Outlet />
            </main>
            <Footer />
            <CookieBanner />
          </div>
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </LocaleProvider>
  );
}

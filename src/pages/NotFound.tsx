import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import Button from "@/components/ui/Button";
import Kicker from "@/components/ui/Kicker";
import { useLocale } from "@/i18n/LocaleContext";

export default function NotFound() {
  const { locale, t, path } = useLocale();
  return (
    <>
      <SEO locale={locale} noindex title={t.notFound.title} description={t.notFound.body} />

      {/* Negatīvā augšmala pavelk tumšo fonu zem fiksētās galvenes (Layout main pt-20/24). */}
      <div className="-mt-20 flex flex-1 flex-col bg-ink-900 pt-20 text-paper md:-mt-24 md:pt-24">
        <section className="relative flex flex-1 items-center overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(56% 68% at 50% 0%, rgba(224,114,60,.18), transparent 66%)",
            }}
          />
          <div className="relative mx-auto grid w-full max-w-wrap min-h-[52vh] content-center justify-items-center gap-6 px-[var(--pad-x)] py-[var(--sec-y)] text-center">
            <Kicker>404</Kicker>
            <h1 className="max-w-[16ch] text-[clamp(2.2rem,5.6vw,4.4rem)] font-light leading-[1.04] tracking-[-0.042em] [text-wrap:balance]">
              {t.notFound.title}
            </h1>
            <p className="max-w-[52ch] text-[clamp(1rem,1.2vw,1.12rem)] leading-[1.62] text-paper-2">
              {t.notFound.body}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3.5">
              <Button to={path("home")}>
                {t.notFound.cta}
                <ArrowRight size={17} aria-hidden="true" />
              </Button>
              <Button to={path("portfolio")} variant="ghost">
                {t.nav.portfolio}
              </Button>
              <Button to={path("contact")} variant="ghost">
                {t.nav.contact}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

import SEO from "@/components/SEO";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import { useLocale } from "@/i18n/LocaleContext";

export default function NotFound() {
  const { locale, t, path } = useLocale();
  return (
    <>
      <SEO locale={locale} noindex title={t.notFound.title} description={t.notFound.body} />

      <section className="flex flex-1 items-center bg-ink-900 pb-sec-lg pt-[clamp(120px,18vw,220px)]">
        <div className="mx-auto w-full max-w-wrap px-pad-x">
          <p className="mb-6">
            <Label caps>(404)</Label>
          </p>
          <h1 className="max-w-[16ch] text-display-2 font-bold uppercase text-paper">
            {t.notFound.title}
          </h1>
          <p className="mt-8 max-w-[52ch] text-[clamp(1.02rem,1.4vw,1.25rem)] leading-[1.5] text-paper-2">
            {t.notFound.body}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button to={path("home")}>{t.notFound.cta}</Button>
            <Button to={path("portfolio")} variant="link">
              {t.nav.portfolio}
            </Button>
            <Button to={path("contact")} variant="link">
              {t.nav.contact}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

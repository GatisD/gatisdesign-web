import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SEO from "@/components/SEO";
import JsonLd from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import Kicker from "@/components/ui/Kicker";
import ContentSection from "./ContentSection";
import FaqList from "./FaqList";
import { buildServiceSchema } from "./serviceSchema";
import { serviceContent, type ServiceRouteKey } from "@/content";
import { useLocale } from "@/i18n/LocaleContext";
import { CONTACT_EMAIL } from "@/lib/site";

const SERVICE_KEYS: ServiceRouteKey[] = [
  "services.brand",
  "services.web",
  "services.ai",
  "services.seo",
];

const LABEL_BY_KEY = {
  "services.brand": "brand",
  "services.web": "web",
  "services.ai": "ai",
  "services.seo": "seo",
} as const;

/** metaTitle jau beidzas ar zīmola nosaukumu, bet to pieliek arī SEO komponente. */
const stripBrand = (title: string) => title.replace(/\s*\|\s*Gatis Design\s*$/, "");

export default function ServicePage({ routeKey }: { routeKey: ServiceRouteKey }) {
  const { locale, t, path } = useLocale();
  const content = serviceContent[routeKey];
  const isLv = locale === "lv";

  // TODO: EN saturs vēl nav uzrakstīts. Līdz tam EN maršruti rāda LV tekstu ar
  // noindex, lai Google neindeksē latviešu saturu zem angļu URL. Kad tulkojums
  // ir gatavs: pievieno src/content/en/*.json, izvēlies pēc locale un noņem noindex.
  const noindex = !isLv;

  const otherServices = SERVICE_KEYS.filter((key) => key !== routeKey);

  return (
    // Negatīvā augšmala pavelk tumšo fonu zem fiksētās galvenes (Layout main
    // pt-20/24), lai zem caurspīdīgās galvenes nepaliktu gaiša josla.
    <div className="-mt-20 flex-1 bg-ink-900 pt-20 text-paper md:-mt-24 md:pt-24">
      <SEO
        routeKey={routeKey}
        locale={locale}
        title={stripBrand(content.metaTitle)}
        description={content.metaDescription}
        noindex={noindex}
      />
      <JsonLd data={buildServiceSchema(content, routeKey, locale)} />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 62% at 8% -10%, rgba(224,114,60,.18), transparent 62%)",
          }}
        />
        <div className="relative mx-auto max-w-wrap px-[var(--pad-x)] pb-[clamp(44px,6vw,84px)] pt-[clamp(36px,5vw,76px)]">
          <Kicker>{t.services[LABEL_BY_KEY[routeKey]]}</Kicker>
          <h1 className="mt-5 max-w-[19ch] text-[clamp(2.1rem,5.4vw,4.3rem)] font-light leading-[1.03] tracking-[-0.042em] [text-wrap:balance]">
            {content.h1}
          </h1>

          <div className="mt-[clamp(28px,3.4vw,44px)] max-w-[66ch] border-l-2 border-amber bg-ink-850 px-6 py-6 md:px-8 md:py-7">
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.19em] text-paper-faint">
              {isLv ? "Īsā atbilde" : "Short answer"}
            </span>
            <p className="text-[clamp(1.02rem,1.3vw,1.19rem)] leading-relaxed text-paper">
              {content.directAnswer}
            </p>
          </div>

          <div className="mt-[clamp(26px,3vw,38px)] flex flex-wrap gap-3">
            <Button to={path("contact")}>{t.nav.cta}</Button>
            <Button to={path("portfolio")} variant="ghost">
              {t.nav.portfolio}
            </Button>
          </div>
        </div>
      </section>

      {/* SATURA SADAĻAS */}
      <div className="mx-auto max-w-wrap px-[var(--pad-x)] py-[clamp(48px,6vw,88px)]">
        <div className="space-y-[clamp(38px,5vw,72px)]">
          {content.sections.map((section, index) => (
            <ContentSection key={section.heading} section={section} index={index} />
          ))}
        </div>
      </div>

      {/* FAQ */}
      <section className="border-y border-line bg-ink-850">
        <div className="mx-auto max-w-wrap px-[var(--pad-x)] py-[var(--sec-y)]">
          <Kicker className="mb-4">FAQ</Kicker>
          <h2 className="mb-[clamp(30px,4vw,52px)] max-w-[20ch] text-[clamp(1.85rem,3.8vw,3rem)] font-light leading-[1.06] tracking-[-0.038em] [text-wrap:balance]">
            {isLv ? "Bieži uzdotie jautājumi" : "Frequently asked questions"}
          </h2>
          <FaqList items={content.faq} />
        </div>
      </section>

      {/* IEKŠĒJĀS SAITES UZ PĀRĒJIEM PAKALPOJUMIEM */}
      <section className="mx-auto max-w-wrap px-[var(--pad-x)] py-[clamp(52px,6vw,92px)]">
        <Kicker className="mb-4" dim>
          {isLv ? "Citi pakalpojumi" : "Other services"}
        </Kicker>
        <ul className="border-t border-line">
          {otherServices.map((key) => (
            <li key={key}>
              <Link
                to={path(key)}
                className="group flex items-center justify-between gap-6 border-b border-line py-6 transition-colors duration-300 hover:text-amber"
              >
                <span className="text-[clamp(1.2rem,2.4vw,1.9rem)] font-light tracking-[-0.03em]">
                  {t.services[LABEL_BY_KEY[key]]}
                </span>
                <ArrowUpRight
                  size={22}
                  aria-hidden="true"
                  className="shrink-0 text-paper-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-amber"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-line bg-ink-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(52% 74% at 50% 0%, rgba(224,114,60,.16), transparent 66%)",
          }}
        />
        <div className="relative mx-auto max-w-wrap px-[var(--pad-x)] py-[var(--sec-y)] text-center">
          <h2 className="mx-auto max-w-[18ch] text-[clamp(1.95rem,4.4vw,3.4rem)] font-light leading-[1.04] tracking-[-0.042em] [text-wrap:balance]">
            {isLv ? "Runāsim par tavu projektu" : "Let us talk about your project"}
          </h2>
          {content.cta ? (
            <p className="mx-auto mt-6 max-w-[62ch] text-paper-dim">{content.cta}</p>
          ) : null}
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Button>
            <Button to={path("contact")} variant="ghost">
              {t.nav.contact}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

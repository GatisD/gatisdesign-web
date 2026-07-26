import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import Kicker from "@/components/ui/Kicker";
import ContentSection from "@/components/content/ContentSection";
import FaqList from "@/components/content/FaqList";
import LinkedEmail from "@/components/content/LinkedEmail";
import { aboutContent } from "@/content/pages";
import { useLocale } from "@/i18n/LocaleContext";
import { pathFor, type RouteKey } from "@/i18n/routes";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL, SOCIAL } from "@/lib/site";

/**
 * Par mani. Viss redzamais teksts nāk no src/content/lv/par-mani.json - šeit ir
 * tikai iezīmējums. Divas lietas ir apzināti tekstā, ne attēlā: hero "Īsā
 * atbilde" bloks un procesa soļi, jo tieši šos gabalus meklētāji un AI atbildes
 * citē visbiežāk.
 */

const SERVICE_KEYS = [
  "services.brand",
  "services.web",
  "services.ai",
  "services.seo",
] as const;

const LABEL_BY_KEY = {
  "services.brand": "brand",
  "services.web": "web",
  "services.ai": "ai",
  "services.seo": "seo",
} as const;

/** Ietin vienu frāzi akcenta stilā. Ja frāzes nav, teksts paliek nemainīts. */
function accent(text: string, phrase: string, className: string): ReactNode {
  const at = text.indexOf(phrase);
  if (at === -1) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className={className}>{phrase}</span>
      {text.slice(at + phrase.length)}
    </>
  );
}

export default function ParMani() {
  const { locale, t, path } = useLocale();
  const isLv = locale === "lv";

  // TODO: EN saturs vēl nav uzrakstīts. Līdz tam EN maršruts rāda LV tekstu ar
  // noindex, tāpat kā pakalpojumu un portfolio lapas.
  const noindex = !isLv;

  const abs = (key: RouteKey) => `${SITE_URL}${pathFor(key, locale)}`;

  /** Person: kas es esmu, ko protu (četras darba līnijas) un kur mani atrast. */
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Gatis Daugavietis",
    alternateName: SITE_NAME,
    jobTitle: "Web dizainers un izstrādātājs",
    description: aboutContent.directAnswer,
    url: SITE_URL,
    mainEntityOfPage: abs("about"),
    email: CONTACT_EMAIL,
    image: `${SITE_URL}/og-image.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Rīga",
      addressCountry: "LV",
    },
    knowsLanguage: ["lv", "en"],
    knowsAbout: SERVICE_KEYS.map((key) => t.services[LABEL_BY_KEY[key]]),
    sameAs: [SOCIAL.dribbble, SOCIAL.facebook, SOCIAL.instagram, SOCIAL.linkedin],
  };

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: aboutContent.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: isLv ? "Sākums" : "Home", path: pathFor("home", locale) },
    { name: t.nav.about, path: pathFor("about", locale) },
  ]);

  return (
    // Negatīvā augšmala pavelk tumšo fonu zem fiksētās galvenes (Layout main pt-20/24).
    <div className="-mt-20 flex-1 bg-ink-900 pt-20 text-paper md:-mt-24 md:pt-24">
      <SEO
        routeKey="about"
        locale={locale}
        title={aboutContent.metaTitle}
        description={aboutContent.metaDescription}
        noindex={noindex}
      />
      <JsonLd data={[personSchema, faqPageSchema, breadcrumbSchema]} />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-b border-line" aria-labelledby="par-h">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 62% at 8% -10%, rgba(224,114,60,.18), transparent 62%)",
          }}
        />
        <div className="relative mx-auto max-w-wrap px-[var(--pad-x)] pb-[clamp(44px,6vw,84px)] pt-[clamp(36px,5vw,76px)]">
          <Kicker>{t.nav.about}</Kicker>
          <h1
            id="par-h"
            className="mt-5 max-w-[19ch] text-[clamp(2.1rem,5.4vw,4.3rem)] font-light leading-[1.03] tracking-[-0.042em] [text-wrap:balance]"
          >
            {accent(aboutContent.h1, "18 gadu pieredzi", "font-accent italic text-amber-soft")}
          </h1>

          <div className="mt-[clamp(28px,3.4vw,44px)] max-w-[66ch] border-l-2 border-amber bg-ink-850 px-6 py-6 md:px-8 md:py-7">
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.19em] text-paper-faint">
              {isLv ? "Īsā atbilde" : "Short answer"}
            </span>
            <p className="text-[clamp(1.02rem,1.3vw,1.19rem)] leading-relaxed text-paper">
              <LinkedEmail text={aboutContent.directAnswer} />
            </p>
          </div>

          <div className="mt-[clamp(26px,3vw,38px)] flex flex-wrap gap-3">
            <Button to={path("contact")}>
              {t.nav.cta}
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
            <Button to={path("portfolio")} variant="ghost">
              {t.nav.portfolio}
            </Button>
          </div>
        </div>
      </section>

      {/* ============ SATURA SADAĻAS ============ */}
      <div className="mx-auto max-w-wrap px-[var(--pad-x)] py-[clamp(48px,6vw,88px)]">
        <div className="space-y-[clamp(38px,5vw,72px)]">
          {aboutContent.sections.map((section, index) => (
            <ContentSection key={section.heading} section={section} index={index} />
          ))}
        </div>
      </div>

      {/* ============ SAITES UZ DARBA LĪNIJĀM UN DARBIEM ============ */}
      <section className="border-t border-line bg-ink-850">
        <div className="mx-auto max-w-wrap px-[var(--pad-x)] py-[clamp(52px,6vw,92px)]">
          <Kicker className="mb-4">{t.nav.services}</Kicker>
          <ul className="border-t border-line">
            {[...SERVICE_KEYS, "portfolio" as const].map((key) => (
              <li key={key}>
                <Link
                  to={path(key)}
                  className="group flex items-center justify-between gap-6 border-b border-line py-6 transition-colors duration-300 hover:text-amber"
                >
                  <span className="text-[clamp(1.2rem,2.4vw,1.9rem)] font-light tracking-[-0.03em]">
                    {key === "portfolio" ? t.nav.portfolio : t.services[LABEL_BY_KEY[key]]}
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
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-wrap px-[var(--pad-x)] py-[var(--sec-y)]">
          <Kicker className="mb-4">FAQ</Kicker>
          <h2 className="mb-[clamp(30px,4vw,52px)] max-w-[20ch] text-[clamp(1.85rem,3.8vw,3rem)] font-light leading-[1.06] tracking-[-0.038em] [text-wrap:balance]">
            {isLv ? "Bieži uzdotie jautājumi" : "Frequently asked questions"}
          </h2>
          <FaqList items={aboutContent.faq} />
        </div>
      </section>

      {/* ============ CTA ============ */}
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
          {aboutContent.cta ? (
            <p className="mx-auto mt-6 max-w-[62ch] text-paper-dim">
              <LinkedEmail text={aboutContent.cta} />
            </p>
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

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import Kicker from "@/components/ui/Kicker";
import ContactForm from "@/components/ContactForm";
import FaqList from "@/components/content/FaqList";
import LinkedEmail from "@/components/content/LinkedEmail";
import StepFlow from "@/components/content/StepFlow";
import { contactContent, contactSections } from "@/content/pages";
import type { ContentSectionData } from "@/content/types";
import { useLocale } from "@/i18n/LocaleContext";
import { pathFor } from "@/i18n/routes";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL, SOCIAL } from "@/lib/site";

/**
 * Kontakti. Teksts nāk no src/content/lv/kontakti.json, forma ir atsevišķa
 * komponente (src/components/ContactForm.tsx), kas sūta uz api/contact.ts.
 * Lapa formu tikai ietver - validācija, lauki un e-pasta plūsma paliek tur.
 *
 * Sadaļas tiek meklētas pēc virsraksta (src/content/pages.ts), jo izkārtojumā tās
 * nestāv failā rakstītajā secībā: pa kreisi saruna par pieteikumu, pa labi forma.
 */

const FORM_ANCHOR = "pieteikuma-forma";

/**
 * Viena satura sadaļa vienā kolonnā. Kontaktu lapā kolonnas ir šauras, tāpēc te
 * neder ContentSection divkolonnu režģis, ko lieto pakalpojumu lapas.
 */
function Block({
  section,
  headingId,
  children,
}: {
  section: ContentSectionData;
  headingId?: string;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby={headingId}>
      {section.kicker ? <Kicker className="mb-3">{section.kicker}</Kicker> : null}
      <h2
        id={headingId}
        className="max-w-[24ch] text-[clamp(1.5rem,2.8vw,2.15rem)] font-light leading-[1.1] tracking-[-0.035em] [text-wrap:balance]"
      >
        {section.heading}
      </h2>
      <div className="mt-[clamp(14px,1.8vw,20px)] space-y-4 text-paper-2">
        {section.body.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="max-w-[64ch]">
            <LinkedEmail text={paragraph} />
          </p>
        ))}
      </div>

      {section.bullets ? (
        <ul className="mt-[clamp(18px,2.2vw,26px)] max-w-[64ch] border-b border-line">
          {section.bullets.map((bullet) => (
            <li
              key={bullet.slice(0, 48)}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 border-t border-line py-3.5 text-paper-2"
            >
              <span
                aria-hidden="true"
                className="mt-[0.62em] block h-[6px] w-[6px] rounded-full bg-amber"
              />
              <span>
                <LinkedEmail text={bullet} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {children}
    </section>
  );
}

export default function Kontakti() {
  const { locale, t, path } = useLocale();
  const isLv = locale === "lv";

  // TODO: EN saturs vēl nav uzrakstīts. Līdz tam EN maršruts rāda LV tekstu ar
  // noindex, tāpat kā pārējās lapas.
  const noindex = !isLv;

  const pageUrl = `${SITE_URL}${pathFor("contact", locale)}`;

  const person = {
    "@type": "Person",
    name: "Gatis Daugavietis",
    alternateName: SITE_NAME,
    jobTitle: "Web dizainers un izstrādātājs",
    url: SITE_URL,
    email: CONTACT_EMAIL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Rīga",
      addressCountry: "LV",
    },
    sameAs: [SOCIAL.dribbble, SOCIAL.facebook, SOCIAL.instagram, SOCIAL.linkedin],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: CONTACT_EMAIL,
      availableLanguage: ["lv", "en", "ru"],
      areaServed: ["LV", "EE", "LT", "US"],
    },
  };

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: contactContent.h1,
    description: contactContent.metaDescription,
    url: pageUrl,
    inLanguage: locale,
    mainEntity: person,
  };

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: contactContent.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: isLv ? "Sākums" : "Home", path: pathFor("home", locale) },
    { name: t.nav.contact, path: pathFor("contact", locale) },
  ]);

  const contactFacts = [
    { term: isLv ? "E-pasts" : "Email", value: CONTACT_EMAIL, isEmail: true },
    { term: isLv ? "Atrašanās vieta" : "Location", value: "Rīga, Latvija", isEmail: false },
    {
      // "Valodas" prasa ģenitīvu ("kādas?"), tāpēc te ir "Latviešu, angļu, krievu",
      // nevis apstākļa vārdi "latviski, angliski, krieviski" kā sadaļas tekstā.
      term: isLv ? "Valodas" : "Languages",
      value: isLv ? "Latviešu, angļu, krievu" : "Latvian, English, Russian",
      isEmail: false,
    },
  ];

  return (
    // Negatīvā augšmala pavelk tumšo fonu zem fiksētās galvenes (Layout main pt-20/24).
    <div className="-mt-20 flex-1 bg-ink-900 pt-20 text-paper md:-mt-24 md:pt-24">
      <SEO
        routeKey="contact"
        locale={locale}
        title={contactContent.metaTitle}
        description={contactContent.metaDescription}
        noindex={noindex}
      />
      <JsonLd data={[contactPageSchema, faqPageSchema, breadcrumbSchema]} />

      {/* ============ HERO ============ */}
      <section
        className="relative overflow-hidden border-b border-line"
        aria-labelledby="kontakti-h"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 62% at 8% -10%, rgba(224,114,60,.18), transparent 62%)",
          }}
        />
        <div className="relative mx-auto max-w-wrap px-[var(--pad-x)] pb-[clamp(44px,6vw,84px)] pt-[clamp(36px,5vw,76px)]">
          <Kicker>{t.nav.contact}</Kicker>
          <h1
            id="kontakti-h"
            className="mt-5 max-w-[19ch] text-[clamp(2.1rem,5.4vw,4.3rem)] font-light leading-[1.03] tracking-[-0.042em] [text-wrap:balance]"
          >
            {contactContent.h1}
          </h1>

          <div className="mt-[clamp(28px,3.4vw,44px)] max-w-[66ch] border-l-2 border-amber bg-ink-850 px-6 py-6 md:px-8 md:py-7">
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.19em] text-paper-faint">
              {isLv ? "Īsā atbilde" : "Short answer"}
            </span>
            <p className="text-[clamp(1.02rem,1.3vw,1.19rem)] leading-relaxed text-paper">
              <LinkedEmail text={contactContent.directAnswer} />
            </p>
          </div>

          <div className="mt-[clamp(26px,3vw,38px)] flex flex-wrap gap-3">
            <Button href={`#${FORM_ANCHOR}`}>
              {t.form.title}
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
            <Button href={`mailto:${CONTACT_EMAIL}`} variant="ghost">
              {CONTACT_EMAIL}
            </Button>
          </div>
        </div>
      </section>

      {/* ============ SATURS UN FORMA ============ */}
      <div className="mx-auto grid max-w-wrap gap-[clamp(40px,5vw,72px)] px-[var(--pad-x)] py-[clamp(48px,6vw,88px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:items-start lg:gap-[clamp(48px,5vw,80px)]">
        <div className="space-y-[clamp(36px,4.4vw,60px)]">
          <Block section={contactSections.brief} headingId="brief-h" />
          <Block section={contactSections.reply} headingId="reply-h" />
        </div>

        {/* Forma. Uz telefona tā ir zem satura, uz platiem ekrāniem - blakus. */}
        <div id={FORM_ANCHOR} className="scroll-mt-28">
          {contactSections.form.kicker ? (
            <Kicker className="mb-3">{contactSections.form.kicker}</Kicker>
          ) : null}
          <h2 className="max-w-[24ch] text-[clamp(1.5rem,2.8vw,2.15rem)] font-light leading-[1.1] tracking-[-0.035em] [text-wrap:balance]">
            {contactSections.form.heading}
          </h2>
          <div className="mt-[clamp(14px,1.8vw,20px)] space-y-4 text-paper-2">
            {contactSections.form.body.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="max-w-[62ch]">
                {paragraph}
              </p>
            ))}
          </div>
          {/* Lauku uzskaitījums saturā (Vārds, E-pasts, ...) lapā netiek atkārtots -
              tie paši lauki ar tiem pašiem uzrakstiem ir pašā formā zemāk. */}
          <ContactForm className="mt-[clamp(22px,2.6vw,32px)]" />
        </div>
      </div>

      {/* ============ TRĪS SOĻI PĒC PIETEIKUMA ============ */}
      {/* Pilnā platumā zem formas: uz telefona forma tā ir tuvāk sākumam, uz
          platiem ekrāniem plūsma dabū vietu blakus virsrakstam. */}
      <section
        className="border-t border-line"
        aria-labelledby="steps-h"
      >
        <div className="mx-auto grid max-w-wrap gap-x-[clamp(28px,4vw,64px)] gap-y-[clamp(18px,2.4vw,30px)] px-[var(--pad-x)] py-[clamp(48px,6vw,84px)] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
          <div>
            {contactSections.steps.kicker ? (
              <Kicker className="mb-3">{contactSections.steps.kicker}</Kicker>
            ) : null}
            <h2
              id="steps-h"
              className="max-w-[22ch] text-[clamp(1.65rem,3.2vw,2.6rem)] font-light leading-[1.08] tracking-[-0.038em] [text-wrap:balance]"
            >
              {contactSections.steps.heading}
            </h2>
          </div>
          <div className="min-w-0">
            <div className="space-y-4 text-paper-2">
              {contactSections.steps.body.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="max-w-[64ch]">
                  {paragraph}
                </p>
              ))}
            </div>
            <StepFlow
              steps={contactSections.steps.steps ?? []}
              className="mt-[clamp(22px,2.8vw,32px)]"
            />
          </div>
        </div>
      </section>

      {/* ============ KONTAKTINFORMĀCIJA UN ROBEŽAS ============ */}
      <section className="border-y border-line bg-ink-850">
        <div className="mx-auto grid max-w-wrap gap-[clamp(36px,4.4vw,64px)] px-[var(--pad-x)] py-[clamp(52px,6vw,92px)] lg:grid-cols-2 lg:gap-[clamp(48px,5vw,80px)]">
          <Block section={contactSections.contacts} headingId="contacts-h">
            <dl className="mt-[clamp(20px,2.4vw,28px)] border-t border-line">
              {contactFacts.map((fact) => (
                <div
                  key={fact.term}
                  className="grid gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] sm:gap-6"
                >
                  <dt className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-paper-faint">
                    {fact.term}
                  </dt>
                  <dd className="m-0 text-paper">
                    {fact.isEmail ? (
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="break-words border-b border-amber/40 pb-0.5 transition-colors duration-300 hover:border-amber hover:text-amber"
                      >
                        {fact.value}
                      </a>
                    ) : (
                      fact.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Block>

          <Block section={contactSections.limits} headingId="limits-h" />
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section>
        <div className="mx-auto max-w-wrap px-[var(--pad-x)] py-[var(--sec-y)]">
          <Kicker className="mb-4">FAQ</Kicker>
          <h2 className="mb-[clamp(30px,4vw,52px)] max-w-[20ch] text-[clamp(1.85rem,3.8vw,3rem)] font-light leading-[1.06] tracking-[-0.038em] [text-wrap:balance]">
            {isLv ? "Bieži uzdotie jautājumi" : "Frequently asked questions"}
          </h2>
          <FaqList items={contactContent.faq} />
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
          {contactContent.cta ? (
            <p className="mx-auto mt-6 max-w-[62ch] text-paper-dim">
              <LinkedEmail text={contactContent.cta} />
            </p>
          ) : null}
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button href={`#${FORM_ANCHOR}`}>{t.form.title}</Button>
            <Button to={path("portfolio")} variant="ghost">
              {t.nav.portfolio}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

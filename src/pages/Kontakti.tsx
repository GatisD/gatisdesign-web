import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Label from "@/components/ui/Label";
import Reveal from "@/components/animations/Reveal";
import LineReveal from "@/components/animations/LineReveal";
import { h1Lines } from "@/content/h1";
import { Section, SectionTitle, LabelRow } from "@/components/direction/Section";
import ContactForm from "@/components/ContactForm";
import FaqList from "@/components/content/FaqList";
import LinkedText from "@/components/content/LinkedText";
import StepFlow from "@/components/content/StepFlow";
import { contactContent, contactSections } from "@/content/pages";
import { headingId } from "@/content/slug";
import { useLocale } from "@/i18n/LocaleContext";
import { pathFor } from "@/i18n/routes";
import {
  CONTACT_EMAIL,
  PERSON_OCCUPATION,
  PERSON_SAME_AS,
  SITE_NAME,
  SITE_URL,
  WORK_LOCATION,
} from "@/lib/site";

/**
 * Kontakti.
 *
 * Teksts nāk no src/content/lv/kontakti.json, forma ir atsevišķa komponente
 * (src/components/ContactForm.tsx), kas sūta uz api/contact.ts - validācija,
 * lauki un e-pasta plūsma paliek tur.
 *
 * Šī ir vienīgā lapa bez media hero: cilvēks te atnāca rakstīt, ne skatīties.
 * Virsraksts, ievads un pirmie formas lauki ir virs krokas pie 1280x800.
 */

const FORM_ANCHOR = "pieteikuma-forma";

export default function Kontakti() {
  const { locale, t, path } = useLocale();
  const isLv = locale === "lv";
  const noindex = !isLv;

  const contactPointSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: contactContent.h1,
    description: contactContent.metaDescription,
    url: `${SITE_URL}${pathFor("contact", locale)}`,
    mainEntity: {
      "@type": "Person",
      "@id": `${SITE_URL}/#gatis`,
      name: "Gatis Daugavietis",
      alternateName: SITE_NAME,
      jobTitle: "Web dizainers un izstrādātājs",
      url: SITE_URL,
      email: CONTACT_EMAIL,
      address: { "@type": "PostalAddress", addressLocality: "Rīga", addressCountry: "LV" },
      hasOccupation: PERSON_OCCUPATION,
      workLocation: WORK_LOCATION,
      sameAs: PERSON_SAME_AS,
    },
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

  const { brief, reply, form, steps, contacts, limits } = contactSections;

  return (
    <>
      <SEO
        routeKey="contact"
        locale={locale}
        title={contactContent.metaTitle}
        description={contactContent.metaDescription}
        noindex={noindex}
      />
      <JsonLd data={[contactPointSchema, faqPageSchema, breadcrumbSchema]} />

      {/* ============ GALVA ============ */}
      {/* Atkāpes te ir ciešākas nekā citās lapās apzināti: šī ir vienīgā lapa,
          kurā pirmais ekrāns ir DARBĪBA, ne lasīšana. Pie 1280x800 pirmajam
          formas laukam jāpaliek virs sīkdatņu joslas, kas aizņem apakšējos
          69 px līdz brīdim, kad apmeklētājs uz to atbild. */}
      <section className="bg-ink-900 pb-8 md:pb-10 pt-[clamp(88px,12vw,140px)]" aria-labelledby="kontakti-h">
        <div className="mx-auto w-full max-w-wrap px-5 sm:px-8 lg:px-10">
          <LineReveal
            as="h1"
            id="kontakti-h"
            lines={h1Lines(contactContent.h1, 2)}
            className="text-display-2 font-bold uppercase text-paper"
          />
          <Reveal delay={0.2} className="mt-[clamp(18px,2.4vw,28px)] max-w-[62ch]">
            <p className="text-[clamp(1.02rem,1.4vw,1.25rem)] leading-[1.5] text-paper-2">
              <span aria-hidden="true" className="text-amber">
                &#8627;
              </span>{" "}
              {contactContent.heroLede ?? contactContent.directAnswer}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ FORMA + BLAKUS KOLONNA ============ */}
      <Section rhythm="sm" ariaLabel={isLv ? "Pieprasījums" : "Enquiry"}>
        <div className="grid gap-x-16 gap-y-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
          <div id={FORM_ANCHOR} className="scroll-mt-24">
            <h2 className="mb-8 text-h3 font-medium text-paper">{t.form.title}</h2>
            <ContactForm />
          </div>

          <div className="flex flex-col gap-12">
            <div className="rounded-card border border-line bg-ink-850 p-7 md:p-8">
              <Label>{isLv ? "E-pasts" : "Email"}</Label>
              <p className="mt-3">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[clamp(1.15rem,2vw,1.6rem)] font-medium tracking-[-0.02em] text-paper transition-colors duration-300 hover:text-amber"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              {contacts.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-3 text-[15px] leading-[1.6] text-paper-dim">
                  <LinkedText text={paragraph} />
                </p>
              ))}
            </div>

            {/* Formas ievads nāk no satura, ne no koda: tur ir pateikts, kas ar
                aizpildīto formu notiek un kāpēc formā vispār jautāju budžeta
                diapazonu. Abas rindkopas bija uzrakstītas un izgājušas
                gramatikas pārbaudi, bet lapā nenonāca. Tās stāv blakus formai,
                nevis virs tās: pie 1280x800 divas rindkopas starp virsrakstu un
                pirmo lauku aizstumj formu par 171 px zem krokas. */}
            <div className="border-s border-line ps-5">
              {form.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mb-4 text-[15px] leading-[1.6] text-paper-dim last:mb-0">
                  <LinkedText text={paragraph} />
                </p>
              ))}
            </div>

            {/* Atbildes laiks ar norādi par surogātpasta mapi. Tas ir vienīgais
                teikums lapā, kas pasaka, ko darīt, ja atbilde nepienāk. */}
            <div>
              <h2 id={headingId(reply.heading)} className="mb-4 text-h3 font-medium scroll-mt-24">
                {reply.heading}
              </h2>
              {reply.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mb-4 text-[16px] leading-[1.6] text-paper-dim last:mb-0">
                  <LinkedText text={paragraph} />
                </p>
              ))}
            </div>

            <div>
              <h2 id={headingId(steps.heading)} className="mb-4 text-h3 font-medium scroll-mt-24">
                {steps.heading}
              </h2>
              {steps.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mb-6 text-[16px] leading-[1.6] text-paper-dim last:mb-6">
                  <LinkedText text={paragraph} />
                </p>
              ))}
              {steps.steps ? <StepFlow steps={steps.steps} /> : null}
            </div>
          </div>
        </div>
      </Section>

      {/* ============ KO RAKSTĪT ============ */}
      <Section rhythm="md" surface="ink-850" labelledBy={headingId(brief.heading)}>
        <Reveal>
          <h2 id={headingId(brief.heading)} className="mb-[clamp(24px,3vw,40px)] max-w-[20ch] text-h2 font-medium">
            {brief.heading}
          </h2>
        </Reveal>
        <LabelRow label={brief.kicker}>
          {brief.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mb-5 max-w-[64ch] text-[17px] leading-[1.6] text-paper-2 last:mb-0">
              <LinkedText text={paragraph} />
            </p>
          ))}
          {brief.bullets ? (
            <ul className="mt-8 max-w-[68ch]">
              {brief.bullets.map((bullet, i) => (
                <Reveal
                  as="li"
                  key={bullet.slice(0, 40)}
                  delay={i * 0.05}
                  y={12}
                  className={`border-t border-line py-4 ${
                    i === brief.bullets!.length - 1 ? "border-b" : ""
                  }`}
                >
                  <p className="text-[16px] leading-[1.55] text-paper-2">
                    <LinkedText text={bullet} />
                  </p>
                </Reveal>
              ))}
            </ul>
          ) : null}
        </LabelRow>
      </Section>

      {/* ============ KO ES NEDARU ============ */}
      <Section rhythm="sm" labelledBy={headingId(limits.heading)}>
        <Reveal>
          <h2 id={headingId(limits.heading)} className="mb-[clamp(24px,3vw,40px)] max-w-[20ch] text-h2 font-medium">
            {limits.heading}
          </h2>
        </Reveal>
        <LabelRow label={limits.kicker}>
          {limits.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mb-5 max-w-[64ch] text-[17px] leading-[1.6] text-paper-2 last:mb-0">
              <LinkedText text={paragraph} />
            </p>
          ))}
          {limits.bullets ? (
            <ul className="mt-8 max-w-[68ch]">
              {limits.bullets.map((bullet, i) => (
                <Reveal
                  as="li"
                  key={bullet.slice(0, 40)}
                  delay={i * 0.05}
                  y={12}
                  className={`border-t border-line py-4 ${
                    i === limits.bullets!.length - 1 ? "border-b" : ""
                  }`}
                >
                  <p className="text-[16px] leading-[1.55] text-paper-2">
                    <LinkedText text={bullet} />
                  </p>
                </Reveal>
              ))}
            </ul>
          ) : null}
        </LabelRow>
      </Section>

      {/* ============ JAUTĀJUMI ============ */}
      <Section rhythm="lg" surface="ink-850" labelledBy="jautajumi">
        <SectionTitle id="jautajumi" size="giant" className="mb-[clamp(28px,4vw,56px)] scroll-mt-24">
          {isLv ? "Jautājumi" : "Questions"}
        </SectionTitle>
        <FaqList items={contactContent.faq} />
      </Section>
    </>
  );
}

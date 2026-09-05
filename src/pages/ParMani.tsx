import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import Reveal, { stagger } from "@/components/animations/Reveal";
import LineReveal from "@/components/animations/LineReveal";
import MagneticButton from "@/components/animations/MagneticButton";
import CountUp from "@/components/animations/CountUp";
import MediaPlaceholder from "@/components/direction/MediaPlaceholder";
import { Section, SectionTitle, LabelRow } from "@/components/direction/Section";
import ContentSections from "@/components/content/ContentSections";
import FaqList from "@/components/content/FaqList";
import LinkedEmail from "@/components/content/LinkedEmail";
import { aboutContent } from "@/content/pages";
import { statItems } from "@/content/home";
import { useLocale } from "@/i18n/LocaleContext";
import { pathFor, type RouteKey } from "@/i18n/routes";
import { CONTACT_EMAIL, CONTENT_MODIFIED, SITE_NAME, SITE_URL, SOCIAL } from "@/lib/site";

const SERVICE_KEYS = ["services.brand", "services.web", "services.ai", "services.seo"] as const;
const LABEL_BY_KEY = {
  "services.brand": "brand",
  "services.web": "web",
  "services.ai": "ai",
  "services.seo": "seo",
} as const;

/**
 * Skaitļu josla ir TIKAI šeit - zem portreta, kur tā ir biogrāfijas daļa.
 * Sākumlapā tā bija trešā reize ar tiem pašiem cipariem. "1 kontaktpersona"
 * izņemts pavisam: to pašu pasaka virsraksts "Viens cilvēks, kurš atbild par
 * rezultātu", un skaitlis "1" statistikas joslā ir teikums, izģērbts par datiem.
 */
const FACTS = statItems.filter((stat) => !(stat.value === 1 && stat.suffix === ""));

export default function ParMani() {
  const { locale, t, path } = useLocale();
  const isLv = locale === "lv";
  const noindex = !isLv;

  const abs = (key: RouteKey) => `${SITE_URL}${pathFor(key, locale)}`;
  const PERSON_ID = `${SITE_URL}/#gatis`;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Gatis Daugavietis",
    alternateName: SITE_NAME,
    jobTitle: "Web dizainers un izstrādātājs",
    description: aboutContent.directAnswer,
    url: SITE_URL,
    mainEntityOfPage: abs("about"),
    email: CONTACT_EMAIL,
    image: `${SITE_URL}/og-image.png`,
    address: { "@type": "PostalAddress", addressLocality: "Rīga", addressCountry: "LV" },
    knowsLanguage: ["lv", "en"],
    knowsAbout: SERVICE_KEYS.map((key) => t.services[LABEL_BY_KEY[key]]),
    sameAs: [SOCIAL.linkedin, SOCIAL.instagram, SOCIAL.dribbble, SOCIAL.facebook],
    dateModified: CONTENT_MODIFIED,
  };

  // FAQPage satur arī tos jautājumus, kas lapā netiek rādīti (piem. "Kas ir
  // Gatis Daugavietis?"): visa lapa jau ir atbilde uz to, un redzams jautājums
  // to atkārtotu trešo reizi, bet strukturētajos datos tas ir vietā.
  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [...aboutContent.faq, ...(aboutContent.faqSchemaOnly ?? [])].map((item) => ({
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
    <>
      <SEO
        routeKey="about"
        locale={locale}
        title={aboutContent.metaTitle}
        description={aboutContent.metaDescription}
        noindex={noindex}
      />
      <JsonLd data={[personSchema, faqPageSchema, breadcrumbSchema]} />

      {/* ============ GALVA: portrets pa kreisi, vārds pa labi ============ */}
      <section className="bg-ink-900 pb-12 md:pb-16 pt-[clamp(96px,14vw,160px)]" aria-labelledby="par-h">
        <div className="mx-auto grid w-full max-w-wrap gap-x-14 gap-y-10 px-5 sm:px-8 lg:px-10 md:grid-cols-2 md:items-end">
          <MediaPlaceholder
            text={isLv ? "Portrets vai 15 sekunžu video darba vidē - vēl jāuzņem" : "Portrait or a 15 second workshop video - still to be shot"}
            ratio="4 / 5"
            className="md:max-w-[440px]"
          />

          <div>
            <LineReveal
              as="h1"
              id="par-h"
              lines={["Gatis", "Daugavietis"]}
              className="text-display-2 font-bold uppercase text-paper"
            />
            <Reveal delay={0.2} className="mt-[clamp(20px,3vw,34px)] max-w-[54ch]">
              <p className="text-[clamp(1.02rem,1.4vw,1.25rem)] leading-[1.5] text-paper-2">
                <span aria-hidden="true" className="text-amber">
                  &#8627;
                </span>{" "}
                {aboutContent.heroLede ?? aboutContent.directAnswer}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ SKAITĻI ============ */}
      <section className="border-y border-line bg-ink-900" aria-label={isLv ? "Skaitļi" : "Numbers"}>
        <div className="mx-auto grid max-w-wrap gap-8 px-5 py-10 sm:grid-cols-3 sm:px-8 lg:px-10">
          {FACTS.map((stat, i) => (
            <Reveal key={stat.label} delay={stagger(i, 3)} y={14}>
              <p className="flex flex-col gap-2">
                <span className="text-[clamp(2.1rem,4vw,2.9rem)] font-semibold leading-none tracking-[-0.04em] text-paper">
                  <CountUp to={stat.value} />
                  {stat.suffix ? <span className="text-amber">{stat.suffix}</span> : null}
                </span>
                <Label>{stat.label}</Label>
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ SATURA SADAĻAS ============ */}
      <ContentSections sections={aboutContent.sections} />

      {/* ============ JAUTĀJUMI ============ */}
      <Section rhythm="lg" surface="ink-850" labelledBy="jautajumi">
        <SectionTitle id="jautajumi" size="giant" className="mb-[clamp(28px,4vw,56px)] scroll-mt-24">
          {isLv ? "Jautājumi" : "Questions"}
        </SectionTitle>
        <FaqList items={aboutContent.faq} />
      </Section>

      {/* ============ SĀKSIM ============ */}
      <Section rhythm="lg" surface="ink-950" labelledBy="saksim">
        <SectionTitle id="saksim" className="mb-[clamp(22px,3vw,34px)]">
          {isLv ? "Pastāsti, kas tev jāatrisina" : "Tell me what needs solving"}
        </SectionTitle>
        <LabelRow label={isLv ? "Atbilde 1 darba dienā" : "Reply in 1 working day"}>
          {aboutContent.cta ? (
            <p className="max-w-[58ch] text-[17px] leading-[1.6] text-paper-2">
              <LinkedEmail text={aboutContent.cta} />
            </p>
          ) : null}
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton>
              <Button to={path("contact")}>{t.nav.cta}</Button>
            </MagneticButton>
            <Button to={path("portfolio")} variant="link">
              {t.nav.portfolio}
            </Button>
          </div>
        </LabelRow>
      </Section>
    </>
  );
}

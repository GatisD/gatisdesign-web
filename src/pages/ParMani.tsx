import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/animations/MagneticButton";
import HeroMedia from "@/components/direction/HeroMedia";
import Reveal, { stagger } from "@/components/animations/Reveal";
import LineReveal from "@/components/animations/LineReveal";
import { h1Lines } from "@/content/h1";
import CountUp from "@/components/animations/CountUp";
import { Section, SectionTitle } from "@/components/direction/Section";
import ContentSections from "@/components/content/ContentSections";
import ClosingLine from "@/components/content/ClosingLine";
import FaqList from "@/components/content/FaqList";
import { aboutContent } from "@/content/pages";
import type { PageContent } from "@/content/types";
import { factsFrom, statItems, type StatItem } from "@/content/home";
import { useLocale } from "@/i18n/LocaleContext";
import { pathFor, type RouteKey } from "@/i18n/routes";
import {
  CONTACT_EMAIL,
  CONTENT_MODIFIED,
  KNOWS_ABOUT,
  PERSON_JOB_TITLE,
  PERSON_OCCUPATION,
  PERSON_SAME_AS,
  SITE_NAME,
  SITE_URL,
  WORK_LOCATION,
} from "@/lib/site";
import { personNode, faqPageNode } from "@/lib/schema-nodes";
import PicturePortfolio from "@/components/PicturePortfolio";

/**
 * Skaitļu josla ir TIKAI šeit - zem portreta, kur tā ir biogrāfijas daļa.
 * Sākumlapā tā bija trešā reize ar tiem pašiem cipariem. "1 kontaktpersona"
 * izņemts pavisam: to pašu pasaka virsraksts "Viens cilvēks, kurš atbild par
 * rezultātu", un skaitlis "1" statistikas joslā ir teikums, izģērbts par datiem.
 */
const FACTS = factsFrom(statItems);

/** Saturs un skaitļi kā props: LV pēc noklusējuma, EN caur ParManiEn apvalku. */
export default function ParMani({ content = aboutContent, stats = FACTS }: { content?: PageContent; stats?: StatItem[] }) {
  const { locale, t, path } = useLocale();
  const isLv = locale === "lv";
  const noindex = !isLv;

  const abs = (key: RouteKey) => `${SITE_URL}${pathFor(key, locale)}`;
  const PERSON_ID = `${SITE_URL}/#gatis`;

  const personSchema = personNode({
    description: content.directAnswer,
    mainEntityOfPage: abs("about"),
    image: `${SITE_URL}/og-gatisdesign.png`,
    knowsLanguage: ["lv", "en"],
    dateModified: CONTENT_MODIFIED,
  });


  // FAQPage satur arī tos jautājumus, kas lapā netiek rādīti (piem. "Kas ir
  // Gatis Daugavietis?"): visa lapa jau ir atbilde uz to, un redzams jautājums
  // to atkārtotu trešo reizi, bet strukturētajos datos tas ir vietā.
  const faqPageSchema = faqPageNode([...content.faq, ...(content.faqSchemaOnly ?? [])]);


  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: isLv ? "Sākums" : "Home", path: pathFor("home", locale) },
    { name: t.nav.about, path: pathFor("about", locale) },
  ]);

  return (
    <>
      <SEO
        routeKey="about"
        locale={locale}
        title={content.metaTitle}
        description={content.metaDescription}
        noindex={noindex}
      />
      <JsonLd data={[personSchema, faqPageSchema, breadcrumbSchema]} />

      {/* ============ GALVA: portrets pa kreisi, vārds pa labi ============ */}
      {/* Fons te bija tukšs melnums. Kadrs ir pieklusināts (brightness .42):
          galvenais šajā ekrānā ir portrets un vārds, fons ir tekstūra zem tā. */}
      <section className="relative isolate overflow-hidden bg-ink-900 pb-12 md:pb-16 pt-[clamp(96px,14vw,160px)]" aria-labelledby="par-h">
        <HeroMedia className="-z-[2]" poster="/media/hero-about.jpg" eager brightness={0.42} position="center 45%" />
        <div aria-hidden="true" className="absolute inset-0 -z-[1]" style={{ background: "var(--scrim-page)" }} />
        <div className="mx-auto grid w-full max-w-wrap gap-x-14 gap-y-10 px-5 sm:px-8 lg:px-10 md:grid-cols-2 md:items-end">
          {/* Portrets, ne vietturis. `alt` apraksta cilvēku, ne failu: ekrāna
              lasītājam "portrets" neko nepasaka, bet vārds pasaka. Attēls ir
              512x640 - tas ir avota izmērs, tāpēc slotu turam līdz 380 px, lai
              tas paliktu ass arī uz retina ekrāna. */}
          <PicturePortfolio
            src="/media/gatis-portrets.jpg"
            alt={isLv ? "Gatis Daugavietis" : "Gatis Daugavietis"}
            width={512}
            height={640}
            widths={[256, 512]}
            sizes="(min-width: 768px) 380px, 300px"
            loading="eager"
            priority="high"
            className="w-full max-w-[300px] object-cover md:max-w-[380px]"
            style={{ aspectRatio: "4 / 5" }}
          />

          <div>
            <LineReveal
              as="h1"
              id="par-h"
              lines={h1Lines(content.h1, content.h1BreakAfter)}
              className="text-display-2 font-bold uppercase text-paper"
            />
            <Reveal delay={0.2} className="mt-[clamp(20px,3vw,34px)] max-w-[54ch]">
              <p className="text-[clamp(1.02rem,1.4vw,1.25rem)] leading-[1.5] text-paper-2">
                <span aria-hidden="true" className="text-amber">
                  &#8627;
                </span>{" "}
                {content.heroLede ?? content.directAnswer}
              </p>
            </Reveal>
            {/* Lapā nebija nevienas pogas: 1408 vārdi par to, kā es strādāju,
                un neviena vieta, kur to sākt. Darbība ir tā pati, kas
                pakalpojumu lapās, lai lapas nesolītu dažādus ceļus. */}
            <Reveal delay={0.3} className="mt-[clamp(24px,3.4vw,40px)] flex flex-wrap items-center gap-x-8 gap-y-4">
              <MagneticButton>
                <Button to={path("contact")}>
                  {isLv ? "Pastāsti par projektu" : "Tell me about your project"}
                </Button>
              </MagneticButton>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex min-h-[44px] items-center text-[16px] text-paper transition-colors duration-300 hover:text-amber active:text-amber"
              >
                <span className="border-b border-line-amber pb-1.5">{CONTACT_EMAIL}</span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ SKAITĻI ============ */}
      <section className="border-y border-line bg-ink-900" aria-label={isLv ? "Skaitļi" : "Numbers"}>
        <div className="mx-auto grid max-w-wrap gap-8 px-5 py-10 sm:grid-cols-3 sm:px-8 lg:px-10">
          {stats.map((stat, i) => (
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
      <ContentSections sections={content.sections} />

      {/* ============ JAUTĀJUMI ============ */}
      <Section rhythm="lg" surface="ink-850" labelledBy="jautajumi">
        <SectionTitle id="jautajumi" size="giant" className="mb-[clamp(28px,4vw,56px)] scroll-mt-24">
          {isLv ? "Jautājumi" : "Questions"}
        </SectionTitle>
        <FaqList items={content.faq} />
      </Section>

      {/* ============ SĀKSIM ============ */}
      {content.cta ? <ClosingLine text={content.cta} /> : null}
    </>
  );
}

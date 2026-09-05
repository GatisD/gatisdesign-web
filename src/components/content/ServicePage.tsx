import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import JsonLd from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/animations/MagneticButton";
import Reveal from "@/components/animations/Reveal";
import PageHero from "@/components/direction/PageHero";
import Band from "@/components/direction/Band";
import { Section, SectionTitle, LabelRow } from "@/components/direction/Section";
import ContentSections, { tocFor } from "./ContentSections";
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

/**
 * Katras pakalpojumu lapas galvas kadrs un vidusjosla. Fona attēli šobrīd ir
 * pagaidu stock kadri: struktūra jau ir gatava video (HeroMedia `video`), bet
 * paša video vēl nav uzņemts.
 */
const MEDIA: Record<
  ServiceRouteKey,
  { titleLines: string[]; poster: string; posterPosition?: string; band: { poster: string; text: string } }
> = {
  "services.brand": {
    titleLines: ["Zīmola", "identitāte"],
    poster: "/media/hero-brand.jpg",
    posterPosition: "center 45%",
    band: {
      poster: "/media/band-craft.jpg",
      text: "Viena zīme, kas lasās no divdesmit metriem uz kravas auto un no trīsdesmit centimetriem uz vizītkartes.",
    },
  },
  "services.web": {
    titleLines: ["Mājaslapu", "izstrāde"],
    poster: "/media/hero-web.jpg",
    band: {
      poster: "/media/band-craft.jpg",
      text: "Lapa, kas izskatās labi, bet nenes pieteikumus, ir tikai izdevumi. Es salaboju to, kas tai neļauj strādāt.",
    },
  },
  "services.ai": {
    titleLines: ["AI aģenti un", "automatizācija"],
    poster: "/media/hero-ai.jpg",
    band: {
      poster: "/media/band-console.jpg",
      text: "Kad dati pārvietojas paši, komanda pamana kļūdu pirms klienta, nevis pēc tam.",
    },
  },
  "services.seo": {
    titleLines: ["SEO, GEO", "un AEO"],
    poster: "/media/hero-seo.jpg",
    band: {
      poster: "/media/hero-ai.jpg",
      text: "Lai lapu atrastu Google meklēšanā un lai to citētu ChatGPT tad, kad klients jautā tur, nevis meklētājā.",
    },
  },
};

export default function ServicePage({ routeKey }: { routeKey: ServiceRouteKey }) {
  const { locale, t, path } = useLocale();
  const content = serviceContent[routeKey];
  const media = MEDIA[routeKey];
  const isLv = locale === "lv";

  // EN saturs vēl nav uzrakstīts. Līdz tam EN maršruti rāda LV tekstu ar
  // noindex, lai Google neindeksē latviešu saturu zem angļu URL, un EN URL
  // nav sitemapā. Kad tulkojums ir gatavs: src/content/en/*.json, izvēle pēc
  // locale, noindex nost un EN atpakaļ sitemapā (vite.config.ts).
  const noindex = !isLv;

  const otherServices = SERVICE_KEYS.filter((key) => key !== routeKey);

  // Josla nāk pēc satura vidus, ne tieši pirms FAQ: tā ir elpa starp diviem
  // teksta blokiem, nevis dekors pirms noslēguma.
  const mid = Math.ceil(content.sections.length / 2);
  const first = content.sections.slice(0, mid);
  const rest = content.sections.slice(mid);

  return (
    <>
      <SEO
        routeKey={routeKey}
        locale={locale}
        title={content.metaTitle}
        description={content.metaDescription}
        noindex={noindex}
      />
      <JsonLd data={buildServiceSchema(content, routeKey, locale)} />

      <PageHero
        titleLines={media.titleLines}
        lede={content.heroLede ?? content.directAnswer}
        poster={media.poster}
        posterPosition={media.posterPosition}
        toc={tocFor(content.sections)}
      />

      <ContentSections sections={first} />
      <Band poster={media.band.poster} text={media.band.text} />
      <ContentSections sections={rest} />

      {/* ============ JAUTĀJUMI ============ */}
      <Section rhythm="lg" surface="ink-850" labelledBy="jautajumi">
        <SectionTitle id="jautajumi" size="giant" className="mb-[clamp(28px,4vw,56px)] scroll-mt-24">
          {isLv ? "Jautājumi" : "Questions"}
        </SectionTitle>
        <FaqList items={content.faq} />
      </Section>

      {/* ============ CITI PAKALPOJUMI ============ */}
      <Section rhythm="md" labelledBy="citi-h">
        <SectionTitle id="citi-h" className="mb-[clamp(22px,3vw,36px)]">
          {isLv ? "Citi pakalpojumi" : "Other services"}
        </SectionTitle>
        <ul>
          {otherServices.map((key, i) => (
            <Reveal
              as="li"
              key={key}
              delay={i * 0.06}
              y={14}
              className={`border-t border-line ${i === otherServices.length - 1 ? "border-b" : ""}`}
            >
              <Link
                to={path(key)}
                className="group flex items-center justify-between gap-6 py-6 text-paper transition-colors duration-300 hover:text-amber"
              >
                <span className="text-h3 font-medium">{t.services[LABEL_BY_KEY[key]]}</span>
                <span
                  aria-hidden="true"
                  className="h-px w-14 origin-right shrink-0 scale-x-[.55] bg-paper-faint transition-[transform,background-color] duration-300 ease-dir group-hover:scale-x-100 group-hover:bg-amber"
                />
              </Link>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ============ SĀKSIM ============ */}
      <Section rhythm="lg" surface="ink-950" labelledBy="saksim">
        <SectionTitle id="saksim" className="mb-[clamp(22px,3vw,34px)] scroll-mt-24">
          {isLv ? "Pastāsti, kas tev jāatrisina" : "Tell me what needs solving"}
        </SectionTitle>
        <LabelRow label={isLv ? "Sāksim" : "Start"}>
          {content.cta ? (
            <p className="max-w-[58ch] text-[17px] leading-[1.6] text-paper-2">{content.cta}</p>
          ) : null}
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton>
              <Button to={path("contact")}>{t.nav.cta}</Button>
            </MagneticButton>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="border-b border-line-amber pb-1 text-[clamp(1rem,1.4vw,1.2rem)] text-paper transition-colors duration-300 hover:text-amber"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </LabelRow>
      </Section>
    </>
  );
}

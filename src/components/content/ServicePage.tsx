import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import JsonLd from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/animations/MagneticButton";
import Reveal from "@/components/animations/Reveal";
import ClosingLine from "./ClosingLine";
import PageHero from "@/components/direction/PageHero";
import Band from "@/components/direction/Band";
import { Section, SectionTitle } from "@/components/direction/Section";
import ContentSections, { priceSection, tocFor } from "./ContentSections";
import FaqList from "./FaqList";
import { buildServiceSchema } from "./serviceSchema";
import type { ServiceContent, ServiceRouteKey } from "@/content";
import { headingId } from "@/content/slug";
import { useLocale } from "@/i18n/LocaleContext";

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
    posterPosition: "center 40%",
    band: {
      poster: "/media/band-brand.jpg",
      text: "Viena zīme, kas salasāma gan no divdesmit metriem uz kravas auto, gan no trīsdesmit centimetriem uz vizītkartes.",
    },
  },
  "services.web": {
    titleLines: ["Mājaslapu", "izstrāde"],
    poster: "/media/hero-web.jpg",
    band: {
      poster: "/media/band-craft.jpg",
      text: "Testa adrese ir pieejama no pirmās nedēļas: tu redzi lapu topam, nevis saņem to gatavu prezentācijā.",
    },
  },
  "services.ai": {
    titleLines: ["AI aģenti un", "automatizācija"],
    poster: "/media/hero-ai.jpg",
    band: {
      poster: "/media/band-console.jpg",
      text: "Kad dati plūst paši, komanda pamana kļūdu pirms klienta, nevis pēc tam.",
    },
  },
  "services.seo": {
    titleLines: ["SEO, GEO", "un AEO"],
    poster: "/media/hero-seo.jpg",
    band: {
      poster: "/media/band-seo.jpg",
      text: "Lai lapu atrastu Google meklēšanā un lai ChatGPT to citētu tad, kad klients jautā tur, nevis meklētājā.",
    },
  },
};

/**
 * Saturs nāk kā props, ne no kartes.
 *
 * `serviceContent` karte ieveda VISU četru lapu JSON vienā koplietotā gabalā
 * (31,6 KB gzip), un vite-react-ssg to priekšielādēja katrā pakalpojumu lapā -
 * apmeklētājs, kurš atvēra vienu lapu, lejupielādēja visu četru tekstu, lai gan
 * viņa lapas teksts jau bija HTML. Tagad katra lapa ievelk tikai savu failu.
 */
export default function ServicePage({
  routeKey,
  content,
}: {
  routeKey: ServiceRouteKey;
  content: ServiceContent;
}) {
  const { locale, t, path } = useLocale();
  const media = MEDIA[routeKey];
  const isLv = locale === "lv";

  // EN saturs vēl nav uzrakstīts. Līdz tam EN maršruti rāda LV tekstu ar
  // noindex, lai Google neindeksē latviešu saturu zem angļu URL, un EN URL
  // nav sitemapā. Kad tulkojums ir gatavs: src/content/en/*.json, izvēle pēc
  // locale, noindex nost un EN atpakaļ sitemapā (vite.config.ts).
  const noindex = !isLv;

  const otherServices = SERVICE_KEYS.filter((key) => key !== routeKey);

  // Cenu sadaļas enkurs hero sekundārajai saitei. Nāk no tā paša atlasītāja,
  // ko lieto satura rādītājs, tāpēc abas saites vienmēr ved uz vienu vietu.
  const prices = priceSection(content.sections);

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

      {/* Pirmajā ekrānā jābūt darbībai. Nomērīts bija tā, ka vienīgā poga virs
          krokas visās četrās pakalpojumu lapās bija sīkdatņu joslas poga -
          tieši tajās lapās, kurās ir cenas. Pill ir viena (saruna), otrā
          darbība ir teksta saite uz cenu tabulu: cilvēks, kurš atnāca pēc
          cenas, nedrīkst to meklēt ar ritināšanu 19 000 px garā lapā. */}
      <PageHero
        titleLines={media.titleLines}
        lede={content.heroLede ?? content.directAnswer}
        poster={media.poster}
        posterPosition={media.posterPosition}
        toc={tocFor(content.sections)}
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <MagneticButton>
            <Button to={path("contact")}>
              {isLv ? "Pastāsti par projektu" : "Tell me about your project"}
            </Button>
          </MagneticButton>
          {prices ? (
            <Button href={`#${headingId(prices.heading)}`} variant="link">
              {isLv ? "Apskati cenas" : "See prices"}
            </Button>
          ) : null}
        </div>
      </PageHero>

      {/* Etiķešu budžets ir uz LAPU, ne uz izsaukumu: 2 + 2 = 4, un vairāk par
          četrām sānu etiķetēm 14 sekciju dokumentā vairs nav ritms, bet raksts. */}
      <ContentSections sections={first} labelBudget={2} />
      <Band poster={media.band.poster} text={media.band.text} />
      <ContentSections sections={rest} labelBudget={2} />

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
                {/* Zem sm displeja mērogs ir par lielu vienai rindai: "AI aģenti un
                    automatizācija" ir 26 zīmes, un pēc atkāpēm un svītras paliek ~270 px. */}
                <span className="text-[clamp(1.125rem,4.6vw,1.5rem)] font-medium tracking-[-0.03em] sm:text-h3">
                  {t.services[LABEL_BY_KEY[key]]}
                </span>
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
      {/* Viena rinda, ne bloks: pilnais noslēgums ar to pašu virsrakstu, etiķeti
          un pill bija astoņās lapās. Pilnā forma paliek sākumlapā; te ir lapas
          paša noslēguma teikums ar e-pasta saiti. Darbība pirmajā ekrānā jau ir
          (PageHero children). */}
      {content.cta ? <ClosingLine text={content.cta} /> : null}
    </>
  );
}

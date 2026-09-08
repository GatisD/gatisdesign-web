import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Reveal from "@/components/animations/Reveal";
import Label from "@/components/ui/Label";
import ServiceIcon from "@/components/ui/ServiceIcon";
import HeroMedia from "@/components/direction/HeroMedia";
import PageHero from "@/components/direction/PageHero";
import { Section, SectionTitle, ProseColumns } from "@/components/direction/Section";
import ClosingLine from "@/components/content/ClosingLine";
import content from "@/content/lv/pakalpojumi.json";
import { useLocale } from "@/i18n/LocaleContext";
import { routeKeyForPath, type RouteKey } from "@/i18n/routes";
import { SITE_URL } from "@/lib/site";

/**
 * Visu pakalpojumu lapa - četras kartes vienā skatā (Gatis, 2026-09-08:
 * "globālā pakalpojumu sadaļa ar skaistām animētām kartītēm").
 *
 * SATURS IR SAVS, MAZS FAILS, ne četru pakalpojumu lapu JSON: vite-react-ssg
 * maršrutu gabalus priekšielādē visās lapās, un četru lapu teksts (31,6 KB
 * gzip) būtu jāielādē katram, kas atver jebko. Šeit ir tikai tas, kas stāv
 * kartē: nosaukums, viens teikums, trīs "kas ietilpst", cena un termiņš.
 * Cenas sakrīt ar pakalpojumu lapu tabulām - to tur tests.
 *
 * KARTES IR SAITES UZ ESOŠAJĀM LAPĀM, ne lapu kopijas. Katrai kartei fonā ir
 * tās pakalpojuma lapas galvas kadrs melnbalts un lēnā dreifā (tas pats
 * HeroMedia, kas hero), tāpēc, atverot lapu, cilvēks nonāk tajā pašā kadrā,
 * ko tikko redzēja kartē. Uz hover kadrs iegūst krāsu - kā darbu kartēm:
 * kursors stāv uz vienas kartes, un tieši tā atdzīvojas. Kartes hover un
 * kustība dzīvo src/index.css (.pak-karte).
 *
 * EN maršruts /en/services rāda LV tekstu ar noindex - tas pats stāvoklis,
 * kāds ir pārējām lapām, kamēr EN saturs nav uzrakstīts.
 */
export default function Pakalpojumi() {
  const { locale, path } = useLocale();
  const isLv = locale === "lv";
  const noindex = !isLv;
  const url = `${SITE_URL}${path("services")}`;

  const cards = content.cards.map((card) => ({ ...card, key: routeKeyForPath(card.target) as RouteKey }));

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: isLv ? "Sākums" : "Home", path: path("home") },
    { name: content.h1, path: path("services") },
  ]);
  // CollectionPage ar ItemList: četri pakalpojumi kā saraksts, katrs ar savu
  // lapas adresi. Pašu Service objektu šeit nav - tie dzīvo katrā pakalpojuma
  // lapā ar cenu diapazonu no tās tabulas, un dublēts objekts ar citiem
  // laukiem AI dzinējiem būtu divi dažādi pakalpojumi ar vienu vārdu.
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: content.metaTitle,
    description: content.metaDescription,
    url,
    inLanguage: locale,
    about: { "@id": `${SITE_URL}/#gatis` },
    mainEntity: {
      "@type": "ItemList",
      name: content.h1,
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: cards.length,
      itemListElement: cards.map((card, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: card.title,
        url: `${SITE_URL}${path(card.key)}`,
      })),
    },
  };

  return (
    <>
      <SEO
        routeKey="services"
        locale={locale}
        title={content.metaTitle}
        description={content.metaDescription}
        noindex={noindex}
      />
      <JsonLd data={[collectionSchema, breadcrumbSchema]} />

      <PageHero titleLines={[content.h1]} lede={content.lede} poster="/media/hero-workshop.jpg" posterPosition="center 40%" />

      {/* ============ KARTES ============ */}
      <Section rhythm="lg" ariaLabel={content.h1}>
        <ul className="grid gap-grid md:grid-cols-2">
          {cards.map((card, i) => (
            <Reveal as="li" key={card.target} delay={i * 0.08} y={24} className="min-w-0">
              <Link
                to={path(card.key)}
                className="pak-karte group relative isolate flex min-h-[clamp(320px,36vw,470px)] flex-col overflow-hidden rounded-card p-[clamp(22px,2.6vw,36px)] text-paper"
              >
                <HeroMedia className="-z-[2]" poster={card.poster} position={card.posterPosition} brightness={0.36} drift />
                <div aria-hidden="true" className="absolute inset-0 -z-[1]" style={{ background: "var(--scrim-cover)" }} />

                <div className="flex items-start justify-between gap-4">
                  <Label caps>({card.label})</Label>
                  <ServiceIcon target={card.target} className="pak-ikona h-7 w-7 shrink-0 text-paper-dim" />
                </div>

                <div className="mt-auto pt-[clamp(48px,7vw,96px)]">
                  <h2 className="text-h3 font-medium leading-[1.05] text-paper">{card.title}</h2>
                  <p className="mt-3 max-w-[46ch] text-[16px] leading-[1.55] text-paper-2">{card.lead}</p>
                  {/* "Kas ietilpst" kā trīs čipi, ne rindkopa: kartē tos nolasa
                      vienā skatā, un pakalpojuma lapā tie pārtop tabulā. */}
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label={isLv ? "Kas ietilpst" : "What is included"}>
                    {card.includes.map((item) => (
                      <li key={item} className="rounded-full border border-line px-3 py-1 text-[13px] text-paper-dim">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-5">
                    <p className="flex flex-col gap-1">
                      <span className="text-[20px] font-semibold tabular-nums text-paper">{card.price}</span>
                      <Label>{card.term}</Label>
                    </p>
                    <span className="pak-vairak inline-flex items-center gap-2 text-[15px] font-medium text-paper">
                      {isLv ? "Vairāk" : "More"}
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
        <p className="pt-6">
          <Label>{content.note}</Label>
        </p>
      </Section>

      {/* ============ KOPĀ ============ */}
      <Section rhythm="md" surface="ink-850" labelledBy="kopa-h">
        <SectionTitle id="kopa-h" className="mb-[clamp(24px,3vw,40px)]">
          {content.together.heading}
        </SectionTitle>
        <ProseColumns>
          {content.together.body.map((paragraph) => (
            <Reveal key={paragraph.slice(0, 24)} y={16}>
              <p className="max-w-[60ch] text-[17px] leading-[1.6] text-paper-2">{paragraph}</p>
            </Reveal>
          ))}
        </ProseColumns>
      </Section>

      <ClosingLine text={content.cta} />
    </>
  );
}

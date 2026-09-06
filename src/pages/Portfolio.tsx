import { useMemo, useState } from "react";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Reveal from "@/components/animations/Reveal";
import LineReveal from "@/components/animations/LineReveal";
import Label from "@/components/ui/Label";
import { Section, SectionTitle } from "@/components/direction/Section";
import LinkedText from "@/components/content/LinkedText";
import ProjectCard from "@/components/ProjectCard";
import ClosingLine from "@/components/content/ClosingLine";
import { projects, CATEGORY_LABEL, type ProjectCategory } from "@/data/projects";
import { useLocale } from "@/i18n/LocaleContext";
import { pathFor } from "@/i18n/routes";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

type Filter = "all" | ProjectCategory;

/**
 * Darbu skaits nāk no datiem, ne no rokas. Iepriekš te stāvēja "23 pabeigti
 * projekti", un pēc tam, kad 4. kārta pievienoja desmit vietnes, meta apraksts
 * apgalvoja vienu skaitli, bet lapa rādīja citu.
 */
const META_DESCRIPTION = `${projects.length} publicēti darbi: mājaslapu izstrāde, logo un zīmola dizains. Estire, Box Latvia, ROIS.lv, Apmeklē.lv. Katram darbam norādīts klients un mana loma.`;

/**
 * Divas sadaļas zem režģa. Teksts dzīvo šeit, ne satura failā, jo /portfolio
 * satura faila nav - dati nāk no projects.raw.json. Ja lapa iegūs savu JSON,
 * abas rindkopas pārceļas turp.
 */
const WEB_NOTE =
  "Darbu sarakstā ir divi tehnoloģiju ceļi. WordPress ar Elementor vai Breakdance - tad, kad saturu pēc palaišanas maina klients pats; tā uzbūvēta lielākā daļa šo lapu. Kodēta lapa ar React un Vite - tad, kad saturs mainās reti, bet svarīgi ir ātrums un dizaina precizitāte: Estire, ROIS.lv, Universal Solutions. Atsevišķa grupa ir veikali WooCommerce vai Shopify vidē, kā arī daudzvalodu lapas ar WPML. Cenas un termiņus katram no šiem ceļiem atradīsi lapā [Mājaslapu izstrāde](/majaslapu-izstrade).";

const BRAND_NOTE =
  "Šajā sadaļā ir gan pilnas identitātes ar zīmola grāmatu un drukas materiāliem, gan atsevišķi logotipi. Box Latvia ir loģistikas zīmols ar transportlīdzekļu marķējumu, Apmeklē.lv - platformas zīme, kurai jāstrādā lietotnes ikonas izmērā, Digitālais Dzintars - plakātu un afišu sistēma. Daļu darbu veidoju ROIS komandā, daļu viens pats, un pie katra tas ir norādīts. Cenas ir lapā [Logo izveide un zīmola identitāte](/zimola-identitate).";

/**
 * Režģa ritms. Piecu flīžu cikls: divas platas (7+5), tad trīs vienādas (4+4+4).
 * Rindas iekšienē kadra proporcija ir VIENĀDA - nevienāds augstums vienā rindā
 * pie augšā līdzinātām kartēm lasās kā kļūda, ne kā ritms.
 */
const SPAN = ["md:col-span-7", "md:col-span-5", "md:col-span-4", "md:col-span-4", "md:col-span-4"];
/** Augstums, ne proporcija: vienā rindā visām kartēm jābeidzas vienā līnijā. */
const FRAME = [
  "h-[clamp(210px,30vw,500px)]",
  "h-[clamp(210px,30vw,500px)]",
  "h-[clamp(190px,22vw,360px)]",
  "h-[clamp(190px,22vw,360px)]",
  "h-[clamp(190px,22vw,360px)]",
];
/** Kadra proporcija - pēc tās karte izlemj, vai attēls aizpilda vai ietilpst. */
const FRAME_RATIO = [7 / 4.4, 5 / 3.2, 4 / 3, 4 / 3, 4 / 3];

export default function Portfolio() {
  const { locale, t } = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const isLv = locale === "lv";

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );

  const filters: Array<{ key: Filter; label: string; count: number }> = [
    { key: "all", label: isLv ? "Visi" : "All", count: projects.length },
    {
      key: "web",
      label: CATEGORY_LABEL.web,
      count: projects.filter((p) => p.category === "web").length,
    },
    {
      key: "brand",
      label: CATEGORY_LABEL.brand,
      count: projects.filter((p) => p.category === "brand").length,
    },
  ];

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Gatis Daugavieša darbi",
    numberOfItems: projects.length,
    itemListElement: projects.map((project, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: project.title,
      url: `${SITE_URL}${pathFor("portfolio", locale)}/${project.slug}`,
    })),
  };

  return (
    <>
      <SEO
        routeKey="portfolio"
        locale={locale}
        title="Mājaslapu un logo izstrādes piemēri"
        description={META_DESCRIPTION}
        // EN saturs vēl nav tulkots, tāpēc /en/portfolio rāda LV tekstu ar noindex.
        noindex={!isLv}
      />
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: isLv ? "Sākums" : "Home", path: pathFor("home", locale) },
            { name: t.nav.portfolio, path: pathFor("portfolio", locale) },
          ]),
          listSchema,
        ]}
      />

      {/* ============ GALVA ============ */}
      <section className="bg-ink-900 pb-12 md:pb-16 pt-[clamp(104px,15vw,180px)]" aria-labelledby="darbi-h">
        <div className="mx-auto w-full max-w-wrap px-5 sm:px-8 lg:px-10">
          <LineReveal
            as="h1"
            id="darbi-h"
            lines={["Mājaslapu un logo", "izstrādes piemēri"]}
            className="text-display-2 font-bold uppercase text-paper"
          />
          <Reveal delay={0.2} className="mt-[clamp(22px,3vw,38px)] max-w-[62ch]">
            <p className="text-[clamp(1.02rem,1.4vw,1.25rem)] leading-[1.5] text-paper-2">
              <span aria-hidden="true" className="text-amber">
                &#8627;
              </span>{" "}
              Projekti, kas strādā arī ārpus prezentācijas. Katram darbam norādīts klients un mana
              loma - daļu veidoju ROIS komandā, daļu viens pats.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ FILTRS ============ */}
      <div className="sticky top-16 z-40 border-y border-line bg-ink-900/90 backdrop-blur-md md:top-[72px]">
        <div
          role="group"
          aria-label={isLv ? "Darbu filtrs" : "Work filter"}
          className="mx-auto flex max-w-wrap flex-wrap items-center gap-x-8 gap-y-1 px-5 sm:px-8 lg:px-10 py-3"
        >
          {filters.map((item) => {
            const active = item.key === filter;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                aria-pressed={active}
                className={cn(
                  "relative inline-flex min-h-[44px] items-center gap-2 text-[16px] transition-colors duration-300 active:text-paper",
                  active ? "text-paper" : "text-paper-dim hover:text-paper",
                )}
              >
                {item.label}
                <span className="font-label text-label text-paper-faint">{item.count}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 bottom-1 h-[2px] origin-left bg-amber transition-transform duration-300 ease-dir",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ============ REŽĢIS ============ */}
      <Section rhythm="lg" ariaLabel={isLv ? "Darbu saraksts" : "Work list"}>
        {/*
          Režģis tiek pārmontēts ar `key={filter}`, un kartes ienāk ar vilni
          (`.grid-in`, src/index.css). Tā ir CSS animācija, ne JS izkārtojuma
          pārrēķins: `layout` FLIP ar animāciju bibliotēku šeit maksāja 41,5 KB
          gzip KATRĀ lapā (vite-react-ssg maršrutu gabalus priekšielādē visur),
          un tas ir vairāk nekā viss pārējais animāciju kods kopā.
        */}
        <div key={filter} className="grid gap-grid md:grid-cols-12">
          {visible.map((project, i) => (
            <div
              key={project.slug}
              className={cn("grid-in", SPAN[i % SPAN.length])}
              style={{ ["--grid-index" as string]: Math.min(i, 7) }}
            >
              <ProjectCard
                project={project}
                eager={i === 0}
                frame={FRAME[i % FRAME.length]}
                frameRatio={FRAME_RATIO[i % FRAME_RATIO.length]}
                devicePair
              />
            </div>
          ))}
        </div>

        <p className="mt-[clamp(30px,4vw,52px)] border-t border-line pt-5">
          <Label>
            {isLv
              ? `Redzami: ${visible.length} no ${projects.length}`
              : `Showing ${visible.length} of ${projects.length}`}
          </Label>
        </p>
      </Section>


      {/* ============ KO ŠAJĀ SARAKSTĀ MEKLĒT ============ */}
      {/* Lapa bija 277 vārdi ar vienu virsrakstu un bez neviena H2: navigācija,
          ne galamērķis. Teksts stāv ZEM režģa, jo darbu lapā pirmais ir darbs.
          Abas sadaļas ved uz komercijas lapām ar atslēgvārdu enkurā. */}
      {isLv ? (
        <Section rhythm="md" surface="ink-850" labelledBy="darbu-veidi">
          <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
            <div>
              <SectionTitle id="darbu-veidi" className="mb-5">
                Mājaslapas šajā sarakstā
              </SectionTitle>
              <p className="max-w-[58ch] text-[16px] leading-[1.6] text-paper-2">
                <LinkedText text={WEB_NOTE} />
              </p>
            </div>
            <div>
              <SectionTitle id="zimola-darbi" className="mb-5">
                Logo un zīmola darbi
              </SectionTitle>
              <p className="max-w-[58ch] text-[16px] leading-[1.6] text-paper-2">
                <LinkedText text={BRAND_NOTE} />
              </p>
            </div>
          </div>
        </Section>
      ) : null}

      {/* ============ SĀKSIM ============ */}
      <ClosingLine
        text={
          isLv
            ? `Uzraksti uz ${CONTACT_EMAIL}, kas tev vajadzīgs - godīgi novērtēšu, cik tas prasīs laika un naudas, un pēc pirmās sarunas saņemsi fiksētu tāmi ar termiņu.`
            : `Write to ${CONTACT_EMAIL} and tell me what you need. I will give you an honest estimate of time and cost, and a fixed quote after the first call.`
        }
        note={isLv ? "Atbilde 1 darba dienā" : "Reply in 1 working day"}
      />
    </>
  );
}

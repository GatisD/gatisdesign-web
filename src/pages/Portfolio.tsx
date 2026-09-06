import { useMemo, useState } from "react";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Reveal from "@/components/animations/Reveal";
import LineReveal from "@/components/animations/LineReveal";
import MagneticButton from "@/components/animations/MagneticButton";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import { Section, SectionTitle, LabelRow } from "@/components/direction/Section";
import ProjectCard from "@/components/ProjectCard";
import { projects, CATEGORY_LABEL, type ProjectCategory } from "@/data/projects";
import { useLocale } from "@/i18n/LocaleContext";
import { pathFor } from "@/i18n/routes";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

type Filter = "all" | ProjectCategory;

const META_DESCRIPTION =
  "23 pabeigti projekti: mājaslapu izstrādes piemēri, logo un zīmola darbi. Estire, Box Latvia, ROIS.lv, Apmeklē.lv. Katram projektam norādīta loma un gads.";

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
  const { locale, t, path } = useLocale();
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
              Projekti, kas strādā arī ārpus prezentācijas. Pie katra darba ir norādīts klients, mana
              loma un gads - daļa projektu tapa ROIS komandā, daļa - vienam pašam.
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

      {/* ============ SĀKSIM ============ */}
      <Section rhythm="lg" surface="ink-950" labelledBy="portfolio-cta-h">
        <SectionTitle id="portfolio-cta-h" className="mb-[clamp(22px,3vw,34px)]">
          {isLv ? "Vai nākamais darbs būs tavs?" : "Will the next one be yours?"}
        </SectionTitle>
        <LabelRow label={isLv ? "Atbilde 1 darba dienā" : "Reply in 1 working day"}>
          <p className="max-w-[58ch] text-[17px] leading-[1.6] text-paper-2">
            {isLv
              ? "Uzraksti, ko tev vajag - godīgi novērtēšu, cik tas prasīs laika un naudas, un pēc pirmās sarunas tu saņemsi fiksētu tāmi ar termiņu."
              : "Tell me what you need. I will give you an honest estimate of time and cost, and a fixed quote after the first call."}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton>
              <Button to={path("contact")}>{t.nav.cta}</Button>
            </MagneticButton>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-block border-b border-line-amber py-1.5 text-[clamp(1rem,1.4vw,1.2rem)] text-paper transition-colors duration-300 hover:text-amber"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </LabelRow>
      </Section>
    </>
  );
}

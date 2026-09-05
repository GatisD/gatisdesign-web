import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

type Filter = "all" | ProjectCategory;

const META_DESCRIPTION =
  "23 pabeigti projekti: mājaslapu izstrādes piemēri, logo un zīmola darbi. Estire, Box Latvia, ROIS.lv, Apmeklē.lv, Lauvas Zobs. Katram projektam norādīta loma un gads.";

/**
 * Režģa ritms. Piecu flīžu cikls: divas platas (7+5), tad trīs vienādas (4+4+4).
 * Rindas iekšienē kadra proporcija ir VIENĀDA - nevienāds augstums vienā rindā
 * pie augšā līdzinātām kartēm lasās kā kļūda, ne kā ritms.
 */
const SPAN = ["md:col-span-7", "md:col-span-5", "md:col-span-4", "md:col-span-4", "md:col-span-4"];
const RATIO = ["16 / 10", "16 / 10", "4 / 3", "4 / 3", "4 / 3"];

export default function Portfolio() {
  const { locale, t, path } = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const reduced = useReducedMotion();
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
      url: `${SITE_URL}/portfolio/${project.slug}`,
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
            { name: isLv ? "Sākums" : "Home", path: "/" },
            { name: t.nav.portfolio, path: "/portfolio" },
          ]),
          listSchema,
        ]}
      />

      {/* ============ GALVA ============ */}
      <section className="bg-ink-900 pb-sec-sm pt-[clamp(104px,15vw,180px)]" aria-labelledby="darbi-h">
        <div className="mx-auto w-full max-w-wrap px-pad-x">
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
              loma un gads - daļa projektu tapa ROIS komandā, daļa viena paša rokām.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ FILTRS ============ */}
      <div className="sticky top-16 z-40 border-y border-line bg-ink-900/90 backdrop-blur-md md:top-[72px]">
        <div
          role="group"
          aria-label={isLv ? "Darbu filtrs" : "Work filter"}
          className="mx-auto flex max-w-wrap flex-wrap items-center gap-x-8 gap-y-1 px-pad-x py-3"
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
                  "relative inline-flex min-h-[44px] items-center gap-2 text-[16px] transition-colors duration-300",
                  active ? "text-paper" : "text-paper-dim hover:text-paper",
                )}
              >
                {item.label}
                <span className="font-label text-label text-paper-faint">{item.count}</span>
                {active ? (
                  <motion.span
                    aria-hidden="true"
                    layoutId="filter-underline"
                    className="absolute inset-x-0 bottom-1 h-[2px] bg-amber"
                    transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 42 }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============ REŽĢIS ============ */}
      <Section rhythm="lg" ariaLabel={isLv ? "Darbu saraksts" : "Work list"}>
        <div className="grid gap-grid md:grid-cols-12">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project, i) => (
              <motion.div
                key={project.slug}
                layout={reduced ? false : "position"}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.42, ease: [0.22, 0.61, 0.36, 1], delay: Math.min(i, 5) * 0.04 }
                }
                className={SPAN[i % SPAN.length]}
              >
                <ProjectCard project={project} eager={i === 0} ratio={RATIO[i % RATIO.length]} />
              </motion.div>
            ))}
          </AnimatePresence>
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
          {isLv ? "Vai tavs projekts būs nākamais sarakstā?" : "Will your project be next on this list?"}
        </SectionTitle>
        <LabelRow label={isLv ? "Sāksim" : "Start"}>
          <p className="max-w-[58ch] text-[17px] leading-[1.6] text-paper-2">
            {isLv
              ? "Uzraksti, ko vajag - godīgi novērtēšu, cik tas prasīs laika un naudas, un pēc pirmās sarunas tu saņem fiksētu tāmi ar termiņu."
              : "Tell me what you need. I will give you an honest estimate of time and cost, and a fixed quote after the first call."}
          </p>
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

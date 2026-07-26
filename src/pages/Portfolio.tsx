import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import Kicker from "@/components/ui/Kicker";
import ProjectTile from "@/components/ProjectTile";
import { projects, CATEGORY_LABEL, type Project, type ProjectCategory } from "@/data/projects";
import { useLocale } from "@/i18n/LocaleContext";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

type Filter = "all" | ProjectCategory;

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "Visi" },
  { key: "web", label: CATEGORY_LABEL.web },
  { key: "brand", label: CATEGORY_LABEL.brand },
];

const META_DESCRIPTION =
  "Mājaslapas, zīmolu identitātes, ilustrācijas un drukas darbi. Pie katra projekta redzams klients, mana loma un tehnoloģijas.";

/** Flīzes augstums kolonnas platuma vienībās: attēls plus paraksta bloks. */
const tileCost = (project: Project) => project.cover.height / project.cover.width + 0.12;

/**
 * Sadala sarakstu divās kolonnās pēc uzkrātā augstuma, NESAJAUCOT secību: pirmās
 * flīzes iet kreisajā kolonnā, pārējās labajā. Tā uz telefona (viena kolonna zem
 * otras) saglabājas tā pati secība, kas datora režģī, un abas kolonnas beidzas
 * aptuveni vienā augstumā.
 */
function splitColumns(list: Project[]): [Project[], Project[]] {
  if (list.length < 2) return [list, []];
  const total = list.reduce((sum, project) => sum + tileCost(project), 0);
  let acc = 0;
  let cut = list.length;
  for (let i = 0; i < list.length; i++) {
    const cost = tileCost(list[i]);
    if (acc + cost / 2 > total / 2) {
      cut = i;
      break;
    }
    acc += cost;
  }
  cut = Math.min(Math.max(cut, 1), list.length - 1);
  return [list.slice(0, cut), list.slice(cut)];
}

export default function Portfolio() {
  const { locale } = useLocale();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );
  const [columnA, columnB] = splitColumns(visible);

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
    // Negatīvā augšmala pavelk tumšo fonu zem fiksētās galvenes (Layout main pt-20/24).
    <div className="-mt-20 flex-1 bg-ink-900 pt-20 text-paper md:-mt-24 md:pt-24">
      <SEO
        routeKey="portfolio"
        locale={locale}
        title="Darbi"
        description={META_DESCRIPTION}
        // TODO: EN saturs vēl nav uzrakstīts, tāpēc /en rāda LV tekstu ar noindex,
        // tāpat kā pakalpojumu lapas.
        noindex={locale !== "lv"}
      />
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Sākums", path: "/" },
            { name: "Darbi", path: "/portfolio" },
          ]),
          listSchema,
        ]}
      />

      {/* ============ GALVA ============ */}
      <section className="relative overflow-hidden border-b border-line" aria-labelledby="darbi-h">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-6%] top-[-30%] h-[min(460px,52vw)] w-[min(760px,92vw)] rounded-full opacity-60 blur-[90px]"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(224,114,60,.26), transparent 68%)",
          }}
        />
        <div className="relative mx-auto max-w-wrap px-[var(--pad-x)] pb-[clamp(40px,5vw,68px)] pt-[clamp(32px,5vw,72px)]">
          <Kicker className="mb-[clamp(18px,2.4vw,28px)]">Darbi</Kicker>
          <h1
            id="darbi-h"
            className="max-w-[18ch] text-[clamp(2.1rem,5vw,4.1rem)] font-light leading-[1.04] tracking-[-0.042em] [text-wrap:balance]"
          >
            Projekti, kas <span className="font-accent italic text-amber-soft">strādā</span> arī
            ārpus prezentācijas
          </h1>
          <p className="mt-[clamp(20px,2.6vw,30px)] max-w-[62ch] text-[clamp(1.02rem,1.28vw,1.19rem)] leading-[1.62] text-paper-2">
            Mājaslapas, zīmolu identitātes, ilustrācijas un drukas darbi. Pie katra darba ir norādīts,
            kas bija klients un kāda bija mana loma - daļa projektu tapa ROIS komandā, daļa - viens
            pats.
          </p>
        </div>
      </section>

      {/* ============ FILTRS ============ */}
      <section className="border-b border-line bg-ink-850" aria-label="Darbu filtrs">
        <div className="mx-auto flex max-w-wrap flex-wrap items-center gap-2.5 px-[var(--pad-x)] py-[clamp(16px,2vw,22px)]">
          {FILTERS.map((item) => {
            const active = item.key === filter;
            const count =
              item.key === "all"
                ? projects.length
                : projects.filter((p) => p.category === item.key).length;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                aria-pressed={active}
                className={cnFilter(active)}
              >
                {item.label}
                <span className={active ? "text-[#1a1206]/60" : "text-paper-faint"}>{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============ REŽĢIS ============ */}
      <section className="mx-auto max-w-wrap px-[var(--pad-x)] py-[var(--sec-y)]" aria-label="Darbu saraksts">
        <div className="grid gap-[clamp(28px,3.4vw,40px)] md:grid-cols-2 md:gap-[clamp(24px,2.6vw,38px)]">
          <div className="grid content-start gap-[clamp(28px,3.4vw,40px)]">
            {columnA.map((project, i) => (
              <ProjectTile key={project.slug} project={project} eager={i === 0} />
            ))}
          </div>
          <div className="grid content-start gap-[clamp(28px,3.4vw,40px)] md:mt-[clamp(46px,6vw,104px)]">
            {columnB.map((project) => (
              <ProjectTile key={project.slug} project={project} />
            ))}
          </div>
        </div>

        {/* Bez skaitļa locīšanas: "Redzami: 14 no 23" strādā ar jebkuru skaitli. */}
        <p className="mt-[clamp(36px,4vw,56px)] text-center text-[13px] text-paper-dim">
          Redzami: {visible.length} no {projects.length}
        </p>
      </section>

      {/* ============ CTA ============ */}
      <section className="border-t border-line bg-ink-950" aria-labelledby="portfolio-cta-h">
        <div className="mx-auto grid max-w-wrap justify-items-center gap-6 px-[var(--pad-x)] py-[var(--sec-y)] text-center">
          <Kicker>Sadarbība</Kicker>
          <h2
            id="portfolio-cta-h"
            className="max-w-[18ch] text-[clamp(1.85rem,4.2vw,3.2rem)] font-light leading-[1.06] tracking-[-0.04em] [text-wrap:balance]"
          >
            Vai tavs projekts būs nākamais <span className="font-accent italic text-amber-soft">šajā</span>{" "}
            sarakstā?
          </h2>
          <p className="max-w-[58ch] text-[clamp(1rem,1.2vw,1.12rem)] leading-[1.62] text-paper-2">
            Uzraksti, ko vajag - godīgi novērtēšu, cik tas prasīs laika un naudas.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3.5">
            <Button href={`mailto:${CONTACT_EMAIL}`}>
              Sākt projektu
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Filtra pogas stils. Atsevišķi, lai JSX paliek lasāms. */
function cnFilter(active: boolean): string {
  return [
    "inline-flex items-center gap-2 rounded-full px-[18px] py-[9px] text-[13.5px] font-medium",
    "transition-[background-color,color,border-color,transform] duration-300",
    active
      ? "border border-amber bg-amber text-[#1a1206]"
      : "border border-line-strong text-paper-2 hover:border-amber hover:text-amber",
  ].join(" ");
}

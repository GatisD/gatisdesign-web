import { useMemo, useState } from "react";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import FadeInOnScroll from "@/components/animations/FadeInOnScroll";
import PortfolioTile from "@/components/PortfolioTile";
import { portfolioWorks, categories, type PortfolioCategory } from "@/data/portfolio";

export default function Portfolio() {
  const [active, setActive] = useState<"Visi" | PortfolioCategory>("Visi");

  const filtered = useMemo(() => {
    if (active === "Visi") return portfolioWorks;
    return portfolioWorks.filter((w) => w.category === active);
  }, [active]);

  return (
    <>
      <SEO
        title="Portfolio"
        description="Atlasītie brand identity, web, ilustrāciju un drukas projekti. 18 gadu darba kolekcija."
        path="/portfolio"
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Sākums", path: "/" },
          { name: "Portfolio", path: "/portfolio" },
        ])}
      />

      {/* Header */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 pt-12 pb-16 md:pt-16 md:pb-24">
        <FadeInOnScroll>
          <span className="eyebrow orange-dot text-muted-foreground block mb-6">PORTFOLIO</span>
          <h1 className="h1-hero text-balance max-w-4xl">Atlasītie projekti, kas iztur laiku</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-8 leading-relaxed">
            18 gadu darbā tapušas dažādas vizuālās valodas — no logo līdz pilnām zīmola sistēmām un
            mājaslapām. Šeit redzami atlasītie darbi.
          </p>
        </FadeInOnScroll>
      </section>

      {/* Filter bar */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 mb-10 md:mb-16 sticky top-20 md:top-24 z-30 bg-background/85 backdrop-blur py-4">
        <div className="flex flex-wrap items-center gap-3">
          {categories.map((c) => {
            const isActive = c === active;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                className={`px-5 py-2 font-mono text-[11px] uppercase tracking-widest rounded-lg border transition-colors ${
                  isActive
                    ? "bg-foreground text-background border-foreground"
                    : "border-foreground text-foreground hover:bg-foreground hover:text-background"
                }`}
                aria-pressed={isActive}
              >
                {c}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 mb-24 md:mb-32">
        <div className="grid grid-cols-4 md:grid-cols-12 gap-4 md:gap-6">
          {filtered.map((work, i) => (
            <FadeInOnScroll
              key={work.id}
              delay={(i % 4) * 0.08}
              className={`col-span-4 ${
                work.span === 8 ? "md:col-span-8" : work.span === 6 ? "md:col-span-6" : "md:col-span-4"
              }`}
            >
              {/* PortfolioTile applies its own col-span via prop, but we already wrap.
                  To avoid double-span, we render inline tile body here. */}
              <PortfolioTile work={work} />
            </FadeInOnScroll>
          ))}
        </div>

        <FadeInOnScroll className="mt-16 flex flex-col items-center gap-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Apskatīts {filtered.length} no 100+
          </p>
        </FadeInOnScroll>
      </section>
    </>
  );
}

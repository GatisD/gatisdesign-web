import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SEO from "@/components/SEO";
import JsonLd, { personSchema, professionalServiceSchema } from "@/components/JsonLd";
import RevealText from "@/components/animations/RevealText";
import FadeInOnScroll from "@/components/animations/FadeInOnScroll";
import CountUp from "@/components/animations/CountUp";
import Marquee from "@/components/animations/Marquee";
import HoverLift from "@/components/animations/HoverLift";
import MagneticButton from "@/components/animations/MagneticButton";
import { stats, clientLogos, portfolioWorks } from "@/data/portfolio";
import { CONTACT_EMAIL } from "@/lib/site";

export default function Index() {
  // Top 4 darbi sākumlapas "Nesenie projekti" sadaļā
  const featured = portfolioWorks.slice(0, 4);

  return (
    <>
      <SEO />
      <JsonLd data={[personSchema, professionalServiceSchema]} />

      {/* HERO — asimetrisks 3-image grid */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12 lg:gap-16 items-center">
        <div>
          <span className="eyebrow orange-dot text-muted-foreground block mb-6">
            BRAND IDENTITY
          </span>
          <RevealText
            text="Brand identity ar 18 gadu pieredzi"
            as="h1"
            className="h1-hero mb-8 text-balance"
          />
          <FadeInOnScroll delay={0.4}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              100+ projekti zīmoliem Latvijā un ārpus. Logo, mājaslapas, ilustrācijas, drukai.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/portfolio">
                <MagneticButton
                  className="bg-foreground text-background px-8 py-4 rounded-lg text-base font-medium inline-flex items-center group transition-all"
                  aria-label="Apskatīt darbus portfolio sadaļā"
                >
                  Apskatīt darbus
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </MagneticButton>
              </Link>
              <Link to="/kontakti">
                <MagneticButton
                  className="border border-foreground text-foreground px-8 py-4 rounded-lg text-base font-medium hover:bg-foreground hover:text-background transition-all"
                  aria-label="Sākt sarunu — pāriet uz kontaktu lapu"
                >
                  Sākt sarunu
                </MagneticButton>
              </Link>
            </div>
          </FadeInOnScroll>
        </div>

        {/* Asimetrisks 3-image grid: 1 lielais kreisajā, 2 vertikāli sakrauti labajā */}
        <FadeInOnScroll delay={0.5} className="relative grid grid-cols-2 gap-3 md:gap-4 h-[400px] md:h-[500px]">
          <Link
            to="/portfolio/box-latvia"
            className="relative overflow-hidden bg-secondary border border-border group"
            aria-label="Atvērt Box Latvia projekta lapu"
          >
            <img
              src="/portfolio/box-latvia-cover.jpg"
              alt="Box Latvia — brand identity"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="eager"
              decoding="async"
              width={2000}
              height={1500}
            />
          </Link>
          <div className="grid grid-rows-2 gap-3 md:gap-4 h-full">
            <Link
              to="/portfolio/apmekle"
              className="relative overflow-hidden bg-secondary border border-border group"
              aria-label="Atvērt Apmeklē.lv projekta lapu"
            >
              <img
                src="/portfolio/apmekle-cover.jpg"
                alt="Apmeklē.lv — brand identity"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
                decoding="async"
                width={2000}
                height={2000}
              />
            </Link>
            <Link
              to="/portfolio/digitalaisdzintars"
              className="relative overflow-hidden bg-secondary border border-border group"
              aria-label="Atvērt Digitālais Dzintars projekta lapu"
            >
              <img
                src="/portfolio/digitalaisdzintars-cover.jpg"
                alt="Digitālais Dzintars — brand identity"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
                decoding="async"
                width={2000}
                height={2500}
              />
            </Link>
          </div>
        </FadeInOnScroll>
      </section>

      {/* STATS */}
      <FadeInOnScroll>
        <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 border-t border-b border-border">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col gap-2 ${i < stats.length - 1 ? "md:border-r md:border-border md:pr-4" : ""}`}
              >
                <span className="font-display text-4xl lg:text-6xl font-semibold">
                  <CountUp to={s.number} suffix={s.suffix ?? ""} />
                </span>
                <span className="eyebrow text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      </FadeInOnScroll>

      {/* CLIENT LOGOS — Marquee */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <span className="eyebrow text-muted-foreground whitespace-nowrap">UZTICAS</span>
        <div className="w-full">
          <Marquee speed={35}>
            {clientLogos.map((name) => (
              <span
                key={name}
                className="font-display text-2xl md:text-3xl font-bold tracking-tighter grayscale-soft px-6"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* FEATURED WORKS */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 md:mb-16 gap-6">
          <div>
            <span className="eyebrow text-muted-foreground block mb-4">DARBI</span>
            <h2 className="h2-editorial">Nesenie projekti</h2>
          </div>
          <Link
            to="/portfolio"
            className="eyebrow text-foreground hover-underline inline-flex items-center self-start"
          >
            Visi darbi <ArrowUpRight size={14} className="ml-2" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-12 md:gap-y-20">
          {featured.map((work, i) => (
            <FadeInOnScroll
              key={work.slug}
              delay={i * 0.08}
              className={i % 2 === 1 ? "md:mt-12" : i === 2 ? "md:-mt-12" : ""}
            >
              <HoverLift>
                <Link to={`/portfolio/${work.slug}`} className="block group">
                  <div
                    className={`overflow-hidden bg-secondary border border-border mb-5 ${
                      work.aspect === "4/5" ? "aspect-[4/5]" : work.aspect === "square" ? "aspect-square" : "aspect-[4/3]"
                    }`}
                  >
                    {work.cover ? (
                      <img
                        src={work.cover}
                        alt={`${work.name} — ${work.category}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        width={800}
                        height={600}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display font-bold text-4xl md:text-5xl text-foreground/15 text-center px-6">
                          {work.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="eyebrow text-muted-foreground">{work.category}</span>
                  <h3 className="font-display text-xl md:text-2xl font-semibold mt-2 group-hover:text-accent transition-colors">
                    {work.name}
                  </h3>
                </Link>
              </HoverLift>
            </FadeInOnScroll>
          ))}
        </div>
      </section>

      {/* MINI ABOUT */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <FadeInOnScroll className="aspect-square overflow-hidden bg-secondary border border-border order-2 lg:order-1">
          <div className="w-full h-full flex items-center justify-center grayscale">
            <span className="font-display font-bold text-5xl md:text-6xl text-foreground/15">
              Gatis
            </span>
          </div>
        </FadeInOnScroll>
        <FadeInOnScroll className="order-1 lg:order-2">
          <span className="eyebrow text-muted-foreground block mb-6">PAR MANI</span>
          <h2 className="h2-editorial mb-8">Brand identity ar uzsvaru uz stāstu</h2>
          <p className="text-lg mb-6 text-muted-foreground leading-relaxed">
            Esmu Gatis — neatkarīgs brand un web dizainers ar 18 gadu pieredzi. Strādāju ar zīmoliem
            Latvijā un ārpus, primary fokuss uz brand identity, mājaslapām un izdrukāmā satura
            dizainu.
          </p>
          <p className="text-lg mb-10 text-muted-foreground leading-relaxed">
            Kvalitāte priekš kvantitātes. Katrs projekts pelnījis pilnu uzmanību.
          </p>
          <Link to="/par-mani" className="eyebrow text-foreground hover-underline inline-flex items-center">
            Vairāk par mani <ArrowUpRight size={14} className="ml-2" />
          </Link>
        </FadeInOnScroll>
      </section>

      {/* CTA BANNER */}
      <section className="bg-foreground text-background py-24 md:py-32">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 text-center">
          <FadeInOnScroll>
            <h2 className="h1-hero mb-6 text-balance">Gatavs sākt projektu?</h2>
            <div className="mb-10 md:mb-12">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-display text-2xl md:text-4xl font-medium border-b-2 border-accent pb-2 hover:opacity-80 transition-opacity inline-block"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
            <Link to="/kontakti">
              <MagneticButton
                className="border border-background text-background px-10 md:px-12 py-4 rounded-lg text-base md:text-lg font-medium hover:bg-background hover:text-foreground transition-all"
                aria-label="Pāriet uz kontaktu lapu"
              >
                Rakstīt
              </MagneticButton>
            </Link>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}

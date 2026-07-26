import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SEO from "@/components/SEO";
import JsonLd from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import Kicker from "@/components/ui/Kicker";
import SectionHead from "@/components/ui/SectionHead";
import CountUp from "@/components/animations/CountUp";
import ProjectTile from "@/components/ProjectTile";
import { useLocale } from "@/i18n/LocaleContext";
import { ROUTES, type RouteKey } from "@/i18n/routes";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL, SOCIAL } from "@/lib/site";
import { featuredSlugs, projectBySlug, type Project } from "@/data/projects";
import {
  aboutSection,
  contactSection,
  heroCtas,
  heroSection,
  homeContent,
  serviceCards,
  servicesSection,
  statItems,
  statsSection,
  worksSection,
} from "@/content/home";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Teksta palīgi. Saturs nāk no home.json un netiek pārrakstīts - šeit
 * tikai tiek pielikts marķējums: akcents, izcelts skaitlis, saite.
 * ------------------------------------------------------------------ */

/** Ietin vienu vārdu akcenta stilā. Ja vārda nav, teksts paliek nemainīts. */
function accent(text: string, word: string, className: string): ReactNode {
  const at = text.indexOf(word);
  if (at === -1) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className={className}>{word}</span>
      {text.slice(at + word.length)}
    </>
  );
}

/** Izceļ skaitļus rindkopā ("18 gadu praksē, 100+ projekti"). */
function withNumbers(text: string): ReactNode {
  return text.split(/(\d+\+?)/g).map((part, i) =>
    /^\d+\+?$/.test(part) ? (
      <b key={i} className="font-semibold text-paper">
        {part}
      </b>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** LV ceļš saturā -> maršruta atslēga, lai saite strādā arī zem /en. */
const ROUTE_KEY_BY_LV_PATH = Object.fromEntries(
  (Object.keys(ROUTES) as RouteKey[]).map((key) => [ROUTES[key].lv, key]),
) as Record<string, RouteKey>;

const LINK_TOKEN = new RegExp(`(${CONTACT_EMAIL.replace(/\./g, "\\.")}|/[a-z-]+)`, "g");

const INLINE_LINK =
  "underline decoration-amber/50 underline-offset-4 transition-colors duration-200 hover:text-amber";

/**
 * Rindkopa, kurā satura tekstā ierakstītie ceļi (/portfolio) un e-pasts
 * kļūst par īstām saitēm. Teksts paliek burtiski tāds, kāds tas ir saturā.
 */
function LinkedText({ text }: { text: string }) {
  const { path } = useLocale();
  return (
    <>
      {text.split(LINK_TOKEN).map((part, i) => {
        if (part === CONTACT_EMAIL) {
          return (
            <a key={i} href={`mailto:${CONTACT_EMAIL}`} className={INLINE_LINK}>
              {part}
            </a>
          );
        }
        const key = ROUTE_KEY_BY_LV_PATH[part];
        if (key) {
          return (
            <Link key={i} to={path(key)} className={INLINE_LINK}>
              {part}
            </Link>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Dati
 * ------------------------------------------------------------------ */

/**
 * Uzticības joslas klienti. Vārdi nāk no home.json darbu sadaļas ("Box Latvia",
 * "Estire", "Universal Solutions" un "Citi klienti" punkta) - šeit nav neviena
 * jauna nosaukuma.
 */
const TRUST_CLIENTS = [
  "Estire",
  "MLM Cargo",
  "ARM Metals",
  "Tavasdurvis",
  "Box Latvia",
  "Universal Solutions",
];

/**
 * Hero specifikāciju josla. Vieta un kompetences nāk no home.json (directAnswer
 * un metaTitle), statuss - no apstiprinātā koncepta.
 */
const HERO_SPECS = [
  { term: "Atrašanās vieta", value: "Rīga, Latvija", live: false },
  { term: "Kompetences", value: "Zīmols, web, AI, SEO", live: false },
  { term: "Statuss", value: "Uzņemu jaunus projektus", live: true },
];

/**
 * Darbu izlase. home.json darbu sadaļā ir rakstīts "Šeit pieci darbi", tāpēc
 * flīžu ir tieši piecas. Otrā kolonna ir nobīdīta uz leju, kā konceptā.
 * Slugi nāk no src/data/projects.ts, tur arī pārbaudīts, ka tie eksistē.
 */
const bySlug = (slugs: string[]): Project[] =>
  slugs.map((slug) => projectBySlug(slug)).filter(Boolean) as Project[];

/* ------------------------------------------------------------------ *
 * Strukturētie dati
 * ------------------------------------------------------------------ */

const sameAs = [SOCIAL.dribbble, SOCIAL.facebook, SOCIAL.instagram, SOCIAL.linkedin];
const postalAddress = {
  "@type": "PostalAddress",
  addressLocality: "Rīga",
  addressCountry: "LV",
};

const homePersonSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gatis Daugavietis",
  alternateName: SITE_NAME,
  jobTitle: "Web dizainers un izstrādātājs",
  description: homeContent.directAnswer,
  url: SITE_URL,
  email: CONTACT_EMAIL,
  image: `${SITE_URL}/og-image.png`,
  address: postalAddress,
  knowsLanguage: ["lv", "en"],
  knowsAbout: serviceCards.map((card) => card.title),
  sameAs,
};

const homeServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE_NAME,
  description: homeContent.metaDescription,
  url: SITE_URL,
  email: CONTACT_EMAIL,
  image: `${SITE_URL}/og-image.png`,
  areaServed: ["Latvija", "Igaunija", "Lietuva", "ASV"],
  address: postalAddress,
  founder: { "@type": "Person", name: "Gatis Daugavietis" },
  sameAs,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Pakalpojumi",
    itemListElement: serviceCards.map((card) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: card.title,
        url: `${SITE_URL}${card.target}`,
      },
    })),
  },
};

/** metaTitle satur zīmolu vidū, bet SEO komponente to pieliek beigās. */
const PAGE_TITLE = homeContent.metaTitle.replace(` - ${SITE_NAME} |`, " -");

/* ------------------------------------------------------------------ *
 * Lapa
 * ------------------------------------------------------------------ */

export default function Index() {
  const { locale, t, path } = useLocale();
  const isLv = locale === "lv";

  // TODO: EN sākumlapas saturs vēl nav uzrakstīts. Līdz tam /en rāda LV tekstu
  // ar noindex, tāpat kā pakalpojumu lapas - lai Google neindeksē latviešu
  // saturu zem angļu URL.
  const noindex = !isLv;

  const columnA = bySlug(featuredSlugs.columnA);
  const columnB = bySlug(featuredSlugs.columnB);

  return (
    // Negatīvā augšmala pavelk tumšo fonu zem fiksētās galvenes (Layout main
    // pt-20/24), lai zem caurspīdīgās galvenes nepaliktu gaiša josla.
    <div className="-mt-20 flex-1 bg-ink-900 pt-20 text-paper md:-mt-24 md:pt-24">
      <SEO
        routeKey="home"
        locale={locale}
        title={PAGE_TITLE}
        description={homeContent.metaDescription}
        noindex={noindex}
      />
      <JsonLd data={[homePersonSchema, homeServiceSchema]} />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden" aria-labelledby="hero-h">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)",
            backgroundSize: "clamp(72px,8vw,116px) clamp(72px,8vw,116px)",
            WebkitMaskImage: "radial-gradient(120% 92% at 50% 0%, #000 12%, transparent 78%)",
            maskImage: "radial-gradient(120% 92% at 50% 0%, #000 12%, transparent 78%)",
          }}
        />
        {/* Trīs slāņu vara mirdzums */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span
            className="absolute left-[-8%] top-[-16%] h-[min(560px,62vw)] w-[min(760px,92vw)] rounded-full opacity-[0.55] blur-[90px]"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(224,114,60,.30), transparent 68%)",
            }}
          />
          <span
            className="absolute right-[-10%] top-[6%] h-[min(500px,58vw)] w-[min(620px,80vw)] rounded-full opacity-[0.55] blur-[90px]"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(152,70,30,.26), transparent 66%)",
            }}
          />
          <span
            className="absolute bottom-[-22%] left-[24%] h-[min(320px,40vw)] w-[min(900px,96vw)] rounded-full opacity-[0.55] blur-[90px]"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(224,114,60,.14), transparent 70%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-wrap px-[var(--pad-x)] pb-[clamp(56px,7vw,96px)] pt-[clamp(32px,5vw,80px)]">
          <div className="mb-[clamp(24px,3.4vw,40px)] flex flex-wrap items-center gap-x-4 gap-y-2">
            <Kicker>Dizainers un izstrādātājs</Kicker>
            <span className="text-[13px] text-paper-faint">Kopš 2008. gada</span>
          </div>

          <h1
            id="hero-h"
            className="max-w-[19ch] text-[clamp(2.3rem,5.6vw,4.6rem)] font-light leading-[1.03] tracking-[-0.042em] [text-wrap:balance]"
          >
            {accent(homeContent.h1, "aģentus", "font-accent italic text-amber-soft")}
          </h1>

          <p className="mt-[clamp(22px,3vw,32px)] max-w-[58ch] text-[clamp(1.02rem,1.28vw,1.19rem)] leading-[1.62] text-paper-2">
            {withNumbers(heroSection.body[0])}
          </p>

          <div className="mt-[clamp(28px,3.6vw,42px)] flex flex-wrap gap-3.5">
            <Button to={path(ROUTE_KEY_BY_LV_PATH[heroCtas[0].target])}>
              {heroCtas[0].label}
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
            <Button to={path(ROUTE_KEY_BY_LV_PATH[heroCtas[1].target])} variant="ghost">
              {heroCtas[1].label}
            </Button>
          </div>

          <dl className="mt-[clamp(44px,6vw,80px)] grid border-t border-line sm:grid-cols-3">
            {HERO_SPECS.map((spec) => (
              <div
                key={spec.term}
                className="border-b border-line py-5 sm:border-b-0 sm:pb-0 sm:pt-[22px]"
              >
                <dt className="text-[11.5px] uppercase tracking-[0.16em] text-paper-faint">
                  {spec.term}
                </dt>
                <dd
                  className={cn(
                    "mt-[7px] text-[clamp(0.98rem,1.15vw,1.08rem)] tracking-[-0.015em]",
                    spec.live ? "text-amber" : "text-paper",
                  )}
                >
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============ ĪSĀ ATBILDE ============ */}
      <section
        className="mx-auto max-w-wrap px-[var(--pad-x)] pb-[clamp(48px,6vw,84px)]"
        aria-labelledby="atbilde-h"
      >
        <div className="reveal max-w-[74ch] border-l-2 border-amber bg-ink-850 px-6 py-6 md:px-8 md:py-7">
          <h2
            id="atbilde-h"
            className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.19em] text-paper-faint"
          >
            Īsā atbilde
          </h2>
          <p className="text-[clamp(1.02rem,1.35vw,1.22rem)] leading-[1.6] text-paper">
            {homeContent.directAnswer}
          </p>
        </div>
      </section>

      {/* ============ UZTICĪBAS JOSLA ============ */}
      <section className="border-y border-line bg-ink-850" aria-labelledby="uzticas-h">
        <div className="mx-auto flex max-w-wrap flex-wrap items-center gap-x-[clamp(16px,3vw,42px)] gap-y-3 px-[var(--pad-x)] py-[26px]">
          <h2 className="shrink-0 text-[11.5px] font-semibold uppercase tracking-[0.19em] text-paper-faint" id="uzticas-h">
            Ar mani strādā
          </h2>
          <ul className="flex flex-wrap items-center gap-x-[clamp(14px,2.6vw,36px)] gap-y-2">
            {TRUST_CLIENTS.map((name) => (
              <li
                key={name}
                className="text-[clamp(0.96rem,1.25vw,1.14rem)] font-medium tracking-[-0.02em] text-paper-2 transition-colors duration-300 hover:text-amber-soft"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ PAKALPOJUMI ============ */}
      <section aria-labelledby="pakalpojumi-h">
        <div className="mx-auto max-w-wrap px-[var(--pad-x)] py-[var(--sec-y)]">
          <SectionHead
            id="pakalpojumi-h"
            kicker={servicesSection.kicker ?? "Pakalpojumi"}
            title={accent(servicesSection.heading, "viena atbildība", "font-semibold")}
            lede={servicesSection.body[0]}
          />

          <ul className="grid gap-[clamp(16px,2vw,24px)] md:grid-cols-2">
            {serviceCards.map((card, i) => {
              const key = ROUTE_KEY_BY_LV_PATH[card.target];
              return (
                <li key={card.target} className="reveal">
                  <Link
                    to={path(key)}
                    className="group flex h-full flex-col rounded-2xl border border-line bg-ink-850 p-6 transition-[transform,border-color,background-color] duration-500 [transition-timing-function:var(--ease)] hover:-translate-y-[3px] hover:border-amber/40 hover:bg-ink-800 md:p-8"
                  >
                    <span className="font-accent text-[clamp(1.5rem,2.5vw,2.1rem)] italic leading-none text-paper-faint transition-colors duration-300 group-hover:text-amber">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-5 text-[clamp(1.28rem,2.3vw,1.85rem)] font-normal tracking-[-0.032em]">
                      {card.title}
                    </h3>
                    <p className="mt-3.5 mb-[clamp(22px,3vw,34px)] max-w-[46ch] text-paper-dim">
                      {card.description}
                    </p>
                    <span className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-5">
                      <span className="text-[14px] font-semibold text-amber">
                        {card.price}
                        {card.term ? (
                          <span className="ml-2 font-normal text-paper-faint">{card.term}</span>
                        ) : null}
                      </span>
                      <ArrowUpRight
                        size={20}
                        aria-hidden="true"
                        className="shrink-0 text-paper-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-amber"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="reveal mt-[clamp(24px,3vw,36px)] max-w-[62ch] text-[15px] text-paper-dim">
            {servicesSection.body[1]}
          </p>
        </div>
      </section>

      {/* ============ DARBI ============ */}
      <section className="border-t border-line" aria-labelledby="darbi-h">
        <div className="mx-auto max-w-wrap px-[var(--pad-x)] py-[var(--sec-y)]">
          <SectionHead
            id="darbi-h"
            kicker={worksSection.kicker ?? "Darbi"}
            title={accent(worksSection.heading, "jau tagad", "font-semibold")}
            lede={<LinkedText text={worksSection.body[0]} />}
          />

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

          <div className="reveal mt-[clamp(40px,5vw,68px)] flex justify-center">
            <Button to={path("portfolio")} variant="ghost">
              {heroCtas[1].label}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* ============ SKAITĻI ============ */}
      <section className="border-t border-line" aria-labelledby="skaitli-h">
        <div className="mx-auto max-w-wrap px-[var(--pad-x)] py-[var(--sec-y)]">
          <SectionHead
            id="skaitli-h"
            kicker={statsSection.kicker ?? "Skaitļi"}
            title={accent(statsSection.heading, "raksturo darbu", "font-semibold")}
            lede={statsSection.body[0]}
          />

          <ul className="reveal grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
            {statItems.map((stat) => (
              <li
                key={stat.label}
                className="bg-ink-900 px-[clamp(20px,2.4vw,30px)] py-[clamp(26px,3.4vw,42px)] transition-colors duration-300 hover:bg-ink-850"
              >
                <span className="block text-[clamp(2.4rem,5.4vw,4.05rem)] font-extralight leading-none tracking-[-0.05em]">
                  <CountUp to={stat.value} />
                  {stat.suffix ? <span className="font-light text-amber">{stat.suffix}</span> : null}
                </span>
                <span className="mt-3.5 block text-[13.5px] leading-[1.5] text-paper-dim">
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ PAR MANI ============ */}
      <section className="border-t border-line bg-ink-850" aria-labelledby="par-h">
        <div className="mx-auto grid max-w-wrap gap-[clamp(28px,4vw,56px)] px-[var(--pad-x)] py-[var(--sec-y)] lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)] lg:gap-[clamp(48px,6vw,96px)]">
          <div className="reveal">
            <Kicker className="mb-4">{aboutSection.kicker ?? "Par mani"}</Kicker>
            <h2
              id="par-h"
              className="max-w-[16ch] text-[clamp(1.85rem,3.6vw,2.8rem)] font-light leading-[1.12] tracking-[-0.036em] [text-wrap:balance]"
            >
              {accent(aboutSection.heading, "mani", "font-accent italic text-amber-soft")}
            </h2>
          </div>

          <div className="reveal">
            {aboutSection.body.map((paragraph) => (
              <p
                key={paragraph}
                className="mb-5 text-[clamp(1rem,1.15vw,1.1rem)] leading-[1.62] text-paper-2 last:mb-0"
              >
                <LinkedText text={paragraph} />
              </p>
            ))}
            <div className="mt-8">
              <Button to={path("about")} variant="ghost">
                {t.nav.about}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ KONTAKTI ============ */}
      <section
        className="relative overflow-hidden border-t border-line bg-ink-950"
        aria-labelledby="kontakti-h"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-38%] h-[min(620px,80vw)] w-[min(1100px,120vw)] -translate-x-1/2 blur-[70px]"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(224,114,60,.17), transparent 66%)",
          }}
        />
        <div className="relative mx-auto grid max-w-wrap justify-items-center gap-6 px-[var(--pad-x)] py-[var(--sec-y)] text-center">
          <Kicker>{contactSection.kicker ?? "Kontakti"}</Kicker>
          <h2
            id="kontakti-h"
            className="max-w-[18ch] text-[clamp(2.05rem,5.2vw,4rem)] font-light leading-[1.04] tracking-[-0.042em] [text-wrap:balance]"
          >
            {accent(contactSection.heading, "sākt", "font-accent italic text-amber-soft")}
          </h2>

          <p className="max-w-[62ch] text-[clamp(1rem,1.2vw,1.12rem)] leading-[1.62] text-paper-2">
            <LinkedText text={contactSection.body[0]} />
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="border-b border-amber/40 pb-1.5 text-[clamp(1.06rem,2.1vw,1.6rem)] tracking-[-0.026em] text-paper transition-colors duration-300 hover:border-amber hover:text-amber"
          >
            {CONTACT_EMAIL}
          </a>

          <div className="mt-2 flex flex-wrap justify-center gap-3.5">
            <Button href={`mailto:${CONTACT_EMAIL}`}>
              {heroCtas[0].label}
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
            <Button to={path("contact")} variant="ghost">
              {t.nav.contact}
            </Button>
          </div>

          <p className="max-w-[62ch] text-[14.5px] leading-[1.6] text-paper-dim">
            {contactSection.body[1]}
          </p>
        </div>
      </section>
    </div>
  );
}

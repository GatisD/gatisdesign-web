import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import JsonLd from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import Reveal, { stagger } from "@/components/animations/Reveal";
import LineReveal from "@/components/animations/LineReveal";
import MagneticButton from "@/components/animations/MagneticButton";
import HeroMedia from "@/components/direction/HeroMedia";
import MediaPlaceholder, { SHOW_PLACEHOLDERS } from "@/components/direction/MediaPlaceholder";
import Band from "@/components/direction/Band";
import { Section, SectionTitle, LabelRow, ProseColumns } from "@/components/direction/Section";
import FaqList from "@/components/content/FaqList";
import ProjectCard from "@/components/ProjectCard";
import { useLocale } from "@/i18n/LocaleContext";
import { ROUTES, type RouteKey } from "@/i18n/routes";
import { CONTACT_EMAIL, CONTENT_MODIFIED, SITE_NAME, SITE_URL, SOCIAL } from "@/lib/site";
import { featured, projectBySlug, projects, type Project } from "@/data/projects";
import {
  aboutSection,
  chainSection,
  contactSection,
  heroCtas,
  heroSection,
  homeContent,
  serviceCards,
  servicesSection,
  trustClients,
  worksSection,
} from "@/content/home";

/* ------------------------------------------------------------------ *
 * Teksta palīgi. Saturs nāk no home.json un netiek pārrakstīts - šeit
 * tam tikai tiek pielikts marķējums.
 * ------------------------------------------------------------------ */

/** LV ceļš saturā -> maršruta atslēga, lai saite strādā arī zem /en. */
const ROUTE_KEY_BY_LV_PATH = Object.fromEntries(
  (Object.keys(ROUTES) as RouteKey[]).map((key) => [ROUTES[key].lv, key]),
) as Record<string, RouteKey>;

const LINK_TOKEN = new RegExp(`(${CONTACT_EMAIL.replace(/\./g, "\\.")}|/[a-z-]+)`, "g");
const INLINE_LINK = "border-b border-line-amber transition-colors duration-300 hover:text-amber";

/** Rindkopa, kurā saturā ierakstītie ceļi un e-pasts kļūst par īstām saitēm. */
function LinkedText({ text }: { text: string }): ReactNode {
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
 * Strukturētie dati
 * ------------------------------------------------------------------ */

const sameAs = [SOCIAL.linkedin, SOCIAL.instagram, SOCIAL.dribbble, SOCIAL.facebook];
const postalAddress = { "@type": "PostalAddress", addressLocality: "Rīga", addressCountry: "LV" };
const PERSON_ID = `${SITE_URL}/#gatis`;
const BUSINESS_ID = `${SITE_URL}/#business`;

const homePersonSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
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
  worksFor: { "@id": BUSINESS_ID },
  sameAs,
  dateModified: CONTENT_MODIFIED,
};

const homeServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": BUSINESS_ID,
  name: SITE_NAME,
  description: homeContent.metaDescription,
  url: SITE_URL,
  email: CONTACT_EMAIL,
  image: `${SITE_URL}/og-image.png`,
  priceRange: "200-3000 EUR",
  currenciesAccepted: "EUR",
  areaServed: ["Latvija", "Igaunija", "Lietuva", "ASV"],
  address: postalAddress,
  founder: { "@id": PERSON_ID },
  provider: { "@id": PERSON_ID },
  sameAs,
  dateModified: CONTENT_MODIFIED,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Pakalpojumi",
    itemListElement: serviceCards.map((card) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: card.title, url: `${SITE_URL}${card.target}` },
    })),
  },
};

const homeWebsiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: ["lv", "en"],
  publisher: { "@id": PERSON_ID },
  about: { "@id": BUSINESS_ID },
};

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeContent.faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const bySlug = (slugs: string[]): Project[] =>
  slugs.map((slug) => projectBySlug(slug)).filter(Boolean) as Project[];

/* ------------------------------------------------------------------ *
 * Lapa
 * ------------------------------------------------------------------ */

export default function Index() {
  const { locale, t, path } = useLocale();
  const isLv = locale === "lv";

  // EN sākumlapas saturs vēl nav uzrakstīts, tāpēc /en rāda LV tekstu ar
  // noindex, lai Google neindeksē latviešu saturu zem angļu URL. Tāpēc EN
  // maršruti arī nav sitemapā (sk. vite.config.ts).
  const noindex = !isLv;

  const works = bySlug(featured);
  const rowTop = works.slice(0, 2);
  const rowBottom = works.slice(2, 5);

  return (
    <>
      <SEO
        routeKey="home"
        locale={locale}
        title={homeContent.metaTitle}
        description={homeContent.metaDescription}
        noindex={noindex}
      />
      <JsonLd data={[homeWebsiteSchema, homePersonSchema, homeServiceSchema, homeFaqSchema]} />

      {/* ============ HERO ============ */}
      <section
        className="relative isolate flex min-h-[clamp(560px,88vh,880px)] flex-col justify-end overflow-hidden bg-ink-900 pb-[clamp(28px,4vw,44px)] pt-[clamp(104px,18vw,220px)]"
        aria-labelledby="hero-h"
      >
        <HeroMedia
          poster="/media/hero-workshop.jpg"
          position="center 40%"
          eager
          brightness={0.55}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,11,9,.42) 0%, rgba(13,11,9,.06) 44%, rgba(13,11,9,.88) 100%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-wrap px-5 sm:px-8 lg:px-10">
          <LineReveal
            as="h1"
            id="hero-h"
            lines={["Lapa, kas nes", "pieprasījumus."]}
            accentFrom={1}
            className="text-display font-bold uppercase text-paper"
          />

          <div className="mt-[clamp(24px,4vw,56px)] grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
            <Reveal delay={0.2} className="max-w-[46ch]">
              <p className="text-[clamp(1rem,1.35vw,1.19rem)] leading-[1.5] text-paper-2">
                <span aria-hidden="true" className="text-amber">
                  &#8627;
                </span>{" "}
                {heroSection.body[0]}
              </p>
            </Reveal>

            <Reveal delay={0.3} className="flex flex-wrap items-center gap-x-8 gap-y-4 md:justify-end">
              <MagneticButton>
                <Button to={path(ROUTE_KEY_BY_LV_PATH[heroCtas[0].target])}>{heroCtas[0].label}</Button>
              </MagneticButton>
              <Button to={path(ROUTE_KEY_BY_LV_PATH[heroCtas[1].target])} variant="link">
                {heroCtas[1].label}
              </Button>
            </Reveal>
          </div>

          {SHOW_PLACEHOLDERS ? (
            <div className="mt-8 max-w-[260px]">
              <MediaPlaceholder text="Vieta 20 sekunžu video vai portretam - vēl jāuzņem" />
            </div>
          ) : null}

          <Reveal delay={0.38} className="mt-[clamp(26px,3.4vw,44px)]">
            <div className="grid border border-line-amber sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <p className="border-b border-line-amber px-4 py-3 sm:border-b-0 sm:border-e">
                <Label tone="amber">Gatis Design · Rīga · kopš 2008</Label>
              </p>
              <p className="px-4 py-3">
                <Label tone="amber">
                  Lapa, kas izskatās labi, bet nenes pieprasījumus, ir tikai izdevumi.
                </Label>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ AR MANI STRĀDĀ ============ */}
      {/* Bez ritošas joslas: septiņpadsmit vārdu saraksts ir saturs, un kustība
          te neko nepaskaidrotu - tā tikai apgrūtinātu nolasīšanu. */}
      <section className="border-y border-line bg-ink-850" aria-labelledby="klienti-h">
        <div className="mx-auto flex max-w-wrap flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-baseline md:gap-10 lg:px-10">
          <h2 id="klienti-h" className="shrink-0">
            <Label caps>Ar mani strādā</Label>
          </h2>
          <ul className="flex flex-wrap gap-x-7 gap-y-2">
            {trustClients.map((name) => (
              <li key={name} className="text-[clamp(1rem,1.3vw,1.18rem)] text-paper-2">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ DARBI ============ */}
      <Section rhythm="lg" labelledBy="darbi-h">
        <SectionTitle id="darbi-h" size="giant" className="mb-[clamp(32px,5vw,64px)]">
          Darbu izlase
        </SectionTitle>

        <div className="grid gap-grid md:grid-cols-12">
          {rowTop.map((project, i) => (
            <Reveal
              key={project.slug}
              delay={stagger(i, 2)}
              className={i === 0 ? "md:col-span-7" : "md:col-span-5"}
            >
              <ProjectCard project={project} eager={i === 0} ratio="16 / 10" />
            </Reveal>
          ))}
        </div>

        <div className="mt-grid grid gap-grid md:grid-cols-12">
          {rowBottom.map((project, i) => (
            <Reveal key={project.slug} delay={stagger(i, 3)} className="md:col-span-4">
              <ProjectCard project={project} ratio="4 / 3" />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-[clamp(34px,4.4vw,64px)] flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="max-w-[52ch] text-[16px] leading-[1.55] text-paper-dim">
            <LinkedText text={worksSection.body[0]} />
          </p>
          <Button to={path("portfolio")} variant="link" className="self-start">
            Visi {projects.length} darbi
          </Button>
        </Reveal>
      </Section>

      {/* ============ JOSLA ============ */}
      <Band
        poster="/media/band-craft.jpg"
        text="Vienalga, kur tu sāc - ar tukšu lapu vai ar lapu, kas neko nenes: es novedu līdz versijai, kas strādā."
      />

      {/* ============ PAKALPOJUMI ============ */}
      <Section rhythm="lg" labelledBy="pakalpojumi-h">
        <SectionTitle id="pakalpojumi-h" className="mb-[clamp(30px,4vw,56px)]">
          {servicesSection.heading}
        </SectionTitle>

        <LabelRow label="Pakalpojumi">
          <ul>
            {serviceCards.map((card, i) => (
              <Reveal
                as="li"
                key={card.target}
                delay={i * 0.06}
                y={16}
                className={`border-t border-line ${i === serviceCards.length - 1 ? "border-b" : ""}`}
              >
                <Link
                  to={path(ROUTE_KEY_BY_LV_PATH[card.target])}
                  className="group grid grid-cols-1 gap-x-8 gap-y-3 py-7 transition-colors duration-300 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_160px]"
                >
                  <h3 className="text-h3 font-medium text-paper transition-colors duration-300 group-hover:text-amber">
                    {card.title}
                  </h3>
                  <p className="max-w-[46ch] text-[16px] leading-[1.55] text-paper-2 md:pt-2.5">
                    {card.description}
                  </p>
                  <p className="flex flex-col gap-1.5 md:pt-3 md:text-right">
                    <span className="text-[18px] font-semibold tabular-nums text-paper">{card.price}</span>
                    {card.term ? <Label>{card.term}</Label> : null}
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>
          <p className="pt-6">
            <Label>Norādītās cenas ir gala cenas - neesmu PVN maksātājs.</Label>
          </p>
        </LabelRow>
      </Section>

      {/* ============ VIENA CILVĒKA ĶĒDE ============ */}
      <Section rhythm="md" surface="ink-850" labelledBy="kede-h">
        <SectionTitle id="kede-h" className="mb-[clamp(26px,3.4vw,44px)]">
          {chainSection.heading}
        </SectionTitle>
        <ProseColumns>
          {chainSection.body.map((paragraph, i) => (
            <Reveal key={paragraph.slice(0, 40)} delay={stagger(i, 2)}>
              <p className="mb-5 max-w-[62ch] text-[17px] leading-[1.6] text-paper-2 last:mb-0">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </ProseColumns>
      </Section>

      {/* ============ PAR MANI ============ */}
      <Section rhythm="md" labelledBy="par-h">
        <SectionTitle id="par-h" className="mb-[clamp(26px,3.4vw,44px)]">
          Viens cilvēks, kurš atbild par rezultātu
        </SectionTitle>
        <LabelRow label="Par mani">
          {aboutSection.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mb-5 max-w-[64ch] text-[17px] leading-[1.6] text-paper-2 last:mb-0">
              <LinkedText text={paragraph} />
            </p>
          ))}
          <p className="mt-8">
            <Button to={path("about")} variant="link">
              {t.nav.about}
            </Button>
          </p>
        </LabelRow>
      </Section>

      {/* ============ JAUTĀJUMI ============ */}
      <Section rhythm="lg" surface="ink-850" labelledBy="faq-h">
        <SectionTitle id="faq-h" size="giant" className="mb-[clamp(28px,4vw,56px)]">
          Jautājumi
        </SectionTitle>
        <FaqList items={homeContent.faq} />
      </Section>

      {/* ============ SĀKSIM ============ */}
      <Section rhythm="lg" surface="ink-950" labelledBy="kontakti-h">
        <SectionTitle id="kontakti-h" className="mb-[clamp(22px,3vw,34px)]">
          {contactSection.heading === "Kā sākt" ? "Pastāsti, kas tev jāatrisina" : contactSection.heading}
        </SectionTitle>
        <LabelRow label="Sāksim">
          <p className="max-w-[58ch] text-[17px] leading-[1.6] text-paper-2">
            <LinkedText text={contactSection.body[0]} />
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton>
              <Button to={path("contact")}>{heroCtas[0].label}</Button>
            </MagneticButton>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="border-b border-line-amber pb-1 text-[clamp(1rem,1.4vw,1.2rem)] text-paper transition-colors duration-300 hover:text-amber"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <p className="mt-6 max-w-[58ch] text-[15px] leading-[1.6] text-paper-dim">
            {contactSection.body[1]}
          </p>
        </LabelRow>
      </Section>
    </>
  );
}

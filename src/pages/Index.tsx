import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import JsonLd from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import Reveal, { stagger } from "@/components/animations/Reveal";
import LineReveal from "@/components/animations/LineReveal";
import { h1Lines } from "@/content/h1";
import MagneticButton from "@/components/animations/MagneticButton";
import HeroMedia from "@/components/direction/HeroMedia";
import MediaPlaceholder, { SHOW_PLACEHOLDERS } from "@/components/direction/MediaPlaceholder";
import Band from "@/components/direction/Band";
import { Section, SectionTitle, LabelRow, ProseColumns } from "@/components/direction/Section";
import ProjectCard from "@/components/ProjectCard";
import ClientMarquee from "@/components/ClientMarquee";
import LinkedText from "@/components/content/LinkedText";
import FaqList from "@/components/content/FaqList";
import Testimonials from "@/components/content/Testimonials";
import { useLocale } from "@/i18n/LocaleContext";
import { ROUTES, type RouteKey } from "@/i18n/routes";
import { routeKeyForLvPath } from "@/components/content/LinkedText";
import {
  AREA_SERVED,
  BUSINESS_SAME_AS,
  CONTACT_EMAIL,
  CONTENT_MODIFIED,
  KNOWS_ABOUT,
  PERSON_JOB_TITLE,
  PERSON_OCCUPATION,
  PERSON_SAME_AS,
  SITE_NAME,
  SITE_URL,
  WORK_LOCATION,
} from "@/lib/site";
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
  worksSection,
} from "@/content/home";
import { personNode, faqPageNode } from "@/lib/schema-nodes";

/* ------------------------------------------------------------------ *
 * Strukturētie dati
 * ------------------------------------------------------------------ */

const postalAddress = { "@type": "PostalAddress", addressLocality: "Rīga", addressCountry: "LV" };
const PERSON_ID = `${SITE_URL}/#gatis`;
const BUSINESS_ID = `${SITE_URL}/#business`;

const homePersonSchema = personNode({
  description: homeContent.directAnswer,
  image: `${SITE_URL}/og-image.png`,
  knowsLanguage: ["lv", "en"],
  worksFor: { "@id": BUSINESS_ID },
  dateModified: CONTENT_MODIFIED,
});

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
  // Google zināšanu panelis un zīmola bloks logo ņem TIKAI no `logo` lauka -
  // `image` tam neder. Atsevišķa vārda zīmes faila vēl nav, tāpēc pagaidām
  // der 512x512 ikona (prasība ir vismaz 112x112).
  logo: {
    "@type": "ImageObject",
    "@id": `${SITE_URL}/#logo`,
    url: `${SITE_URL}/icon-512.png`,
    contentUrl: `${SITE_URL}/icon-512.png`,
    width: 512,
    height: 512,
    caption: SITE_NAME,
  },
  // Uz jautājumu "vai Gatis Design ir aģentūra" entitāte atbild pati.
  numberOfEmployees: { "@type": "QuantitativeValue", value: 1 },
  knowsAbout: KNOWS_ABOUT,
  // `availableLanguage` Organization domēnā nav; uz biznesa mezgla pareizais
  // lauks ir `knowsLanguage`, un `availableLanguage` dzīvo `contactPoint` iekšā.
  knowsLanguage: ["lv", "en"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: CONTACT_EMAIL,
    availableLanguage: ["lv", "en"],
    areaServed: AREA_SERVED,
  },
  areaServed: AREA_SERVED,
  address: postalAddress,
  founder: { "@id": PERSON_ID },
  provider: { "@id": PERSON_ID },
  sameAs: BUSINESS_SAME_AS,
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

/**
 * Sākumlapas FAQ strukturētajos datos.
 *
 * Schema un redzamais teksts iet vienā izmaiņā, ne divās: septiņi jautājumi
 * tikai `<script>` blokā būtu slēpta iezīmēšana, un Google strukturēto datu
 * politika to aizliedz. Avots abiem ir viens - `homeContent.faq`.
 */
const homeFaqSchema = faqPageNode(homeContent.faq, {
  "@id": `${SITE_URL}/#faq`,
  inLanguage: "lv",
});

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
      {/* Hero augstums ir piesiets EKRĀNA PROPORCIJAI, ne platumam.
          `88vh` ar `justify-end` ir laba kompozīcija platā ekrānā: liels kadrs,
          virsraksts zemu. Šaurā un garā ekrānā tā pati formula rada caurumu, jo
          saturs ir tikpat garš, bet augstums nav - starpība nokrīt tukšumā.
          Nomērīts pirms labojuma: 329 px (38% ekrāna) uz 390x844, 407 px (43%)
          uz 430x932 un 487 px (47%) uz planšetes 768x1024.
          Platums to nešķir - planšete ir platāka par telefonu un cieta tāpat.
          Šķir proporcija: `min-aspect-ratio: 4/3` ieslēdz vh tikai tur, kur
          ekrāns tiešām ir plats, un pārējiem paliek fiksēts augstums. */}
      <section
        className="relative isolate flex min-h-[540px] flex-col justify-end overflow-hidden bg-ink-900 pb-[clamp(28px,4vw,44px)] pt-[clamp(104px,18vw,220px)] sm:min-h-[600px] [@media(min-aspect-ratio:4/3)]:min-h-[clamp(560px,88vh,880px)]"
        aria-labelledby="hero-h"
      >
        <HeroMedia className="-z-[2]" poster="/media/hero-workshop.jpg" position="center 40%" eager drift brightness={0.5} />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-[1]"
          style={{ background: "var(--scrim-hero)" }}
        />

        <div className="relative mx-auto w-full max-w-wrap px-5 sm:px-8 lg:px-10">
          <LineReveal
            as="h1"
            id="hero-h"
            lines={h1Lines(homeContent.h1, homeContent.h1BreakAfter)}
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
                <Button to={path(routeKeyForLvPath(heroCtas[0].target))}>{heroCtas[0].label}</Button>
              </MagneticButton>
              <Button to={path(routeKeyForLvPath(heroCtas[1].target))} variant="link">
                {heroCtas[1].label}
              </Button>
            </Reveal>
          </div>

          {SHOW_PLACEHOLDERS ? (
            <div className="mt-8 max-w-[260px]">
              <MediaPlaceholder text="Portrets vai 15 sekunžu video darba vidē - vēl jāuzņem" />
            </div>
          ) : null}
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
              <ProjectCard
                project={project}
                eager={i === 0}
                frame="h-[clamp(210px,30vw,500px)]"
                frameRatio={i === 0 ? 7 / 4.4 : 5 / 3.2}
              />
            </Reveal>
          ))}
        </div>

        <div className="mt-grid grid gap-grid md:grid-cols-12">
          {rowBottom.map((project, i) => (
            <Reveal key={project.slug} delay={stagger(i, 3)} className="md:col-span-4">
              <ProjectCard project={project} frame="h-[clamp(190px,22vw,360px)]" frameRatio={4 / 3} />
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

      {/* Klientu josla stāv AIZ darbu izlases, ne tūlīt aiz hero: pierādījums
          nāk pēc darba, ne tā vietā. Logotipi ir vienkrāsaini - sk.
          src/data/clients.ts. */}
      <section className="border-y border-line bg-ink-850" aria-labelledby="klienti-h">
        <ClientMarquee headingId="klienti-h" heading="Klienti, ar kuriem strādāju" />
      </section>

      {/* Atsauksmes ar vārdu, uzņēmumu un rezultātu. Sadaļa ir uzbūvēta, bet
          izslēgta (src/content/testimonials.ts) - kamēr atsauksmju nav, tā
          nerenderē neko, nevis rāda tukšu rāmi. */}
      <Testimonials />

      {/* ============ JOSLA ============ */}
      <Band
        poster="/media/band-craft.jpg"
        text="Vienalga, kur tu sāc: ar tukšu lapu vai ar tādu, kas neko nenes. Es to aizvedu līdz versijai, kas strādā."
      />

      {/* ============ PAKALPOJUMI ============ */}
      <Section rhythm="lg" labelledBy="pakalpojumi-h">
        <SectionTitle id="pakalpojumi-h" className="mb-[clamp(30px,4vw,56px)]">
          {servicesSection.heading}
        </SectionTitle>

        <LabelRow label={`${serviceCards.length} pakalpojumi · no 300 EUR`}>
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
                  to={path(routeKeyForLvPath(card.target))}
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
            <Label>Norādītās cenas ir galīgās - neesmu PVN maksātājs.</Label>
          </p>
        </LabelRow>
      </Section>

      {/* ============ JAUTĀJUMI ============ */}
      {/* Deviņi jautājumi ar cenām un termiņiem stāv tūlīt aiz cenu rindas: tie
          atbild tieši uz to, ko pakalpojumu saraksts tikko pacēla. Atbildes ir
          atvērtas, ne akordeonā - sk. FaqList. */}
      {/* Ritms `md`, ne `lg`: fons ir tas pats, kas pakalpojumu sadaļai, tāpēc
          divas `lg` atkāpes pēc kārtas telefonā deva 112 px tukšuma bez nevienas
          līnijas vai krāsas maiņas - caurums, ne robeža. */}
      <Section rhythm="md" labelledBy="jautajumi-h">
        <SectionTitle id="jautajumi-h" className="mb-[clamp(30px,4vw,56px)]">
          Biežākie jautājumi
        </SectionTitle>
        <FaqList items={homeContent.faq} />
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
        <LabelRow label="Rīgā kopš 2008">
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

      {/* ============ SĀKSIM ============ */}
      <Section rhythm="lg" surface="ink-950" labelledBy="kontakti-h">
        <SectionTitle id="kontakti-h" className="mb-[clamp(22px,3vw,34px)]">
          {contactSection.heading === "Kā sākt" ? "Pastāsti, kas tev jāatrisina" : contactSection.heading}
        </SectionTitle>
        <LabelRow label="Atbilde 1 darba dienā">
          <p className="max-w-[58ch] text-[17px] leading-[1.6] text-paper-2">
            <LinkedText text={contactSection.body[0]} />
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            {/* Otrā pill uz vienas lapas atceļ pirmās nozīmi: pill apzīmē
                VIENU galveno darbību. Noslēgumā tā ir rāmja poga. */}
            <Button to={path("contact")} variant="outline">
              {heroCtas[0].label}
            </Button>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-[44px] items-center text-[clamp(1rem,1.4vw,1.2rem)] text-paper transition-colors duration-300 hover:text-amber active:text-amber"
            >
              <span className="border-b border-line-amber pb-1.5">{CONTACT_EMAIL}</span>
            </a>
          </div>
          <p className="mt-6 max-w-[58ch] text-[15px] leading-[1.6] text-paper-dim">
            <LinkedText text={contactSection.body[1]} />
          </p>
        </LabelRow>
      </Section>
    </>
  );
}

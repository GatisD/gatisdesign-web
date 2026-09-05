import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import Reveal, { stagger } from "@/components/animations/Reveal";
import LineReveal from "@/components/animations/LineReveal";
import MagneticButton from "@/components/animations/MagneticButton";
import { Section, SectionTitle, LabelRow } from "@/components/direction/Section";
import PicturePortfolio from "@/components/PicturePortfolio";
import NotFound from "./NotFound";
import { useLocale } from "@/i18n/LocaleContext";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";
import {
  projectBySlug,
  projectNeighbours,
  CATEGORY_TAG,
  EXTERNAL_STATUS_NOTE,
  SERVICE_LABEL,
  SERVICE_ROUTE_KEY,
  type Project,
} from "@/data/projects";

/** Domēns bez protokola - saites tekstam. */
const prettyUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

function buildCreativeWorkSchema(project: Project) {
  const person = { "@type": "Person", "@id": `${SITE_URL}/#gatis`, name: "Gatis Daugavietis", url: SITE_URL };
  // ROIS projektos autors nav viens cilvēks - shēmā to nedrīkst noklusēt.
  const creator =
    project.role.kind === "rois"
      ? [person, { "@type": "Organization", name: "ROIS", url: "https://rois.lv" }]
      : person;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    url: `${SITE_URL}/portfolio/${project.slug}`,
    image: `${SITE_URL}${project.cover.src}`,
    creator,
    inLanguage: "lv",
  };
  if (project.summary) schema.description = project.summary;
  if (project.year && /^\d{4}$/.test(project.year)) schema.dateCreated = project.year;
  if (project.stack && project.stack.length > 0) schema.keywords = project.stack.join(", ");
  if (project.externalUrl) schema.sameAs = project.externalUrl;
  return schema;
}

/**
 * Vāka parallax: +-24 px, tikai ar peli un tikai tad, ja lietotājs kustību nav
 * izslēdzis. Mobilajā tas ir 0 - tur ekrāns ir mazs, ritināšana ar pirkstu, un
 * papildu nobīde tikai maksā kadrus.
 */
function useCoverParallax() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const shift = Math.max(-24, Math.min(24, window.scrollY * 0.06));
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

export default function ProjectDetail() {
  const { locale, t, path } = useLocale();
  const { slug = "" } = useParams<{ slug: string }>();
  const project = projectBySlug(slug);
  const nav = projectNeighbours(slug);
  const gallery = project?.gallery ?? [];
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const coverRef = useCoverParallax();

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => {
    setLoaded(false);
    setLightbox((cur) => (cur === null || gallery.length === 0 ? cur : (cur - 1 + gallery.length) % gallery.length));
  }, [gallery.length]);
  const next = useCallback(() => {
    setLoaded(false);
    setLightbox((cur) => (cur === null || gallery.length === 0 ? cur : (cur + 1) % gallery.length));
  }, [gallery.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, close, prev, next]);

  if (!project) return <NotFound />;

  const isLv = locale === "lv";
  const statusNote = EXTERNAL_STATUS_NOTE[project.externalStatus];
  const linkLabel = project.category === "brand" ? "Klienta mājaslapa" : "Apskatīt mājaslapu";

  const facts: Array<{ term: string; value: string }> = [
    { term: "Klients", value: project.client },
    { term: "Loma", value: project.role.label },
    { term: "Nozare", value: CATEGORY_TAG[project.category] },
  ];
  if (project.year) facts.push({ term: "Gads", value: project.year });

  // Virsraksts divās rindās, ja nosaukums ir garš - uppercase displejs vienā
  // rindā pie 132 px izlien no lapas.
  const words = project.title.split(" ");
  const titleLines =
    words.length > 2
      ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")]
      : [project.title];

  return (
    <>
      <SEO
        locale={locale}
        title={project.title}
        description={project.summary || `${project.client}. ${project.role.label}.`}
        image={project.cover.src}
        alternates={[
          { locale: "lv", path: `/portfolio/${project.slug}` },
          { locale: "en", path: `/en/portfolio/${project.slug}` },
        ]}
        // EN saturs vēl nav tulkots, tāpēc /en rāda LV tekstu ar noindex.
        noindex={!isLv}
      />
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: isLv ? "Sākums" : "Home", path: "/" },
            { name: t.nav.portfolio, path: "/portfolio" },
            { name: project.title, path: `/portfolio/${project.slug}` },
          ]),
          buildCreativeWorkSchema(project),
        ]}
      />

      {/* ============ VĀKS ============ */}
      <section
        className="relative isolate flex min-h-[clamp(420px,66vh,720px)] flex-col justify-end overflow-hidden bg-ink-900 pb-sec-sm pt-[clamp(96px,14vw,180px)]"
        aria-labelledby="projekts-h"
      >
        <div ref={coverRef} className="absolute inset-x-0 -top-6 bottom-[-24px] -z-[2] will-change-transform">
          <PicturePortfolio
            src={project.cover.src}
            alt=""
            width={project.cover.width}
            height={project.cover.height}
            loading="eager"
            priority="high"
            decoding="sync"
            className="media-settle h-full w-full object-cover object-[top_center] [filter:brightness(.5)_saturate(.85)]"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,11,9,.6) 0%, rgba(13,11,9,.15) 45%, rgba(13,11,9,.94) 100%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-wrap px-pad-x">
          <Link
            to={path("portfolio")}
            className="inline-flex min-h-[44px] items-center gap-2.5 text-[15px] text-paper-2 transition-colors duration-300 hover:text-amber"
          >
            <span aria-hidden="true" className="h-px w-6 bg-current" />
            {isLv ? "Visi darbi" : "All work"}
          </Link>
          <LineReveal
            as="h1"
            id="projekts-h"
            lines={titleLines}
            className="mt-5 text-display-2 font-bold uppercase text-paper"
          />
        </div>
      </section>

      {/* ============ FAKTU JOSLA ============ */}
      <section className="border-y border-line bg-ink-900" aria-label={isLv ? "Projekta dati" : "Project facts"}>
        <dl className="mx-auto grid max-w-wrap grid-cols-2 px-pad-x md:grid-cols-4">
          {facts.map((fact, i) => (
            <div
              key={fact.term}
              className="border-line py-5 pe-6 [&:not(:last-child)]:border-e [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0"
            >
              <dt>
                <Label>{fact.term}</Label>
              </dt>
              <dd className="mt-2 text-[17px] leading-snug text-paper">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ============ APRAKSTS UN SAITE ============ */}
      {project.summary || project.externalUrl || project.stack ? (
        <Section rhythm="md" labelledBy="par-projektu-h">
          <SectionTitle id="par-projektu-h" className="mb-[clamp(22px,3vw,36px)]">
            {isLv ? "Par projektu" : "About the project"}
          </SectionTitle>
          <LabelRow label={isLv ? "Uzdevums" : "Brief"}>
            {project.summary ? (
              <p className="max-w-[64ch] text-[17px] leading-[1.6] text-paper-2">{project.summary}</p>
            ) : null}

            {project.stack && project.stack.length > 0 ? (
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2" aria-label={isLv ? "Tehnoloģijas" : "Stack"}>
                {project.stack.map((tech) => (
                  <li key={tech}>
                    <Label>{tech}</Label>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
              {project.externalUrl ? (
                <>
                  <Button href={project.externalUrl} variant="link">
                    {linkLabel}
                  </Button>
                  <Label>{prettyUrl(project.externalUrl)}</Label>
                </>
              ) : statusNote ? (
                <Label>{statusNote}</Label>
              ) : null}
            </div>
          </LabelRow>
        </Section>
      ) : null}

      {/* ============ GALERIJA ============ */}
      {gallery.length === 0 ? (
        <Section rhythm="md" ariaLabel={isLv ? "Projekta vāks" : "Project cover"}>
          <Reveal>
            <span className="mx-auto block max-w-[1080px] overflow-hidden rounded-card border border-line bg-ink-card">
              <PicturePortfolio
                src={project.cover.src}
                alt={project.cover.alt}
                width={project.cover.width}
                height={project.cover.height}
                loading="lazy"
                decoding="async"
                className="h-auto w-full object-cover"
              />
            </span>
          </Reveal>
        </Section>
      ) : (
        <Section rhythm="lg" labelledBy="galerija-h">
          <SectionTitle id="galerija-h" size="giant" className="mb-[clamp(28px,4vw,56px)]">
            {isLv ? "Galerija" : "Gallery"}
          </SectionTitle>
          <div className="grid gap-grid md:grid-cols-12">
            {gallery.map((img, i) => (
              <Reveal
                key={img.src}
                delay={stagger(i, 2)}
                className={i % 4 === 0 ? "md:col-span-12" : "md:col-span-6"}
              >
                <button
                  type="button"
                  onClick={() => {
                    setLoaded(false);
                    setLightbox(i);
                  }}
                  className="group block w-full overflow-hidden rounded-card border border-line bg-ink-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                  aria-label={
                    isLv
                      ? `Atvērt ${i + 1}. attēlu no ${gallery.length}`
                      : `Open image ${i + 1} of ${gallery.length}`
                  }
                >
                  <PicturePortfolio
                    src={img.src}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-auto w-full object-cover transition-transform duration-[1100ms] ease-dir group-hover:scale-[1.03]"
                  />
                </button>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* ============ SAISTĪTIE PAKALPOJUMI ============ */}
      {project.services.length > 0 ? (
        <Section rhythm="sm" surface="ink-850" labelledBy="saistitie-h">
          <SectionTitle id="saistitie-h" className="mb-[clamp(18px,2.4vw,28px)]">
            {isLv ? "Pakalpojumi šajā projektā" : "Services in this project"}
          </SectionTitle>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {project.services.map((service) => (
              <li key={service}>
                <Link
                  to={path(SERVICE_ROUTE_KEY[service])}
                  className="inline-flex min-h-[44px] items-center border-b border-line-amber text-[17px] text-paper transition-colors duration-300 hover:text-amber"
                >
                  {SERVICE_LABEL[service]}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* ============ NĀKAMAIS PROJEKTS ============ */}
      {nav ? (
        <Section rhythm="lg" labelledBy="nakamais-h">
          <p className="mb-6">
            <Label caps>({isLv ? "Nākamais projekts" : "Next project"})</Label>
          </p>
          <Reveal>
            <Link
              to={`${path("portfolio")}/${nav.next.slug}`}
              className="group grid items-center gap-x-10 gap-y-6 border-t border-line pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,520px)]"
            >
              <div>
                <h2 id="nakamais-h" className="text-h2 font-medium text-paper transition-colors duration-300 group-hover:text-amber">
                  {nav.next.title}
                </h2>
                <p className="mt-3 text-[16px] text-paper-dim">{nav.next.client}</p>
              </div>
              <span className="block overflow-hidden rounded-card border border-line bg-ink-card" style={{ aspectRatio: "16 / 10" }}>
                <PicturePortfolio
                  src={nav.next.cover.src}
                  alt=""
                  width={nav.next.cover.width}
                  height={nav.next.cover.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-[top_center] [filter:contrast(.96)_saturate(.9)] transition-transform duration-[1100ms] ease-dir group-hover:scale-[1.03]"
                />
              </span>
            </Link>
          </Reveal>
        </Section>
      ) : null}

      {/* ============ SĀKSIM ============ */}
      <Section rhythm="lg" surface="ink-950" labelledBy="projekts-cta-h">
        <SectionTitle id="projekts-cta-h" className="mb-[clamp(22px,3vw,34px)]">
          {isLv ? "Vajag līdzīgu risinājumu?" : "Need something similar?"}
        </SectionTitle>
        <LabelRow label={isLv ? "Sāksim" : "Start"}>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
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

      {/* ============ LIGHTBOX ============ */}
      {lightbox !== null && gallery[lightbox] ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            isLv
              ? `${lightbox + 1}. attēls no ${gallery.length}`
              : `Image ${lightbox + 1} of ${gallery.length}`
          }
          className="fixed inset-0 z-[120] flex items-center justify-center bg-ink-950/97 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute end-3 top-3 inline-flex h-12 w-12 items-center justify-center text-paper-2 transition-colors hover:text-amber md:end-6 md:top-6"
            aria-label={isLv ? "Aizvērt" : "Close"}
          >
            <span aria-hidden="true" className="relative block h-6 w-6">
              <span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-current" />
              <span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-current" />
            </span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute start-1 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center text-paper-2 transition-colors hover:text-amber md:start-6"
            aria-label={isLv ? "Iepriekšējais attēls" : "Previous image"}
          >
            <span aria-hidden="true" className="block h-3 w-3 rotate-45 border-b border-s border-current" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute end-1 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center text-paper-2 transition-colors hover:text-amber md:end-6"
            aria-label={isLv ? "Nākamais attēls" : "Next image"}
          >
            <span aria-hidden="true" className="block h-3 w-3 -rotate-45 border-b border-e border-current" />
          </button>

          {/* Skelets, kamēr attēls lādējas: tukšs melns ekrāns izskatās pēc kļūdas. */}
          <span
            aria-hidden="true"
            className={`absolute inset-x-8 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line-strong transition-opacity duration-300 md:inset-x-1/4 ${
              loaded ? "opacity-0" : "opacity-100"
            }`}
          />
          <PicturePortfolio
            src={gallery[lightbox].src}
            alt={gallery[lightbox].alt}
            width={gallery[lightbox].width}
            height={gallery[lightbox].height}
            onLoad={() => setLoaded(true)}
            className={`max-h-[86vh] max-w-[92vw] object-contain transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2">
            <Label>
              {lightbox + 1} / {gallery.length}
            </Label>
          </span>
        </div>
      ) : null}
    </>
  );
}

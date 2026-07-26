import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import Kicker from "@/components/ui/Kicker";
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
  const person = { "@type": "Person", name: "Gatis Daugavietis", url: SITE_URL };
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

export default function ProjectDetail() {
  const { locale, path } = useLocale();
  const { slug = "" } = useParams<{ slug: string }>();
  const project = projectBySlug(slug);
  const nav = projectNeighbours(slug);
  const gallery = project?.gallery ?? [];
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => {
    setLightbox((cur) => (cur === null || gallery.length === 0 ? cur : (cur - 1 + gallery.length) % gallery.length));
  }, [gallery.length]);
  const next = useCallback(() => {
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

  const statusNote = EXTERNAL_STATUS_NOTE[project.externalStatus];
  const linkLabel = project.category === "brand" ? "Klienta mājaslapa" : "Apskatīt mājaslapu";
  const facts: Array<{ term: string; value: string }> = [
    { term: "Klients", value: project.client },
    { term: "Loma", value: project.role.label },
  ];
  if (project.year) facts.push({ term: "Gads", value: project.year });
  if (gallery.length > 0) facts.push({ term: "Darbu skaits", value: String(gallery.length) });

  return (
    // Negatīvā augšmala pavelk tumšo fonu zem fiksētās galvenes (Layout main pt-20/24).
    <div className="-mt-20 flex-1 bg-ink-900 pt-20 text-paper md:-mt-24 md:pt-24">
      <SEO
        locale={locale}
        title={project.title}
        description={project.summary || `${project.client}. ${project.role.label}.`}
        image={project.cover.src}
        alternates={[
          { locale: "lv", path: `/portfolio/${project.slug}` },
          { locale: "en", path: `/en/portfolio/${project.slug}` },
        ]}
        // TODO: EN saturs vēl nav uzrakstīts, tāpēc /en rāda LV tekstu ar noindex.
        noindex={locale !== "lv"}
      />
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Sākums", path: "/" },
            { name: "Darbi", path: "/portfolio" },
            { name: project.title, path: `/portfolio/${project.slug}` },
          ]),
          buildCreativeWorkSchema(project),
        ]}
      />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-b border-line" aria-labelledby="projekts-h">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-6%] top-[-34%] h-[min(440px,52vw)] w-[min(720px,92vw)] rounded-full opacity-60 blur-[90px]"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(224,114,60,.24), transparent 68%)",
          }}
        />
        <div className="relative mx-auto max-w-wrap px-[var(--pad-x)] pb-[clamp(40px,5vw,64px)] pt-[clamp(24px,4vw,56px)]">
          <Link
            to={path("portfolio")}
            className="inline-flex items-center gap-2 text-[13px] text-paper-dim transition-colors duration-300 hover:text-amber"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Visi darbi
          </Link>

          <Kicker className="mb-[clamp(16px,2vw,24px)] mt-[clamp(22px,3vw,34px)]">
            {CATEGORY_TAG[project.category]}
          </Kicker>
          <h1
            id="projekts-h"
            className="max-w-[20ch] text-[clamp(2rem,4.6vw,3.7rem)] font-light leading-[1.05] tracking-[-0.042em] [text-wrap:balance]"
          >
            {project.title}
          </h1>

          {project.summary && (
            <p className="mt-[clamp(20px,2.6vw,30px)] max-w-[62ch] text-[clamp(1.02rem,1.28vw,1.19rem)] leading-[1.62] text-paper-2">
              {project.summary}
            </p>
          )}

          {/* Flex, ne fiksēts režģis: divi fakti aizņem pusi katrs, nevis atstāj tukšas kastes. */}
          <dl className="mt-[clamp(34px,4.4vw,56px)] flex flex-wrap gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {facts.map((fact) => (
              <div key={fact.term} className="min-w-[min(100%,200px)] flex-1 bg-ink-900 px-5 py-[18px]">
                <dt className="text-[11.5px] uppercase tracking-[0.16em] text-paper-faint">{fact.term}</dt>
                <dd className="mt-[7px] text-[clamp(0.98rem,1.15vw,1.06rem)] tracking-[-0.015em]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>

          {project.stack && project.stack.length > 0 && (
            <ul className="mt-[clamp(20px,2.4vw,28px)] flex flex-wrap gap-2" aria-label="Tehnoloģijas">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-line-strong px-3.5 py-1.5 text-[12.5px] text-paper-dim"
                >
                  {tech}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-[clamp(26px,3.2vw,38px)] flex flex-wrap items-center gap-4">
            {project.externalUrl ? (
              <Button href={project.externalUrl} variant="ghost" size="sm">
                {linkLabel}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Button>
            ) : null}
            {!project.externalUrl && statusNote ? (
              <p className="text-[13.5px] text-paper-dim">{statusNote}</p>
            ) : null}
            {project.externalUrl ? (
              <span className="text-[13px] text-paper-faint">{prettyUrl(project.externalUrl)}</span>
            ) : null}
          </div>
        </div>
      </section>

      {/* ============ VĀKS / GALERIJA ============ */}
      {gallery.length === 0 ? (
        <section className="mx-auto max-w-wrap px-[var(--pad-x)] py-[var(--sec-y)]" aria-label="Projekta vāks">
          {/* Vāks ir 1200px plats, tāpēc kadru neizstiepjam pāri dabiskajam izmēram. */}
          <span className="mx-auto block max-w-[960px] overflow-hidden rounded-2xl border border-line bg-ink-800">
            <PicturePortfolio
              src={project.cover.src}
              alt={project.cover.alt}
              width={project.cover.width}
              height={project.cover.height}
              decoding="async"
              className="h-auto w-full object-cover"
            />
          </span>
        </section>
      ) : (
        <section className="mx-auto max-w-wrap px-[var(--pad-x)] py-[var(--sec-y)]" aria-label="Darbu galerija">
          <div className="grid gap-[clamp(16px,2vw,26px)] md:grid-cols-2">
            {gallery.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setLightbox(i)}
                className={`group block w-full overflow-hidden rounded-2xl border border-line bg-ink-800 transition-[border-color,transform] duration-500 [transition-timing-function:var(--ease)] hover:-translate-y-[5px] hover:border-amber/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber ${
                  i % 4 === 0 ? "md:col-span-2" : ""
                }`}
                aria-label={`Atvērt ${i + 1}. attēlu no ${gallery.length}`}
              >
                <PicturePortfolio
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-auto w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ============ SAISTĪTIE PAKALPOJUMI ============ */}
      {project.services.length > 0 && (
        <section className="border-t border-line bg-ink-850" aria-labelledby="pakalpojumi-h">
          <div className="mx-auto max-w-wrap px-[var(--pad-x)] py-[clamp(48px,6vw,84px)]">
            <Kicker className="mb-5">Pakalpojumi šajā projektā</Kicker>
            <h2 id="pakalpojumi-h" className="sr-only">
              Ar šo projektu saistītie pakalpojumi
            </h2>
            <ul className="flex flex-wrap gap-3">
              {project.services.map((service) => (
                <li key={service}>
                  <Link
                    to={path(SERVICE_ROUTE_KEY[service])}
                    className="inline-flex items-center gap-2 rounded-full border border-line-strong px-[18px] py-[10px] text-[14px] text-paper-2 transition-colors duration-300 hover:border-amber hover:text-amber"
                  >
                    {SERVICE_LABEL[service]}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ============ IEPRIEKŠĒJAIS / NĀKAMAIS ============ */}
      {nav && (
        <section
          className="border-t border-line"
          aria-label="Pāreja starp darbiem"
        >
          <div className="mx-auto grid max-w-wrap gap-8 px-[var(--pad-x)] py-[clamp(44px,5vw,72px)] md:grid-cols-2">
            <Link to={`${path("portfolio")}/${nav.prev.slug}`} className="group block">
              <span className="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.16em] text-paper-faint">
                <ArrowLeft size={14} aria-hidden="true" />
                Iepriekšējais
              </span>
              <span className="mt-3 block text-[clamp(1.15rem,2vw,1.5rem)] tracking-[-0.03em] transition-colors duration-300 group-hover:text-amber-soft">
                {nav.prev.title}
              </span>
              <span className="mt-1 block text-[13px] text-paper-dim">{nav.prev.client}</span>
            </Link>
            <Link
              to={`${path("portfolio")}/${nav.next.slug}`}
              className="group block md:justify-self-end md:text-right"
            >
              <span className="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.16em] text-paper-faint">
                Nākamais
                <ArrowRight size={14} aria-hidden="true" />
              </span>
              <span className="mt-3 block text-[clamp(1.15rem,2vw,1.5rem)] tracking-[-0.03em] transition-colors duration-300 group-hover:text-amber-soft">
                {nav.next.title}
              </span>
              <span className="mt-1 block text-[13px] text-paper-dim">{nav.next.client}</span>
            </Link>
          </div>
        </section>
      )}

      {/* ============ CTA ============ */}
      <section className="border-t border-line bg-ink-950" aria-labelledby="projekts-cta-h">
        <div className="mx-auto grid max-w-wrap justify-items-center gap-6 px-[var(--pad-x)] py-[clamp(56px,7vw,104px)] text-center">
          <Kicker>Kontakti</Kicker>
          <h2
            id="projekts-cta-h"
            className="max-w-[18ch] text-[clamp(1.8rem,4vw,3rem)] font-light leading-[1.06] tracking-[-0.04em] [text-wrap:balance]"
          >
            Vajag <span className="font-accent italic text-amber-soft">līdzīgu</span> risinājumu?
          </h2>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Button href={`mailto:${CONTACT_EMAIL}`}>
              Rakstīt
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
            <Button to={path("portfolio")} variant="ghost">
              Visi darbi
            </Button>
          </div>
        </div>
      </section>

      {/* ============ LIGHTBOX ============ */}
      {lightbox !== null && gallery[lightbox] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${lightbox + 1}. attēls no ${gallery.length}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/96"
          onClick={close}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute right-4 top-4 p-2 text-paper-2 transition-colors hover:text-amber md:right-6 md:top-6"
            aria-label="Aizvērt"
          >
            <X size={28} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-paper-2 transition-colors hover:text-amber md:left-6"
            aria-label="Iepriekšējais attēls"
          >
            <ArrowLeft size={28} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-paper-2 transition-colors hover:text-amber md:right-6"
            aria-label="Nākamais attēls"
          >
            <ArrowRight size={28} />
          </button>
          <PicturePortfolio
            src={gallery[lightbox].src}
            alt={gallery[lightbox].alt}
            width={gallery[lightbox].width}
            height={gallery[lightbox].height}
            className="max-h-[88vh] max-w-[92vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] tracking-[0.16em] text-paper-faint">
            {lightbox + 1} / {gallery.length}
          </span>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import Reveal, { stagger } from "@/components/animations/Reveal";
import LineReveal from "@/components/animations/LineReveal";
import { Section, SectionTitle, LabelRow } from "@/components/direction/Section";
import PicturePortfolio from "@/components/PicturePortfolio";
import NotFound from "./NotFound";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";
import { pathFor, type Locale } from "@/i18n/routes";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

/** Projekta ceļš vienā valodā. Slug abās valodās ir viens, prefikss - no ROUTES. */
const projectPath = (slug: string, locale: Locale) => `${pathFor("portfolio", locale)}/${slug}`;
import ProjectCard from "@/components/ProjectCard";
import ClosingLine from "@/components/content/ClosingLine";
import {
  projectBySlug,
  projectNeighbours,
  relatedProjects,
  SERVICE_ROUTE_KEY,
  categoryTag,
  externalStatusNote,
  localized,
  serviceLabel,
  type Project,
} from "@/data/projects";

/**
 * Fakti par projektu vienā teikumu virknē.
 *
 * Nekas netiek izdomāts: viss salikts no laukiem, kas datos jau ir - nozare,
 * klients, loma, gads, pakalpojumi. Četrām lapām no 33 apraksta nav vispār, un
 * līdz šim tur bija tikai "Cafeteria. Izstrāde ROIS komandā." - 38 zīmes gan
 * lapā, gan meta aprakstā.
 */
const lowerFirst = (s: string) => (s ? s[0].toLocaleLowerCase("lv") + s.slice(1) : s);

function factualSentence(project: Project, locale: Locale): string {
  const services = project.services.map((s) => serviceLabel(locale)[s]).join(", ");
  if (locale !== "lv") {
    return [
      `${categoryTag(locale)[project.category]} for ${project.client}.`,
      `Role: ${project.role.label.toLowerCase()}${project.year ? `, ${project.year}` : ""}.`,
      services ? `Services: ${services}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
  return [
    `${categoryTag(locale)[project.category]} klientam ${project.client}.`,
    // Aiz kola latviski seko mazais burts, ja aiz tā nav īpašvārds. Lomas
    // apzīmējums datos sākas ar lielo ("Izstrāde ROIS komandā").
    `Loma: ${lowerFirst(project.role.label)}${project.year ? `, ${project.year}` : ""}.`,
    services ? `Pakalpojumi: ${services}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Meta apraksts: apraksts, ja tāds ir, plus lomas un gada rinda. */
function metaDescription(project: Project, locale: Locale): string {
  if (!project.summary) return factualSentence(project, locale);
  return `${project.summary} ${project.role.label}${project.year ? `, ${project.year}` : ""}.`;
}

/** Domēns bez protokola - saites tekstam. */
const prettyUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

function buildCreativeWorkSchema(project: Project, locale: Locale) {
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
    url: `${SITE_URL}${projectPath(project.slug, locale)}`,
    image: `${SITE_URL}${project.cover.src}`,
    creator,
    inLanguage: locale,
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
  const projectRaw = projectBySlug(slug);
  const project = projectRaw ? localized(projectRaw, locale) : undefined;
  const navRaw = projectNeighbours(slug);
  const nav = navRaw ? { prev: localized(navRaw.prev, locale), next: localized(navRaw.next, locale) } : null;
  // Tā pati kategorija un kopīgs pakalpojums. Nākamais projekts te netiek
  // atkārtots - tas lapā jau ir kā atsevišķs bloks.
  const related = relatedProjects(slug).map((item) => localized(item, locale));
  const gallery = project?.gallery ?? [];
  const isGrid = project?.galleryLayout === "grid";
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const coverRef = useCoverParallax();
  // Fokusa pārvaldība: no kuras pogas attēls tika atvērts, kur fokuss iet
  // dialoga iekšienē un kur tas atgriežas pēc aizvēršanas.
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const openAt = useCallback((i: number) => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setLoaded(false);
    setLightbox(i);
  }, []);
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
    if (lightbox === null) {
      // Fokuss atgriežas uz to pašu galerijas pogu, no kuras attēls tika atvērts.
      // Bez tā tabulēšana pēc aizvēršanas sākas no lapas sākuma.
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "ArrowLeft") {
        prev();
        return;
      }
      if (e.key === "ArrowRight") {
        next();
        return;
      }
      // Fokusa slazds: aiz dialoga pēdējās pogas Tab atgriežas pie pirmās.
      if (e.key !== "Tab") return;
      const buttons = dialogRef.current?.querySelectorAll<HTMLElement>("button");
      if (!buttons || buttons.length === 0) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, close, prev, next]);

  if (!project) return <NotFound />;

  const isLv = locale === "lv";
  const statusNote = externalStatusNote(locale)[project.externalStatus];
  const linkLabel = isLv
    ? project.category === "brand"
      ? "Klienta mājaslapa"
      : "Apskatīt mājaslapu"
    : project.category === "brand"
      ? "Client website"
      : "Visit the website";

  const facts: Array<{ term: string; value: string }> = [
    { term: isLv ? "Klients" : "Client", value: project.client },
    { term: isLv ? "Loma" : "Role", value: project.role.label },
    { term: isLv ? "Nozare" : "Industry", value: categoryTag(locale)[project.category] },
  ];
  if (project.year) facts.push({ term: isLv ? "Gads" : "Year", value: project.year });

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
        description={metaDescription(project, locale)}
        image={project.cover.src}
        alternates={[
          { locale: "lv", path: projectPath(project.slug, "lv") },
          { locale: "en", path: projectPath(project.slug, "en") },
        ]}
        // Lapa bez apraksta Google indeksā ir plāns saturs, tāpēc tā ir noindex
        // abās valodās, līdz apraksts ir uzrakstīts (sk. indexableProjects).
        noindex={!project.summary}
      />
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: isLv ? "Sākums" : "Home", path: pathFor("home", locale) },
            { name: t.nav.portfolio, path: pathFor("portfolio", locale) },
            { name: project.title, path: projectPath(project.slug, locale) },
          ]),
          buildCreativeWorkSchema(project, locale),
        ]}
      />

      {/* ============ VĀKS ============ */}
      <section
        className="relative isolate flex min-h-[clamp(420px,66vh,720px)] flex-col justify-end bg-ink-900 pb-12 pt-[clamp(96px,14vw,180px)] md:pb-16"
        aria-labelledby="projekts-h"
      >
        {/* Apgriešana notiek TIKAI uz attēla slāņa: ja to liktu uz sekcijas,
            virsraksts ar garumzīmēm apakšējā malā tiktu nogriezts. */}
        <div aria-hidden="true" className="absolute inset-0 -z-[2] overflow-hidden">
          <div ref={coverRef} className="absolute inset-x-0 -top-6 bottom-[-24px] will-change-transform">
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
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-[1]"
          style={{ background: "var(--scrim-cover)" }}
        />
        <div className="relative mx-auto w-full max-w-wrap px-5 sm:px-8 lg:px-10">
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
        <dl className="mx-auto grid max-w-wrap grid-cols-2 px-5 py-2 sm:px-8 md:grid-cols-4 lg:px-10">
          {facts.map((fact, i) => (
            <div
              key={fact.term}
              /* Atdalītājs pieder kolonnai, kas rindā NAV pirmā (border-s + ps-6),
                 nevis tai, kas nav pēdējā. Ar `border-e` līnija pielipa nākamās
                 kolonnas tekstam, un mobilajā otrās kolonnas labā mala uzzīmēja
                 svītru pie satura malas. Rindas platums mainās (2 -> 4 kolonnas),
                 tāpēc nosacījums ir uz nth-child(2n+1) un nth-child(4n+1). */
              className="border-line py-5 pe-6 [&:not(:nth-child(2n+1))]:border-s [&:not(:nth-child(2n+1))]:ps-6 [&:nth-child(-n+2)]:border-b md:[&:not(:nth-child(4n+1))]:border-s md:[&:not(:nth-child(4n+1))]:ps-6 md:[&:nth-child(-n+2)]:border-b-0"
            >
              <dt>
                <Label>{fact.term}</Label>
              </dt>
              <dd className="mt-2 text-[17px] leading-snug text-paper">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ============ PĀRLŪKA KADRI ============ */}
      {/* Divi kadri, ne viens: mājaslapa nav attēls, tā ir divas dažādas lapas
          vienā adresē. Telefona kadrs stāv blakus, ne zem - blakus tie ir
          salīdzināmi, un tieši salīdzinājums ir tas, ko šeit ir vērts rādīt.
          Mobilajā kolonnas saliekas vienā, un telefons paliek savā platumā, jo
          izstiepts pāri visai lapai tas vairs nav telefons. */}
      {project.shot ? (
        <Section rhythm="md" labelledBy="ekrani-h">
          <SectionTitle id="ekrani-h" className="mb-[clamp(22px,3vw,36px)]">
            {isLv ? "Ekrānuzņēmumi" : "Screens"}
          </SectionTitle>
          <div className="grid gap-grid md:grid-cols-[3fr_1fr] md:items-start">
            <Reveal className="overflow-hidden rounded-card border border-line bg-ink-card">
              <PicturePortfolio
                src={project.shot.desktop.src}
                alt={project.shot.desktop.alt}
                width={project.shot.desktop.width}
                height={project.shot.desktop.height}
                style={{ aspectRatio: `${project.shot.desktop.width} / ${project.shot.desktop.height}` }}
                loading="lazy"
                priority="low"
                decoding="async"
                sizes="(min-width: 768px) 72vw, 92vw"
                className="h-auto w-full"
              />
            </Reveal>
            <Reveal
              delay={0.1}
              className="w-[58%] max-w-[200px] justify-self-center overflow-hidden rounded-card border border-line bg-ink-card md:w-full"
            >
              <PicturePortfolio
                src={project.shot.mobile.src}
                alt={project.shot.mobile.alt}
                width={project.shot.mobile.width}
                height={project.shot.mobile.height}
                style={{ aspectRatio: `${project.shot.mobile.width} / ${project.shot.mobile.height}` }}
                loading="lazy"
                priority="low"
                decoding="async"
                sizes="(min-width: 768px) 24vw, 54vw"
                className="h-auto w-full"
              />
            </Reveal>
          </div>
          <p className="mt-5">
            <Label>{isLv ? "Sākumlapa datorā un telefonā" : "Home page on desktop and phone"}</Label>
          </p>
        </Section>
      ) : null}

      {/* ============ APRAKSTS UN SAITE ============ */}
      <Section rhythm="md" labelledBy="par-projektu-h">
          <SectionTitle id="par-projektu-h" className="mb-[clamp(22px,3vw,36px)]">
            {isLv ? "Par projektu" : "About the project"}
          </SectionTitle>
          <LabelRow label={isLv ? "Uzdevums" : "Brief"}>
            {/* Ja apraksta nav, lapa nepaliek tukša un neizdomā tekstu: rāda
                faktus, kas datos jau ir. */}
            <p className="max-w-[64ch] text-[17px] leading-[1.45] text-paper-2">
              {project.summary || factualSentence(project, locale)}
            </p>

            {project.stack && project.stack.length > 0 ? (
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2" aria-label={isLv ? "Tehnoloģijas" : "Stack"}>
                {project.stack.map((tech) => (
                  <li key={tech}>
                    <Label>{tech}</Label>
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Rinda tikai tad, kad tajā kaut kas ir. Zīmola darbiem nav ne
                ārējās saites, ne statusa piezīmes, un tukšs konteiners ar
                `mt-8` telefonā deva 32 px tukšuma, kas kopā ar sekciju atkāpēm
                izauga par 132 px caurumu pirms galerijas. */}
            {project.externalUrl || statusNote ? (
              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
                {project.externalUrl ? (
                  <>
                    <Button href={project.externalUrl} variant="link">
                      {linkLabel}
                    </Button>
                    <Label>{prettyUrl(project.externalUrl)}</Label>
                  </>
                ) : (
                  <Label>{statusNote}</Label>
                )}
              </div>
            ) : null}
          </LabelRow>
      </Section>

      {/* ============ GALERIJA ============ */}
      {/* Vāka bloks ir rezerve lapām bez galerijas. Ja projektam ir pārlūka
          kadri, vāks ir TAS PATS datora kadrs, kas jau stāv augstāk kopā ar
          telefonu - un viens un tas pats attēls divreiz vienā lapā ir kļūda,
          ne ritms. */}
      {gallery.length === 0 ? (
        project.shot ? null : (
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
        )
      ) : (
        <Section rhythm="lg" labelledBy="galerija-h">
          <SectionTitle id="galerija-h" size="giant" className="mb-[clamp(28px,4vw,56px)]">
            {isLv ? "Galerija" : "Gallery"}
          </SectionTitle>
          {isGrid ? (
            /* Kolekcija, kur katrs kadrs ir atsevišķs darbs: vienādi kvadrāti.
               `object-contain` tāpēc, ka kadri ir dažādās proporcijās un darbs
               nedrīkst tikt apgriezts, lai ietilptu šūnā. Režģa kartei pietiek
               ar 640 px variantu - pilno kadru ielādē tikai lightbox. */
            /* Viena atklāsme visam režģim, ne 70 atsevišķas: katrs Reveal atver
               savu IntersectionObserver, un 70 novērotāji telefonā maksāja 230 ms
               galvenajā pavedienā (Lighthouse TBT 70 -> 300 ms). Blīvā sietā
               viļņa animācija turklāt lasās kā troksnis, ne kā ritms. */
            <Reveal>
              <ul className="grid grid-cols-2 gap-grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {gallery.map((img, i) => (
                  <li key={img.src}>
                    <button
                      type="button"
                      onClick={() => openAt(i)}
                      className="group block aspect-square w-full overflow-hidden rounded-card border border-line bg-ink-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                      aria-label={isLv ? `${img.alt}. Atvērt lielāku attēlu` : `${img.alt}. Open larger`}
                    >
                      <PicturePortfolio
                        src={img.src}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        widths={[400, 640]}
                        sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        className="h-full w-full object-contain"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : (
            <div className="grid gap-grid md:grid-cols-12">
              {gallery.map((img, i) => (
                <Reveal
                  key={img.src}
                  delay={stagger(i, 2)}
                  className={i % 4 === 0 ? "md:col-span-12" : "md:col-span-6"}
                >
                  <button
                    type="button"
                    onClick={() => openAt(i)}
                    className="group block w-full overflow-hidden rounded-card border border-line bg-ink-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                    aria-label={isLv ? `${img.alt}. Atvērt lielāku attēlu` : `${img.alt}. Open larger`}
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
          )}
        </Section>
      )}

      {/* ============ SAISTĪTIE PAKALPOJUMI ============ */}
      {project.services.length > 0 ? (
        <Section rhythm="sm" surface="ink-850" labelledBy="saistitie-h">
          <SectionTitle id="saistitie-h" className="mb-[clamp(18px,2.4vw,28px)]">
            {isLv ? "Pakalpojumi šajā projektā" : "Services in this project"}
          </SectionTitle>
          <ul className="flex flex-wrap gap-x-8 gap-y-1">
            {project.services.map((service) => (
              <li key={service}>
                <Link
                  to={path(SERVICE_ROUTE_KEY[service])}
                  className="inline-flex min-h-[44px] items-center border-b border-line-amber text-[17px] text-paper transition-colors duration-300 hover:text-amber"
                >
                  {serviceLabel(locale)[service]}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* ============ SAISTĪTIE DARBI ============ */}
      {related.length > 0 ? (
        <Section rhythm="md" labelledBy="saistitie-darbi-h">
          <SectionTitle id="saistitie-darbi-h" className="mb-[clamp(22px,3vw,36px)]">
            {isLv ? "Līdzīgi darbi" : "Similar work"}
          </SectionTitle>
          <div className="grid gap-grid md:grid-cols-3">
            {related.map((item, i) => (
              <Reveal key={item.slug} delay={stagger(i, 3)}>
                <ProjectCard
                  project={item}
                  /* Trīs vienādas kolonnas dod tieši to pašu platumu, ko sākumlapas
                     apakšējā rinda (437 px pie >=1440 px), tāpēc te der tas pats
                     kadrs. `md:` prefikss ir svarīgs: bez tā fiksētais augstums
                     nostrādāja arī telefonā, kur rindā ir viena karte un augstums
                     nesaskaņo neko - tikai griež. Iepriekš te stāvēja 4/3, bet
                     mērījums deva 1,46-1,52, un vairumam vāku proporcija ir 1,60,
                     tāpēc visi trīs stāvēja joslās. */
                  frame="md:h-[clamp(150px,18.9vw,273px)]"
                  frameRatio={1.59}
                />
              </Reveal>
            ))}
          </div>
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
              {/* 325 px, ne 320: kolonna ir 520 px plata, un 520/325 = 1,60 -
                  tieši tā proporcija, kāda ir 26 no 39 vākiem. */}
              <span className="block h-[clamp(200px,26vw,325px)] overflow-hidden rounded-card border border-line bg-ink-card">
                <PicturePortfolio
                  src={nav.next.cover.src}
                  alt=""
                  width={nav.next.cover.width}
                  height={nav.next.cover.height}
                  loading="lazy"
                  decoding="async"
                  /* Enkurs pēc vāka tipa, tāpat kā kartēs: pārlūka kadram pie
                     augšas (tur ir izvēlne), pārējiem pa vidu. Ar augšas enkuru
                     kvadrātveida kolekcijas vākam te tika nogriezti 38% no
                     apakšas, un objekts tajos vākos ir centrā. */
                  className={cn(
                    /* Tāpat kā "Līdzīgi darbi" kartes tieši virs tās: melnbalts
                       mierā, krāsa uz hover. Bez tā vienā ekrānā stāvēja divas
                       karšu rindas ar diviem dažādiem likumiem. */
                    "h-full w-full object-cover [filter:grayscale(1)_contrast(.98)] transition-[transform,filter] duration-[700ms] ease-dir group-hover:scale-[1.03] group-hover:[filter:grayscale(0)_contrast(1)]",
                    nav.next.shot?.desktop.src === nav.next.cover.src ? "object-[top_center]" : "object-center",
                  )}
                />
              </span>
            </Link>
          </Reveal>
        </Section>
      ) : null}

      {/* ============ SĀKSIM ============ */}
      <ClosingLine
        text={
          isLv
            ? `Vajag līdzīgu risinājumu? Uzraksti uz ${CONTACT_EMAIL} un pastāsti, kas tev jāatrisina.`
            : `Need something similar? Write to ${CONTACT_EMAIL} and tell me what you need to solve.`
        }
        note={isLv ? "Atbilde 1 darba dienā" : "Reply in 1 working day"}
      />

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
          ref={dialogRef}
          /* Apakšā papildu atstarpe: sīkdatņu josla ir virs dialoga (z-200), un
             bez tās paraksts ar skaitītāju paliktu zem joslas. */
          className="fixed inset-0 z-[120] flex items-center justify-center bg-ink-950/95 p-4 pb-28 md:pb-24"
          onClick={close}
        >
          <button
            type="button"
            ref={closeRef}
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
          {/* Attēls un paraksts vienā kolonnā, ne absolūti pozicionēti: citādi
              garš paraksts pielīp pie attēla apakšas vai aizlien zem tā. */}
          <div className="flex max-h-full flex-col items-center gap-3">
            <PicturePortfolio
              src={gallery[lightbox].src}
              alt={gallery[lightbox].alt}
              width={gallery[lightbox].width}
              height={gallery[lightbox].height}
              onLoad={() => setLoaded(true)}
              className={`max-h-[72vh] max-w-[88vw] object-contain transition-opacity duration-300 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex flex-col items-center gap-1.5 text-center">
              {/* Paraksts ir tikai tur, kur teksts nāk no Gata paša ieraksta. */}
              {gallery[lightbox].caption ? (
                <p className="max-w-[60ch] text-[15px] leading-snug text-paper-2">
                  {gallery[lightbox].caption}
                </p>
              ) : null}
              <Label>
                {lightbox + 1} / {gallery.length}
              </Label>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

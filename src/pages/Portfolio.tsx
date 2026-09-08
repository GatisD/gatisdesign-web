import { useMemo, useState } from "react";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Reveal from "@/components/animations/Reveal";
import LineReveal from "@/components/animations/LineReveal";
import Label from "@/components/ui/Label";
import { Section, SectionTitle } from "@/components/direction/Section";
import LinkedText from "@/components/content/LinkedText";
import ProjectCard from "@/components/ProjectCard";
import ClosingLine from "@/components/content/ClosingLine";
import ClientMarquee from "@/components/ClientMarquee";
import {
  indexableProjects,
  PLATFORM_TAGS,
  projects,
  localized,
  serviceTag,
  type ServiceKey,
} from "@/data/projects";
import { useLocale } from "@/i18n/LocaleContext";
import { pathFor } from "@/i18n/routes";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Filtra atslēga. Prefikss nes šķirni, lai pakalpojums un tehnoloģija ar vienu
 * un to pašu vārdu nekad nesajauktos: "s:" - pakalpojums, "t:" - tehnoloģija.
 */
type Filter = "all" | `s:${ServiceKey}` | `t:${string}`;

interface FilterChip {
  key: Filter;
  label: string;
  count: number;
}

/**
 * Darbu skaits nāk no datiem, ne no rokas. Iepriekš te stāvēja "23 pabeigti
 * projekti", un pēc tam, kad 4. kārta pievienoja desmit vietnes, meta apraksts
 * apgalvoja vienu skaitli, bet lapa rādīja citu.
 */
const META_DESCRIPTION = `${projects.length} publicēti darbi: mājaslapu izstrāde, logo un zīmola dizains. Estire, Box Latvia, ROIS.lv, Apmeklē.lv. Katram darbam norādīts klients un mana loma.`;
const META_DESCRIPTION_EN = `${projects.length} published projects: website development, logo and brand design. Estire, Box Latvia, ROIS.lv, Apmeklē.lv. Each project lists the client and my role.`;

/**
 * Divas sadaļas zem režģa. Teksts dzīvo šeit, ne satura failā, jo /portfolio
 * satura faila nav - dati nāk no projects.raw.json. Ja lapa iegūs savu JSON,
 * abas rindkopas pārceļas turp.
 */
const WEB_NOTE =
  "Darbu sarakstā ir divi tehnoloģiju ceļi. WordPress ar Elementor vai Breakdance - tad, kad saturu pēc palaišanas maina klients pats; tā uzbūvēta lielākā daļa šo lapu. Kodēta lapa ar React un Vite - tad, kad saturs mainās reti, bet svarīgi ir ātrums un dizaina precizitāte: Estire, ROIS.lv, Universal Solutions. Atsevišķa grupa ir veikali WooCommerce vai Shopify vidē, kā arī daudzvalodu lapas ar WPML. Cenas un termiņus katram no šiem ceļiem atradīsi lapā [Mājaslapu izstrāde](/majaslapu-izstrade).";

const WEB_NOTE_EN =
  "The list has two technology paths. WordPress with Elementor or Breakdance - when the client changes the content themselves after launch; most of these sites are built that way. A coded site with React and Vite - when the content changes rarely but speed and design precision matter: Estire, ROIS.lv, Universal Solutions. A separate group is stores on WooCommerce or Shopify, plus multilingual sites with WPML. Prices and timelines for each of these paths are on the page [Website development](/majaslapu-izstrade).";

const BRAND_NOTE_EN =
  "This section has both full identities with a brand book and print materials, and standalone logos. Box Latvia is a logistics brand with vehicle livery, Apmeklē.lv a platform mark that has to work at app icon size, Digitālais Dzintars a poster and playbill system. Some of the work I made in the ROIS team, some alone, and each piece says which. Prices are on the page [Logo design and brand identity](/zimola-identitate).";

const BRAND_NOTE =
  "Šajā sadaļā ir gan pilnas identitātes ar zīmola grāmatu un drukas materiāliem, gan atsevišķi logotipi. Box Latvia ir loģistikas zīmols ar transportlīdzekļu marķējumu, Apmeklē.lv - platformas zīme, kurai jāstrādā lietotnes ikonas izmērā, Digitālais Dzintars - plakātu un afišu sistēma. Daļu darbu veidoju ROIS komandā, daļu viens pats, un pie katra tas ir norādīts. Cenas ir lapā [Logo izveide un zīmola identitāte](/zimola-identitate).";

/**
 * Režģa ritms. Piecu flīžu cikls: divas platas (7+5), tad trīs vienādas (4+4+4).
 * Rindas iekšienē kadra proporcija ir VIENĀDA - nevienāds augstums vienā rindā
 * pie augšā līdzinātām kartēm lasās kā kļūda, ne kā ritms.
 */
/**
 * Rinda pa divi, tad rinda pa trīs. Agrāk lielā rinda bija 7+5, un tieši tur
 * bija neatrisināma vieta: vienā rindā kartēm jābeidzas vienā līnijā, tātad
 * viens augstums, bet 783 px un 553 px platums ar vienu augstumu dod divas
 * dažādas proporcijas (1,81 un 1,28). Vismaz vienam vākam kadrs vienmēr bija
 * nepareizs. 6+6 to atrisina: vienāds platums, vienāds augstums, viena
 * proporcija - un abas rindas var noregulēt uz to, kas vākos tiešām ir.
 */
const SPAN = ["md:col-span-6", "md:col-span-6", "md:col-span-4", "md:col-span-4", "md:col-span-4"];
/** Augstums, ne proporcija: vienā rindā visām kartēm jābeidzas vienā līnijā. */
const FRAME = [
  "md:h-[clamp(230px,29vw,417px)]",
  "md:h-[clamp(230px,29vw,417px)]",
  "md:h-[clamp(150px,18.9vw,273px)]",
  "md:h-[clamp(150px,18.9vw,273px)]",
  "md:h-[clamp(150px,18.9vw,273px)]",
];
/**
 * Kadra proporcija. Visiem kadriem tagad viena, un tā nav izvēlēta no gaisa:
 * 26 no 39 vākiem proporcija ir tieši 1,600, vēl 7 ir 1,778. Kadrs 1,60 nozīmē
 * NULLES griezumu divām trešdaļām karšu.
 *
 * Griesti (417 px un 273 px) sakrīt ar to platumu, kur karte pārstāj augt
 * (668 px un 437 px pie >=1440 px). Bez tā augstums auga ar `vw`, kamēr
 * konteiners pie 1440 px apstājās, un proporcija ceļoja: mērīts PIRMS 1,81 pie
 * 1440 px pret 1,57 pie 1920 px vienai un tai pašai kartei. Tagad 1,55-1,60
 * visā diapazonā.
 */
const FRAME_RATIO = [1.59, 1.59, 1.59, 1.59, 1.59];

export default function Portfolio() {
  const { locale, t } = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const isLv = locale === "lv";

  // Lokalizēti darbi: EN virsraksti, apraksti un lomas, ja tie ir datos.
  const items = useMemo(() => projects.map((p) => localized(p, locale)), [locale]);
  const visible = useMemo(() => {
    if (filter === "all") return items;
    const vertiba = filter.slice(2);
    return filter.startsWith("s:")
      ? items.filter((p) => p.services.includes(vertiba as ServiceKey))
      : items.filter((p) => p.stack?.includes(vertiba));
  }, [filter]);

  /**
   * Čipi un skaitļi nāk no datiem, ne no rokas. Skaitlis blakus tagam ir
   * solījums: nospiežot, tik daudz darbu arī paliek redzami. Uzrakstīts ar roku
   * tas noveco klusi - tieši tā, kā kādreiz noveco "23 pabeigti projekti"
   * meta aprakstā.
   *
   * Pakalpojumi iet pirmie un skaitliskā secībā, tehnoloģijas aiz tiem: cilvēks
   * vispirms zina, KO viņam vajag, un tikai pēc tam - uz kā.
   */
  const filters = useMemo<FilterChip[]>(() => {
    const pakalpojumi = new Map<ServiceKey, number>();
    const tehnologijas = new Map<string, number>();
    for (const p of items) {
      for (const s of p.services) pakalpojumi.set(s, (pakalpojumi.get(s) ?? 0) + 1);
      for (const t of p.stack ?? []) tehnologijas.set(t, (tehnologijas.get(t) ?? 0) + 1);
    }
    return [
      { key: "all", label: isLv ? "Visi" : "All", count: projects.length },
      ...[...pakalpojumi]
        .sort((a, b) => b[1] - a[1])
        .map(([k, count]): FilterChip => ({ key: `s:${k}`, label: serviceTag(locale)[k], count })),
      ...PLATFORM_TAGS.map((t): FilterChip => ({ key: `t:${t}`, label: t, count: tehnologijas.get(t) ?? 0 }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count),
    ];
  }, [isLv, items, locale]);

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isLv ? "Gatis Daugavieša darbi" : "Work by Gatis Daugavietis",
    // Sarakstā tikai tie darbi, kuriem ir sava indeksējama lapa. Nosaukt
    // `noindex` adresi strukturētā sarakstā nozīmē aicināt to indeksēt.
    numberOfItems: indexableProjects.length,
    itemListElement: indexableProjects.map((project, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: project.title,
      url: `${SITE_URL}${pathFor("portfolio", locale)}/${project.slug}`,
    })),
  };

  return (
    <>
      <SEO
        routeKey="portfolio"
        locale={locale}
        title={isLv ? "Mājaslapu un logo izstrādes piemēri" : "Website and logo design examples"}
        description={isLv ? META_DESCRIPTION : META_DESCRIPTION_EN}
      />
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: isLv ? "Sākums" : "Home", path: pathFor("home", locale) },
            { name: t.nav.portfolio, path: pathFor("portfolio", locale) },
          ]),
          listSchema,
        ]}
      />

      {/* ============ GALVA ============ */}
      <section className="bg-ink-900 pb-12 md:pb-16 pt-[clamp(104px,15vw,180px)]" aria-labelledby="darbi-h">
        <div className="mx-auto w-full max-w-wrap px-5 sm:px-8 lg:px-10">
          <LineReveal
            as="h1"
            id="darbi-h"
            lines={isLv ? ["Mājaslapu un logo", "izstrādes piemēri"] : ["Website and logo", "design examples"]}
            className="text-display-2 font-bold uppercase text-paper"
          />
          <Reveal delay={0.2} className="mt-[clamp(22px,3vw,38px)] max-w-[62ch]">
            <p className="text-[clamp(1.02rem,1.4vw,1.25rem)] leading-[1.5] text-paper-2">
              <span aria-hidden="true" className="text-amber">
                &#8627;
              </span>{" "}
              {isLv
                ? "Projekti, kas strādā arī ārpus prezentācijas. Katram darbam norādīts klients un mana loma - daļu veidoju ROIS komandā, daļu viens pats."
                : "Projects that work outside the presentation too. Each one lists the client and my role - some I made in the ROIS team, some alone."}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ FILTRS ============ */}
      <div className="sticky top-[var(--galvene)] z-40 border-y border-line bg-ink-900/90 backdrop-blur-md">
        {/* Viena rinda ar sānu ritināšanu, ne aplaušana: pie četrpadsmit tagiem
            aplauzta čipu siena aizņemtu trešdaļu ekrāna un pastumtu pašus darbus
            zem lokas. Ritjosla paslēpta - ka rinda turpinās, pasaka pati rinda,
            kas beidzas aiz malas. */}
        <div className="mx-auto max-w-wrap overflow-x-auto no-scrollbar">
          <div
            role="group"
            aria-label={isLv ? "Darbu filtrs" : "Work filter"}
            className="flex w-max items-center gap-2 px-5 py-3 sm:px-8 lg:px-10"
          >
            {filters.map((item) => {
              const active = item.key === filter;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  aria-pressed={active}
                  // Stikls, tas pats, kas galvenes tabletēm (sk. .stikls src/index.css):
                  // hover iedegas, nospiestais (aria-pressed) paliek iedegts ar
                  // akcenta tekstu. Bez .stikls-blur - josla pati ir ar blur, un
                  // ligzdots backdrop-filter zīmējas plakans. Rāmis mierā 14%:
                  // čipu rinda bez malām ir tikai vārdi ar atstarpēm.
                  className={cn(
                    "stikls stikls-rams inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[15px]",
                    active ? "text-amber" : "text-paper-dim hover:text-paper active:text-paper",
                  )}
                >
                  {item.label}
                  {/* Skaitlis ir solījums: nospiežot, tik daudz darbu paliek. */}
                  <span className={cn("font-label text-label", active ? "opacity-70" : "text-paper-faint")}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============ KLIENTI ============ */}
      {/* Klientu josla tieši zem filtriem (Gatis, 2026-09-08): darbu lapā
          cilvēks vispirms redz, KAM ir strādāts, tad pašus darbus. Tā pati
          josla, kas sākumlapā, uz tā paša fona; augšējo līniju dod filtru
          joslas apakšmala. */}
      <section className="border-b border-line bg-ink-850" aria-labelledby="klienti-h">
        <ClientMarquee headingId="klienti-h" heading={isLv ? "Klienti, ar kuriem strādāju" : "Clients I work with"} />
      </section>

      {/* ============ REŽĢIS ============ */}
      <Section rhythm="lg" ariaLabel={isLv ? "Darbu saraksts" : "Work list"}>
        {/*
          Režģis tiek pārmontēts ar `key={filter}`, un kartes ienāk ar vilni
          (`.grid-in`, src/index.css). Tā ir CSS animācija, ne JS izkārtojuma
          pārrēķins: `layout` FLIP ar animāciju bibliotēku šeit maksāja 41,5 KB
          gzip KATRĀ lapā (vite-react-ssg maršrutu gabalus priekšielādē visur),
          un tas ir vairāk nekā viss pārējais animāciju kods kopā.
        */}
        <div key={filter} className="grid gap-grid md:grid-cols-12">
          {visible.map((project, i) => (
            <div
              key={project.slug}
              className={cn("grid-in", SPAN[i % SPAN.length])}
              style={{ ["--grid-index" as string]: Math.min(i, 7) }}
            >
              <ProjectCard
                project={project}
                eager={i === 0}
                frame={FRAME[i % FRAME.length]}
                frameRatio={FRAME_RATIO[i % FRAME_RATIO.length]}
                devicePair
              />
            </div>
          ))}
        </div>

        <p className="mt-[clamp(30px,4vw,52px)] border-t border-line pt-5">
          <Label>
            {isLv
              ? `Redzami: ${visible.length} no ${projects.length}`
              : `Showing ${visible.length} of ${projects.length}`}
          </Label>
        </p>
      </Section>


      {/* ============ KO ŠAJĀ SARAKSTĀ MEKLĒT ============ */}
      {/* Lapa bija 277 vārdi ar vienu virsrakstu un bez neviena H2: navigācija,
          ne galamērķis. Teksts stāv ZEM režģa, jo darbu lapā pirmais ir darbs.
          Abas sadaļas ved uz komercijas lapām ar atslēgvārdu enkurā. */}
      {isLv ? (
        <Section rhythm="md" surface="ink-850" labelledBy="darbu-veidi">
          <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
            <div>
              <SectionTitle id="darbu-veidi" className="mb-5">
                {isLv ? "Mājaslapas šajā sarakstā" : "Websites in this list"}
              </SectionTitle>
              <p className="max-w-[58ch] text-[16px] leading-[1.45] text-paper-2">
                <LinkedText text={isLv ? WEB_NOTE : WEB_NOTE_EN} />
              </p>
            </div>
            <div>
              <SectionTitle id="zimola-darbi" className="mb-5">
                {isLv ? "Logo un zīmola darbi" : "Logo and brand work"}
              </SectionTitle>
              <p className="max-w-[58ch] text-[16px] leading-[1.45] text-paper-2">
                <LinkedText text={isLv ? BRAND_NOTE : BRAND_NOTE_EN} />
              </p>
            </div>
          </div>
        </Section>
      ) : null}

      {/* ============ SĀKSIM ============ */}
      <ClosingLine
        text={
          isLv
            ? `Uzraksti uz ${CONTACT_EMAIL}, kas tev vajadzīgs - godīgi novērtēšu, cik tas prasīs laika un naudas, un pēc pirmās sarunas saņemsi fiksētu tāmi ar termiņu.`
            : `Write to ${CONTACT_EMAIL} and tell me what you need. I will give you an honest estimate of time and cost, and a fixed quote after the first call.`
        }
        note={isLv ? "Atbilde 1 darba dienā" : "Reply in 1 working day"}
      />
    </>
  );
}

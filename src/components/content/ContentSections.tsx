import Reveal, { stagger } from "@/components/animations/Reveal";
import { Section, LabelRow, ProseColumns } from "@/components/direction/Section";
import LinkedText from "./LinkedText";
import PriceTable from "./PriceTable";
import StepFlow from "./StepFlow";
import { headingId } from "@/content/slug";
import type { ContentSectionData } from "@/content/types";

/**
 * Satura sadaļu bloks garajām lapām (pakalpojumi, par mani).
 *
 * Trīs lietas te ir apzinātas un atrisina konkrētus audita atradumus:
 *
 * 1. TRĪS FORMAS ROTĀCIJĀ, ne viena. Vienpadsmit vienādas sekcijas pēc kārtas
 *    ar vienu un to pašu atkāpi lasās kā ģenerēts dokuments. Tabulas sadaļa
 *    iet pilnā platumā, prozas sadaļa divās kolonnās, saraksta sadaļa ar
 *    etiķeti sānu kolonnā.
 * 2. ETIĶETE TIKAI TAD, ja saturā tiešām ir `kicker`, un ne vairāk kā trīs uz
 *    lapu. Agrāk etiķeti ģenerēja no virsraksta pirmā vārda, un lapā parādījās
 *    "(Kas)", "(Ar)", "(Četras)".
 * 3. VIRSRAKSTS VIENMĒR PIRMS ETIĶETES dokumenta secībā. Etiķete virs
 *    virsraksta ir kickers, un tas ir aizliegts; te tā stāv blakus kolonnā pie
 *    satura, un ekrānlasītājs vispirms dzird virsrakstu.
 */

const MAX_LABELS = 3;

/**
 * Etiķete, kas atkārto savu virsrakstu, neko nepasaka. "(Struktūra)" blakus
 * virsrakstam "Struktūra, kas pārvērš apmeklētājus pieprasījumos" ir tikai
 * 340 px kolonna ar to pašu vārdu. Referencē etiķete nes CITU informāciju
 * nekā virsraksts, tāpēc te tā tiek rādīta tikai tad, kad tā to dara.
 *
 * Divas pārbaudes, ne viena. Prefiksa pārbaude viena pati palaida cauri
 * "(Pēc palaišanas)" pie virsraksta "Kas notiek pēc palaišanas" un
 * "(Zīmola grāmata)" pie "Kas ir zīmola grāmata un kad tā tiešām vajadzīga" -
 * abos gadījumos etiķetē nebija neviena vārda, kura virsrakstā jau nebūtu.
 * Tāpēc otrā pārbaude ir vārdu kopa: ja katrs etiķetes vārds jau ir
 * virsrakstā, etiķete ir atkārtojums neatkarīgi no vārdu secības.
 */
function labelAddsMeaning(kicker: string, heading: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-zāčēģīķļņšūž0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const normHeading = norm(heading);
  if (normHeading.startsWith(norm(kicker))) return false;
  const headingWords = new Set(normHeading.split(" "));
  const kickerWords = norm(kicker).split(" ").filter(Boolean);
  return !kickerWords.every((word) => headingWords.has(word));
}

type Form = "table" | "prose" | "label";

function formFor(section: ContentSectionData, index: number): Form {
  if (section.table) return "table";
  if (section.bullets || section.steps) return "label";
  return index % 2 === 0 ? "prose" : "label";
}

/**
 * Ritms pēc tā, KAS sadaļā ir, ne tikai cik tur vārdu.
 *
 * Iepriekš slieksnis bija tikai vārdu skaits, un lapas otrā puse - piecas
 * teksta sadaļas pēc kārtas bez neviena cita objekta - iznāca `sm·sm·sm·sm·sm`.
 * Pirmajā pusē ritms bija `lg·sm·md·lg·sm·md`, otrajā - taisna līnija.
 * Tāpēc: tabulai `lg`, procesa soļiem un garam sarakstam `md`, un trešā
 * vienāda atkāpe pēc kārtas tiek pacelta par vienu soli.
 */
const RHYTHM_ORDER = ["sm", "md", "lg"] as const;
type Rhythm = (typeof RHYTHM_ORDER)[number];

function baseRhythm(section: ContentSectionData): Rhythm {
  if (section.table) return "lg";
  if (section.steps?.length) return "md";
  if ((section.bullets?.length ?? 0) >= 5) return "md";
  const words = section.body.join(" ").split(/\s+/).length;
  return words > 130 ? "md" : "sm";
}

/** Paceļ atkāpi, ja tā būtu trešā vienāda pēc kārtas. */
function rhythmFor(section: ContentSectionData, recent: Rhythm[]): Rhythm {
  const base = baseRhythm(section);
  const twoSame = recent.length >= 2 && recent.slice(-2).every((r) => r === base);
  if (!twoSame) return base;
  const next = RHYTHM_ORDER[Math.min(RHYTHM_ORDER.indexOf(base) + 1, RHYTHM_ORDER.length - 1)];
  return next;
}

/**
 * Cenu sadaļa: tā, kuras tabulā ir kolonna "Cena", nevis vienkārši pirmā
 * tabula lapā. SEO lapā pirmā tabula ir SEO/GEO/AEO salīdzinājums, un satura
 * rādītāja saite "Cenas" veda tieši uz to - cilvēks, kurš atnāca pēc cenas,
 * nokļuva pie citas tabulas un ritināja tālāk pats.
 */
export function priceSection(sections: ContentSectionData[]): ContentSectionData | undefined {
  return (
    sections.find((s) => s.table?.columns.some((c) => /cena/i.test(c))) ??
    sections.find((s) => s.table)
  );
}

export function tocFor(sections: ContentSectionData[]): Array<{ id: string; label: string }> {
  const out: Array<{ id: string; label: string }> = [];
  const prices = priceSection(sections);
  if (prices) out.push({ id: headingId(prices.heading), label: "Cenas" });
  // Procesu meklē gan pēc `steps` masīva, gan pēc virsraksta: trīs lapas to
  // saturā tur kā numurētu sarakstu, un bez otrā ceļa satura rādītājā pazuda
  // vienīgais enkurs septiņām vidus sadaļām 14 000 px garā lapā.
  const steps =
    sections.find((s) => s.steps) ??
    sections.find(
      (s) =>
        /^(kā notiek|kā sāk|process|darba gaita|kā es strādāju)/i.test(s.heading) ||
        s.kicker === "Process",
    );
  if (steps) out.push({ id: headingId(steps.heading), label: "Process" });
  out.push({ id: "jautajumi", label: "Jautājumi" });
  // "Sāksim" te vairs nav: kopš noslēgums ir viena rinda bez virsraksta,
  // enkurs veda uz vietu, kur nospiedējam nav nekāda apstiprinājuma, ka viņš ir
  // nonācis. Darbība tagad ir hero blokā, pirmajā ekrānā.
  return out;
}

export default function ContentSections({
  sections,
  labelBudget = MAX_LABELS,
}: {
  sections: ContentSectionData[];
  /**
   * Cik etiķetes šis izsaukums drīkst iztērēt. Budžets ir uz LAPU, ne uz
   * izsaukumu: pakalpojumu lapa satura sadaļas renderē divos gabalos (pirms
   * un pēc foto joslas), un bez šī propa katrs gabals sāktu skaitīt no nulles.
   */
  labelBudget?: number;
}) {
  let labelsUsed = 0;
  const recentRhythms: Rhythm[] = [];

  return (
    <>
      {sections.map((section, index) => {
        const form = formFor(section, index);
        const rhythm = rhythmFor(section, recentRhythms);
        recentRhythms.push(rhythm);
        const id = headingId(section.heading);
        const surface = index % 2 === 1 ? "ink-850" : "ink";
        let label: string | undefined;
        if (
          section.kicker &&
          labelsUsed < labelBudget &&
          form === "label" &&
          labelAddsMeaning(section.kicker, section.heading)
        ) {
          label = section.kicker;
          labelsUsed += 1;
        }

        const body = (
          <>
            {section.body.map((paragraph, i) => (
              <p
                key={paragraph.slice(0, 48)}
                className={`max-w-[64ch] text-[17px] leading-[1.45] text-paper-2 ${i > 0 ? "mt-5" : ""}`}
              >
                <LinkedText text={paragraph} />
              </p>
            ))}
          </>
        );

        return (
          <Section key={section.heading} rhythm={rhythm} surface={surface} labelledBy={id}>
            <Reveal>
              <h2 id={id} className="mb-[clamp(24px,3vw,40px)] max-w-[20ch] text-h2 font-medium scroll-mt-24">
                {section.heading}
              </h2>
            </Reveal>

            {form === "prose" || form === "table" ? (
              <ProseColumns>
                {section.body.map((paragraph, i) => (
                  <Reveal key={paragraph.slice(0, 48)} delay={stagger(i, 2)}>
                    <p className="max-w-[58ch] text-[17px] leading-[1.45] text-paper-2">
                      <LinkedText text={paragraph} />
                    </p>
                  </Reveal>
                ))}
              </ProseColumns>
            ) : (
              <LabelRow label={label}>
                {/* Tukšs `Reveal` ir tukšs konteiners: kad sadaļai prozas nav
                    (saraksts pats ir saturs), tas atstāj vietu, kurā nekā nav,
                    un nākamā bloka `mt-8` to vēl pastiepj. */}
                {section.body.length > 0 ? <Reveal>{body}</Reveal> : null}

                {section.steps ? (
                  <StepFlow steps={section.steps} className={section.body.length > 0 ? "mt-8" : undefined} />
                ) : null}

                {section.bullets ? (
                  <ul className={`max-w-[68ch] ${section.body.length > 0 || section.steps ? "mt-8" : ""}`}>
                    {section.bullets.map((bullet, i) => (
                      <Reveal
                        as="li"
                        key={bullet.slice(0, 48)}
                        delay={i * 0.05}
                        y={12}
                        className={`border-t border-line py-4 ${
                          i === section.bullets!.length - 1 ? "border-b" : ""
                        }`}
                      >
                        <p className="text-[16px] leading-[1.55] text-paper-2">
                          <LinkedText text={bullet} />
                        </p>
                      </Reveal>
                    ))}
                  </ul>
                ) : null}
              </LabelRow>
            )}

            {/* Tabula iet pilnā platumā bez sānu kolonnas - četru kolonnu
                cenrādim vajag katru pikseli, un tā ir šīs lapas galvenā vieta. */}
            {section.table ? (
              <Reveal className="mt-[clamp(24px,3vw,40px)]">
                <PriceTable table={section.table} />
              </Reveal>
            ) : null}
          </Section>
        );
      })}
    </>
  );
}

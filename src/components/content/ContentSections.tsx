import Reveal, { stagger } from "@/components/animations/Reveal";
import { Section, LabelRow, ProseColumns } from "@/components/direction/Section";
import LinkedEmail from "./LinkedEmail";
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
 * virsrakstam "Struktūra, kas pārvērš apmeklētājus pieteikumos" ir tikai
 * 340 px kolonna ar to pašu vārdu. Referencē etiķete nes CITU informāciju
 * nekā virsraksts, tāpēc te tā tiek rādīta tikai tad, kad tā to dara.
 */
function labelAddsMeaning(kicker: string, heading: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-zāčēģīķļņšūž ]/g, "");
  return !norm(heading).startsWith(norm(kicker));
}

type Form = "table" | "prose" | "label";

function formFor(section: ContentSectionData, index: number): Form {
  if (section.table) return "table";
  if (section.bullets || section.steps) return "label";
  return index % 2 === 0 ? "prose" : "label";
}

/** Ritms mainās pēc satura garuma, ne pēc kārtas numura. */
function rhythmFor(section: ContentSectionData): "sm" | "md" | "lg" {
  if (section.table) return "lg";
  const words = section.body.join(" ").split(/\s+/).length;
  return words > 130 ? "md" : "sm";
}

export function tocFor(sections: ContentSectionData[]): Array<{ id: string; label: string }> {
  const out: Array<{ id: string; label: string }> = [];
  const table = sections.find((s) => s.table);
  if (table) out.push({ id: headingId(table.heading), label: "Cenas" });
  // Procesu meklē gan pēc `steps` masīva, gan pēc virsraksta: trīs lapas to
  // saturā tur kā numurētu sarakstu, un bez otrā ceļa satura rādītājā pazuda
  // vienīgais enkurs septiņām vidus sadaļām 14 000 px garā lapā.
  const steps =
    sections.find((s) => s.steps) ??
    sections.find((s) => /^(kā notiek|kā sāk|process|darba gaita)/i.test(s.heading) || s.kicker === "Process");
  if (steps) out.push({ id: headingId(steps.heading), label: "Process" });
  out.push({ id: "jautajumi", label: "Jautājumi" });
  out.push({ id: "saksim", label: "Sāksim" });
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

  return (
    <>
      {sections.map((section, index) => {
        const form = formFor(section, index);
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
                className={`max-w-[64ch] text-[17px] leading-[1.6] text-paper-2 ${i > 0 ? "mt-5" : ""}`}
              >
                <LinkedEmail text={paragraph} />
              </p>
            ))}
          </>
        );

        return (
          <Section key={section.heading} rhythm={rhythmFor(section)} surface={surface} labelledBy={id}>
            <Reveal>
              <h2 id={id} className="mb-[clamp(24px,3vw,40px)] max-w-[20ch] text-h2 font-medium scroll-mt-24">
                {section.heading}
              </h2>
            </Reveal>

            {form === "prose" || form === "table" ? (
              <ProseColumns>
                {section.body.map((paragraph, i) => (
                  <Reveal key={paragraph.slice(0, 48)} delay={stagger(i, 2)}>
                    <p className="max-w-[58ch] text-[17px] leading-[1.6] text-paper-2">
                      <LinkedEmail text={paragraph} />
                    </p>
                  </Reveal>
                ))}
              </ProseColumns>
            ) : (
              <LabelRow label={label}>
                <Reveal>{body}</Reveal>

                {section.steps ? <StepFlow steps={section.steps} className="mt-8" /> : null}

                {section.bullets ? (
                  <ul className="mt-8 max-w-[68ch]">
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
                          <LinkedEmail text={bullet} />
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

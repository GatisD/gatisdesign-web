import Kicker from "@/components/ui/Kicker";
import LinkedEmail from "./LinkedEmail";
import PriceTable from "./PriceTable";
import StepFlow from "./StepFlow";
import type { ContentSectionData } from "@/content/types";

type Props = {
  section: ContentSectionData;
  /** Kārtas numurs sadaļu sarakstā (no 0). Rāda kā "01" akcenta fontā. */
  index: number;
};

/**
 * Viena satura sadaļa: virsraksta kolonna kreisajā pusē (uz platiem ekrāniem
 * lipīga), teksts un saraksts labajā, tabula pāri abām kolonnām - četru kolonnu
 * cenu tabulai vajag visu platumu.
 */
export default function ContentSection({ section, index }: Props) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <section className="grid gap-x-[clamp(28px,4vw,64px)] gap-y-[clamp(18px,2.4vw,30px)] border-t border-line pt-[clamp(32px,4.4vw,64px)] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
      <div className="lg:sticky lg:top-[calc(6rem+28px)] lg:self-start">
        <div className="mb-3 flex items-baseline gap-3">
          <span aria-hidden="true" className="font-accent text-[1.25rem] italic leading-none text-paper-faint">
            {number}
          </span>
          {section.kicker ? <Kicker>{section.kicker}</Kicker> : null}
        </div>
        <h2 className="max-w-[22ch] text-[clamp(1.65rem,3.2vw,2.6rem)] font-light leading-[1.08] tracking-[-0.038em] [text-wrap:balance]">
          {section.heading}
        </h2>
      </div>

      <div className="min-w-0">
        <div className="space-y-5 text-paper-2">
          {section.body.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="max-w-[68ch]">
              <LinkedEmail text={paragraph} />
            </p>
          ))}
        </div>

        {section.steps ? (
          <StepFlow steps={section.steps} className="mt-[clamp(24px,3vw,36px)]" />
        ) : null}

        {section.bullets ? (
          <ul className="mt-[clamp(22px,2.6vw,34px)] max-w-[70ch] border-b border-line">
            {section.bullets.map((bullet) => (
              <li
                key={bullet.slice(0, 48)}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 border-t border-line py-4 text-paper-2"
              >
                <span aria-hidden="true" className="mt-[0.62em] block h-[6px] w-[6px] rounded-full bg-amber" />
                <span>
                  <LinkedEmail text={bullet} />
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* min-w-0 ir obligāts: režģa šūnas noklusējums ir min-width:auto, tāpēc
          ritināmā tabula (min-w-[620px]) citādi izstieptu visu režģi un
          mobilajā aizbīdītu rindkopu tekstu ārpus ekrāna. */}
      {section.table ? (
        <div className="min-w-0 lg:col-span-2">
          <PriceTable table={section.table} />
        </div>
      ) : null}
    </section>
  );
}

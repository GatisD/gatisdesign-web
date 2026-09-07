import Reveal from "@/components/animations/Reveal";
import LinkedText from "./LinkedText";
import type { FaqItem } from "@/content/types";

/**
 * BUJ kā atvāžams saraksts uz native <details>/<summary>.
 *
 * Kāpēc tieši native, nevis React stāvoklis: aizvērta <details> saturs PALIEK
 * dokumentā. Tieši šo sadaļu meklētāji un AI atbildes citē visbiežāk, un
 * agrākais lēmums turēt atbildes vaļā balstījās uz bailēm to pazaudēt. Ar
 * <details> tās bailes vairs nav pamatotas: atbilde ir statiskajā HTML arī
 * aizvērtā stāvoklī, bet ekrānā vairs neaizņem visu lapu. Papildus tas strādā
 * bez JavaScript un ar tastatūru bez neviena mūsu uzrakstīta atributa.
 *
 * <dl> te vairs nav: <dl> iekšpusē drīkst būt tikai <dt>, <dd>, <div> ar tiem
 * un skripti, tāpēc <details> tur nelikumīgi. Mašīnlasāmo pusi jau nes FAQPage
 * JSON-LD, un tā paliek neskarta.
 *
 * Pirmais jautājums ir vaļā ar nolūku: lapa miera stāvoklī parāda, ka te ir
 * saturs un ka rindas atveras.
 */
export default function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item, i) => (
        <Reveal key={item.q} delay={i * 0.05} y={14} className="border-b border-line">
          <details className="group" open={i === 0}>
            {/* list-none + ::-webkit-details-marker: nost noklusēto trijstūri,
                kas Safari un Chrome zīmējas atšķirīgi. */}
            <summary className="flex cursor-pointer list-none items-start justify-between gap-8 py-6 outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] [&::-webkit-details-marker]:hidden">
              <span className="max-w-[46ch] text-[clamp(1.05rem,1.7vw,1.35rem)] font-medium leading-[1.32] tracking-[-0.02em] text-paper transition-colors duration-300 group-hover:text-amber">
                {item.q}
              </span>
              {/* Plus, kas atverot pagriežas par krustu. Viena transformācija
                  divām zīmēm - bez otras ikonas un bez pārslēgšanās mirkšķa. */}
              <span
                aria-hidden="true"
                className="relative mt-[0.45em] block h-[14px] w-[14px] shrink-0 text-paper-dim transition-transform duration-300 ease-out group-open:rotate-45 group-open:text-amber motion-reduce:transition-none"
              >
                <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-current" />
                <span className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-current" />
              </span>
            </summary>
            <div className="max-w-[62ch] pb-7 text-[16px] leading-[1.6] text-paper-2">
              <LinkedText text={item.a} />
            </div>
          </details>
        </Reveal>
      ))}
    </div>
  );
}

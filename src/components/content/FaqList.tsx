import Reveal from "@/components/animations/Reveal";
import LinkedEmail from "./LinkedEmail";
import type { FaqItem } from "@/content/types";

/**
 * FAQ ar semantisku <dl> iezīmējumu un ATVĒRTĀM atbildēm.
 *
 * Akordeons te apzināti nav: tieši šo satura daļu meklētāji un AI atbildes citē
 * visbiežāk, un apstiprinātajā kanvā jautājums un atbilde stāv blakus vienā
 * rindā. Aizvērts akordeons ietaupītu ekrānu, bet iztērētu to, kāpēc šī sadaļa
 * vispār eksistē.
 *
 * <dt> nedrīkst saturēt virsraksta elementu (HTML specifikācija), tāpēc
 * jautājums ir noformēts kā virsraksts, bet paliek <dt>.
 */
export default function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <dl>
      {/* Viens <div> uz jautājuma un atbildes pāri, ne divi: <dl> iekšienē
          drīkst būt tikai <dt>, <dd>, <div> ar tiem un skripti, un ietinums
          ietinumā šo prasību lauž (Lighthouse definition-list). Tāpēc Reveal
          renderē tieši šo <div>, nevis vēl vienu virs tā. */}
      {items.map((item, i) => (
        <Reveal
          key={item.q}
          delay={i * 0.05}
          y={14}
          className={`grid gap-x-12 gap-y-3 border-t border-line py-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_28px] ${
            i === items.length - 1 ? "border-b" : ""
          }`}
        >
          <dt className="max-w-[26ch] text-[clamp(1.15rem,1.9vw,1.5rem)] font-medium leading-[1.32] tracking-[-0.02em] text-paper">
            {item.q}
          </dt>
          <dd className="m-0 max-w-[62ch] text-[16px] leading-[1.6] text-paper-2">
            <LinkedEmail text={item.a} />
          </dd>
          <span aria-hidden="true" className="hidden h-px w-4 self-start justify-self-end bg-paper-faint md:mt-3.5 md:block" />
        </Reveal>
      ))}
    </dl>
  );
}

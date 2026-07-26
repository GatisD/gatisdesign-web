import LinkedEmail from "./LinkedEmail";
import type { FaqItem } from "@/content/types";

/**
 * FAQ ar semantisku <dl> iezīmējumu. Atbildes ir pilnā tekstā HTML, nevis aiz
 * JS akordeona - tieši šo satura daļu meklētāji un AI atbildes citē visbiežāk.
 * <dt> nedrīkst saturēt virsraksta elementu (HTML specifikācija), tāpēc
 * jautājums ir noformēts kā virsraksts, bet paliek <dt>.
 */
export default function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <dl className="border-t border-line">
      {items.map((item) => (
        <div
          key={item.q}
          className="grid gap-3 border-b border-line py-[clamp(22px,2.6vw,32px)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12"
        >
          <dt className="max-w-[28ch] text-[clamp(1.08rem,1.7vw,1.35rem)] font-medium leading-snug tracking-[-0.022em] text-paper">
            {item.q}
          </dt>
          <dd className="m-0 max-w-[64ch] text-paper-dim">
            <LinkedEmail text={item.a} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

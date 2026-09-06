import Reveal, { stagger } from "@/components/animations/Reveal";
import { Section, SectionTitle } from "@/components/direction/Section";
import Label from "@/components/ui/Label";
import { TESTIMONIALS_ENABLED, testimonials, type Testimonial } from "@/content/testimonials";

/**
 * Atsauksmju sadaļa.
 *
 * Nerenderē NEKO, kamēr `TESTIMONIALS_ENABLED` ir `false` vai saraksts ir tukšs.
 * Tas ir apzināti: sadaļa ar diviem tukšiem rāmjiem vai ar anonīmu "lielisks
 * darbs!" izskatās pēc salauztas lapas, un lapai, kuras galvenais arguments ir
 * "viens cilvēks, kurš atbild par rezultātu", tas maksā vairāk nekā dod.
 *
 * Rezultāts stāv PIRMS citāta: to lasa arī tas, kurš citātu neizlasa.
 */
export default function Testimonials({ heading = "Ko saka klienti" }: { heading?: string }) {
  const items = TESTIMONIALS_ENABLED ? testimonials : [];
  if (items.length === 0) return null;

  return (
    <Section rhythm="lg" surface="ink-850" labelledBy="atsauksmes-h">
      <SectionTitle id="atsauksmes-h" className="mb-[clamp(28px,4vw,48px)]">
        {heading}
      </SectionTitle>
      <ul className="grid gap-grid md:grid-cols-2">
        {items.map((item, i) => (
          <Reveal as="li" key={`${item.company}-${item.name}`} delay={stagger(i, 2)}>
            <Card item={item} />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

function Card({ item }: { item: Testimonial }) {
  return (
    <figure className="flex h-full flex-col gap-5 rounded-card border border-line bg-ink-card p-7 md:p-8">
      <p>
        <Label tone="amber">{item.result}</Label>
      </p>
      <blockquote className="text-[17px] leading-[1.6] text-paper-2">{item.quote}</blockquote>
      <figcaption className="mt-auto border-t border-line pt-4 text-[15px] text-paper">
        {item.name}
        <span className="block text-[14px] text-paper-dim">
          {item.role}, {item.company}
        </span>
      </figcaption>
    </figure>
  );
}

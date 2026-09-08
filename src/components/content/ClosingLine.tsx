import Label from "@/components/ui/Label";
import { Section } from "@/components/direction/Section";
import LinkedText from "./LinkedText";
import { useLocale } from "@/i18n/LocaleContext";

/**
 * Noslēguma rinda iekšējām lapām.
 *
 * Pilnais noslēgums - virsraksts "Pastāsti, kas tev jāatrisina", etiķete
 * "Atbilde 1 darba dienā", pill un e-pasts - astoņās lapās bija viens un tas
 * pats bloks; sestajā reizē tas vairs nav aicinājums, bet slots. Tāpēc pilnā
 * forma paliek tikai sākumlapā (un Kontaktos, kur tā ir visa lapa), pārējām
 * lapām paliek viena rinda ar lapas paša tekstu un e-pasta saiti.
 *
 * `id="saksim"` paliek: uz to norāda pakalpojumu lapu satura rādītājs.
 */
export default function ClosingLine({
  text,
  note,
}: {
  /** Lapas paša noslēguma teikums. E-pasts tekstā kļūst par saiti. */
  text: string;
  /** Īsa piezīme rindas labajā malā, ja teksts pats atbildes laiku nenosauc. */
  note?: string;
}) {
  const { locale } = useLocale();
  return (
    <Section rhythm="md" surface="ink-950" id="saksim" ariaLabel={locale === "lv" ? "Sāksim" : "Let's start"} className="scroll-mt-24">
      <div className="flex flex-col gap-3 border-t border-line pt-6 md:flex-row md:items-baseline md:justify-between md:gap-10">
        <p className="max-w-[64ch] text-[17px] leading-[1.45] text-paper-2">
          <LinkedText text={text} />
        </p>
        {note ? (
          <p className="shrink-0">
            <Label>{note}</Label>
          </p>
        ) : null}
      </div>
    </Section>
  );
}

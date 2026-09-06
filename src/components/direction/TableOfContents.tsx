import Label from "@/components/ui/Label";

/**
 * Mini satura rādītājs pakalpojumu lapas hero apakšā.
 *
 * Iemesls ir mērāms: šīs lapas ir 2500-3300 vārdu gari dokumenti, un cenu
 * tabula dažās no tām ir desmitā sadaļa. Bez enkuriem cilvēks, kurš atnāca
 * pēc cenas, to meklē ar ritināšanu.
 *
 * Klikšķa lauks ir 44 px augsts, apakšsvītra paliek pie teksta. Nomērīts bija
 * 46x16 un 60x16 - 16 px augsta josla, kas domāta pieskārienam. `--underline`
 * tiek uzstādīts uz saites, ne uz iekšējā span, lai apakšsvītra parādās arī
 * tad, kad pirksts trāpa atkāpē, ne burtos.
 */
export default function TableOfContents({
  items,
  heading = "Šajā lapā",
}: {
  items: Array<{ id: string; label: string }>;
  heading?: string;
}) {
  if (items.length === 0) return null;
  return (
    <nav aria-label={heading} className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
      <Label caps>{heading}</Label>
      <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="inline-flex min-h-[44px] items-center text-[15px] text-paper-2 transition-colors duration-300 hover:text-amber hover:[--underline:1] focus-visible:[--underline:1] active:text-amber md:text-[16px]"
            >
              <span className="nav-underline relative">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

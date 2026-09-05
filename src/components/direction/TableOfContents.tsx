import Label from "@/components/ui/Label";

/**
 * Mini satura rādītājs pakalpojumu lapas hero apakšā.
 *
 * Iemesls ir mērāms: šīs lapas ir 2500-3300 vārdu gari dokumenti, un cenu
 * tabula dažās no tām ir desmitā sadaļa. Bez enkuriem cilvēks, kurš atnāca
 * pēc cenas, to meklē ar ritināšanu.
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
              className="nav-underline relative text-[15px] text-paper-2 transition-colors duration-300 hover:text-amber md:text-[16px]"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

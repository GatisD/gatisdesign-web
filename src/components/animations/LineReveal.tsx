import { useEffect, useRef, useState, type CSSProperties, type ElementType } from "react";

/**
 * Virsraksta rindu atklāsme: katra rinda izbīdās no apakšas ar 70 ms nobīdi.
 * Rindas padod kā masīvu - vārdu-pa-vārdam reveal pie piecu rindu virsraksta
 * ilgtu divas sekundes, un lietotājs to gaidītu pirms pirmā satura.
 *
 * SSG kadrā teksts ir REDZAMS: slēpšana notiek tikai zem `html[data-reveal="on"]`,
 * ko uzliek inline <head> skripts (index.html) un ko tas NEUZLIEK, ja pārlūks
 * ziņo `prefers-reduced-motion: reduce`. Tāpēc šeit nav ne inline `opacity: 0`,
 * ne JS mērījuma: bez kustības, bez JS un drukājot virsraksts vienkārši ir.
 * Slēpšanas, atklāsmes, `prefers-reduced-motion` un 3 s avārijas taimera
 * likumi dzīvo vienuviet - src/index.css `.line-reveal` blokā.
 * Atsevišķas rindas ir <span>, tāpēc ekrānlasītājs virsrakstu nolasa kā vienu
 * teikumu.
 *
 * ATSTARPE starp rindām ir ĪSTA rakstzīme, ne tikai bloka robeža. Renderētajā
 * DOM `display: block` vārdus atdala, bet `textContent` deva
 * "Mājaslapuizstrāde" - un tieši to redz katrs teksta izvilcējs, kas
 * nerenderē CSS (kopēšana, `document.title`, AI atbilžu dzinēji, kurus
 * robots.txt un llms.txt te īpaši ielaiž). Atstarpe rindas beigās izkārtojumā
 * sabrūk un vizuāli neko nemaina.
 */
export default function LineReveal({
  as: Tag = "h1",
  id,
  lines,
  className,
  lineClassName,
  accentFrom,
}: {
  as?: ElementType;
  id?: string;
  lines: string[];
  className?: string;
  lineClassName?: string;
  /** No šī indeksa rindas ir vara krāsā (Direction divkrāsu virsraksts). */
  accentFrom?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-js", "");
    const el = ref.current;
    if (
      !el ||
      typeof IntersectionObserver === "undefined" ||
      document.documentElement.getAttribute("data-reveal") !== "on"
    ) {
      setVisible(true);
      return;
    }
    // Hero ir jau skatā, tāpēc novērotājs nostrādā tūlīt pēc hidratācijas.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      // `overflow-wrap: anywhere` nostrādā TIKAI tad, kad vārds citādi izlīstu
      // no lapas. Latviešu salikteņi displeja mērogā pie 320 px ir tieši tāds
      // gadījums, un nogriezts vārds ar `overflow-x: clip` ir sliktāks par
      // pārnestu vārdu.
      className={["line-reveal [overflow-wrap:anywhere]", visible && "is-visible", className]
        .filter(Boolean)
        .join(" ")}
    >
      {lines.map((line, i) => (
        <span
          key={line}
          className={[
            "block",
            accentFrom !== undefined && i >= accentFrom ? "text-amber" : undefined,
            lineClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ "--line-index": i } as CSSProperties}
        >
          {i < lines.length - 1 ? `${line} ` : line}
        </span>
      ))}
    </Tag>
  );
}

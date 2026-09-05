import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Tag = "div" | "li" | "article" | "section" | "header" | "tr" | "span";

interface Props {
  children: ReactNode;
  /** Aizture sekundēs. Režģiem lieto stagger(), viencolonnas sarakstiem i * step. */
  delay?: number;
  /** Cik pikseļu elements paceļas. 0 = tikai fade (rindām ar dalītājlīniju). */
  y?: number;
  className?: string;
  /** Kādu tagu renderēt: <ol>/<ul> iekšā drīkst būt tikai <li>. */
  as?: Tag;
}

/**
 * Viļņa aizture režģa kartēm: cikls iet pa kolonnu, ne pa kartes kārtas numuru -
 * secīga aizture 12 kartēm sanāktu pusotra sekunde astei. `cols` = kolonnu skaits
 * platākajā breakpointā. Viencolonnas sarakstiem šo NELIETO - tur pareizais ir
 * monotons `i * step`, citādi rindas parādās nepareizā secībā.
 */
export function stagger(i: number, cols = 3, step = 0.08): number {
  return (i % cols) * step;
}

/**
 * Scroll atklāsme. Slēpšana un animācija dzīvo src/index.css `.reveal` blokā un
 * darbojas tikai zem `html[data-reveal="on"]`, ko uzliek inline skripts index.html.
 * Šī komponente pievieno `.is-visible`, kad elements ienāk skatā, un uzliek
 * `data-js` uz <html>, kas izslēdz 3 s avārijas taimeri.
 *
 * Bez Framer Motion apzināti: SSG serveris ierakstītu inline `opacity:0`, un, ja
 * hidratācija apstātos, saturs paliktu neredzams. CSS klases lēmumu pārlūks
 * pieņem pirms jebkura JS.
 */
export default function Reveal({ children, delay = 0, y = 24, className, as = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-js", "");

    const el = ref.current;
    // Ja vārti nav ieslēgti (reduced-motion, vecs pārlūks), CSS neko neslēpj -
    // novērotājs būtu tīrs zaudējums.
    if (
      !el ||
      typeof IntersectionObserver === "undefined" ||
      document.documentElement.getAttribute("data-reveal") !== "on"
    ) {
      setVisible(true);
      return;
    }
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

  const style: CSSProperties = {};
  if (delay) (style as Record<string, string>)["--reveal-delay"] = `${delay}s`;
  if (y !== 24) (style as Record<string, string>)["--reveal-y"] = `${y}px`;

  return createElement(
    as,
    {
      ref,
      className: ["reveal", visible && "is-visible", className].filter(Boolean).join(" "),
      style,
    },
    children,
  );
}

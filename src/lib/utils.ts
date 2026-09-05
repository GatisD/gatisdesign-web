import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Klašu apvienošana ar tailwind-merge.
 *
 * `extendTailwindMerge` te nav dekorācija. `text-label` ir mūsu pašu fonta
 * izmērs (tailwind.config.ts `fontSize.label`), bet tailwind-merge to nepazīst
 * un klasificē kā `text-<krāsa>`, tāpēc jebkurš vēlāks `text-paper-faint` to
 * KLUSI izmeta. Rezultāts būvē: 24 `font-label` un tikai 1 `text-label` -
 * visas mono etiķetes mantoja 16-17 px no vecāka 12 px vietā.
 *
 * Tas ir tieši tas defekta veids, ko neredz ne TypeScript, ne būves vārti:
 * klase ir kodā, klase ir CSS, un tomēr lapā tās nav.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["label", "display", "display-2", "giant", "h2", "h3"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

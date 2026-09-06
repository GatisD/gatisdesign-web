import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";
import { ROUTES, pathForPathname, type RouteKey } from "@/i18n/routes";
import { CONTACT_EMAIL } from "@/lib/site";

const INLINE_LINK = "border-b border-line-amber transition-colors duration-300 hover:text-amber";

/** LV ceļš saturā -> maršruta atslēga, lai saite strādā arī zem /en. */
const ROUTE_KEY_BY_LV_PATH = Object.fromEntries(
  (Object.keys(ROUTES) as RouteKey[]).map((key) => [ROUTES[key].lv, key]),
) as Record<string, RouteKey>;

/**
 * Trīs formas vienā atlasītājā, un secība ir svarīga: `[enkurs](/cels)` jāatpazīst
 * PIRMS kailā ceļa, citādi iekavās esošais ceļš tiktu izgriezts atsevišķi un
 * enkurs paliktu kā teksts ar kvadrātiekavām.
 *
 * Grupu skaits ir tieši viena: `String.split` ar regulāro izteiksmi izvadā liek
 * VISAS grupas, tāpēc iekšējās ir bez tveršanas.
 */
const MD_LINK_SOURCE = "\\[[^\\]]+\\]\\(/[a-z0-9/-]+\\)";
const MD_EXTERNAL_SOURCE = "\\[[^\\]]+\\]\\(https://[^)\\s]+\\)";
const TOKEN = new RegExp(
  `(${MD_LINK_SOURCE}|${MD_EXTERNAL_SOURCE}|${CONTACT_EMAIL.replace(/\./g, "\\.")}|/[a-z-]+)`,
  "g",
);
const MD_LINK = /^\[([^\]]+)\]\((\/[a-z0-9/-]+)\)$/;
const MD_EXTERNAL = /^\[([^\]]+)\]\((https:\/\/[^)\s]+)\)$/;

/**
 * LV ceļš -> maršruta atslēga. Krīt ar skaidru kļūdu, ja saturā ir ceļš, kāda
 * ROUTES kartē nav: klusa `undefined` atslēga dotu saiti uz `/undefined`.
 */
export function routeKeyForLvPath(lvPath: string): RouteKey {
  const key = ROUTE_KEY_BY_LV_PATH[lvPath];
  if (!key) throw new Error(`Saturā ir ceļš, kura ROUTES kartē nav: ${lvPath}`);
  return key;
}

/**
 * Teksts, kurā saturā ierakstītā e-pasta adrese un iekšējais ceļš kļūst par
 * īstām saitēm. Pats teksts netiek mainīts - tikai ietīts.
 *
 * Viena komponente, ne divas: agrāk `LinkedEmail` (satura sadaļas) prata tikai
 * e-pastu, bet `LinkedText` (tikai sākumlapā) - arī ceļus. Rezultāts bija tāds,
 * ka saturā ierakstīts `/par-mani` vienā lapā bija saite, citā - teksts ar
 * slīpsvītru. Ceļa atslēga nāk no ROUTES kartes, tāpēc zem /en tā pati rinda
 * ved uz angļu maršrutu.
 *
 * `[enkurs](/cels)` ir vēlamā forma: kails ceļš pamattekstā lasās kā adrese, ne
 * kā enkurs, un enkura teksts ir tas, ko meklētājs un AI modelis ņem par lapas
 * tēmu. Kailais ceļš paliek atbalstīts, lai vecais saturs nesalūztu.
 */
export default function LinkedText({ text }: { text: string }): ReactNode {
  const { path, locale } = useLocale();
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        const md = MD_LINK.exec(part);
        if (md) {
          // `pathForPathname` zina arī projektu lapas (/portfolio/<slug>), tāpēc
          // enkuru drīkst likt gan uz maršrutu, gan uz konkrētu darbu.
          const target = pathForPathname(md[2], locale);
          if (!target) throw new Error(`Saturā ir saite uz ceļu, kāda nav: ${md[2]}`);
          return (
            <Link key={i} to={target} className={INLINE_LINK}>
              {md[1]}
            </Link>
          );
        }
        // Ārēja atsauce uz avotu. Tikai https, tikai jauna cilne: lapa, kas
        // apgalvo, kā Google renderē JavaScript, atsauci uz avotu ir parādā.
        const ext = MD_EXTERNAL.exec(part);
        if (ext) {
          return (
            <a
              key={i}
              href={ext[2]}
              target="_blank"
              rel="noopener noreferrer"
              className={INLINE_LINK}
            >
              {ext[1]}
            </a>
          );
        }
        if (part === CONTACT_EMAIL) {
          return (
            <a key={i} href={`mailto:${CONTACT_EMAIL}`} className={INLINE_LINK}>
              {part}
            </a>
          );
        }
        const key = ROUTE_KEY_BY_LV_PATH[part];
        if (key) {
          return (
            <Link key={i} to={path(key)} className={INLINE_LINK}>
              {part}
            </Link>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

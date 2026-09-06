import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";
import { ROUTES, type RouteKey } from "@/i18n/routes";
import { CONTACT_EMAIL } from "@/lib/site";

const INLINE_LINK = "border-b border-line-amber transition-colors duration-300 hover:text-amber";

/** LV ceļš saturā -> maršruta atslēga, lai saite strādā arī zem /en. */
const ROUTE_KEY_BY_LV_PATH = Object.fromEntries(
  (Object.keys(ROUTES) as RouteKey[]).map((key) => [ROUTES[key].lv, key]),
) as Record<string, RouteKey>;

const TOKEN = new RegExp(`(${CONTACT_EMAIL.replace(/\./g, "\\.")}|/[a-z-]+)`, "g");

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
 */
export default function LinkedText({ text }: { text: string }): ReactNode {
  const { path } = useLocale();
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
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

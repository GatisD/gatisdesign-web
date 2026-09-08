import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";
import { BUILD_YEAR, CONTACT_EMAIL, SOCIAL } from "@/lib/site";
import MediaPlaceholder, { SHOW_PLACEHOLDERS } from "./direction/MediaPlaceholder";
import Label from "./ui/Label";
import LanguageSwitch from "./LanguageSwitch";
import { openCookieSettings } from "./CookieBanner";

/**
 * Kājene kā kolofons, ne kā vietnes karte.
 *
 * Sešu lapu vietnei nav ko katalogizēt divpadsmit saitēs trīs kolonnās - tā ir
 * SaaS kājenes forma, un uz šīs lapas tā būtu tikai forma. Tāpēc te ir viena
 * saišu rinda, e-pasts, kolofona rinda un vieta portretam, kā apstiprinātajā
 * kanvā: papīra inversija zem visas tumšās lapas.
 *
 * Krāsu piezīme: uz papīra fona vara #DF541E ir 3,18:1 un tekstam neder, tāpēc
 * saites un to hover stāvoklis lieto --amber-on-paper (#98461E, 5,34:1).
 */
export default function Footer() {
  const { t, path } = useLocale();

  const pages = [
    { to: path("portfolio"), label: t.nav.portfolio },
    { to: path("services.brand"), label: t.services.brand },
    { to: path("services.web"), label: t.services.web },
    { to: path("services.ai"), label: t.services.ai },
    { to: path("services.seo"), label: t.services.seo },
    { to: path("about"), label: t.nav.about },
    { to: path("contact"), label: t.nav.contact },
  ];

  const social = [
    { label: "LinkedIn", href: SOCIAL.linkedin },
    { label: "Instagram", href: SOCIAL.instagram },
    { label: "Dribbble", href: SOCIAL.dribbble },
    { label: "Facebook", href: SOCIAL.facebook },
  ];

  const linkCls =
    "inline-flex min-h-[44px] items-center text-[16px] text-on-paper transition-colors duration-300 hover:text-amber-paper md:text-[17px]";


  return (
    <footer className="on-paper bg-paper text-on-paper">
      <div className="mx-auto w-full max-w-wrap px-5 sm:px-8 lg:px-10 pb-10 pt-12 md:pt-24">
        {/* Kolonnas ir divas tikai tad, kad portreta vieta reāli renderējas.
            Produkcijā vietturis ir null, un bez šī nosacījuma saites paliktu
            iespiestas šaurajā 1fr kolonnā blakus tukšumam. */}
        <div
          className={
            SHOW_PLACEHOLDERS
              ? "grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-end md:gap-12"
              : "grid gap-10"
          }
        >
          <MediaPlaceholder
            text={t.footer.portraitSlot}
            ratio="17 / 10"
            className="max-w-[280px] border-on-paper/35 bg-paper"
          />

          <div className="flex flex-col gap-6">
            {/* Kolofona zīme. Kopš 2026-09-06 te ir īstais logo, un tam vairs
                nevajag atsevišķu variantu gaišam fonam: zīme nes pati savas
                melnās kontūras, tāpēc tā turas gan uz papīra, gan uz tintes.
                alt tukšs, jo
                vārds ir blakus tekstā. */}
            <Link to={path("home")} className="flex w-fit items-center gap-3">
              <img
                src="/media/lauva.svg"
                alt=""
                width="72"
                height="64"
                className="h-14 w-auto shrink-0 md:h-16"
              />
              <span className="text-[19px] font-bold tracking-[-0.02em] text-on-paper md:text-[20px]">
                Gatis Design
              </span>
            </Link>

            <nav aria-label={t.nav.services}>
              <ul className="flex flex-wrap items-center gap-x-7 gap-y-0">
                {pages.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className={linkCls}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex flex-wrap items-center gap-x-7 gap-y-0">
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkCls}>
                {CONTACT_EMAIL}
              </a>
              {social.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkCls}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line-paper pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Label tone="on-paper">{t.footer.location}</Label>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {/* Tikai gads. Vārds jau stāv kolofona zīmē virs saitēm, un
                trešais "Gatis Design" vienā kājenē ir atkārtojums, ne uzsvars. */}
            <Label tone="on-paper" caps>
              {BUILD_YEAR}
            </Label>
            <Link
              to={path("privacy")}
              className="inline-flex min-h-[44px] items-center font-label text-label text-on-paper-dim transition-colors duration-300 hover:text-amber-paper active:text-amber-paper"
            >
              {t.footer.privacy}
            </Link>
            {/* Piekrišanu varēja dot, bet ne atsaukt: josla neatgriezās, un
                politikā ierakstītais ceļš (izdzēst sīkdatnes pārlūkā) izvēli
                neatiestatīja, jo tā glabājas localStorage. */}
            <button
              type="button"
              onClick={openCookieSettings}
              className="inline-flex min-h-[44px] items-center font-label text-label text-on-paper-dim transition-colors duration-300 hover:text-amber-paper active:text-amber-paper"
            >
              {t.cookies.settings}
            </button>
            <LanguageSwitch onPaper />
          </div>
        </div>
      </div>
    </footer>
  );
}

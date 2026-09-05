import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";
import { CONTACT_EMAIL, SOCIAL } from "@/lib/site";
import MediaPlaceholder from "./direction/MediaPlaceholder";
import Label from "./ui/Label";
import LanguageSwitch from "./LanguageSwitch";

/**
 * Kājene kā kolofons, ne kā vietnes karte.
 *
 * Sešu lapu vietnei nav ko katalogizēt divpadsmit saitēs trīs kolonnās - tā ir
 * SaaS kājenes forma, un uz šīs lapas tā būtu tikai forma. Tāpēc te ir viena
 * saišu rinda, e-pasts, kolofona rinda un vieta portretam, kā apstiprinātajā
 * kanvā: papīra inversija zem visas tumšās lapas.
 *
 * Krāsu piezīme: uz papīra fona vara #E0723C ir 2,60:1 un tekstam neder, tāpēc
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

  // Vienīgais atļautais new Date() render laikā - gads mainās reizi gadā, un
  // būves un hidratācijas brīdis praktiski vienmēr sakrīt (projekta CLAUDE.md).
  const year = new Date().getFullYear();

  return (
    <footer className="on-paper bg-paper text-on-paper">
      <div className="mx-auto w-full max-w-wrap px-pad-x pb-10 pt-sec-md">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-end md:gap-12">
          <MediaPlaceholder
            text={t.footer.portraitSlot}
            ratio="17 / 10"
            className="max-w-[280px] border-on-paper/35 bg-paper"
          />

          <div className="flex flex-col gap-6">
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
            <Label tone="on-paper" caps>
              {year} · Gatis Design
            </Label>
            <Link
              to={path("privacy")}
              className="font-label text-label text-on-paper-dim transition-colors duration-300 hover:text-amber-paper"
            >
              {t.footer.privacy}
            </Link>
            <LanguageSwitch onPaper />
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";
import { BUILD_YEAR, CONTACT_EMAIL, SOCIAL } from "@/lib/site";
import { SOC_ZIMES } from "@/data/soc-zimes";
import MediaPlaceholder, { SHOW_PLACEHOLDERS } from "./direction/MediaPlaceholder";
import Label from "./ui/Label";
import LanguageSwitch from "./LanguageSwitch";
import { openCookieSettings } from "./CookieBanner";

/**
 * Kājene kā kolofons, ne kā vietnes karte.
 *
 * Sešu lapu vietnei nav ko katalogizēt divpadsmit saitēs trīs kolonnās - tā ir
 * SaaS kājenes forma, un uz šīs lapas tā būtu tikai forma. Tāpēc te ir viena
 * saišu rinda, e-pasts, zīmju rinda un kolofons.
 *
 * TUMŠA, ne papīra. Līdz 2026-09-08 kājene bija gaišā papīra inversija zem
 * tumšās lapas. Tas maksāja vairāk, nekā deva: papīra virsmai vajadzēja savu
 * teksta krāsu, savu līniju krāsu, savu akcentu (akcents uz papīra ir 1,68:1
 * un nav lietojams nemaz) un savu fokusa gredzenu - četri paralēli tokeni un
 * divi komponenšu karogi, lai viena sekcija būtu otrādi. Tagad lapa ir tumša
 * no augšas līdz apakšai, un kājeni no satura atdala tonis (ink-850), ne
 * inversija.
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
    { key: "linkedin", label: "LinkedIn", href: SOCIAL.linkedin },
    { key: "instagram", label: "Instagram", href: SOCIAL.instagram },
    { key: "dribbble", label: "Dribbble", href: SOCIAL.dribbble },
    { key: "facebook", label: "Facebook", href: SOCIAL.facebook },
  ];

  const linkCls =
    "inline-flex min-h-[44px] items-center text-[16px] text-paper-2 transition-colors duration-300 hover:text-amber active:text-amber md:text-[17px]";


  return (
    <footer className="border-t border-line bg-ink-850 text-paper">
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
            className="max-w-[280px] border-line bg-ink-card"
          />

          <div className="flex flex-col gap-6">
            {/* Kolofona zīme. Horizontālais logo ietver vārdzīmi, tāpēc blakus
                vairs nav atsevišķa teksta. */}
            <Link to={path("home")} className="flex w-fit items-center">
              <img
                src="/media/gd-logo-horizontal.svg"
                alt="Gatis Design"
                width="225"
                height="72"
                className="h-14 w-auto shrink-0 md:h-[72px]"
              />
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

            <div className="flex flex-wrap items-center gap-x-7 gap-y-1">
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkCls}>
                {CONTACT_EMAIL}
              </a>

              {/* Zīmes, ne vārdi. Nosaukums paliek `sr-only`: ekrānlasītājam
                  vajag "LinkedIn", acij pietiek ar glifu, un četri vārdi rindā
                  ar e-pasta adresi bija garāki par pašu adresi.

                  Klikšķa lauks ir 44 px, kaut zīme ir 20 px - pieskāriena
                  mērķis nedrīkst būt zīmes izmērā. */}
              <ul className="-mx-2.5 flex items-center">
                {social.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-11 items-center justify-center text-paper-dim transition-colors duration-300 hover:text-amber active:text-amber"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: SOC_ZIMES[item.key] }}
                      />
                      <span className="sr-only">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Label>{t.footer.location}</Label>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {/* Tikai gads. Vārds jau stāv kolofona zīmē virs saitēm, un
                trešais "Gatis Design" vienā kājenē ir atkārtojums, ne uzsvars. */}
            <Label caps>{BUILD_YEAR}</Label>
            <Link
              to={path("privacy")}
              className="inline-flex min-h-[44px] items-center font-label text-label text-paper-faint transition-colors duration-300 hover:text-amber active:text-amber"
            >
              {t.footer.privacy}
            </Link>
            {/* Piekrišanu varēja dot, bet ne atsaukt: josla neatgriezās, un
                politikā ierakstītais ceļš (izdzēst sīkdatnes pārlūkā) izvēli
                neatiestatīja, jo tā glabājas localStorage. */}
            <button
              type="button"
              onClick={openCookieSettings}
              className="inline-flex min-h-[44px] items-center font-label text-label text-paper-faint transition-colors duration-300 hover:text-amber active:text-amber"
            >
              {t.cookies.settings}
            </button>
            <LanguageSwitch />
          </div>
        </div>
      </div>
    </footer>
  );
}

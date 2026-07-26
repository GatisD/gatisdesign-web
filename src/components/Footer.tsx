import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";
import { CONTACT_EMAIL, SOCIAL } from "@/lib/site";
import Kicker from "./ui/Kicker";

const socialLinks = [
  { label: "Dribbble", href: SOCIAL.dribbble },
  { label: "Instagram", href: SOCIAL.instagram },
  { label: "LinkedIn", href: SOCIAL.linkedin },
  { label: "Facebook", href: SOCIAL.facebook },
];

export default function Footer() {
  const { t, path } = useLocale();

  const serviceLinks = [
    { to: path("services.brand"), label: t.services.brand },
    { to: path("services.web"), label: t.services.web },
    { to: path("services.ai"), label: t.services.ai },
    { to: path("services.seo"), label: t.services.seo },
  ];

  const pageLinks = [
    { to: path("portfolio"), label: t.nav.portfolio },
    { to: path("about"), label: t.nav.about },
    { to: path("contact"), label: t.nav.contact },
    { to: path("privacy"), label: t.footer.privacy },
  ];

  // Vienīgais atļautais new Date() lietojums render laikā - gads mainās reti,
  // build un hidratācijas laiks praktiski vienmēr sakrīt (sk. projekta CLAUDE.md).
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ink-850">
      <div className="mx-auto max-w-wrap px-[var(--pad-x)] py-16 md:py-20">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <Link to={path("home")} className="flex w-fit flex-col leading-none">
              <span className="font-accent text-xl italic text-paper">Gatis Design</span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-paper-faint">Rīga</span>
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-block min-h-[44px] items-center text-sm text-paper-dim transition-colors duration-200 hover:text-amber"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="space-y-4">
            <Kicker>{t.nav.services}</Kicker>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-[44px] items-center text-sm text-paper-dim transition-colors duration-200 hover:text-amber"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <ul className="space-y-3">
              {pageLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-[44px] items-center text-sm text-paper-dim transition-colors duration-200 hover:text-amber"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-line pt-8 md:flex-row">
          <p className="text-xs text-paper-faint">
            © {year} Gatis Design. {t.footer.rights}.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {socialLinks.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center text-xs uppercase tracking-[0.08em] text-paper-faint transition-colors duration-200 hover:text-amber"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

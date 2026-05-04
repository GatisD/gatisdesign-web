import { Link } from "react-router-dom";
import { CONTACT_EMAIL, SOCIAL } from "@/lib/site";

const navLinks = [
  { label: "Sākums", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Par mani", href: "/par-mani" },
  { label: "Kontakti", href: "/kontakti" },
];

const socialLinks = [
  { label: "Dribbble", href: SOCIAL.dribbble },
  { label: "Instagram", href: SOCIAL.instagram },
  { label: "LinkedIn", href: SOCIAL.linkedin },
  { label: "Facebook", href: SOCIAL.facebook },
];

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <span className="eyebrow text-muted-foreground block">GATIS DESIGN</span>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Brand identity ar 18 gadu pieredzi. <br /> Bāzēts Rīgā, pieejams projektiem visā pasaulē.
            </p>
          </div>

          <div className="space-y-4">
            <span className="eyebrow text-muted-foreground block">Navigācija</span>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <span className="eyebrow text-muted-foreground block">Kontakti</span>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-foreground hover:text-accent transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="text-sm text-muted-foreground">Rīga, Latvija</li>
            </ul>
          </div>

          <div className="space-y-4">
            <span className="eyebrow text-muted-foreground block">Sociāli</span>
            <ul className="space-y-3">
              {socialLinks.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row gap-3 justify-between items-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Gatis Design. Visas tiesības aizsargātas.</p>
          <div className="flex gap-6">
            <Link to="/privatuma-politika" className="hover:text-foreground transition-colors">
              Privātuma politika
            </Link>
            <span className="font-mono uppercase tracking-widest">Crafted in Riga</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

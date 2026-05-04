import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Sākums", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Par mani", href: "/par-mani" },
  { label: "Kontakti", href: "/kontakti" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 flex items-center justify-between h-20 md:h-24">
          <Link
            to="/"
            className="font-display font-bold text-xl md:text-2xl tracking-tighter text-foreground"
            aria-label="Gatis Design — Sākums"
          >
            Gatis Design
          </Link>

          <nav className="hidden md:flex items-center gap-10" aria-label="Galvenā navigācija">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  `font-display text-base transition-colors duration-300 ${
                    isActive
                      ? "text-foreground border-b-2 border-accent pb-1"
                      : "text-muted-foreground hover:text-accent"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/kontakti"
              className="hidden md:inline-flex bg-foreground text-background px-6 py-3 text-sm rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Sākt projektu
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-foreground"
              aria-label={mobileOpen ? "Aizvērt izvēlni" : "Atvērt izvēlni"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-20 z-[100] bg-background overflow-y-auto">
          <nav className="flex flex-col p-6 gap-2" aria-label="Mobilā navigācija">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-4 py-4 text-2xl font-display font-medium border-b border-border hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/kontakti"
              className="mt-6 bg-foreground text-background px-6 py-4 text-base text-center rounded-lg font-medium"
            >
              Sākt projektu
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

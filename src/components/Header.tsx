import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";
import { PHONE } from "@/lib/site";
import { getLenis } from "./SmoothScroll";
import LanguageSwitch from "./LanguageSwitch";
import type { RouteKey } from "@/i18n/routes";

const SERVICE_KEYS: RouteKey[] = ["services.brand", "services.web", "services.ai", "services.seo"];
const SERVICE_LABEL = { "services.brand": "brand", "services.web": "web", "services.ai": "ai", "services.seo": "seo" } as const;

/** Chevron pa labi - izvēlnes rindas "tālāk" zīme. Viens līnijas biezums ar bultiņu un klausuli. */
function Chevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

/**
 * Galvene.
 *
 * Fons un apakšlīnija parādās tikai pēc 40 px ritināšanas - virs hero attēla
 * josla ar fonu nogriež kadru, un Direction galva ir daļa no attēla, ne josla
 * virs tā. Fons ir 90% grafīts BEZ backdrop-blur: galvene ar savu blur kļūtu
 * par vecāku stikla tabletēm un Pakalpojumu panelim, un ligzdots
 * backdrop-filter Chrome zīmē kā plakanu laukumu (sk. .stikls-blur
 * src/index.css). Blur te nes tabletes, ne josla.
 *
 * "Pakalpojumi" ir īsts atklājamais bloks ar četrām saitēm, nevis saite uz
 * lapu, kuras nav. Bez tā četri pakalpojumi navigācijā aizņemtu pusi joslas.
 *
 * STIKLS (2026-09-08). Hover uz saites ir matēta stikla tablete ap tekstu
 * (sk. .stikls src/index.css), un tā pati tablete paliek uz pašreizējās
 * lapas saites (aria-current caur .stikls-aktivs). Sākumā aktīvajai lapai bija
 * pasvītrojums, un tablete tikai hover; Gatis dzīvajā redzēja abus blakus un
 * izvēlējās vienu virsmu: tablete, kas STĀV, ir lapa, kurā esi, tablete, kas
 * SEKO kursoram, ir lapa, uz kuru vari aiziet. Atšķirība ir uzvedībā, ne
 * formā, un tas ir mazāk vizuālu ideju vienā joslā.
 * Pakalpojumu saraksts ir stikla panelis, un tā rindas uz hover kļūst par
 * tableti ar bultiņu. Mobilā izvēlne ir rindu saraksts ar chevroniem, kur
 * pašreizējā lapa ir stikla kartīte, un apakšā ir zvana poga: telefonā izvēlne
 * ir īsākais ceļš līdz zvanam, un tur to arī meklē.
 */
export default function Header() {
  const { t, path } = useLocale();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  // Fons pēc 40 px. Pasīvs klausītājs, bez izkārtojuma mērījumiem render laikā.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Atvērta mobilā izvēlne aptur arī Lenis, ne tikai body overflow - citādi
  // ritināšanas inerce noplūst zem pārklājuma.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      getLenis()?.stop();
    } else {
      document.body.style.overflow = "";
      getLenis()?.start();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen && !servicesOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (mobileOpen) {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
      setServicesOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mobileOpen, servicesOpen]);

  // Tablete: 44 px augsta, 1 rem iekšējā atkāpe, hover = stikls. Krāsu pāreju
  // dod .stikls, tāpēc te nav transition-colors - divas pārejas uz vienas
  // īpašības viena otru pārrakstītu.
  const tablete = "stikls stikls-blur stikls-aktivs relative inline-flex min-h-[44px] items-center rounded-full px-4 text-[16px] font-medium";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(tablete, "active:text-amber", isActive ? "text-paper" : "text-paper-2 hover:text-paper");

  // Mobilā rinda. Pašreizējā lapa ir stikla kartīte (aria-current), ne cita
  // krāsa: kartīte ir tas pats žests, kas darbvirsmā hover, un tā lasās arī
  // tad, ja cilvēks krāsas neatšķir. Kartīte ir par 16 px platāka nekā
  // dalītājlīnijas (-mx-4) - tā stāv VIRS saraksta, ne tajā.
  // Pakalpojumu rindas ir ievilktas zem "Pakalpojumi": tā saraksts pasaka, ka
  // četras ir vienas sadaļas daļas, ne četras vienādas lapas blakus Darbiem.
  const mobileLinkClass =
    (sub: boolean) =>
    ({ isActive }: { isActive: boolean }) =>
      cn(
        // Uz īsiem ekrāniem (iPhone SE: 667 px) rindas ir 52 px, ne 60: astoņas
        // rindas plus zvans citādi neietilpst, un zvans paliek zem malas.
        "stikls stikls-aktivs -mx-4 my-1.5 flex min-h-[60px] items-center justify-between gap-4 rounded-[16px] px-4 text-paper active:text-amber [@media(max-height:700px)]:my-1 [@media(max-height:700px)]:min-h-[52px]",
        sub ? "ps-9 text-[clamp(1.05rem,4.2vw,1.25rem)] [@media(max-height:700px)]:min-h-[46px]" : "text-[clamp(1.25rem,5vw,1.5rem)]",
        !isActive && "hover:text-amber",
      );

  const mobileRows: { key: RouteKey; label: string; sub?: boolean }[] = [
    { key: "portfolio", label: t.nav.portfolio },
    { key: "services", label: t.nav.services },
    ...SERVICE_KEYS.map((key) => ({ key, label: t.services[SERVICE_LABEL[key as keyof typeof SERVICE_LABEL]], sub: true })),
    { key: "about", label: t.nav.about },
    { key: "contact", label: t.nav.contact },
  ];

  // 44 px klikšķa lauks ap zīmi. Pilsēta blakus vārdam nestāv: tā ir kājenē
  // un strukturētajos datos, un galvenē tā tikai atkārtoja to pašu.
  const wordmark = (
    <Link
      to={path("home")}
      className="inline-flex min-h-[44px] shrink-0 items-center leading-none transition-colors duration-300 active:text-amber"
    >
      {/*
        Horizontālais logo ietver arī vārdzīmi, tāpēc blakus vairs nav atsevišķa
        teksta - ar to ekrānlasītājs saiti nolasītu divreiz. `alt` te NAV tukšs
        tieši tāpēc: vārds tagad ir attēla iekšienē, un bez tā saitei nebūtu
        nosaukuma vispār.

        Augstums 56 px telefonā un 72 px darbvirsmā. Skaitlis izvēlēts pēc
        lauvas, ne pēc visa bloka: zīmē lauva aizņem 83% no augstuma, tāpēc pie
        72 px tā ir 60 px - tas pats, ko iepriekš deva atsevišķā 64 px zīme.

        SVG ir pārvērsts līknēs. Illustrator eksportēja vārdzīmi kā dzīvu tekstu
        fontā Core Sans D 77 Cn Black; apmeklētāja pārlūkā tāda fonta nav, un tas
        to aizvietotu ar noklusējuma - cita platuma, cita svara, bez slīpuma.
        Pārbaudīts pret oriģinālu, renderējot abus 2800 px platumā: katrs burts
        savā vietā ar 0-1 px atšķirību, pārējais ir malu izlīdzināšana.
      */}
      <img
        src="/media/gd-logo-horizontal.svg"
        alt="Gatis Design"
        width="231"
        height="72"
        className="h-14 w-auto shrink-0 md:h-[72px]"
      />
    </Link>
  );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ease-dir",
          scrolled ? "border-b border-line bg-ink-900/90" : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-[var(--galvene)] w-full max-w-wrap items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
          {wordmark}

          {/* -mr-4: tabletes iekšējā atkāpe ir 1 rem, un bez tā "Kontakti"
              teksts stāvētu 16 px tālāk no lapas malas nekā logo no kreisās. */}
          <nav aria-label={t.nav.services} className="-mr-4 hidden items-center gap-1 lg:flex">
            <NavLink to={path("portfolio")} className={linkClass}>
              {t.nav.portfolio}
            </NavLink>

            <div ref={servicesRef} className="relative">
              {/* Saite, ne poga: bez JS <button> neko nedarīja. Ar JS klikšķis
                  atver sarakstu (preventDefault), bez JS tas aizved uz visu
                  pakalpojumu lapu /pakalpojumi (2026-09-08; agrāk uz pirmo
                  pakalpojumu, jo kopējās lapas nebija). */}
              <a
                href={path("services")}
                aria-expanded={servicesOpen}
                aria-controls={panelId}
                onClick={(e) => {
                  e.preventDefault();
                  setServicesOpen((v) => !v);
                }}
                // Saite ar aria-expanded uzvedas kā poga, bet atstarpes taustiņš
                // saitei neko nedara - to jāpieliek ar roku, citādi ar tastatūru
                // sarakstu var atvērt tikai ar Enter.
                onKeyDown={(e) => {
                  if (e.key !== " ") return;
                  e.preventDefault();
                  setServicesOpen((v) => !v);
                }}
                className={cn(
                  tablete,
                  "cursor-pointer gap-1.5 active:text-amber",
                  // Saite, ne NavLink, tāpēc aria-current tai nav - aktīvo
                  // stiklu ieslēdz klase, ja atvērta kāda no četrām lapām.
                  [...SERVICE_KEYS, "services" as RouteKey].some((k) => pathname === path(k))
                    ? "stikls-on text-paper"
                    : "text-paper-2 hover:text-paper",
                )}
              >
                {t.nav.services}
                {/* Stāvokli nes aria-expanded; bultiņa ir tā paša stāvokļa
                    redzamā puse, tāpēc aria-hidden - citādi ekrāna lasītājs
                    pieteiktu to pašu divreiz. */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "shrink-0 transition-transform duration-300 ease-dir motion-reduce:transition-none",
                    servicesOpen && "rotate-180",
                  )}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </a>
              {servicesOpen ? (
                <div
                  id={panelId}
                  className="stikls-panelis izvelne-in absolute right-0 top-[calc(100%+12px)] z-10 w-[340px] rounded-[20px] p-2.5"
                >
                  <ul className="flex flex-col gap-0.5">
                    {SERVICE_KEYS.map((key) => (
                      <li key={key}>
                        <NavLink
                          to={path(key)}
                          className={({ isActive }) =>
                            cn(
                              "stikls group flex min-h-[54px] items-center justify-between gap-4 rounded-[14px] px-4 text-[16px]",
                              isActive ? "text-paper" : "text-paper-2 hover:text-paper",
                            )
                          }
                        >
                          <span>{t.services[SERVICE_LABEL[key as keyof typeof SERVICE_LABEL]]}</span>
                          {/* Bultiņa ienāk kopā ar tableti: no kreisās 4 px un
                              no caurspīdīga. Rindā, uz kuras kursora nav, tās
                              nav vispār - četras bultiņas vienā sarakstā būtu
                              četri "spied šeit" bez adresāta. */}
                          <span
                            aria-hidden="true"
                            className="inline-flex shrink-0 -translate-x-1 opacity-0 transition-[opacity,transform] duration-300 ease-dir group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="17"
                              height="17"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14" />
                              <path d="m13 6 6 6-6 6" />
                            </svg>
                          </span>
                        </NavLink>
                      </li>
                    ))}
                    {/* Visu pakalpojumu lapa kā pēdējā rinda ar līniju virs tās:
                        četras ir izvēles, piektā ir pārskats. */}
                    <li className="mt-1 border-t border-line pt-1">
                      <NavLink
                        to={path("services")}
                        className={({ isActive }) =>
                          cn(
                            "stikls group flex min-h-[54px] items-center justify-between gap-4 rounded-[14px] px-4 text-[16px]",
                            isActive ? "text-paper" : "text-paper-2 hover:text-paper",
                          )
                        }
                      >
                        <span>{t.nav.allServices}</span>
                        <span
                          aria-hidden="true"
                          className="inline-flex shrink-0 -translate-x-1 opacity-0 transition-[opacity,transform] duration-300 ease-dir group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                        >
                          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="m13 6 6 6-6 6" />
                          </svg>
                        </span>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              ) : null}
            </div>

            <NavLink to={path("about")} className={linkClass}>
              {t.nav.about}
            </NavLink>
            <NavLink
              to={path("contact")}
              className={cn(tablete, "text-amber")}
            >
              {t.nav.contact}
            </NavLink>
            <LanguageSwitch />
          </nav>

          {/* Atvērtā stāvoklī poga ir stikla kvadrāts ar krustiņu - tas pats
              stikls, kas izvēlnes rindām, tāpēc krustiņš izskatās pēc izvēlnes
              daļas, ne pēc svešķermeņa virs tās. */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            className={cn(
              "stikls -mr-2 inline-flex h-[46px] w-[46px] items-center justify-center rounded-[12px] text-paper hover:text-amber lg:hidden",
              mobileOpen && "stikls-on",
            )}
          >
            <span className="sr-only">{mobileOpen ? t.nav.closeMenu : t.nav.openMenu}</span>
            <span aria-hidden="true" className="flex w-7 flex-col gap-[6px]">
              <span
                className={cn(
                  "h-px w-full bg-current transition-transform duration-300 ease-dir",
                  mobileOpen && "translate-y-[7px] rotate-45",
                )}
              />
              <span className={cn("h-px w-full bg-current transition-opacity duration-200", mobileOpen && "opacity-0")} />
              <span
                className={cn(
                  "h-px w-full bg-current transition-transform duration-300 ease-dir",
                  mobileOpen && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div
          id={menuId}
          // z-160: virs peldošajām pogām (WhatsApp un "uz augšu" ir z-150).
          // Citādi abas stāv izvēlnes apakšējā kreisajā stūrī tieši uz zvana
          // pogas - ekrānuzņēmumā tur bija divas zaļas ripas viena uz otras.
          // Apakšmala ir sīkdatņu joslas augstums (--bottom-bar; josla ir
          // z-200 un paliek redzama arī ar atvērtu izvēlni), lai tā neaizsegtu
          // ne pēdējo rindu, ne zvanu.
          className="fixed inset-x-0 top-[var(--galvene)] z-[160] flex flex-col overflow-hidden bg-ink-900 lg:hidden"
          style={{ bottom: "var(--bottom-bar, 0px)" }}
        >
          {/* Ritinās SARAKSTS, ne visa izvēlne: zvans apakšā ir piesprausts un
              redzams vienmēr. Kad viss panelis ritinājās kopā, īsā skatā zvans
              bija pusē nogriezts zem malas - un tieši tā poga, kuras dēļ
              izvēlni telefonā atver. */}
          <nav aria-label={t.nav.services} className="min-h-0 flex-1 overflow-y-auto px-5 pt-3 sm:px-8">
            <ul className="divide-y divide-line">
              {mobileRows.map((row) => (
                <li key={row.key}>
                  <NavLink to={path(row.key)} className={mobileLinkClass(Boolean(row.sub))}>
                    <span>{row.label}</span>
                    <Chevron className="shrink-0 text-paper-dim" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          {/* Zvans apakšā, ne augšā: īkšķis telefonā ir apakšā. Bloks ir
              ārpus ritināmā saraksta, tāpēc tas ir redzams arī tad, kad
              saraksts ir garāks par ekrānu. */}
          <div className="flex shrink-0 items-center justify-between gap-6 border-t border-line px-5 pb-8 pt-6 sm:px-8 [@media(max-height:700px)]:pb-5 [@media(max-height:700px)]:pt-4">
            <a
              href={PHONE.href}
              className="group inline-flex min-h-[44px] items-center gap-4 text-[16px] text-paper-dim transition-colors duration-300 hover:text-paper active:text-paper"
            >
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-amber text-on-amber transition-colors duration-300 group-hover:bg-amber-soft group-active:bg-amber-soft [@media(max-height:700px)]:h-14 [@media(max-height:700px)]:w-14">
                {/* Tā pati klausule, kas WhatsApp pogai - viena zīme vienai darbībai. */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {t.nav.call}
            </a>
            <LanguageSwitch />
          </div>
        </div>
      ) : null}
    </>
  );
}

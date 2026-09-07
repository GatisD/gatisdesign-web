/**
 * Hero fona grafika: punktu režģis, nospiedumteksts un punktētas līnijas.
 *
 * Kāpēc tieši šeit: hero saturs ir līdzināts pie apakšas, un augšējā puse bija
 * tukšs, aptumšots fotoattēls. Tas bija lielākais "tukšuma" avots visā lapā.
 *
 * Trīs slāņi, katrs ar savu uzdevumu un katrs klusāks par nākamo:
 *  - punktu režģis dod tehniskā rasējuma faktūru, un maska to nodzēš tur, kur
 *    sākas teksts, lai zem burtiem nebūtu raibuma;
 *  - nospiedumteksts ir KONTŪRA, ne pildījums: uz fotoattēla pildīts burts
 *    kļūtu par dūņām, kontūra paliek lasāma kā rasējums;
 *  - punktētās līnijas ar mezgliem galos savieno tukšo augšu ar virsrakstu.
 *
 * Viss ir statisks ar nolūku. Hero jau kustas divās vietās - fotoattēls lēnām
 * dreifē un virsraksts nāk pa rindām. Trešā kustība te būtu troksnis, ne dzīvība.
 *
 * `aria-hidden` un `pointer-events-none`: te nav ne satura, ne mērķa.
 */
export default function HeroGrafika() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[1] overflow-hidden">
      <div className="hero-punkti absolute inset-0" />

      {/* Nospiedumteksts sēž augšā, kur saturs nesniedzas. Telefonā to nerāda:
          šaurā ekrānā tas nokļūtu zem virsraksta un lasītos kā kļūda. */}
      <span className="hero-nospiedums absolute start-[-2%] top-[6%] hidden select-none whitespace-nowrap font-bold uppercase leading-[0.82] tracking-[-0.03em] sm:block">
        Gatis Design
      </span>

      {/* Punktētās līnijas ar mezgliem galos. `vector-effect` tur līnijas
          biezumu vienādu neatkarīgi no tā, cik plati izstiepjas viewBox. */}
      <svg
        className="absolute inset-0 h-full w-full text-amber opacity-[0.38]"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-20 130 C 280 60, 620 250, 1460 96"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="5 9"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M-20 470 C 420 300, 900 520, 1460 330"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="5 9"
          vectorEffect="non-scaling-stroke"
        />
        <rect x="236" y="96" width="7" height="7" fill="currentColor" />
        <rect x="1104" y="126" width="7" height="7" fill="currentColor" />
        <rect x="628" y="424" width="7" height="7" fill="currentColor" />
      </svg>
    </div>
  );
}

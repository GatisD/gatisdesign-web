/**
 * Hero fona grafika: punktu režģis un nospiedumteksts.
 *
 * Kāpēc tieši šeit: hero saturs ir līdzināts pie apakšas, un augšējā puse bija
 * tukšs, aptumšots fotoattēls. Tas bija lielākais "tukšuma" avots visā lapā.
 *
 * Divi slāņi, katrs ar savu uzdevumu un katrs klusāks par nākamo:
 *  - punktu režģis dod tehniskā rasējuma faktūru, un maska to nodzēš tur, kur
 *    sākas teksts, lai zem burtiem nebūtu raibuma;
 *  - nospiedumteksts ir KONTŪRA, ne pildījums: uz fotoattēla pildīts burts
 *    kļūtu par dūņām, kontūra paliek lasāma kā rasējums.
 *
 * Trešais slānis - punktētas oranžas līnijas ar mezgliem - te bija un ir izņemts:
 * uz fotoattēla tās lasījās kā rasējuma atlieka, ne kā akcents.
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

    </div>
  );
}

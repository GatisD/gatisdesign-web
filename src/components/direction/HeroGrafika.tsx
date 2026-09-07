import CiparuLietus from "@/components/direction/CiparuLietus";

/**
 * Hero fona grafika: ciparu lietus un nospiedumteksts.
 *
 * Kāpēc tieši šeit: hero saturs ir līdzināts pie apakšas, un augšējā puse bija
 * tukšs, aptumšots fotoattēls. Tas bija lielākais "tukšuma" avots visā lapā.
 *
 * Divi slāņi, katrs ar savu uzdevumu un katrs klusāks par nākamo:
 *  - ciparu lietus dod kustību un faktūru, un maska to nodzēš tur, kur sākas
 *    teksts, lai zem burtiem nebūtu raibuma;
 *  - nospiedumteksts ir KONTŪRA, ne pildījums: uz fotoattēla pildīts burts
 *    kļūtu par dūņām, kontūra paliek lasāma kā rasējums.
 *
 * Trešais slānis - punktētas oranžas līnijas ar mezgliem - te bija un ir izņemts:
 * uz fotoattēla tās lasījās kā rasējuma atlieka, ne kā akcents.
 *
 * Kustība te ir apzināti klusa. Hero jau kustas divās vietās - fotoattēls lēnām
 * dreifē un virsraksts nāk pa rindām - tāpēc trešā kustība nedrīkst sacensties
 * ne ar vienu no tām. Cipari ir 7-20% caurspīdīgi un 16 kadri sekundē; tie ir
 * jūtami perifērijā, bet neaicina tiem skatīties.
 *
 * `aria-hidden` un `pointer-events-none`: te nav ne satura, ne mērķa.
 */
export default function HeroGrafika() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[1] overflow-hidden">
      <CiparuLietus />

      {/* Nospiedumteksts sēž augšā, kur saturs nesniedzas. Telefonā to nerāda:
          šaurā ekrānā tas nokļūtu zem virsraksta un lasītos kā kļūda. */}
      <span className="hero-nospiedums absolute start-[-2%] top-[6%] hidden select-none whitespace-nowrap font-bold uppercase leading-[0.82] tracking-[-0.03em] sm:block">
        Gatis Design
      </span>

    </div>
  );
}

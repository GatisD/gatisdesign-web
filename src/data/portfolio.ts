/**
 * Kolekciju galerijas: faili, alt teksti un paraksti.
 *
 * Alt teksts katram attēlam ir rakstīts pēc satura - kas tajā kadrā tiešām ir.
 * Iepriekš tas tika ģenerēts kā "Logo kolekcija - 7. attēls no 51", kas ekrāna
 * lasītājam nepasaka neko un meklētājam - vēl mazāk.
 *
 * Paraksts (`caption`) ir TIKAI tur, kur teksts nāk no Gata paša publicētā
 * ieraksta Instagram vai Facebook. Nekas netiek izdomāts klāt: ja avota nav,
 * lauka nav, un lapā paraksta vietā nav nekā.
 *
 * Attēlu ceļš: /portfolio/<slug>/<file>.jpg, blakus tāds pats .webp
 * (scripts/convert-webp.mjs). Režģa kolekcijām papildus ir -640 varianti
 * (scripts/gallery-thumbs.mjs).
 */

/** Kā galerija izkārtojas lapā. */
export type GalleryLayout =
  /** Platas rindas, pirmais katrā ceturtniekā - pilnā platumā. Zīmola grāmatām. */
  | "feature"
  /** Vienādi kvadrāti 2-5 kolonnās. Kolekcijām, kur katrs kadrs ir viens darbs. */
  | "grid";

export interface GalleryImage {
  /** Faila nosaukums bez mapes un paplašinājuma. */
  file: string;
  /** Alt teksts pēc attēla satura. */
  alt: string;
  /** Paraksts no Gata paša ieraksta. Nav klāt, ja avota teksta nav. */
  caption?: string;
}

export interface PortfolioWork {
  /** Slug - sasaiste ar ierakstu src/content/projects.raw.json. */
  slug: string;
  /**
   * Kolekcijas vāks ir GALERIJAS ORIĢINĀLS, ne iepriekš apgriezts kadrs.
   * Automātiskais kvadrātveida griezums (sharp `position: attention`) nogrieza
   * tieši to, kas kartei dod jēgu: "APMEKLĒ.LV" kļuva par "APMEK". Kadrējumu
   * izlemj karte pēc proporcijas (ProjectCard `fits`), un nekas netiek
   * iegriezts failā uz visiem laikiem.
   */
  cover: string;
  layout: GalleryLayout;
  /** Visi galerijas attēli parādīšanas secībā. */
  gallery: GalleryImage[];
}

/** Pilns ceļš zem /public galerijas attēlam. */
export const galleryPath = (slug: string, file: string) => `/portfolio/${slug}/${file}.jpg`;

export const portfolioWorks: PortfolioWork[] = [
  {
    slug: "box-latvia",
    cover: "/portfolio/box-latvia/box-latvia-01.jpg",
    layout: "feature",
    gallery: [
      { file: "box-latvia-01", alt: "Box Latvia logotips ar saukli „Mēs izdarīsim”, iespiests baltā papīrā" },
      { file: "box-latvia-02", alt: "Box Latvia veidlapa ar logotipu un ūdenszīmi uz oranži brūna fona" },
      { file: "box-latvia-03", alt: "Divas Box Latvia vizītkartes: viena ar logotipu, otra ar kontaktinformāciju" },
      { file: "box-latvia-04", alt: "Divas Box Latvia aploksnes ar oranžu joslu un logotipu" },
      { file: "box-latvia-05", alt: "Box Latvia buklets ar piegādes fotogrāfiju un kartona tūbu" },
      { file: "box-latvia-06", alt: "Oranža Box Latvia mape ar baltu logotipu" },
      { file: "box-latvia-07", alt: "Atvērta Box Latvia prezentācijas mape ar ģeometrisku oranžu rakstu" },
      { file: "box-latvia-08", alt: "Balts Box Latvia piegādes furgons ar logotipu un oranžu ģeometrisku apdruku" },
      { file: "box-latvia-09", alt: "Divas Box Latvia pildspalvas, oranža un balta, ar iespiestu logotipu" },
      { file: "box-latvia-10", alt: "Kartona sūtījuma kaste ar Box Latvia marķējumu" },
      { file: "box-latvia-11", alt: "Pilns Box Latvia kancelejas komplekts: veidlapa, aploksne, mape un vizītkartes" },
      { file: "box-latvia-12", alt: "Box Latvia logotips ar oranžu kastes zīmi un saukli „Mēs izdarīsim” uz tumša fona", caption: "Logotips augošam Latvijas uzņēmumam." },
    ],
  },
  {
    slug: "apmekle",
    cover: "/portfolio/apmekle/apmekle-01.jpg",
    layout: "feature",
    gallery: [
      { file: "apmekle-01", alt: "Apmeklē.lv vizuālās identitātes rokasgrāmatas vāks ar logotipu uz tumši zaļa fona" },
      { file: "apmekle-02", alt: "Zīmola grāmatas satura rādītājs ar sadaļām no logotipa līdz krāsām" },
      { file: "apmekle-03", alt: "Zīmola grāmatas lapa „Par uzņēmumu” ar Apmeklē.lv aprakstu" },
      { file: "apmekle-04", alt: "Zīmola grāmatas lapa ar Apmeklē.lv pamata logotipu" },
      { file: "apmekle-05", alt: "Logotipa variācijas: vertikālā, horizontālā un tumšā fona versija" },
      { file: "apmekle-06", alt: "Logotipa lietojuma lapa ar aizsargzonu un minimālo izmēru" },
      { file: "apmekle-07", alt: "Zīmola krāsu lapa: zaļā, tumši zaļā un baltā krāsa ar kodiem" },
      { file: "apmekle-08", alt: "Alternatīvā logotipa konstrukcija un lietojums uz melna, pelēka un fotogrāfijas fona" },
      { file: "apmekle-09", alt: "Logotipa versija ar ejoša cilvēka zīmi un tās lietojums uz melna, zaļa un fotogrāfijas fona" },
    ],
  },
  {
    slug: "digitalaisdzintars",
    cover: "/portfolio/digitalaisdzintars/digitalaisdzintars-01.jpg",
    layout: "feature",
    gallery: [
      { file: "digitalaisdzintars-01", alt: "Digitālā Dzintara stila grāmatas vāks ar logotipu uz tumša fona" },
      { file: "digitalaisdzintars-02", alt: "Stila grāmatas satura rādītājs un ievada lapa" },
      { file: "digitalaisdzintars-03", alt: "Sadaļas „Logotips” šķirlapa un logotipa konstrukcija no trim elementiem" },
      { file: "digitalaisdzintars-04", alt: "Logotipa versijas un krāsu varianti uz gaiša un tumša fona" },
      { file: "digitalaisdzintars-05", alt: "Logotipa aizsargzona un lietojuma piemēri uz dažādiem fona veidiem" },
      { file: "digitalaisdzintars-06", alt: "Koncerta afišas piemērs un sadaļas „Burtveidols” šķirlapa" },
      { file: "digitalaisdzintars-07", alt: "Burtveidolu lapas ar Museo Sans un Myriad Pro burtu paraugiem" },
      { file: "digitalaisdzintars-08", alt: "Sadaļas „Grafiskie elementi” šķirlapa ar līniju rakstu" },
      { file: "digitalaisdzintars-09", alt: "Sadaļas „Krāsas” šķirlapa un zīmola krāsu palete ar kodiem" },
      { file: "digitalaisdzintars-10", alt: "Sadaļas „Korporatīvie materiāli” šķirlapa un dokumentu veidņu shēma" },
      { file: "digitalaisdzintars-11", alt: "Prezentācijas slaidu veidnes ar tumšu fonu un oranžu akcentu" },
      { file: "digitalaisdzintars-12", alt: "Noteikumi slaidu fonam un teksta slāņiem, ar piemēriem" },
      { file: "digitalaisdzintars-13", alt: "Sadaļas „Vizuālie materiāli” šķirlapa un āra reklāmas piemēri" },
      { file: "digitalaisdzintars-14", alt: "Koncertu afišu un bukletu maketi" },
      { file: "digitalaisdzintars-15", alt: "Afišu tipogrāfijas un krāsu kontrastu piemēri" },
      { file: "digitalaisdzintars-16", alt: "Drukāto materiālu kopskats ar afišām un bukletiem" },
    ],
  },
  {
    // Zīmes, kas parādītas materiālā - foliju, gravējumā, izšuvumā, apdrukā.
    // Kadri ir vizualizācijas, ne fotogrāfijas no ražotnes: mokaps parāda zīmi
    // uz materiāla, un tā ir sena prezentācijas forma, bet apgalvot, ka tieši
    // šī vizītkarte tika iespiesta, nedrīkst. Tāpēc paraksti apraksta ZĪMI un
    // materiālu, nevis stāsta par pasūtījumu vai tirāžu.
    slug: "zimolu-zimes",
    cover: "/portfolio/zimolu-zimes/zimolu-zimes-01.jpg",
    layout: "grid",
    gallery: [
      { file: "zimolu-zimes-01", alt: "PAXMONT skrūves zīme vara folijā uz melnas kokvilnas vizītkartes" },
      { file: "zimolu-zimes-02", alt: "Akmens1.lv zīme un uzraksts, iegravēts slīpētā tumšā granītā" },
      { file: "zimolu-zimes-03", alt: "adamo.lv zīme izgaismotā akrilā uz tumšas mikrocementa sienas" },
      { file: "zimolu-zimes-04", alt: "Guesthouse Vētras zīme, izdedzināta ozola atslēgu piekariņā" },
      { file: "zimolu-zimes-05", alt: "Runar apaļā zīme ar rūnu kompasu, misiņā uz apdedzināta koka sienas" },
      { file: "zimolu-zimes-06", alt: "Vāverkaķa zīme kā izšūts ielāps uz ādas virsmas" },
      { file: "zimolu-zimes-07", alt: "Wavy Slats zīme uz rievotas koka latu sienas" },
      { file: "zimolu-zimes-08", alt: "Metic zīme zeltā, kodināta tumšā metāla virsmā" },
      { file: "zimolu-zimes-09", alt: "Bomis zīme tēraudā, piestiprināta pie stikla starpsienas" },
      { file: "zimolu-zimes-10", alt: "Gtech.es Green Energy zīme uz zaļa linu grāmatas vāka" },
      { file: "zimolu-zimes-11", alt: "ModuleList zīme, gravēta misiņa birkā uz ādas auklas" },
      { file: "zimolu-zimes-12", alt: "No Bērza zīme uz tumša stikla pudeles ar ādas birku" },
      { file: "zimolu-zimes-13", alt: "Party Box zīme hologrāfiskā folijā uz melnas dāvanu kastes" },
      { file: "zimolu-zimes-14", alt: "Bonova zīme, aklā iespiedumā rokas papīrā ar plēstu malu" },
      { file: "zimolu-zimes-15", alt: "LTECH zīme, iespiesta melnā anodēta alumīnija virsmā" },
      { file: "zimolu-zimes-16", alt: "MLM Cargo zīme uz vaskota audekla ar misiņa cilpu" },
      { file: "zimolu-zimes-17", alt: "Vita Bud produktu iepakojumi aptiekas plauktā" },
      { file: "zimolu-zimes-18", alt: "Vendings.lv aplīmēts tirdzniecības automāts biroja vestibilā" },
      { file: "zimolu-zimes-19", alt: "JurmalaEstate.lv zīme misiņa burtos uz rievotas riesta sienas reģistratūrā" },
      { file: "zimolu-zimes-20", alt: "Holidays House zīmola komplekts uz ozola galda: veidlapa, vizītkartes un aploksne" },
      { file: "zimolu-zimes-21", alt: "Darba Apģērbi zīme, izšūta uz augstas redzamības darba jakas" },
    ],
  },
  {
    slug: "logo-branding",
    cover: "/portfolio/logo-branding/logo-branding-01.jpg",
    layout: "grid",
    gallery: [
      { file: "logo-branding-01", alt: "LimeBit logotips trīs variantos: uz dzeltena, balta un pilsētas fotogrāfijas fona" },
      { file: "logo-branding-02", alt: "LimeBit logotips ar poligonālu burtu L uz dzeltena fona" },
      { file: "logo-branding-03", alt: "Film Editing Pro logotips uz oranža videoredaktora ekrāna" },
      { file: "logo-branding-04", alt: "Annatar Foto logotips un vizītkartes dzeltenā un pelēkā krāsā" },
      { file: "logo-branding-05", alt: "Vurchase logotips un vizītkartes uz dzeltena un tumši zila fona" },
      { file: "logo-branding-06", alt: "Vurchase vizītkartes tumši zilā un baltā krāsā ar bultas zīmi" },
      { file: "logo-branding-07", alt: "Crackle logotips zelta krāsā uz tumša fona" },
      { file: "logo-branding-08", alt: "Apaļš Alchemy Metalworks logotips ar āmuru un gadskaitli 2017" },
      { file: "logo-branding-09", alt: "Crackle zīmola komplekts: vizītkartes, mape, veidlapa un produkta fotogrāfija" },
      { file: "logo-branding-10", alt: "Street Legends rokraksta logotips uz balta un sarkana fona" },
      { file: "logo-branding-11", alt: "Masterpiece Initiative logotips ar sirds zīmēm" },
      { file: "logo-branding-12", alt: "Burta K logotips baltās kontūrlīnijās uz dzeltena fona" },
      { file: "logo-branding-13", alt: "Macros logotips zaļā rokrakstā ar lapu" },
      { file: "logo-branding-14", alt: "Balts burta V logotips, iespiests gaišā papīrā" },
      { file: "logo-branding-15", alt: "Zaļš kancelejas komplekts: mape, veidlapa, aploksne un vizītkartes" },
      { file: "logo-branding-16", alt: "neobeats logotips ar zaļu skaņas viļņa zīmi" },
      { file: "logo-branding-17", alt: "neobeats zīme uz fotogrāfijas ar meiteni austiņās" },
      { file: "logo-branding-18", alt: "Pillar Farms logotips trīs krāsu variantos ar auga zīmi" },
      { file: "logo-branding-19", alt: "Pillar Farms zaļā zīme uz lauka fotogrāfijas" },
      { file: "logo-branding-20", alt: "SellBroke logotips un vizītkartes dzeltenā, melnā un baltā krāsā" },
      { file: "logo-branding-21", alt: "SellBroke baltā zibens zīme uz nolietotas elektronikas fotogrāfijas", caption: "Zīmols uzņēmumam, kas pārstrādā vecu elektroniku." },
      { file: "logo-branding-22", alt: "Silver Substance vizītkartes ar monogrammu baltā un melnā krāsā" },
      { file: "logo-branding-23", alt: "Soetendonck Fine Wine logotips ar vīna glāzi uz rozā fona" },
      { file: "logo-branding-24", alt: "„Zīle” logotips ar ozolzīles kontūru uz tumša fona" },
      { file: "logo-branding-25", alt: "Melns logotips ar piekūnu izplestiem spārniem" },
      { file: "logo-branding-26", alt: "Melns logotips ar diviem sakrustotiem gaļas cirvjiem", caption: "Tērauda cirvja zīme ar smalki izstrādātām detaļām." },
      { file: "logo-branding-27", alt: "Lionfish Capital logotips ar zivs spuru līnijām uz tumši sarkana fona" },
      { file: "logo-branding-28", alt: "ASAP logotips ar poligonālu panteru uz tumši zila fona" },
      { file: "logo-branding-29", alt: "„Ontuars” monogramma aplī uz melna fona" },
      { file: "logo-branding-30", alt: "Film Editing Pro logotipa versijas, ikonas un lietojuma piemēri" },
      { file: "logo-branding-31", alt: "Prosharps logotips ar sakrustotiem nažiem sudraba aplī" },
      { file: "logo-branding-32", alt: "Work logotips ar laktu rombveida rāmī" },
      { file: "logo-branding-33", alt: "F Like Flower logotips ar lotosa ziedu" },
      { file: "logo-branding-34", alt: "Lone Wolf Therapy logotips ar vilka galvu un eglēm", caption: "Vilka logotips ar tīrām līnijām un rūpīgi izstrādātām detaļām." },
      { file: "logo-branding-35", alt: "Zila apļveida zīme ar plūstošām formām" },
      { file: "logo-branding-36", alt: "Zīme no palmu lapām un sakrustotiem zobeniem", caption: "Palmu un zobenu apvienojums; zīme nav izmantota." },
      { file: "logo-branding-37", alt: "Ranger vizītkartes tumši zilā un baltā krāsā ar zvaigznes zīmi" },
      { file: "logo-branding-38", alt: "Oranža un zila cilvēka figūra kustībā" },
      { file: "logo-branding-39", alt: "Phoenix Collection vizītkartes un logotips ar fēniksu" },
      { file: "logo-branding-40", alt: "Svītrota apļveida zīme zilos toņos uz tumša fona" },
      { file: "logo-branding-41", alt: "Zaļš ķeksis apļveida zīmē" },
      { file: "logo-branding-42", alt: "Poligonāls lapsas portrets ar lapotiem zariem" },
      { file: "logo-branding-43", alt: "Piper's Glen logotips ar māju siluetiem un lapām" },
      { file: "logo-branding-44", alt: "Coconuts Island Bar logotips un koka izkārtne ar kokosriekstu", caption: "Logotips bāram Naso, Bahamu salās." },
      { file: "logo-branding-45", alt: "arcade logotips ar roku pie spēļu pogas" },
      { file: "logo-branding-46", alt: "Iowa Dent Solutions vizītkartes uz sarkana fona" },
      { file: "logo-branding-47", alt: "Pelēka lapas zīme uz picas fotogrāfijas" },
      { file: "logo-branding-48", alt: "Rozā un zila cilvēka figūra kustībā" },
      { file: "logo-branding-49", alt: "Kaurat logotips zelta krāsā uz balta un tumša fona" },
      { file: "logo-branding-50", alt: "La Cour logotips gaiši zaļā krāsā, izkārtne un iespiedums papīrā" },
      { file: "logo-branding-51", alt: "Strategic Sales and Marketing logotips un vizītkartes" },
      { file: "logo-branding-52", alt: "Fybercom logotips ar bezvadu signāla zīmi, iespiests gaišā papīrā" },
      { file: "logo-branding-53", alt: "DJ Mr. Viva logotips ar austiņām un vinila plati" },
      { file: "logo-branding-54", alt: "Pandemonium Gaming Company logotips ar dūri, kas satver spēļu sviru" },
      { file: "logo-branding-55", alt: "Fourth Power vizītkartes rokā, logotips oranžā un melnā krāsā" },
      { file: "logo-branding-56", alt: "Koined logotips ar kroni sarkanā trīsstūrī uz balta papīra" },
      { file: "logo-branding-57", alt: "Doug Clark vizītkartes uz dzeltena fona ar melnu un dzeltenu zīmi" },
      { file: "logo-branding-58", alt: "Moonshine Drinkery logotips trīs variantos: uz balta, tumša un fotogrāfijas fona" },
      { file: "logo-branding-59", alt: "Ortodonta Mandeep Gosal logotips ar zilu putnu" },
      { file: "logo-branding-60", alt: "Discoverme Box logotips ar kasti un baloniem" },
      { file: "logo-branding-61", alt: "President Street uzraksts kontūrburtos uz brūna fona", caption: "Viens no konkursā uzvarējušajiem darbiem." },
      { file: "logo-branding-62", alt: "mann made productions logotips ar mikrofonu gaišā un tumšā variantā" },
      { file: "logo-branding-63", alt: "CanX kancelejas komplekts: mape, veidlapa, aploksne un vizītkartes", caption: "99designs konkursa uzvarētājdarbs." },
      { file: "logo-branding-64", alt: "Moovements Academy logotips un vizītkartes melnā, baltā un zelta krāsā" },
      { file: "logo-branding-65", alt: "Still River Software Company logotips ar oranžu lappuses zīmi", caption: "99designs konkursa uzvarētājdarbs." },
      { file: "logo-branding-66", alt: "Simple Pet Care logotips: suns tauriņā pavadas aplī", caption: "Logotips, kas palika neizmantots." },
      { file: "logo-branding-67", alt: "wacky n weird logotips ar rokrakstā zīmētiem oranžiem burtiem", caption: "Darba versija klientam." },
      { file: "logo-branding-68", alt: "CCS IT Solutions logotips ar zilu monogrammu uz tumši zila fona" },
      { file: "logo-branding-69", alt: "Logotips ar mērkaķa maskotu cepurē un ar cigāru", caption: "Darba versija, kas vēl jānoslīpē." },
      { file: "logo-branding-70", alt: "Burta V logotips ar zibens šķēlumu tirkīza krāsā uz tumšu debesu fona" },
    ],
  },
  {
    slug: "web-design",
    cover: "/portfolio/web-design/web-design-01.jpg",
    layout: "feature",
    gallery: [
      { file: "web-design-01", alt: "bitMedia sākumlapas makets ar kosmosa fotogrāfiju" },
      { file: "web-design-02", alt: "Oranžas mājaslapas makets ar produktu sadaļām un pieteikuma formu" },
      { file: "web-design-03", alt: "Sarkanbaltas mājaslapas makets ar lidmašīnas ilustrāciju" },
    ],
  },
  {
    slug: "illustrations",
    cover: "/portfolio/illustrations/illustrations-01.jpg",
    layout: "feature",
    gallery: [
      { file: "illustrations-01", alt: "Pelēks T krekls ar mandarīna ilustrāciju un vārdu spēli latviski" },
      { file: "illustrations-02", alt: "Melna auduma soma ar spoka ilustrāciju Helovīna sērijā" },
      { file: "illustrations-03", alt: "Pelēks džemperis ar izšūtu ilustrāciju uz oranža fona" },
      { file: "illustrations-04", alt: "Balta termokrūze ar lāča ilustrāciju Ziemassvētku sērijā" },
      { file: "illustrations-05", alt: "Tumšs džemperis ar kļavas lapas ilustrāciju rudens sērijā" },
      { file: "illustrations-06", alt: "Zīdaiņa bodijs ar brokoļu ilustrāciju un uzrakstu „Broccolicious”" },
      { file: "illustrations-07", alt: "Emaljēta krūze ar ķirbju pīrāga ilustrāciju Helovīna sērijā" },
      { file: "illustrations-08", alt: "Ilustrācija ar zemenes tēlu, kas ar kokteili sēž uz ledus gabala" },
    ],
  },
  {
    slug: "print",
    cover: "/portfolio/print/print-01.jpg",
    layout: "feature",
    gallery: [
      { file: "print-01", alt: "Garmin un Esto reklāmas lapa par maksājumu sešās daļās" },
      { file: "print-02", alt: "Garmin un Esto reklāmas lapa ar pulksteņiem uz tumša fona" },
      { file: "print-03", alt: "Digitālā Dzintara koncertu afiša ar mūziķa portretu" },
      { file: "print-04", alt: "Tritikāles bukleti uz zaļa fona Agroresursu un ekonomikas institūtam" },
      { file: "print-05", alt: "Garmin un Esto Black Friday reklāmas lapa ar zelta akcentiem" },
    ],
  },
  {
    slug: "varloz",
    cover: "/portfolio/varloz/varloz-01.jpg",
    layout: "feature",
    gallery: [
      { file: "varloz-01", alt: "Varloz vizītkartes uz zaļa fona ar olīvzaru un logotipu", caption: "Logotips tapis ciešā sadarbībā ar klientu - no idejas līdz izpildījumam." },
    ],
  },
];

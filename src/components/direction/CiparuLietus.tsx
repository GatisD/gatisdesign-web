import { useEffect, useRef } from "react";

/**
 * Ciparu lietus hero fonā - punktu režģa vietā.
 *
 * Atsauce bija Matrix stila ciparu plūsma, bet ar vienu skaidru norādi: DAUDZ
 * mazāk. Tāpēc te nav ne zaļās krāsas, ne blīvās sienas. Cipari ir papīra
 * krāsā ar 7-20% caurspīdīgumu, kolonnas stāv 30 px viena no otras, un aste ir
 * desmit rindas gara. Efekts ir jūtams kā kustība perifērijā; ja tam skatās
 * tieši virsū, tas ir tikko saskatāms. Tieši tas arī bija mērķis - fons, ne
 * priekšnesums.
 *
 * KRĀSA. Matrix zaļā šeit sadurtos ar visu pārējo: lapas akcents ir #1ED760,
 * un divas piesātinātas krāsas fonā cīnītos savā starpā. Cipari ir papīra
 * krāsā, un tikai kolonnas galva ik pa laikam iedegas akcenta krāsā.
 *
 * Akcenta reizinātājs ir 1,3, agrāk 2,1. Vecais oranžais bija TUMŠĀKS par
 * papīra krāsu un tam vajadzēja pastiprinājumu, lai vispār būtu manāms;
 * dzeltenais ir gandrīz tikpat gaišs kā papīrs, un ar 2,1 akcenta cipari
 * sāktu mirgot kā brīdinājums, ne kā fons.
 *
 * KĀPĒC CANVAS, NE DOM. Piecdesmit kolonnas reizes astoņas rindas ir 400
 * elementu, kas mainās katrā kadrā. DOM to izdarītu ar 400 stila pārrēķiniem;
 * canvas to uzzīmē vienā gājienā, bez izkārtojuma.
 *
 * HIDRATĀCIJA. Lapa tiek būvēta statiski, tāpēc serverī nedrīkst rasties nekas,
 * kas atšķirtos no pārlūka. `<canvas>` serverī ir tukšs elements bez satura, un
 * viss zīmējums notiek `useEffect` iekšienē, tas ir, tikai pārlūkā un tikai pēc
 * hidratācijas. `Math.random()` tāpēc te ir drošs - tas nekad nenostrādā
 * renderēšanas laikā.
 *
 * KUSTĪBA IENĀKOT. Pirmajā sekundē kolonnas ienāk no augšas ar nobīdi cita pret
 * citu, un kopējā caurspīdība ceļas no nulles. Bez tā lapa atvērtos ar jau
 * gatavu, nekustīgu ciparu sienu, un "ienākšanas" nebūtu - būtu tapete.
 *
 * CENA. Kadru ātrums ir ierobežots uz 16 fps, ne 60: fonam ar to pietiek, un
 * tas ir gandrīz četras reizes mazāk darba galvenajam pavedienam. Zīmēšana
 * apstājas, kad cilne nav redzama vai kad hero ir aizritināts prom.
 */

/** Ko zīmējam. Tikai cipari - burti fonā sāktu izskatīties pēc teksta. */
const ZIMES = "0123456789";

/** Kolonnu solis pikseļos. Tas pats ritms, kāds bija punktu režģim (30 px). */
const SOLIS = 30;
/** Rindas augstums pikseļos. */
const RINDA = 22;
/** Astes garums rindās. */
const ASTE = 10;
/** Kadru ilgums milisekundēs (16 fps). */
const KADRS = 62;

interface Kolonna {
  /** X pozīcija pikseļos. */
  x: number;
  /** Galvas pozīcija rindās. Daļskaitlis, lai kustība būtu gluda. */
  y: number;
  /** Rindas sekundē. */
  atrums: number;
  /** Kolonnas kopējais spilgtums. */
  spilgtums: number;
  /** Zīmes šajā kolonnā. */
  zimes: string[];
  /** Vai galva deg akcenta krāsā. */
  akcents: boolean;
}

function zime(): string {
  return ZIMES[(Math.random() * ZIMES.length) | 0];
}

export default function CiparuLietus() {
  const audekls = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = audekls.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const klusa = window.matchMedia("(prefers-reduced-motion: reduce)");

    let platums = 0;
    let augstums = 0;
    let rindas = 0;
    let kolonnas: Kolonna[] = [];
    let pieprasijums = 0;
    let pedejaisKadrs = 0;
    let sakums = 0;
    let redzams = true;

    /**
     * Cik tālu kolonnas krīt, pirms atgriežas augšā. Tas ir arī viss redzamais
     * dziļums: zemāk maska ciparus tāpat nodzēš (sk. `.hero-cipari`
     * src/index.css). Robeža ir svarīga ne tikai veiktspējai, bet blīvumam -
     * kamēr tā bija 72%, kolonna pusi cikla pavadīja neredzamajā daļā, un
     * pirmajās sekundēs ekrāns bija gandrīz tukšs.
     */
    const dzilums = () => Math.ceil((augstums * 0.62) / RINDA);

    function uzbuve() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas!.getBoundingClientRect();
      platums = Math.max(1, Math.round(r.width));
      augstums = Math.max(1, Math.round(r.height));
      canvas!.width = Math.round(platums * dpr);
      canvas!.height = Math.round(augstums * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.font = `${RINDA - 6}px "DM Mono", ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx!.textBaseline = "top";

      rindas = dzilums();
      const skaits = Math.max(6, Math.floor(platums / SOLIS));
      const atlikums = platums - (skaits - 1) * SOLIS;

      kolonnas = Array.from({ length: skaits }, (_, i) => ({
        x: atlikums / 2 + i * SOLIS,
        // Sākumā kolonnas ir IZKLĀTAS pa visu joslu, ne sarindotas virs tās.
        // Ienākšanu dod caurspīdības kāpums un ātruma grūdiens, ne tukšums:
        // ar visām kolonnām virs kadra pirmās divas sekundes lapa atvērās ar
        // tukšu fonu un cipari parādījās tikai vēlāk, pa vienam.
        y: Math.random() * (rindas + ASTE) - ASTE,
        atrums: 2.8 + Math.random() * 4,
        spilgtums: 0.35 + Math.random() * 0.65,
        zimes: Array.from({ length: rindas + ASTE + 2 }, zime),
        akcents: Math.random() < 0.16,
      }));
    }

    function zimet(tagad: number) {
      ctx!.clearRect(0, 0, platums, augstums);

      // Ienākšana: pirmajās 900 ms caurspīdība ceļas no nulles. Pēc tam
      // koeficients paliek 1 un vairs neko nemaina.
      const ienak = Math.min(1, (tagad - sakums) / 900);

      for (const k of kolonnas) {
        const galva = Math.floor(k.y);
        for (let i = 0; i < ASTE; i += 1) {
          const rinda = galva - i;
          if (rinda < 0 || rinda > rindas) continue;
          // Aste izdziest ar kvadrātu, ne lineāri: lineāra aste izskatās pēc
          // svītras, kvadrātiskā - pēc pēdas, kas paliek aiz kustības.
          const izdzisums = (1 - i / ASTE) ** 2;
          const alfa = 0.2 * k.spilgtums * izdzisums * ienak;
          if (alfa < 0.004) continue;
          const c = k.zimes[(rinda + ASTE) % k.zimes.length];
          ctx!.fillStyle =
            i === 0 && k.akcents ? `rgba(30, 215, 96, ${alfa * 1.3})` : `rgba(242, 242, 242, ${alfa})`;
          ctx!.fillText(c, k.x, rinda * RINDA);
        }
      }
    }

    function solis(k: { y: number; atrums: number; zimes: string[]; spilgtums: number; akcents: boolean }, delta: number) {
      k.y += k.atrums * delta;
      if (k.y - ASTE > rindas) {
        // Kolonna atgriežas augšā ar jaunām zīmēm un jaunu ātrumu, citādi pēc
        // pāris apļiem visas kolonnas saskaņotos vienā ritmā.
        k.y = -ASTE - Math.random() * 6;
        k.atrums = 2.8 + Math.random() * 4;
        k.spilgtums = 0.35 + Math.random() * 0.65;
        k.akcents = Math.random() < 0.16;
      }
      // Viena zīme kolonnā nomainās uz katru soli. Tā plūsma mirgo, bet
      // nemirgo visa uzreiz.
      k.zimes[(Math.random() * k.zimes.length) | 0] = zime();
    }

    function cikls(tagad: number) {
      pieprasijums = window.requestAnimationFrame(cikls);
      if (!redzams) return;
      const kops = tagad - pedejaisKadrs;
      if (kops < KADRS) return;
      pedejaisKadrs = tagad;
      const delta = Math.min(kops, 200) / 1000;
      // Ienākot plūsma ir ātrāka un 1,6 sekundēs nolīdzinās līdz normālai. Tas
      // ir viss, kas padara atvēršanu par notikumu: pati kustība jau ir, mainās
      // tikai tās steidzīgums.
      const grudiens = 1 + 1.4 * Math.max(0, 1 - (tagad - sakums) / 1600);
      for (const k of kolonnas) solis(k, delta * grudiens);
      zimet(tagad);
    }

    function statisks() {
      // Kam kustība traucē, tas redz to pašu faktūru mierā: kolonnas izklātas
      // pa augstumu, bez kustības un bez ienākšanas.
      for (let i = 0; i < kolonnas.length; i += 1) {
        kolonnas[i].y = (i * 3.7) % rindas;
      }
      sakums = -1000;
      zimet(0);
    }

    function sakt() {
      uzbuve();
      if (klusa.matches) {
        statisks();
        return;
      }
      sakums = performance.now();
      pedejaisKadrs = 0;
      pieprasijums = window.requestAnimationFrame(cikls);
    }

    function apturet() {
      if (pieprasijums) window.cancelAnimationFrame(pieprasijums);
      pieprasijums = 0;
    }

    // Izmēra maiņa pārbūvē režģi, bet ne biežāk kā reizi kadrā.
    let mainas = 0;
    const izmers = new ResizeObserver(() => {
      window.clearTimeout(mainas);
      mainas = window.setTimeout(() => {
        const kustas = pieprasijums !== 0;
        apturet();
        uzbuve();
        if (klusa.matches) statisks();
        else if (kustas) pieprasijums = window.requestAnimationFrame(cikls);
        else sakt();
      }, 180);
    });
    izmers.observe(canvas);

    // Aizritināts prom vai cilne fonā - nezīmējam neko. Fona animācija, kas
    // turpina strādāt neredzama, ir tikai akumulatora rēķins.
    const vero = new IntersectionObserver(
      (ieraksti) => {
        redzams = ieraksti.some((e) => e.isIntersecting);
      },
      { rootMargin: "100px" },
    );
    vero.observe(canvas);

    const cilne = () => {
      redzams = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", cilne);

    const rezims = () => {
      apturet();
      sakt();
    };
    klusa.addEventListener("change", rezims);

    sakt();

    return () => {
      apturet();
      window.clearTimeout(mainas);
      izmers.disconnect();
      vero.disconnect();
      document.removeEventListener("visibilitychange", cilne);
      klusa.removeEventListener("change", rezims);
    };
  }, []);

  return <canvas ref={audekls} aria-hidden="true" className="hero-cipari absolute inset-0 h-full w-full" />;
}

import { Link } from "react-router-dom";
import PicturePortfolio from "@/components/PicturePortfolio";
import Label from "@/components/ui/Label";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";

/**
 * Darba karte.
 *
 * Attēls ir vienīgā vieta lapā, kur `scale` uz hover ir saturs, ne triks:
 * ekrānuzņēmums pietuvojas, un kļūst redzams, ka aiz kartes ir īsta lapa.
 * Amplitūda apzināti maza (1,03), un tā notiek TIKAI tur, kur kursors reāli
 * eksistē (`@media (hover: hover)`): mobilajā hover nav, un transformācija tur
 * bija tikai kadru cena. Vienā kartē ir viens vizuāls notikums - attēls; agrāk
 * tam blakus gāja arī nosaukuma nobīde par 4 px, un tas bija trešais signāls
 * vienam un tam pašam klikšķim (hallmark m1). Nosaukumam palicis tikai krāsas
 * maiņa.
 *
 * `contrast(.96) saturate(.9)` tur 18 svešu zīmolu krāsas vienā reģistrā ar
 * grafīta lapu; hover tās atgriež pilnā spilgtumā.
 *
 * Bez iniciāļu avatāra: divi "L", divi "D", "1" un "8" apļos ir ģenerēts
 * dekors, ne klienta zīme (hallmark audits M2).
 */
export default function ProjectCard({
  project,
  eager = false,
  frame,
  frameRatio,
  devicePair = false,
}: {
  project: Project;
  eager?: boolean;
  /**
   * Kadra AUGSTUMS režģī, ne proporcija. Vienā rindā kartes ir dažāda platuma
   * (7+5, 4+4+4), un vienāda proporcija tad dod dažādu augstumu: karšu apakšas
   * nesakrīt, un tas lasās kā kļūda, ne kā ritms.
   */
  frame?: string;
  /**
   * Kadra proporcija (platums/augstums). Pēc tās tiek izlemts, vai attēls
   * kadru aizpilda vai ietilpst tajā - sk. komentāru pie `fits` zemāk.
   */
  frameRatio?: number;
  /**
   * Mājaslapu kartēm - telefona kadrs kartes stūrī. Rādīts tikai tur, kur tas ir
   * saturs, ne rota: portfolio režģī, kur cilvēks salīdzina darbus. Sākumlapas
   * izlasē kadrs paliek viens, jo tur kartes ir lielākas un mazais telefons
   * blakus lielajam ekrānam sāktu skaitīt pikseļus, ne darbus.
   */
  devicePair?: boolean;
}) {
  const { path } = useLocale();
  const { cover } = project;
  const meta = [project.role.label, project.year].filter(Boolean).join(" · ");

  /**
   * Aizpildīt kadru ir NOKLUSĒJUMS, ne izņēmums.
   *
   * Agrāk te bija pretēji: attēls aizpildīja kadru tikai tad, ja proporcijas
   * sakrita ar 18% pielaidi, citādi stāvēja joslās uz kartes fona. Tas bija
   * ķērpis, ne risinājums. Cēlonis bija kadros: 26 no 39 vākiem proporcija ir
   * tieši 1,600, bet kadru proporcijas bija 1,28 / 1,38 / 1,81 - neviena tuvu.
   * Rezultāts: 36 no 39 kartēm stāvēja joslās.
   *
   * Kadri tagad ir 1,58-1,60, tas ir, saskaņoti ar saturu, tāpēc griezums
   * lielākajai daļai ir nulle un pārējiem zem 12%. Joslas vairs nav vajadzīgas.
   */
  const phone = devicePair ? project.shot?.mobileSmall : undefined;

  /**
   * Pārlūka kadrs kartē NEKAD netiek griezts no malām. Tieši malās sēž tas, kas
   * kartei dod jēgu - klienta logotips pa kreisi un galvenā poga pa labi - un
   * `object-cover` tos nogrieza: Estire kartē no "ESTIRE" palika "TIRE" un no
   * "Beramkravu" palika "amkravu". Kartes kadra proporcija pie 1440 px ir ~1,28,
   * kadra proporcija ir 1,6, tāpēc pilns platums nozīmē šauras joslas augšā un
   * apakšā. Josla uz kartes fona ir godīgāka par pusi no lapas.
   */
  const isBrowserShot = project.shot?.desktop.src === cover.src;

  /**
   * Drošības tīkls, ne noklusējums. Ja kāds vēlāk pieliks portreta vāku (0,8)
   * platā kadrā, `object-cover` no tā nogrieztu pusi klusi. Slieksnis 1,9 ir
   * tur, kur griezums pārsniedz 47%: līdz turienei kompozīcija iztur, aiz tās
   * vairs ne. Kvadrātveida kolekciju vāki (1,0 pret 1,59) paliek zem sliekšņa
   * un aizpilda - pārbaudīts ar acīm: logotipu dēlim nogrieztā apakšējā daļa
   * bija tumšs fotoattēls, un bez tā vāks kļuva labāks, ne sliktāks.
   */
  const coverRatio = cover.width / cover.height;
  const parlieks = frameRatio ? Math.max(coverRatio / frameRatio, frameRatio / coverRatio) : 1;
  const fits = parlieks <= 1.9;

  /**
   * Kur turēt griezumu. Pārlūka kadram - pie augšas: tur ir izvēlne un
   * virsraksts, un apakšā parasti ir kājene, kas neko nepasaka. Visam
   * pārējam - pa vidu: zīmola dēļiem un mokapiem objekts ir centrā, un augšas
   * enkurs tiem nogrieztu tieši to, kas ir zemāk par vidu.
   */
  const enkurs = isBrowserShot ? "object-[top_center]" : "object-center";

  return (
    <Link
      to={`${path("portfolio")}/${project.slug}`}
      className="group flex h-full flex-col gap-[18px]"
    >
      {/* Divi ietvari, ne viens: ārējais tur telefonu, iekšējais griež datora
          kadru. Ja telefons stāv kadra `overflow-hidden` iekšienē, tas nosēžas
          uz attēla labās apakšas - tieši uz tās malas, kuras dēļ sānu griezums
          vispār tika atcelts. Tagad tas atbalstās pret kartes stūri no ārpuses. */}
      <span className="relative block">
      <span
        className={cn(
          "relative block w-full overflow-hidden rounded-card border border-line bg-ink-card",
          // Proporcija zem `md`, augstums no `md` uz augšu - sk. komentāru zemāk.
          "aspect-[var(--vaka-prop)]",
          frame ? "md:aspect-auto" : null,
          frame,
        )}
        /*
         * Kāpēc proporcija ir CSS mainīgajā, ne inline `aspectRatio`:
         *
         * Fiksētais augstums pastāv tāpēc, ka darbvirsmā vienā rindā stāv dažāda
         * platuma kartes (7+5, 4+4+4), un vienāda proporcija tur dotu nesakrītošas
         * apakšas. Telefonā rindā ir VIENA karte, tāpēc augstums tur neko
         * nesaskaņo - toties tas uzspieda kadram proporciju 1,85, kurā 1,41
         * platuma vāks tika nogriezts par ceturtdaļu (mērīts 390 px logā:
         * Digitālais Dzintars 76% redzams, Box Latvia 86%).
         *
         * Inline `aspectRatio` to nerisināja, bet salauza darbvirsmu: kad
         * augstums ir noteikts un platums nāk no režģa, `aspect-ratio` sāka
         * noteikt PLATUMU, un 7/12 kolonnas karte kļuva 621 px plata 790 px
         * vietā. Tāpēc proporcija ir klase, ko `md:aspect-auto` izslēdz.
         */
        style={{ ["--vaka-prop" as string]: `${cover.width} / ${cover.height}` }}
      >
        <PicturePortfolio
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          loading={eager ? "eager" : "lazy"}
          priority={eager ? "high" : "low"}
          decoding={eager ? "sync" : "async"}
          className={cn(
            "h-full w-full",
            fits ? `object-cover ${enkurs}` : "object-contain p-5 md:p-7",
            /* Melnbalts mierā, krāsains uz hover. Režģī tas notur uzmanību
               pie kompozīcijas, ne pie astoņpadsmit svešu zīmolu krāsām, kas
               vienā ekrānā cīnās savā starpā; krāsa atgriežas tieši tai kartei,
               uz kuras cilvēks skatās. Projekta LAPĀ iekšā vāks paliek
               krāsains vienmēr - tur darbs jau ir izvēlēts. */
            "[filter:grayscale(1)_contrast(.98)]",
            "transition-[transform,filter] duration-[700ms] ease-dir",
            "group-hover:[filter:grayscale(0)_contrast(1)]",
            "[@media(hover:hover)]:group-hover:scale-[1.03]",
          )}
        />

      </span>

        {/* Telefona kadrs kartes stūrī. `alt=""` - datora kadrs to pašu darbu jau
            ir nosaucis, un divas reizes viens nosaukums ir troksnis, ne
            informācija. Kadrs nepiedalās hover mērogā: kustība pieder lielajam
            attēlam. */}
        {phone ? (
          <PicturePortfolio
            src={phone.src}
            alt=""
            width={phone.width}
            height={phone.height}
            loading="lazy"
            priority="low"
            decoding="async"
            className="absolute -bottom-2 -end-2 hidden h-[46%] w-auto rounded-[7px] border border-line bg-ink-card object-cover object-top [box-shadow:var(--shadow-panel)] sm:block"
          />
        ) : null}
      </span>

      <span className="flex flex-col gap-1 px-1">
        <span className="flex items-baseline gap-2 text-[17px] font-medium text-paper transition-colors duration-300 group-hover:text-amber md:text-[18px]">
          {project.title}
        </span>
        <Label>{meta}</Label>
      </span>
    </Link>
  );
}

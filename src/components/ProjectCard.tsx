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
}) {
  const { path } = useLocale();
  const { cover } = project;
  const meta = [project.role.label, project.year].filter(Boolean).join(" · ");

  /**
   * `object-cover` griež malas, un tieši malās sēž tas, kas kartei dod jēgu:
   * klienta virsraksts un logotips. Reāli nogriezts iznākums bija "APMEK",
   * "BARE KNUCKL" un "ātne, dati un ksligais intelekts".
   *
   * Tāpēc aizpildīšana notiek tikai tad, kad attēla un kadra proporcijas ir
   * tuvu (griezums zem ~18%). Kvadrātveida logo un platie ekrānuzņēmumi šaurā
   * kadrā ietilpst pilnībā uz kartes fona - labāk redzēt visu darbu ar malu,
   * nekā pusi no tā bez malas.
   */
  const coverRatio = cover.width / cover.height;
  const fits = frameRatio ? Math.max(coverRatio / frameRatio, frameRatio / coverRatio) <= 1.18 : true;

  return (
    <Link
      to={`${path("portfolio")}/${project.slug}`}
      className="group flex h-full flex-col gap-[18px]"
    >
      <span
        className={cn("relative block overflow-hidden rounded-card border border-line bg-ink-card", frame)}
        style={frame ? undefined : { aspectRatio: `${cover.width} / ${cover.height}` }}
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
            fits ? "object-cover object-[top_center]" : "object-contain p-5 md:p-7",
            "[filter:contrast(.96)_saturate(.9)]",
            "transition-[transform,filter] duration-[1100ms] ease-dir",
            "group-hover:[filter:contrast(1)_saturate(1)]",
            "[@media(hover:hover)]:group-hover:scale-[1.03]",
          )}
        />
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

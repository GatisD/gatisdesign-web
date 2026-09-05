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
 * Amplitūda apzināti maza (1,03) - tas ir apstiprinājums, ne šovs.
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
  ratio,
}: {
  project: Project;
  eager?: boolean;
  /** Kadra proporcija režģī. Bez tā karte seko attēla proporcijai. */
  ratio?: string;
}) {
  const { path } = useLocale();
  const { cover } = project;
  const meta = [project.role.label, project.year].filter(Boolean).join(" · ");

  return (
    <Link
      to={`${path("portfolio")}/${project.slug}`}
      className="group flex h-full flex-col gap-[18px]"
    >
      <span
        className="relative block overflow-hidden rounded-card border border-line bg-ink-card"
        style={{ aspectRatio: ratio ?? `${cover.width} / ${cover.height}` }}
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
            "h-full w-full object-cover object-[top_center]",
            "[filter:contrast(.96)_saturate(.9)]",
            "transition-[transform,filter] duration-[1100ms] ease-dir",
            "group-hover:scale-[1.03] group-hover:[filter:contrast(1)_saturate(1)]",
          )}
        />
      </span>

      <span className="flex flex-col gap-1 px-1">
        <span className="flex items-baseline gap-2 text-[17px] font-medium text-paper transition-transform duration-500 ease-dir group-hover:translate-x-1 md:text-[18px]">
          {project.title}
        </span>
        <Label>{meta}</Label>
      </span>
    </Link>
  );
}

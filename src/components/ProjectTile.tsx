import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PicturePortfolio from "@/components/PicturePortfolio";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";

/**
 * Portfolio flīze: vāks, klients, virsraksts un loma. Hover paceļ kadru par 5px
 * un attēlu palielina par 5%, kā apstiprinātajā koncepta režģī.
 */
export default function ProjectTile({ project, eager = false }: { project: Project; eager?: boolean }) {
  const { path } = useLocale();
  const { cover } = project;

  const meta = [project.role.label, project.year].filter(Boolean).join(" · ");

  return (
    <Link to={`${path("portfolio")}/${project.slug}`} className="reveal group block">
      <span
        className={cn(
          "relative block overflow-hidden rounded-2xl border border-line bg-ink-800",
          "transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease)]",
          "group-hover:-translate-y-[5px] group-hover:border-amber/40",
          "group-hover:shadow-[0_36px_72px_-36px_rgba(0,0,0,.95)]",
        )}
        style={{ aspectRatio: `${cover.width} / ${cover.height}` }}
      >
        <PicturePortfolio
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover brightness-[0.93] saturate-[0.9] transition-[transform,filter] duration-700 [transition-timing-function:var(--ease)] group-hover:scale-105 group-hover:brightness-100 group-hover:saturate-100"
        />
      </span>

      <span className="flex items-start justify-between gap-5 pt-4">
        <span>
          <span className="block text-[11px] uppercase tracking-[0.17em] text-paper-faint transition-colors duration-300 group-hover:text-amber">
            {project.client}
          </span>
          <span className="mt-1.5 block text-[clamp(1.1rem,1.55vw,1.38rem)] tracking-[-0.028em] transition-colors duration-300 group-hover:text-amber-soft">
            {project.title}
          </span>
          <span className="mt-1.5 block text-[13px] leading-[1.5] text-paper-dim">{meta}</span>
        </span>
        <span
          aria-hidden="true"
          className="mt-1 grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full border border-line-strong text-paper-faint transition-all duration-300 group-hover:border-amber group-hover:bg-amber group-hover:text-[#1a1206]"
        >
          <ArrowUpRight size={17} />
        </span>
      </span>
    </Link>
  );
}

import { ArrowUpRight } from "lucide-react";
import HoverLift from "./animations/HoverLift";
import type { PortfolioWork } from "@/data/portfolio";

interface Props {
  work: PortfolioWork;
}

const aspectMap = {
  square: "aspect-square",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
  "16/9": "aspect-[16/9]",
};

const spanMap = {
  4: "md:col-span-4",
  6: "md:col-span-6",
  8: "md:col-span-8",
};

export default function PortfolioTile({ work }: Props) {
  const aspect = aspectMap[work.aspect ?? "4/3"];
  // span used by parent grid wrapper; tile itself fills container
  void spanMap;

  return (
    <article className="w-full">
      <HoverLift>
        <div
          className={`relative overflow-hidden bg-secondary border border-border ${aspect} group cursor-pointer`}
        >
          {/* Placeholder while no cover image yet */}
          {work.cover ? (
            <img
              src={work.cover}
              alt={`${work.name} — ${work.category}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              width={800}
              height={600}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <span className="font-display font-bold text-3xl md:text-4xl text-foreground/15 mb-3">
                {work.name}
              </span>
              <span className="eyebrow text-muted-foreground">{work.category}</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-6 md:p-8 flex flex-col justify-end">
            <span className="eyebrow text-white/70 mb-2">{work.category}</span>
            <h3 className="font-display text-xl md:text-2xl font-bold text-white">{work.name}</h3>
            <div className="flex items-center gap-1 mt-3 text-accent">
              <span className="eyebrow">Skatīt</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </div>
          </div>
        </div>
      </HoverLift>
      <div className="mt-4">
        <span className="eyebrow text-muted-foreground">{work.category}</span>
        <h3 className="font-display text-lg md:text-xl font-semibold mt-1 group-hover:text-accent transition-colors">
          {work.name}
        </h3>
        {work.caption && (
          <p className="text-sm text-muted-foreground mt-1">{work.caption}</p>
        )}
      </div>
    </article>
  );
}

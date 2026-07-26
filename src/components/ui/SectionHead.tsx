import Kicker from "./Kicker";
import type { ReactNode } from "react";

export default function SectionHead({ kicker, title, lede }: { kicker: string; title: ReactNode; lede?: ReactNode }) {
  return (
    <div className="mb-[clamp(38px,5vw,64px)] grid gap-[18px] lg:grid-cols-[minmax(0,1fr)_minmax(0,38ch)] lg:items-end lg:gap-11">
      <div>
        <Kicker className="mb-4">{kicker}</Kicker>
        <h2 className="text-[clamp(1.95rem,4.1vw,3.35rem)] font-light leading-[1.06] tracking-[-0.038em] [text-wrap:balance] max-w-[20ch]">
          {title}
        </h2>
      </div>
      {lede && <p className="text-paper-dim">{lede}</p>}
    </div>
  );
}

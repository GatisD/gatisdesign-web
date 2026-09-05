import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import PicturePortfolio from "@/components/PicturePortfolio";

/**
 * Hero un joslu fona kadrs.
 *
 * Struktūra jau tagad ir gatava video: ja `src` ir padots, pēc plakāta ielādes
 * tiek pievienots <video> ar to pašu kadrējumu. Ja `src` nav (šodienas
 * stāvoklis - video vēl nav uzņemts), renderējas tikai plakāts, un lapa no tā
 * neko nezaudē.
 *
 * `prefers-reduced-motion: reduce` -> video netiek pieslēgts vispār, ne tikai
 * apturēts: kustība, ko lietotājs ir izslēdzis sistēmā, nedrīkst arī lejupielādēties.
 */
export default function HeroMedia({
  poster,
  posterAlt = "",
  src,
  className,
  position = "center 40%",
  eager = false,
  brightness = 0.55,
  blur = false,
}: {
  poster: string;
  posterAlt?: string;
  src?: string;
  className?: string;
  position?: string;
  eager?: boolean;
  brightness?: number;
  blur?: boolean;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!src) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Video nedrīkst sacensties ar LCP: pieslēdzam pēc pirmās ielādes.
    const id = window.setTimeout(() => setShowVideo(true), 600);
    return () => window.clearTimeout(id);
  }, [src]);

  const filter = `brightness(${brightness}) saturate(.85)${blur ? " blur(1px)" : ""}`;

  return (
    <div ref={wrap} className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden={posterAlt ? undefined : true}>
      <PicturePortfolio
        src={poster}
        alt={posterAlt}
        loading={eager ? "eager" : "lazy"}
        priority={eager ? "high" : "low"}
        decoding={eager ? "sync" : "async"}
        width={1600}
        height={900}
        className="media-settle absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position, filter }}
      />
      {showVideo && src ? (
        <video
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position, filter }}
        />
      ) : null}
    </div>
  );
}

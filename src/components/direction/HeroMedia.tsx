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
  drift = false,
  brightness = 0.55,
  blur = false,
}: {
  poster: string;
  posterAlt?: string;
  src?: string;
  className?: string;
  position?: string;
  eager?: boolean;
  /** Lēna kadra kustība. Tikai hero virsmām; joslās vidū lapas tā traucē lasīt. */
  drift?: boolean;
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

  /**
   * Filtrs vairs nav inline virkne, bet CSS mainīgie: pelēkošana un tās
   * atgriešanās uz hover dzīvo stila lapā (`.foto-melnbalts`), un inline stils
   * to pārrakstītu - inline vienmēr uzvar pār klasi.
   *
   * Attēli DISKĀ paliek krāsaini ar nolūku. Ja tos padarītu melnbaltus failā,
   * uz hover nebūtu kam kļūt krāsainam; pelēkums ir izskats, ne saturs.
   */
  const mainigie = {
    ["--foto-gaisums" as string]: String(brightness),
    ["--foto-izpludums" as string]: blur ? "1px" : "0px",
  };

  return (
    <div ref={wrap} className={cn("media-melnbalts absolute inset-0 overflow-hidden", drift && "media-drift", className)} aria-hidden={posterAlt ? undefined : true}>
      <PicturePortfolio
        src={poster}
        alt={posterAlt}
        loading={eager ? "eager" : "lazy"}
        priority={eager ? "high" : "low"}
        decoding={eager ? "sync" : "async"}
        widths={[960, 1600]}
        sizes="100vw"
        width={1600}
        height={900}
        className="media-settle foto-melnbalts absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position, ...mainigie }}
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
          className="foto-melnbalts absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position, ...mainigie }}
        />
      ) : null}
    </div>
  );
}

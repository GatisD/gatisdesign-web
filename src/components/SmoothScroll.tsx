import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Modulim piesaistīta singleton instance, lai citas komponentes (piem. Header
 * mobilā izvēlne) var apturēt/atsākt smooth scroll bez atsevišķa React konteksta.
 * `null` kamēr komponente nav mount'ota vai lietotājam ir prefers-reduced-motion.
 */
let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Lenis smooth scroll setup.
 * Respects prefers-reduced-motion (a11y).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisInstance = lenis;

    let raf = 0;
    function loop(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}

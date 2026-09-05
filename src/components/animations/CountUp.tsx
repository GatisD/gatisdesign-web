import { useEffect, useRef, useState } from "react";

/**
 * Odometra skaitītājs. Bez animāciju bibliotēkas: viens requestAnimationFrame
 * cikls ar to pašu easing līkni, kas visam pārējam.
 *
 * Bāzes stāvoklis ir GALA skaitlis - SSG kadrā, bez JS un pie reduced-motion
 * lapā uzreiz stāv "100", ne "0". Animācija tikai pievieno kustību.
 */
export default function CountUp({ to, duration = 1.2 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        setValue(0);
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / (duration * 1000));
          // cubic-bezier(.22,1,.36,1) tuvinājums: ātrs sākums, mīksts nobeigums
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(Math.round(eased * to));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

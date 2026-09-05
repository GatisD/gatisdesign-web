import { useEffect, useRef, type ReactNode } from "react";

/**
 * Magnētiskā primārā CTA. Viena vieta lapā ar "Awwwards" kustību - ne desmit.
 *
 * Tikai `pointer: fine`: uz skāriena ierīcēm nav kursora, ko sekot, un efekts
 * tur nozīmētu tikai lieku rAF ciklu. Pie reduced-motion efekts nepieslēdzas
 * vispār, poga paliek parasta poga.
 *
 * Amplitūda apzināti maza (0,22 no nobīdes, maks. ~10 px) - kustība parāda, ka
 * elements ir dzīvs, nevis izrāda sevi.
 */
export default function MagneticButton({
  children,
  className,
  strength = 0.22,
}: {
  /** Pati poga vai saite. Komponente to tikai ietin - klikšķi netiek aiztikti. */
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const loop = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-12, Math.min(12, (e.clientX - (r.left + r.width / 2)) * strength));
      ty = Math.max(-8, Math.min(8, (e.clientY - (r.top + r.height / 2)) * strength));
      start();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      start();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <span ref={ref} className={["inline-flex will-change-transform", className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

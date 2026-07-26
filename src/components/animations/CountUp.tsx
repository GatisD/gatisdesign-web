import { useInView, animate, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Props {
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

/**
 * Skaitītājs, kas statiskajā HTML jau satur gala skaitli.
 *
 * Sākuma stāvoklis apzināti ir `to`, nevis nulle: lapa tiek ģenerēta statiski,
 * tāpēc bez JavaScript (un meklētāja crawler acīs) paliek redzams tieši tas,
 * kas rakstīts saturā. Animācija sākas tikai pēc hidratācijas, kad bloks nonāk
 * skatā, un beidzas tajā pašā skaitlī.
 */
export default function CountUp({ to, duration = 1.5, suffix = "", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [animated, setAnimated] = useState<number | null>(null);

  // Ja bloks jau ir pirmajā kadrā, skaitītājs nesāk no nulles: HTML skaitlis jau
  // ir redzams, un lēciens 18 -> 0 -> 18 izskatītos pēc kļūdas, ne pēc animācijas.
  const visibleOnLoad = useRef(false);
  useEffect(() => {
    visibleOnLoad.current = ref.current
      ? ref.current.getBoundingClientRect().top < window.innerHeight
      : false;
  }, []);

  useEffect(() => {
    if (!inView || reduce || visibleOnLoad.current) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setAnimated(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {animated ?? to}
      {suffix}
    </span>
  );
}

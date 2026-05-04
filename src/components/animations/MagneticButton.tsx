import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import {
  useRef,
  type MouseEvent,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "ref"> {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export default function MagneticButton({
  children,
  className,
  strength = 0.25,
  ...rest
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18 });
  const springY = useSpring(y, { stiffness: 200, damping: 18 });
  const reduce = useReducedMotion();

  function handleMouseMove(e: MouseEvent<HTMLButtonElement>) {
    if (!ref.current || reduce) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }
  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  if (reduce) {
    return (
      <button ref={ref} className={className} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

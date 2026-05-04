import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
}

export default function Marquee({ children, speed = 30, reverse = false, className }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={`overflow-hidden ${className ?? ""}`}>
        <div className="flex gap-12 whitespace-nowrap flex-wrap justify-center">{children}</div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

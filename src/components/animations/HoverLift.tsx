import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  liftAmount?: number;
}

export default function HoverLift({ children, className, liftAmount = 6 }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ y: -liftAmount, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

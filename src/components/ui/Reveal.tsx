import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The reference reveals nearly every block the same way: opacity 0 → 1 with a
 * 20px rise, triggered once as the block enters the viewport.
 */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  duration = 0.75,
  className,
  once = true,
  amount = 0.25,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function RevealGroup({
  children,
  className,
  amount = 0.2,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        ...staggerParent,
        show: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerChild} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * A single line of type that slides up from behind its own mask.
 *
 * The viewport trigger has to live on the *outer* (unclipped) span: the inner
 * span starts translated fully out of the mask, so an IntersectionObserver
 * attached to it would clip to an empty rect and never fire.
 */
export function MaskLine({
  children,
  delay = 0,
  className,
  duration = 0.9,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  duration?: number;
}) {
  return (
    <motion.span
      className={cn("clip-line", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
    >
      <motion.span
        className="block will-change-transform"
        variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
        transition={{ duration, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

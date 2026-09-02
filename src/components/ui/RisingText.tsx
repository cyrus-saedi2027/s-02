import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Per-character rise: each glyph comes up 20px and fades in, one after the
 * next, once the block is in view.
 *
 * Words stay whole and each character is an inline-block inside its word, so
 * the line still breaks on spaces — splitting on characters alone would let a
 * word break in the middle at a line end.
 */
export function RisingText({
  text,
  className,
  stagger = 0.012,
  delay = 0,
  duration = 0.55,
  amount = 0.2,
}: {
  text: string;
  className?: string;
  /** Seconds between one character and the next. */
  stagger?: number;
  delay?: number;
  duration?: number;
  amount?: number;
}) {
  let i = 0;

  return (
    <motion.span
      className={cn("inline", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {text.split(" ").map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {[...word].map((ch, ci) => {
            const at = delay + i++ * stagger;
            return (
              <motion.span
                key={ci}
                className="inline-block will-change-transform"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration, ease: EASE, delay: at } },
                }}
              >
                {ch}
              </motion.span>
            );
          })}
          {/* A real space, so the browser can still break the line here. */}
          <span className="inline-block">&nbsp;</span>
        </span>
      ))}
    </motion.span>
  );
}

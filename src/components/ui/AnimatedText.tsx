import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
};

const charVariant: Variants = {
  hidden: { y: "115%", opacity: 0, rotate: 4 },
  show: {
    y: "0%",
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.85, ease: EASE },
  },
};

export type Tone = "solid" | "dim" | "accent";

const toneClass: Record<Tone, string> = {
  solid: "text-paper",
  dim: "text-dimmer",
  accent: "text-accent",
};

/**
 * Character-by-character rise, matching the reference's hero and CTA headlines.
 * Words stay whole for wrapping; each word owns its own overflow mask so the
 * glyphs slide up from behind the line above.
 */
export function AnimatedHeadline({
  words,
  className,
  wordClassName,
  stagger = 0.018,
  delay = 0,
  once = true,
  amount = 0.4,
}: {
  words: readonly { text: string; tone?: Tone }[];
  className?: string;
  wordClassName?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
  amount?: number;
}) {
  let charIndex = 0;

  return (
    <motion.span
      className={cn("flex flex-wrap", className)}
      variants={container}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {words.map((word, wi) => (
        <span
          key={`${word.text}-${wi}`}
          className={cn(
            "clip-line inline-flex whitespace-nowrap",
            toneClass[word.tone ?? "solid"],
            wordClassName
          )}
        >
          {[...word.text].map((ch, ci) => {
            const idx = charIndex++;
            return (
              <motion.span
                key={ci}
                className="inline-block will-change-transform"
                variants={charVariant}
                transition={{ delay: delay + idx * stagger }}
              >
                {ch}
              </motion.span>
            );
          })}
          {/* Trailing space lives outside the mask so it never collapses. */}
          <span className="inline-block">&nbsp;</span>
        </span>
      ))}
    </motion.span>
  );
}

/**
 * Label whose glyphs are staggered on hover — used on every button and nav item
 * in the reference, where each letter is its own animated element.
 */
export function HoverStaggerLabel({
  text,
  className,
  active = false,
}: {
  text: string;
  className?: string;
  active?: boolean;
}) {
  return (
    <span className={cn("relative inline-flex overflow-hidden", className)}>
      {/* Resting layer */}
      <span className="inline-flex" aria-hidden={false}>
        {[...text].map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block will-change-transform"
            animate={{ y: active ? "-115%" : "0%" }}
            transition={{ duration: 0.91, ease: EASE, delay: i * 0.039 }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </span>
      {/* Incoming layer */}
      <span className="absolute inset-0 inline-flex" aria-hidden="true">
        {[...text].map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block will-change-transform"
            initial={{ y: "115%" }}
            animate={{ y: active ? "0%" : "115%" }}
            transition={{ duration: 0.91, ease: EASE, delay: i * 0.039 }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

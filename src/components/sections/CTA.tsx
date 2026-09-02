import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimatedHeadline } from "../ui/AnimatedText";
import { Reveal } from "../ui/Reveal";
import { MagneticButton } from "../ui/MagneticButton";
import { identity } from "@/data/site";
import { MarqueeLabel } from "../ui/MarqueeLabel";

const HEADLINE = [
  { text: "Ready", tone: "solid" as const },
  { text: "to", tone: "dim" as const },
  { text: "Transform", tone: "solid" as const },
  { text: "Your", tone: "dim" as const },
  { text: "Vision?", tone: "accent" as const },
];

/**
 * Closing call to action. A soft accent bloom drifts with scroll behind the
 * headline, which rises character by character like the hero.
 */
export function CTA({ onBook }: { onBook: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bloomY = useTransform(scrollYProgress, [0, 1], ["18%", "-18%"]);
  const bloomScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.1, 0.9]);

  return (
    <section
      id="contact"
      ref={ref}
      className="relative overflow-hidden border-t border-hair py-28 md:py-44"
    >
      {/* Accent bloom */}
      <motion.div
        aria-hidden="true"
        style={{ y: bloomY, scale: bloomScale }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vw] w-[70vw] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.18] blur-[120px]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_50%_50%,rgb(var(--c-accent))_0%,rgb(var(--c-accent-warm))_45%,transparent_70%)]" />
      </motion.div>

      <div className="shell relative">
        <Reveal className="mb-10 flex justify-center">
          <MarqueeLabel text="Book a call" />
        </Reveal>

        <h2 className="mx-auto max-w-[16ch] text-center text-[clamp(2.5rem,7.5vw,8rem)] font-medium leading-[0.92] tracking-tighter">
          <AnimatedHeadline
            words={HEADLINE}
            stagger={0.016}
            amount={0.3}
            className="justify-center gap-x-[0.06em]"
          />
        </h2>

        <Reveal delay={0.15} className="mt-10 flex justify-center">
          <p className="max-w-lg text-center font-sans text-base leading-relaxed text-dim">
            Tell me what you are building and where it is stuck. A short call is
            usually enough to work out whether I am the right person for it.
          </p>
        </Reveal>

        <Reveal delay={0.25} className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            label="Book a call"
            onClick={(e) => {
              e.preventDefault();
              onBook();
            }}
            variant="solid"
          />
          <MagneticButton
            label={identity.email}
            href={`mailto:${identity.email}`}
            variant="outline"
          />
        </Reveal>
      </div>
    </section>
  );
}

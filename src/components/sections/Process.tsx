import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Reveal, MaskLine } from "../ui/Reveal";
import { process } from "@/data/site";
import { MarqueeLabel } from "../ui/MarqueeLabel";

/**
 * Four cards that pin in sequence and stack.
 *
 * Each card gets one screen of scroll. Cards stay fully opaque — depth comes
 * from a scrim that darkens a card as the next one slides over it, plus a
 * small scale-down. Fading the cards themselves would let the stack bleed
 * through, since they sit directly on top of one another.
 */
export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section id="process" className="relative py-24 md:py-36">
      <div className="shell">
        <div className="mb-14 md:mb-20">
          <Reveal className="mb-6">
            <MarqueeLabel text="Process" />
          </Reveal>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[clamp(2.75rem,7vw,7.5rem)] font-medium leading-[0.9] tracking-tighter">
              <MaskLine>Unique</MaskLine>
              <MaskLine delay={0.08} className="text-dimmer">
                Angle
              </MaskLine>
            </h2>
            <Reveal delay={0.2}>
              <p className="max-w-sm font-sans text-sm leading-relaxed text-dim">
                Four steps, run the same way every time — so you always know
                what is happening and what comes next.
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Pin track: one screen of scroll per card. */}
      <div
        ref={ref}
        className="shell relative"
        style={{ height: `${process.length * 100}vh` }}
      >
        {process.map((step, i) => (
          <ProcessCard
            key={step.title}
            step={step}
            index={i}
            total={process.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}

function ProcessCard({
  step,
  index,
  total,
  progress,
}: {
  step: (typeof process)[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const slice = 1 / total;
  const start = index * slice;
  const end = start + slice;
  const isLast = index === total - 1;

  // While the next card covers this one: shrink slightly and darken.
  const scale = useTransform(progress, [start, end], [1, isLast ? 1 : 0.93]);
  const scrim = useTransform(progress, [start, end], [0, isLast ? 0 : 0.72]);
  const bar = useTransform(progress, [start, end], [0, 1]);

  // Stagger the resting position so the stacked edges stay visible.
  const offset = index * 18;

  return (
    <div className="sticky top-0 flex h-screen items-center">
      <motion.article
        style={{ scale, transformOrigin: "center top", marginTop: offset }}
        className="relative w-full overflow-hidden rounded-xl border border-hair bg-[#0c0c0c] p-7 shadow-[0_-24px_60px_-30px_rgba(0,0,0,0.9)] md:p-12 lg:p-16"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60"
        />

        <div className="grid min-h-[22vh] gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-start lg:gap-16">
          <span className="font-sans text-2xs font-semibold uppercase tracking-wider text-accent">
            {step.n}
          </span>

          <div className="max-w-3xl">
            <h3 className="text-[clamp(2.25rem,6vw,5rem)] font-medium leading-none tracking-tighter">
              {step.title}
            </h3>
            <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-dim md:text-md">
              {step.body}
            </p>
          </div>

          <span className="hidden font-sans text-2xs uppercase tracking-wider text-dimmer lg:block">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* Step progress */}
        <div className="mt-8 h-px w-full bg-hair md:mt-12">
          <motion.span
            className="block h-px bg-accent"
            style={{ scaleX: bar, originX: 0 }}
          />
        </div>

        {/* Scrim — darkens this card as the next slides over it. */}
        <motion.span
          aria-hidden="true"
          style={{ opacity: scrim }}
          className="pointer-events-none absolute inset-0 bg-ink"
        />
      </motion.article>
    </div>
  );
}

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Reveal, MaskLine } from "../ui/Reveal";
import { CircleTextButton } from "../ui/MagneticButton";
import { about } from "@/data/site";
import { MarqueeLabel } from "../ui/MarqueeLabel";

/** Word-level reveal driven by scroll position rather than a single trigger. */
function ScrollLitParagraph({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });
  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className="flex flex-wrap text-[clamp(1.25rem,2.5vw,2.125rem)] font-normal leading-[1.35] tracking-snug"
    >
      {words.map((w, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return <LitWord key={i} progress={scrollYProgress} range={[start, end]} word={w} />;
      })}
    </p>
  );
}

function LitWord({
  progress,
  range,
  word,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  word: string;
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.28em] inline-block">
      {word}
    </motion.span>
  );
}

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-36">
      <div className="shell">
        {/* Eyebrow */}
        <Reveal className="mb-12 md:mb-20">
          <MarqueeLabel text={about.eyebrow} />
        </Reveal>

        <div className="grid gap-14 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-24">
          <div className="max-w-4xl">
            <ScrollLitParagraph text={about.body} />
            <Reveal delay={0.1} className="mt-8">
              <p className="max-w-xl font-sans text-sm leading-relaxed text-dim">
                {about.secondary}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="shrink-0">
            <CircleTextButton text="MORE·ABOUT·ME·MORE·ABOUT·ME·" href="/about" />
          </Reveal>
        </div>

        {/* Figures */}
        <div className="mt-20 grid grid-cols-1 gap-px border-t border-hair sm:grid-cols-3 md:mt-28">
          {about.stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.08}
              className="group border-b border-hair py-8 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:pr-8"
            >
              <div className="flex items-baseline gap-3">
                <MaskLine delay={i * 0.08}>
                  <span className="text-[clamp(3rem,6vw,5rem)] font-medium leading-none tracking-tighter transition-colors duration-500 group-hover:text-accent">
                    {s.value}
                  </span>
                </MaskLine>
                <span className="text-accent">+</span>
              </div>
              <p className="mt-3 font-sans text-2xs uppercase tracking-wider text-dim">
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

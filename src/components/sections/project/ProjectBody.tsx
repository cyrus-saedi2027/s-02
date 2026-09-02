import { useRef } from "react";
import { motion } from "framer-motion";
import { MarqueeLabel } from "@/components/ui/MarqueeLabel";
import { MaskLine, Reveal } from "@/components/ui/Reveal";
import { RisingText } from "@/components/ui/RisingText";
import { ZoomPlate } from "@/components/ui/ZoomPlate";
import { CountUp } from "@/components/ui/CountUp";
import type { Project } from "@/data/site";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** What was wrong before the work started, set large. */
export function ProjectProblem({ project }: { project: Project }) {
  return (
    <section className="relative py-20 md:py-28">
      <div className="shell grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <Reveal className="mb-6">
            <MarqueeLabel text="The problem" width="11rem" />
          </Reveal>
          <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-medium leading-[0.95] tracking-tighter">
            <MaskLine>Before</MaskLine>
          </h2>
        </div>
        <p className="text-[clamp(1.1rem,1.9vw,1.5rem)] font-medium leading-[1.5] text-white/80">
          <RisingText text={project.problem} stagger={0.006} />
        </p>
      </div>
    </section>
  );
}

/**
 * The work, in two or three moves.
 *
 * Each chapter alternates its plate to the opposite side, so the column of
 * copy reads as the steady thing and the work as what passes by — the same
 * rhythm the projects index uses, at a quieter scale.
 */
export function ProjectChapters({ project }: { project: Project }) {
  return (
    <section className="relative py-10 md:py-16">
      <div className="shell flex flex-col gap-20 md:gap-32">
        {project.chapters.map((c, i) => (
          <Chapter key={c.title} chapter={c} index={i} flipped={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

function Chapter({
  chapter,
  index,
  flipped,
}: {
  chapter: Project["chapters"][number];
  index: number;
  flipped: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={track}
      className={cn(
        "grid items-center gap-8 lg:grid-cols-2 lg:gap-16",
        flipped && "lg:[&>*:first-child]:order-2"
      )}
    >
      <ZoomPlate
        src={chapter.art}
        alt={`${chapter.title} — supporting artwork`}
        track={track}
        className="aspect-[4/3] w-full overflow-hidden rounded-xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <p className="font-sans text-2xs font-semibold uppercase tracking-wider text-accent">
          / {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="mt-4 max-w-[18ch] text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-[1.05] tracking-tight">
          {chapter.title}
        </h3>
        <p className="mt-5 max-w-[46ch] font-sans text-sm leading-relaxed text-dim md:text-base">
          {chapter.body}
        </p>
      </motion.div>
    </div>
  );
}

/** Three figures and what changed once it shipped. */
export function ProjectOutcome({ project }: { project: Project }) {
  return (
    <section className="relative border-t border-hair py-20 md:py-28">
      <div className="shell">
        <Reveal className="mb-10">
          <MarqueeLabel text="The outcome" width="11rem" />
        </Reveal>

        <div className="grid gap-10 border-b border-hair pb-14 sm:grid-cols-3 md:gap-8">
          {project.metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
            >
              <p className="text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-none tracking-tighter">
                <CountUp to={m.value} suffix={m.suffix ?? ""} />
              </p>
              <p className="mt-4 max-w-[22ch] font-sans text-2xs uppercase tracking-wider text-dim">
                {m.label}
              </p>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-12 max-w-[54ch] text-[clamp(1.1rem,1.9vw,1.5rem)] font-medium leading-[1.5] text-white/80">
            {project.outcome}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The next project, so the page has somewhere to go that is not backwards.
 *
 * The whole card is one link and the button under it is a span dressed as one.
 * It was a MagneticButton to begin with, which is an anchor — an anchor inside
 * an anchor is invalid, and a screen reader is handed two controls for one
 * destination. The card already carries the click.
 */
export function ProjectNext({ next }: { next: Project }) {
  return (
    <section className="relative py-20 md:py-28">
      <div className="shell">
        <Reveal className="mb-8">
          <MarqueeLabel text="Next project" width="12rem" />
        </Reveal>

        <a
          href={`/projects/${next.slug}`}
          className="group grid items-center gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="overflow-hidden rounded-xl"
          >
            <img
              src={next.cover}
              alt={`${next.title} — cover artwork`}
              loading="lazy"
              className="aspect-[3/2] w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04]"
            />
          </motion.div>

          <Reveal delay={0.1}>
            <p className="font-sans text-2xs font-semibold uppercase tracking-wider text-accent">
              {next.index}
            </p>
            <h2 className="mt-4 text-[clamp(2.25rem,5vw,4rem)] font-medium leading-none tracking-tighter">
              {next.title}
            </h2>
            <p className="mt-4 font-sans text-2xs uppercase tracking-wider text-dim">
              {next.tags}
            </p>
            <span
              className="mt-8 inline-flex select-none items-center overflow-hidden rounded-md px-8 py-[18px] font-sans text-2xs font-semibold uppercase tracking-wider text-paper"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #fd321c 0%, #ff8a00 100%)",
              }}
            >
              View project
            </span>
          </Reveal>
        </a>
      </div>
    </section>
  );
}

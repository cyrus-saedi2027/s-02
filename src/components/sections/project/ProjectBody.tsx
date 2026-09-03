import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";
import { MarqueeLabel } from "@/components/ui/MarqueeLabel";
import { MaskLine, Reveal } from "@/components/ui/Reveal";
import { RisingText } from "@/components/ui/RisingText";
import { ZoomPlate } from "@/components/ui/ZoomPlate";
import { CountUp } from "@/components/ui/CountUp";
import { MagneticButton } from "@/components/ui/MagneticButton";
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
        <p className="text-[clamp(1.1rem,1.9vw,1.5rem)] font-medium leading-[1.5] text-paper/80">
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
  const calm = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");
  const fine = useMediaQuery("(pointer: fine)");

  // Two whole components rather than one that branches inside, so the hooks
  // each of them needs are never conditional.
  //
  // The sideways track is for a wide screen with a wheel or a trackpad, and
  // nowhere else. On a phone, turning a vertical scroll into a horizontal one
  // fights the gesture the hand is already making; under a reduced-motion
  // preference, moving the whole page sideways is the loudest thing on the
  // site. Both get the stack, which is not a lesser version — it is the layout
  // this section had, unchanged.
  if (calm || !wide || !fine) return <StackedChapters project={project} />;
  return <TrackChapters project={project} />;
}

/** The chapters one under the next: the layout everything but a wide desktop gets. */
function StackedChapters({ project }: { project: Project }) {
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

/**
 * The chapters as one wide strip, pinned while it travels.
 *
 * The section is several screens tall and holds a viewport-high panel to its
 * top edge; scrolling that height moves the strip inside it sideways. So the
 * page keeps one scroll direction — nothing is hijacked, the wheel does what
 * the wheel does — and the reading direction turns ninety degrees inside a
 * frame that is standing still.
 *
 * The distance is measured, not assumed. A chapter card is sized in `vw` and
 * the titles wrap differently per project, so the only honest travel is the
 * strip's real width less one screen, re-measured whenever either changes.
 * Assuming it would leave the last card short of the edge on one project and
 * scroll past the end on another.
 *
 * `position: sticky` is what pins it, which is the reason the smooth-scroll
 * hook drives `window.scrollTo` rather than transforming a wrapper — a
 * transformed ancestor would take sticky out of the equation entirely and this
 * section would simply scroll away.
 */
function TrackChapters({ project }: { project: Project }) {
  const outer = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  const { scrollYProgress } = useScroll({
    target: outer,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useLayoutEffect(() => {
    const el = strip.current;
    if (!el) return;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section
      ref={outer}
      className="relative"
      // One screen to read each chapter in, plus one to bring the strip to
      // rest at the end rather than stopping it against the edge.
      style={{ height: `${(project.chapters.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div
          ref={strip}
          style={{ x }}
          className="flex w-max items-center gap-8 px-[var(--shell-x)]"
        >
          {project.chapters.map((c, i) => (
            <article
              key={c.title}
              className="grid w-[min(74vw,1000px)] shrink-0 grid-cols-2 items-center gap-10"
            >
              <img
                src={c.art}
                alt={`${c.title} — supporting artwork`}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
              <div>
                <p className="font-sans text-2xs font-semibold uppercase tracking-wider text-accent">
                  / {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 max-w-[18ch] text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-[1.05] tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-5 max-w-[46ch] font-sans text-sm leading-relaxed text-dim md:text-base">
                  {c.body}
                </p>
              </div>
            </article>
          ))}
        </motion.div>

        {/* How far through the strip you are. A pinned section takes away the
            scrollbar's answer to that question, so it has to give its own. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[var(--shell-x)] bottom-10 h-px bg-hairStrong"
        >
          <motion.span style={{ width: progress }} className="block h-px bg-accent" />
        </div>
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
          <p className="mt-12 max-w-[54ch] text-[clamp(1.1rem,1.9vw,1.5rem)] font-medium leading-[1.5] text-paper/80">
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
 * Built the same way as a row on the home page, and for the same reason.
 *
 * This card used to be one big anchor with the button inside it drawn as a
 * span, because an anchor inside an anchor is invalid. That kept the markup
 * honest and made the button dead: no lean toward the pointer, no letters
 * rising on hover — the one button on the site that did nothing when you
 * touched it, sitting next to six that did.
 *
 * So the card is no longer the link. The cover is its own link, skipped by Tab
 * and hidden from assistive tech, and the button beside it is the real one —
 * the same MagneticButton the index rows use, with the same lean and the same
 * letter stagger. One destination, one announced control, and nothing nested.
 */
export function ProjectNext({ next }: { next: Project }) {
  return (
    <section className="relative py-20 md:py-28">
      <div className="shell">
        <Reveal className="mb-8">
          <MarqueeLabel text="Next project" width="12rem" />
        </Reveal>

        <div className="group grid items-center gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <a
            href={`/projects/${next.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            data-cursor="view"
            className="block"
          >
          <motion.div
            // Tagged like an index row, so clicking through from one project
            // to the next carries this plate rather than cross-fading two
            // different pictures at the same spot.
            data-project-cover={next.slug}
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
          </a>

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
            <div className="mt-8">
              <MagneticButton
                label="View project"
                describedAs={`View project — ${next.title}`}
                href={`/projects/${next.slug}`}
                variant="accent"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

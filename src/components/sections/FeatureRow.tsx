import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { MagneticButton } from "../ui/MagneticButton";
import type { Project } from "@/data/site";
import { useReducedMotion } from "@/hooks/useMediaQuery";

/**
 * Where the covers pivot from. `50% 180%` sits a little over one card-height
 * below the centre, which is the radius of the arc they travel. Pull it toward
 * `50% 50%` to flatten the curve into a turn on the spot; push it further down
 * to make the sweep wider.
 */
const ARC_PIVOT = "50% 180%";

/**
 * Fraction of a row's scroll range at which its cover finishes straightening.
 * Below 1 the card settles early and then simply holds; at 1 it is still
 * unwinding as the row reaches the middle of the viewport.
 */
const SETTLE_AT = 0.87;

/**
 * One project row: a cover on one side, the details opposite, alternating
 * down the page.
 *
 * The cover sweeps in along a shallow arc and lands square as the row reaches
 * the middle of the viewport, with the copy opposite running off the same
 * scroll range so the two resolve together.
 *
 * The arc comes from the pivot rather than from animating a path: putting the
 * transform origin well below the card means a single rotation carries its
 * centre along a circle of that radius, so the card curves into place and
 * unwinds its tilt in one motion. Nothing translates it — the travel is the
 * rotation. A nearer pivot flattens the curve, a further one deepens it.
 *
 * Shared by the home page's In Detail section and the projects index, which
 * is how the reference builds them: one row, two counts.
 */
export function FeatureRow({
  project,
  index,
  flipped,
  headingLevel = 3,
}: {
  project: Project;
  index: number;
  flipped: boolean;
  /**
   * The home page runs these under an "In Detail" h2, so h3 is right there.
   * The index has only its masthead above them, where an h3 would skip a
   * level and leave a hole in the outline.
   */
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const ref = useRef<HTMLDivElement>(null);
  const calm = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  // Smoothing keeps the turn from tracking every scroll jitter. Under a
  // reduced-motion preference the spring is the problem rather than the cure:
  // it keeps easing after the visitor has stopped scrolling, which is motion
  // they did not ask for. There, the raw progress is read straight.
  const smoothed = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const p = calm ? scrollYProgress : smoothed;

  // +1 when the cover sits on the right, -1 when it sits on the left, so each
  // row leans away from its own side.
  const dir = flipped ? -1 : 1;

  // CSS rotation runs clockwise, so a positive angle lifts the LEFT edge.
  // A cover on the right therefore starts with its left edge raised, and one
  // on the left starts with its right edge raised.
  //
  // With the pivot below the card, that same rotation also swings the card out
  // along the arc — each cover enters from its own side of the layout and
  // curves back in.
  // Both land at SETTLE_AT rather than at the end of the range, so the card is
  // square a little before the row reaches the middle of the viewport.
  // Flattened under reduced motion: the row is drawn where it settles, so the
  // page is still and only the fade is left.
  const rotate = useTransform(p, [0, SETTLE_AT], calm ? [0, 0] : [12 * dir, 0]);
  const scale = useTransform(p, [0, SETTLE_AT], calm ? [1, 1] : [0.94, 1]);

  const textX = useTransform(p, [0, 1], calm ? [0, 0] : [26 * -dir, 0]);
  const textOpacity = useTransform(p, [0.15, 0.75], [0, 1]);

  return (
    <div
      ref={ref}
      className={`grid items-center gap-10 lg:gap-14 ${
        flipped
          ? "lg:grid-cols-[1.28fr_1fr]"
          : "lg:grid-cols-[1fr_1.28fr] lg:[&>*:first-child]:order-2"
      }`}
    >
      {/* Cover */}
      <motion.div
        // The handle the click handler finds this plate by, so it can lend it
        // its view-transition-name on the way into the project page.
        data-project-cover={project.slug}
        style={{ rotate, scale, transformOrigin: ARC_PIVOT }}
        className="relative overflow-hidden rounded-xl will-change-transform"
      >
        <div className="aspect-[3/2] w-full overflow-hidden">
          <img
            src={project.cover}
            alt={`${project.title} cover`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10"
        />
      </motion.div>

      {/* Copy */}
      <motion.div
        style={{ x: textX, opacity: textOpacity }}
        className={`flex flex-col ${flipped ? "lg:items-end lg:text-right" : "lg:items-start lg:text-left"}`}
      >
        <span className="font-sans text-2xs font-semibold uppercase tracking-wider text-accent">
          / {String(index + 1).padStart(2, "0")}
        </span>
        <Heading className="mt-4 text-[clamp(2.25rem,6vw,5rem)] font-medium leading-none tracking-tighter">
          {project.title}
        </Heading>
        <p className="mt-4 font-sans text-2xs uppercase tracking-wider text-dim">
          {project.tags}
        </p>
        <p className="mt-5 max-w-sm font-sans text-sm leading-relaxed text-dim">
          {project.blurb}
        </p>
        <div className="mt-8">
          <MagneticButton
            label="View project"
            href={`/projects/${project.slug}`}
            variant="accent"
          />
        </div>
      </motion.div>
    </div>
  );
}

/**
 * The column the rows sit in.
 *
 * Clipping at viewport width rather than inside the shell lets a card run past
 * the page margin to the screen edge, which is where it starts before sliding
 * in. `clip` rather than `hidden`: `hidden` creates a scroll container, which
 * would break any sticky element on the page.
 */
export function FeatureRows({
  items,
  headingLevel,
}: {
  items: Project[];
  headingLevel?: 2 | 3;
}) {
  return (
    <div className="overflow-x-clip">
      {/* Narrower gutters than the site's shell, so the covers sit closer to
          the page edge — roughly half the usual margin. */}
      <div className="mx-auto flex w-full max-w-shell flex-col gap-[4.02rem] px-[clamp(0.75rem,1.9vw,2.25rem)] md:gap-[6.33rem]">
        {items.map((p, i) => (
          <FeatureRow
            key={p.title}
            project={p}
            index={i}
            flipped={i % 2 === 1}
            headingLevel={headingLevel}
          />
        ))}
      </div>
    </div>
  );
}

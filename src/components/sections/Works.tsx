import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Reveal, MaskLine } from "../ui/Reveal";
import { MagneticButton } from "../ui/MagneticButton";
import { featuredProjects, type Project } from "@/data/site";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MarqueeLabel } from "../ui/MarqueeLabel";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Works index. On desktop the list stays typographic and a single floating
 * preview follows the pointer; below `lg` each row carries its own thumbnail
 * so the section still reads on touch.
 */
export function Works() {
  const [active, setActive] = useState<number | null>(null);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const wrap = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    setPointer({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <section id="projects" className="relative py-24 md:py-36">
      <div className="shell">
        {/* Header row */}
        <div className="mb-14 flex flex-col gap-8 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal className="mb-6">
              <MarqueeLabel text="Creations" />
            </Reveal>
            <h2 className="text-[clamp(2.75rem,7vw,7.5rem)] font-medium leading-[0.9] tracking-tighter">
              <MaskLine>Selected</MaskLine>
              <MaskLine delay={0.08} className="text-dimmer">
                Works
              </MaskLine>
            </h2>
          </div>
          <Reveal delay={0.2}>
            <MagneticButton label="View all works" href="/projects" variant="outline" />
          </Reveal>
        </div>

        {/* List */}
        <div ref={wrap} onMouseMove={onMove} className="relative">
          <ul className="border-t border-hair">
            {featuredProjects.map((p, i) => (
              <ProjectRow
                key={p.title}
                project={p}
                desktop={desktop}
                active={active === i}
                onEnter={() => setActive(i)}
                onLeave={() => setActive(null)}
              />
            ))}
          </ul>

          {/* Pointer-tracked preview */}
          {desktop && (
            <AnimatePresence>
              {active !== null && (
                <motion.div
                  key={active}
                  className="pointer-events-none absolute left-0 top-0 z-20 h-[300px] w-[420px] overflow-hidden rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: pointer.x - 210,
                    y: pointer.y - 150,
                  }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{
                    opacity: { duration: 0.28 },
                    scale: { duration: 0.35, ease: EASE },
                    x: { type: "spring", stiffness: 170, damping: 22, mass: 0.6 },
                    y: { type: "spring", stiffness: 170, damping: 22, mass: 0.6 },
                  }}
                >
                  <img
                    src={featuredProjects[active].art}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectRow({
  project,
  desktop,
  active,
  onEnter,
  onLeave,
}: {
  project: Project;
  desktop: boolean;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.5"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [26, 0]);

  return (
    <motion.li
      ref={ref}
      style={{ opacity, y }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group relative border-b border-hair"
    >
      <a
        href="/projects"
        data-cursor={desktop ? "view" : undefined}
        className="relative block px-1 py-8 md:py-10 lg:py-12"
      >
        {/* Accent field wiping up behind the row */}
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-[600ms] ease-soft group-hover:scale-y-100"
        />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
          <span className="w-16 shrink-0 font-sans text-2xs uppercase tracking-wider text-dim transition-colors duration-500 group-hover:text-paper">
            {project.index}
          </span>

          <h3 className="flex-1 text-[clamp(2rem,5.2vw,4.5rem)] font-medium leading-none tracking-tighter transition-transform duration-[600ms] ease-soft lg:group-hover:translate-x-5">
            {project.title}
          </h3>

          {/* Thumbnail for narrow viewports */}
          {!desktop && (
            <div className="h-52 w-full overflow-hidden rounded-md sm:h-64">
              <img
                src={project.art}
                alt={`${project.title} preview`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <p className="font-sans text-2xs uppercase tracking-wider text-dim transition-colors duration-500 group-hover:text-paper lg:w-[26ch] lg:text-right">
            {project.tags}
          </p>

          <span className="hidden w-16 shrink-0 font-sans text-2xs uppercase tracking-wider text-dim transition-colors duration-500 group-hover:text-paper lg:block lg:text-right">
            {project.year}
          </span>

          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-hairStrong transition-all duration-500 ease-soft group-hover:rotate-45 group-hover:border-paper group-hover:bg-paper group-hover:text-ink">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 13L13 3M13 3H5.5M13 3V10.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {/* Blurb, revealed on hover */}
        <div
          className={`relative z-10 grid transition-all duration-500 ease-soft ${
            active ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <p className="overflow-hidden pl-0 font-sans text-sm text-paper/80 lg:pl-[6.5rem]">
            {project.blurb}
          </p>
        </div>
      </a>
    </motion.li>
  );
}

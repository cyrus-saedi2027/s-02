import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { MarqueeLabel } from "../ui/MarqueeLabel";
import { MaskLine, Reveal } from "../ui/Reveal";
import { MagneticButton } from "../ui/MagneticButton";
import { FeatureRows } from "./FeatureRow";
import { gallery, featuredProjects } from "@/data/site";
import { useReducedMotion } from "@/hooks/useMediaQuery";

/**
 * The long-form counterpart to the works index: a selection of projects gets a
 * full row each, then a gallery closes the section out.
 *
 * Only the featured four appear here. The whole list lives on /projects, which
 * is what the button at the top of the section opens.
 */
export function CaseStudies() {
  return (
    <section id="case-studies" className="relative py-24 md:py-36">
      <div className="shell">
        <div className="mb-16 flex flex-col gap-8 md:mb-24 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal className="mb-6">
              <MarqueeLabel text="Case studies" />
            </Reveal>
            <h2 className="text-[clamp(2.75rem,7vw,7.5rem)] font-medium leading-[0.9] tracking-tighter">
              <MaskLine>In</MaskLine>
              <MaskLine delay={0.08} className="text-dimmer">
                Detail
              </MaskLine>
            </h2>
          </div>
          <Reveal delay={0.2}>
            <MagneticButton label="View all works" href="/projects" variant="outline" />
          </Reveal>
        </div>
      </div>

      <FeatureRows items={featuredProjects} />

      <GalleryWall />
    </section>
  );
}

/**
 * Closing gallery. The wall starts pushed up against the viewer and settles
 * back as the section scrolls, with the middle column running against the
 * outer two so the grid never moves as one slab.
 *
 * The wall is deliberately taller than the window it is seen through, so even
 * at rest it overflows the mask and the columns' parallax can never open a gap
 * at the top or bottom. Centring is done by the parent rather than a transform,
 * because Framer writes the whole `transform` property when it animates scale
 * and would drop a translate applied alongside it.
 */
function GalleryWall() {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });
  // As in FeatureRow: the spring keeps moving after the scroll stops, so under
  // a reduced-motion preference the raw progress is read and the wall holds
  // still at the size and offset it settles to.
  const calm = useReducedMotion();
  const smoothed = useSpring(scrollYProgress, { stiffness: 80, damping: 26, restDelta: 0.001 });
  const p = calm ? scrollYProgress : smoothed;

  const scale = useTransform(p, [0, 1], calm ? [1, 1] : [1.5, 1]);
  const outer = useTransform(p, [0, 1], calm ? [0, 0] : [40, -40]);
  const middle = useTransform(p, [0, 1], calm ? [0, 0] : [-70, 90]);

  // Four tiles per column keeps every column full at any offset.
  const columns = [
    [gallery[0], gallery[3], gallery[6], gallery[1]],
    [gallery[1], gallery[4], gallery[7], gallery[2]],
    [gallery[2], gallery[5], gallery[8], gallery[0]],
  ];

  return (
    <div ref={track} className="relative mt-28 h-[220vh] md:mt-40">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="absolute inset-0 grid place-items-center"
          style={{
            maskImage: "linear-gradient(to bottom, #000 0%, #000 46%, transparent 94%)",
            WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 46%, transparent 94%)",
          }}
        >
          <motion.div
            style={{ scale }}
            className="grid h-[150vh] w-full max-w-[1600px] grid-cols-3 gap-3 px-3 will-change-transform md:gap-5 md:px-5"
          >
            {columns.map((col, i) => (
              <motion.div
                key={i}
                style={{ y: i === 1 ? middle : outer }}
                className="flex min-h-0 flex-col gap-3 will-change-transform md:gap-5"
              >
                {col.map((src, j) => (
                  <figure
                    key={`${src}-${j}`}
                    className="min-h-0 flex-1 overflow-hidden rounded-lg"
                  >
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </figure>
                ))}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

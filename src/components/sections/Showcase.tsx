import { Reveal, MaskLine, RevealGroup, RevealItem } from "../ui/Reveal";
import { MarqueeLabel } from "../ui/MarqueeLabel";
import { ParallaxImage } from "../ui/ParallaxImage";
import { showcase } from "@/data/site";

/**
 * The archive wall: six framed plates on a layer of their own.
 *
 * The page stops being continuous here. `ShowcaseLayer` pins the section above
 * it and lets this one ride up over it, so the wall arrives as a sheet laid
 * over the page rather than as the next thing in the column — which is why it
 * carries its own opaque ground, a lit top edge and a shadow cast upward.
 */
export function Showcase() {
  return (
    <section
      id="archive"
      /* will-change: the sheet gets its own compositing layer. It and the
         pinned section below move relative to each other, so without one the
         browser re-rasters their whole overlap — the viewport — every frame. */
      className="relative z-10 rounded-t-[1.75rem] border-t border-hairStrong bg-ink [will-change:transform]"
    >
      {/* The shadow the sheet casts on what it covers. A painted gradient, not a
          box-shadow: an 80px blur radius spanning the viewport has to be
          re-rastered on every frame the sheet moves, and it moves the whole
          way up. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-full h-24 bg-gradient-to-t from-ink/85 to-transparent"
      />

      {/* A hairline of light along the edge, so the seam reads at any scroll. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[1.75rem] bg-gradient-to-r from-transparent via-paper/25 to-transparent"
      />

      <div className="shell py-24 md:py-32">
        <div className="mb-14 md:mb-20">
          <Reveal className="mb-6">
            <MarqueeLabel text={showcase.eyebrow} />
          </Reveal>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[clamp(2.75rem,7vw,7.5rem)] font-medium leading-[0.9] tracking-tighter">
              <MaskLine>{showcase.lines[0]}</MaskLine>
              <MaskLine delay={0.08} className="text-dimmer">
                {showcase.lines[1]}
              </MaskLine>
            </h2>
            <Reveal delay={0.2}>
              <p className="max-w-sm font-sans text-sm leading-relaxed text-dim">
                {showcase.blurb}
              </p>
            </Reveal>
          </div>
        </div>

        <RevealGroup
          className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3"
          stagger={0.08}
        >
          {showcase.items.map((item) => (
            <RevealItem key={item.n}>
              <Plate {...item} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/** One framed plate: a bordered box, the art inside it, caption underneath. */
function Plate({
  n,
  title,
  meta,
  art,
}: {
  n: string;
  title: string;
  meta: string;
  art: string;
}) {
  return (
    <figure className="group">
      <div className="relative overflow-hidden rounded-lg border border-hair bg-surface transition-colors duration-500 group-hover:border-hairStrong">
        <ParallaxImage
          src={art}
          alt=""
          className="aspect-[4/3] w-full"
          scale={1.1}
          shift={6}
          stiffness={80}
          damping={22}
        />
        {/* Plain type over a shadow rather than a blend mode: blending makes the
            compositor read back what is behind the label on every frame. */}
        <span className="pointer-events-none absolute left-4 top-4 font-sans text-2xs font-semibold tracking-wider text-paper/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
          {n}
        </span>
      </div>
      <figcaption className="mt-4 flex items-baseline justify-between gap-4">
        <span className="truncate font-sans text-sm font-medium transition-colors duration-500 group-hover:text-accent">
          {title}
        </span>
        <span className="shrink-0 font-sans text-2xs uppercase tracking-wider text-dim">
          {meta}
        </span>
      </figcaption>
    </figure>
  );
}

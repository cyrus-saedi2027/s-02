import { motion } from "framer-motion";
import { GLASS_BLUR, GLASS_SATURATE } from "@/lib/glass";

/**
 * The frosted band behind the header.
 *
 * It has no edge: the glass is fully dense at the very top of the page and has
 * run out just below the menu caption, so the page seems to surface out of it
 * rather than to cross a line.
 *
 * That gradient is why it is stacked layers instead of one blurred box with a
 * fade. Fading a single uniform blur leaves the sharp page showing through its
 * own blurred copy — a visible double image. Stacking instead lets each layer
 * blur what the layer beneath it already produced, so the blur itself deepens
 * toward the top.
 *
 * Two layers, not more. Each one is a full-width backdrop filter that the
 * compositor re-rasters on every frame the page moves under it, and that cost
 * lands hardest exactly where the page is busiest. Blurs compose in
 * quadrature, so the pair still meets GLASS_BLUR where they overlap:
 * sqrt(0.90² + 0.44²) ≈ 1.00.
 */
const LAYERS = [
  // ratio of GLASS_BLUR, mask stop where the layer is still solid, stop where it is gone
  { blur: 0.44, hold: "46%", gone: "100%" },
  { blur: 0.9, hold: "14%", gone: "56%" },
] as const;

export function TopGlass({ hidden = false }: { hidden?: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[4.75rem] md:h-[5.5rem]"
      initial={false}
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {LAYERS.map(({ blur, hold, gone }) => {
        const mask = `linear-gradient(to bottom, #000 0%, #000 ${hold}, transparent ${gone})`;
        return (
          <div
            key={blur}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${(GLASS_BLUR * blur).toFixed(1)}px) saturate(${GLASS_SATURATE})`,
              WebkitBackdropFilter: `blur(${(GLASS_BLUR * blur).toFixed(1)}px) saturate(${GLASS_SATURATE})`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}

      {/* A little ground under the wordmark and links, fading out with the blur. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(6,6,8,0.5) 0%, rgba(6,6,8,0.2) 46%, rgba(6,6,8,0) 100%)",
        }}
      />
    </motion.div>
  );
}

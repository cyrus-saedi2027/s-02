import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * An image that drifts toward the pointer inside its own frame.
 *
 * The picture is scaled a little past the frame and the pointer nudges it
 * around inside that overhang. Keep `shift` well under the overhang, which is
 * `size * (scale - 1) / 2`, or the image pulls away from its own edges.
 *
 * The scale is applied through Framer alongside x/y on purpose: animating a
 * transform there writes the whole `transform` property, so a Tailwind scale
 * class would be silently dropped and the image would shift with no overhang
 * to shift within.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  scale = 1.08,
  shift = 9,
  /** Lower stiffness reads as a slower, softer drift. */
  stiffness = 120,
  damping = 20,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  scale?: number;
  shift?: number;
  stiffness?: number;
  damping?: number;
}) {
  const box = useRef<HTMLDivElement>(null);

  // -0.5 .. 0.5 across the frame in each axis.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const spring = { stiffness, damping, mass: 0.7 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const x = useTransform(sx, [-0.5, 0.5], [shift, -shift]);
  const y = useTransform(sy, [-0.5, 0.5], [shift * 1.2, -shift * 1.2]);

  const onMove = (e: React.MouseEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={box}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn("overflow-hidden", className)}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ x, y, scale }}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}

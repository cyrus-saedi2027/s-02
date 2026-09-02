import { useRef, type RefObject } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/** How far past its frame the plate starts, before scroll pulls it back. */
export const START_SCALE = 1.7;

/**
 * A plate that starts cropped and pulls back to full as the page rises.
 *
 * The pull-back is timed against when the plate is actually in frame, not
 * against its arrival. Ending it at `start start` — one viewport of scroll —
 * put the plate at full size slightly *before* its bottom edge had cleared the
 * screen, so the whole pull-back happened while it was still cut off and there
 * was nothing left to watch by the time you could see all of it. Ending three
 * quarters down the screen spends the last stretch of it, 1.15 back to 1.0,
 * over the window where the plate is wholly visible. After that it holds:
 * `useTransform` clamps at the ends of its range, so nothing else is needed.
 *
 * `track` exists for the sticky layouts. Where the plate is pinned beside a
 * long ledger it barely moves itself, so its own box is a poor clock — those
 * callers hand in the surrounding section instead.
 */
export function ZoomPlate({
  src,
  alt,
  className,
  imgClassName,
  track,
  from = START_SCALE,
  offset = ["start end", "end 75%"],
  loading = "lazy",
}: {
  src: string;
  alt: string;
  /** The frame. Needs its own aspect ratio and `overflow-hidden` comes free. */
  className?: string;
  imgClassName?: string;
  track?: RefObject<HTMLElement>;
  from?: number;
  offset?: [string, string];
  loading?: "lazy" | "eager";
}) {
  const self = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: track ?? self,
    offset: offset as never,
  });
  const scale = useTransform(scrollYProgress, [0, 1], [from, 1]);

  return (
    <div ref={self} className={cn("overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        style={{ scale }}
        className={cn("h-full w-full object-cover will-change-transform", imgClassName)}
      />
    </div>
  );
}

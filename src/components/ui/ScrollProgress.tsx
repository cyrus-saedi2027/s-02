import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Scroll indicator pinned to the right edge, vertically centred.
 *
 * It stays out of the way until you actually scroll: hidden at the top of the
 * page, fading in on movement and back out about a second after you stop. The
 * accent fill grows downward with progress and empties again on the way back
 * up.
 */
export function ScrollProgress({
  /** Page offset before the indicator is allowed to appear at all. */
  revealAfter = 120,
  /** Idle time before it fades back out. */
  hideDelay = 1100,
}: {
  revealAfter?: number;
  hideDelay?: number;
}) {
  const { scrollYProgress, scrollY } = useScroll();
  const fill = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    restDelta: 0.0005,
  });

  const [visible, setVisible] = useState(false);
  const timer = useRef<number>();

  useEffect(() => {
    const onScroll = () => {
      window.clearTimeout(timer.current);
      if (window.scrollY <= revealAfter) {
        setVisible(false);
        return;
      }
      setVisible(true);
      timer.current = window.setTimeout(() => setVisible(false), hideDelay);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer.current);
    };
  }, [revealAfter, hideDelay, scrollY]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed right-5 top-1/2 z-[65] hidden h-[clamp(110px,15vh,170px)] w-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-paper/15 md:block"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.span
        className="block h-full w-full rounded-full bg-accent"
        style={{ scaleY: fill, originY: 0 }}
      />
    </motion.div>
  );
}

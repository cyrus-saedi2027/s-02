import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

const EASE = [0.76, 0, 0.24, 1] as const;
const LETTERS = ["Z", "A", "Y", "L", "A"];

/**
 * Intro curtain: the name assembles letter by letter while a counter runs to
 * 100, then the whole panel lifts away and unlocks the page.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(true);
  const [released, setReleased] = useState(false);

  /**
   * Balanced against this effect rather than against `finish`, so a remount
   * (React's development double-invoke) cannot leave the page locked.
   *
   * It releases when the counter lands, not when the curtain has finished
   * lifting. Unlocking means taking `overflow: hidden` off the root, which
   * re-lays out the whole document — 85ms on the home page — and doing that as
   * the curtain cleared put a stutter on the first frames of the page proper.
   * Released here it lands in the still beat before the lift, under a curtain
   * that is still opaque and not yet moving, where nothing can show. Scrolling
   * in that window is harmless: `finish` returns the page to the top anyway.
   */
  useEffect(() => {
    if (released) return;
    lockScroll();
    return unlockScroll;
  }, [released]);

  useEffect(() => {
    const started = performance.now();
    const DURATION = 1900;

    let frame = 0;
    let close = 0;
    const tick = () => {
      const t = Math.min(1, (performance.now() - started) / DURATION);
      // Ease-out so the counter decelerates into 100.
      setCount(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        // Release the scroll here, in the beat before the lift, so the relayout
        // that costs happens while the curtain is still still.
        setReleased(true);
        close = window.setTimeout(() => setOpen(false), 320);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(close);
    };
  }, []);

  const finish = () => {
    // Whatever happened while the curtain was up, the site opens at the top.
    window.scrollTo(0, 0);
    onDone();
  };

  return (
    <AnimatePresence onExitComplete={finish}>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col justify-between bg-ink px-[var(--shell-x)] py-8"
          exit={{ y: "-100%" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div className="flex items-start justify-between">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-sans text-2xs uppercase tracking-wider text-dim"
            >
              Portfolio — 2025
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-sans text-2xs uppercase tracking-wider text-dim"
            >
              Amsterdam, NL
            </motion.span>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="flex">
              {LETTERS.map((l, i) => (
                <span key={i} className="clip-line">
                  <motion.span
                    className="block text-[clamp(3.5rem,14vw,11rem)] font-semibold leading-none tracking-tighter"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.9, delay: 0.12 + i * 0.075, ease: EASE }}
                  >
                    {l}
                  </motion.span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="font-sans text-2xs uppercase tracking-wider text-dim"
            >
              Loading assets
            </motion.span>
            <span className="text-[clamp(2rem,7vw,4.5rem)] font-medium leading-none tracking-tighter tabular-nums">
              {count}
              <span className="text-accent">%</span>
            </span>
          </div>

          {/* Progress hairline across the bottom edge. */}
          <motion.span
            className="absolute bottom-0 left-0 h-px bg-accent"
            initial={{ width: "0%" }}
            animate={{ width: `${count}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

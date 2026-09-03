import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { projects } from "@/data/site";

const EASE = [0.76, 0, 0.24, 1] as const;
const LETTERS = ["Z", "A", "Y", "L", "A"];

/**
 * The work, named, while the counter runs.
 *
 * Read from the project list rather than written out here, so a project added
 * to the site appears in the intro without anybody remembering to come back
 * for it. Seven names across the count is one every 270ms — long enough to
 * read, short enough that it reads as a list rather than a slideshow.
 */
const NAMES = projects.map((p) => p.title);

/**
 * Intro curtain: the name assembles letter by letter while a counter runs to
 * 100 and the work is named one project at a time, then the whole panel lifts
 * away and unlocks the page.
 *
 * The counter was always here; what the names add is that the wait says
 * something. A visitor who never gets past the fold has still been told what
 * is on the site, and the row of names is where the eye goes because it is the
 * only thing moving under a wordmark that has settled.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(true);
  const [released, setReleased] = useState(false);
  /** Which project is named right now, driven by the same clock as the count. */
  const [named, setNamed] = useState(0);

  /**
   * Where the page was when the curtain let go of it.
   *
   * `finish` used to send the page to the top unconditionally, reasoning that
   * the site should open at the top whatever happened behind the curtain. The
   * trouble is the gap. The scroll is released when the counter lands and the
   * curtain takes another 1.3s to lift, so there is over a second where the
   * page is unlocked and visible and something can legitimately move it: an
   * anchor, focus following a Tab, the browser restoring a position. Sending it
   * to the top after that is a yank, not an opening.
   *
   * Measured: a programmatic scroll to 3501 was back at 0 about a second later.
   * Wheel scrolling never showed it, which is why it went unnoticed — the
   * smooth-scroll hook holds its own target and pulls the page back, so that
   * one case heals itself by accident.
   */
  const releasedAt = useRef(0);

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
      // The names run on the raw clock rather than the eased one: eased, they
      // would crowd at the start and stall at the end, which reads as a stall.
      setNamed(Math.min(NAMES.length - 1, Math.floor(t * NAMES.length)));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        // Release the scroll here, in the beat before the lift, so the relayout
        // that costs happens while the curtain is still still.
        setReleased(true);
        releasedAt.current = window.scrollY;
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
    // The site opens at the top — unless something moved the page while the
    // curtain was up, in which case that was deliberate and this would not be.
    if (Math.abs(window.scrollY - releasedAt.current) < 2) window.scrollTo(0, 0);
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

          <div className="flex flex-1 flex-col items-center justify-center gap-6">
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

            {/* The work, one name at a time.
                A fixed-height window with the names swapped inside it, so the
                wordmark above never moves as a longer name arrives — the whole
                point of a curtain is that it holds still. */}
            <div aria-hidden="true" className="h-5 overflow-hidden text-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={named}
                  initial={{ y: "115%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-115%", opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="block font-sans text-2xs font-semibold uppercase tracking-[0.22em] text-accent"
                >
                  {NAMES[named]}
                </motion.span>
              </AnimatePresence>
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

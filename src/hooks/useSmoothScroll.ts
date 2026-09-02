import { useEffect } from "react";

/**
 * Lerp-based smooth scrolling, in the spirit of the reference site's inertial feel.
 * Drives window.scrollTo rather than transforming a wrapper, so `position: sticky`,
 * IntersectionObserver and anchor links all keep working normally.
 */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Touch devices already have momentum scrolling; hijacking it feels worse.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let target = window.scrollY;
    let current = window.scrollY;
    let frame = 0;
    let running = false;

    // Cached, not read per wheel event. `scrollHeight` is a forced synchronous
    // layout, and during a scroll the tree is always dirty — so reading it on
    // every tick made the page pay for a full layout per wheel event, which is
    // felt most over a tall `position: sticky` subtree. A ResizeObserver on the
    // root keeps the number honest as sections reveal and images settle.
    //
    // The first value comes from that observer rather than from a read here.
    // This hook is enabled the moment the preloader finishes lifting, and on a
    // document this tall the read costs ~35ms — landing on the one frame where
    // the curtain is clearing and the hero is starting to move, which showed as
    // a stutter. The observer reports on the next frame regardless, so reading
    // it here only ever bought a single frame of accuracy.
    let limit = Number.POSITIVE_INFINITY;
    const measure = () => {
      limit = document.documentElement.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(limit, target));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);

    const tick = () => {
      current += (target - current) * 0.11;
      if (Math.abs(target - current) < 0.35) {
        current = target;
        running = false;
        window.scrollTo(0, current);
        return;
      }
      window.scrollTo(0, current);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      if (document.documentElement.dataset.locked === "true") return;
      e.preventDefault();
      target = Math.max(0, Math.min(limit, target + e.deltaY));
      start();
    };

    // Keyboard, anchor jumps and programmatic scrolls resync the target.
    const onScroll = () => {
      if (!running) {
        target = window.scrollY;
        current = window.scrollY;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [enabled]);
}

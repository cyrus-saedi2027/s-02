import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Two sections stacked on top of each other instead of end to end: `beneath`
 * plays out in full, holds where it finishes, and `children` then rides up
 * over it as a separate sheet.
 *
 * The pinned box is exactly one viewport tall, and that is the whole trick.
 * Anything else has a part of the section that cannot be on screen during the
 * hold, and which part that is only moves with the arithmetic: pinning at
 * `viewport - height` holds the section by its last line and pushes its
 * heading off the top; clamping that offset to keep the heading pins it early
 * and the end never arrives. Both were tried. A box the size of the screen has
 * no such part — the section catches at `top: 0` with all of it in view — so
 * `beneath` is handed a screen-sized box and is expected to lay itself out
 * inside it. The height is measured rather than written as `100vh`, because on
 * a phone `100vh` is the viewport with the browser's chrome hidden, which is
 * taller than the screen you are actually looking at.
 *
 * `hold` is the beat after that, where the section sits still and complete
 * before the sheet reaches it — and it is exactly how long the section is on
 * screen with nothing over it. It is a balance and not a maximum: the section
 * is pinned for every pixel of it, so a hold much past a screen stops reading
 * as a pause and starts reading as a page that will not move on.
 *
 * Once the sheet covers the viewport the section underneath is hidden
 * outright. It stays in the layout, pinned, with its marquees running, and
 * painting all of that under an opaque cover for the rest of the scroll is the
 * kind of steady waste that reads as a stutter.
 *
 * That flag is read from the sheet's own position on each frame, deliberately.
 * It used to come from an IntersectionObserver on a one-pixel marker at the top
 * of the sheet, and an observer only reports a *crossing*: scroll up past that
 * marker in a single step — a flick, an anchor jump, one frame of the inertial
 * scroller — and it goes from above the viewport to below it without ever
 * intersecting, so nothing fires and the flag stays stuck on. The section then
 * stays hidden with nothing over it, for the rest of the visit. Reading the
 * geometry cannot get stuck: whatever happened between two frames, the answer
 * this frame comes from where the sheet actually is.
 */
export function StackedLayer({
  beneath,
  children,
  hold = "h-[60vh] md:h-[70vh]",
}: {
  beneath: ReactNode;
  children: ReactNode;
  /** Height class for the pause between the two, in viewport units. */
  hold?: string;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const measure = () => setHeight(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    // One rect read per frame while the page is moving, and none when it is
    // not. React bails out when the boolean has not changed, so this settles
    // into two renders per pass.
    let queued = 0;
    const read = () => {
      queued = 0;
      setCovered(el.getBoundingClientRect().top <= 0);
    };
    const onMove = () => {
      if (queued) return;
      queued = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    return () => {
      cancelAnimationFrame(queued);
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
    };
  }, []);

  return (
    <div className="relative">
      <div
        style={{ top: 0, height }}
        className={cn(
          "sticky z-0 [contain:layout_paint]",
          // Before the measurement lands there is no height to give it, and a
          // box of nothing would collapse the layout under it for one frame.
          height === undefined && "h-screen",
          covered && "invisible"
        )}
      >
        {beneath}
      </div>

      <div aria-hidden="true" className={hold} />

      <div ref={sheet} className="relative z-10">
        {children}
      </div>
    </div>
  );
}

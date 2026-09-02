import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Marquee } from "../ui/Marquee";
import { identity } from "@/data/site";

/**
 * The wordmark that closes every page.
 *
 * It is pinned to the bottom of the viewport and painted *behind* the page, so
 * reaching the end of a page slides the page up off it rather than pushing it
 * along. Two things make that work:
 *
 * - The page body is opaque and sits above this on the z axis, so the strip is
 *   covered for the whole scroll until the body's bottom edge clears it.
 * - The spacer below adds exactly the strip's height to the document, which is
 *   the room the page needs in order to travel that far. Measured rather than
 *   guessed: the type is fluid, so the strip is a different height at every
 *   width, and a fixed value would either clip the reveal or leave a gap.
 *
 * The fade at each edge is on the static frame, not the moving track. Masking
 * the track makes the soft edge travel with the text, which reads as a hard cut
 * at the window boundary; masking the frame keeps the fade where the text
 * actually crosses out of view. The ground stays full-bleed underneath it.
 */
export function ClosingMark() {
  const strip = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = strip.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Webfonts land after first paint and Poppins is a good deal taller in the
  // box than the fallback, so the first measurement is short-lived.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => {
      if (live && strip.current) setHeight(strip.current.offsetHeight);
    });
    return () => {
      live = false;
    };
  }, []);

  const fade =
    "linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%)";

  return (
    <>
      <div
        ref={strip}
        className="fixed inset-x-0 bottom-0 z-0 overflow-hidden bg-[linear-gradient(100deg,theme(colors.accent.DEFAULT)_0%,theme(colors.accent.warm)_100%)]"
      >
        <div
          className="py-6 md:py-9"
          style={{ maskImage: fade, WebkitMaskImage: fade }}
        >
          <Marquee duration={40}>
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="flex select-none items-center gap-8 whitespace-nowrap px-8 text-[clamp(3rem,11vw,12.5rem)] font-extrabold leading-none tracking-tighter text-ink"
              >
                {identity.name}
                <span aria-hidden="true">—</span>
              </span>
            ))}
          </Marquee>
        </div>
      </div>

      {/* In flow, and transparent: this is the travel the page needs. */}
      <div aria-hidden="true" style={{ height }} />
    </>
  );
}

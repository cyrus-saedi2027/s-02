import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * One word set edge to edge across its container.
 *
 * The reference draws these headings inside an SVG whose viewBox is the text's
 * own bounding box: the glyphs then scale with the container instead of
 * stepping between breakpoints, so the word touches both margins at every
 * width. This measures that box at runtime rather than hard-coding it, which
 * keeps the fit correct whichever weight of Poppins actually loads — a
 * hard-coded ratio drifts visibly while the webfont is still swapping.
 *
 * Until the measurement lands the SVG is hidden rather than shown at a guessed
 * ratio, so the word never snaps between two sizes on first paint.
 */
export function FitText({
  text,
  className,
  style,
  as: Tag = "h1",
  /** Measured at this size; only the ratio matters, so it never needs tuning. */
  base = 140,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "h1" | "h2" | "div";
  base?: number;
}) {
  const probe = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  const measure = () => {
    const el = probe.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width > 0) setBox({ w: r.width, h: base * 0.85 });
  };

  useLayoutEffect(measure, [text, base]);

  // Webfonts land after first paint, and Poppins is a good deal wider than the
  // fallback — without this the word would settle at the wrong size.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => live && measure());
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, base]);

  const type: React.CSSProperties = {
    fontSize: base,
    lineHeight: "0.85em",
    letterSpacing: "-0.04em",
    fontWeight: 700,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    margin: 0,
  };

  return (
    <>
      {/* Off-screen twin, measured for the viewBox. */}
      <span
        ref={probe}
        aria-hidden="true"
        className="pointer-events-none invisible fixed left-0 top-0 block font-display"
        style={{ ...type, contain: "layout paint" }}
      >
        {text}
      </span>

      <svg
        viewBox={box ? `0 0 ${box.w} ${box.h}` : undefined}
        className={cn("block w-full", !box && "invisible", className)}
        style={box ? undefined : { height: 0 }}
        role="img"
        aria-label={text}
      >
        <foreignObject width="100%" height="100%" style={{ overflow: "visible" }}>
          <Tag className="font-display" style={{ ...type, ...style }}>
            {text}
          </Tag>
        </foreignObject>
      </svg>
    </>
  );
}

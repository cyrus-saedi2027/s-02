import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * A figure that runs up from zero the first time it is seen.
 *
 * The digits are tabular and the box is sized by an invisible copy of the
 * final value, so the card never reflows as the number grows past a digit
 * boundary — the reference does the same, and without it the label under a
 * two-digit count visibly jumps when the third digit lands.
 */
export function CountUp({
  to,
  suffix = "",
  duration = 1.6,
  className,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / (duration * 1000));
      // Decelerating, so the last few counts land slowly enough to read.
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: "tabular-nums", fontFeatureSettings: '"tnum" 1, "zero" 1' }}
    >
      {/* Reserves the final width; the live value sits on top of it. */}
      <span className="relative inline-block">
        <span aria-hidden="true" className="invisible">
          {to}
          {suffix}
        </span>
        <span className="absolute inset-0">
          {n}
          {suffix}
        </span>
      </span>
    </span>
  );
}

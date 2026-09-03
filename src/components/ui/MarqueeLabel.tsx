import { cn } from "@/lib/utils";

/**
 * Section eyebrow as a horizontal ticker.
 *
 * The label repeats inside a narrow clipped window, so a word slides out one
 * edge and the next copy enters from the other.
 *
 * The fade lives on the static wrapper, not on the moving track. Masking the
 * track makes the soft edge travel along with the text, which reads as a hard
 * cut at the window boundary; masking the wrapper keeps the fade pinned where
 * the text actually crosses out of view.
 */
export function MarqueeLabel({
  text,
  className,
  duration = 12,
  width = "13rem",
  reverse = false,
}: {
  text: string;
  className?: string;
  /** Seconds for one full cycle. Longer copy wants a longer duration. */
  duration?: number;
  /** Width of the clipped window. */
  width?: string;
  reverse?: boolean;
}) {
  // Four copies keep the track wider than the window at any label length, so
  // the loop never shows a gap.
  const copies = Array.from({ length: 4 });

  const fade =
    "linear-gradient(to right, transparent 0%, #000 22%, #000 78%, transparent 100%)";

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ width, maskImage: fade, WebkitMaskImage: fade }}
    >
      {/* The label, once. `aria-label` on a plain div is not a name a browser
          is obliged to use, and the track carries the text eight times over —
          four copies in each half — so what was actually announced was the
          eyebrow repeated four times. */}
      <span className="sr-only">{text}</span>

      <div
        aria-hidden="true"
        className={cn(
          "flex w-max flex-nowrap",
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        )}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {/* Two halves so translating by -50% lands on an identical frame. */}
        {[0, 1].map((half) => (
          <div key={half} className="flex flex-nowrap" aria-hidden={half === 1}>
            {copies.map((_, i) => (
              <span
                key={i}
                className="flex shrink-0 items-center gap-2 whitespace-nowrap px-1.5 font-sans text-2xs font-semibold uppercase tracking-wider text-accent"
              >
                <span aria-hidden="true">—</span>
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

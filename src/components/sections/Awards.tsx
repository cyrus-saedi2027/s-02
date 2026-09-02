import { useRef } from "react";
import { Reveal, MaskLine, RevealGroup, RevealItem } from "../ui/Reveal";
import { ZoomPlate } from "../ui/ZoomPlate";
import { awards, accolade } from "@/data/site";
import { MarqueeLabel } from "../ui/MarqueeLabel";

/**
 * Recognition. An oversized masthead, then the ledger of organisations beside a
 * plate that starts cropped and pulls back to full as the section rises. The
 * pull-back itself lives in ZoomPlate, clocked off this section rather than the
 * plate, which is pinned and so barely moves on its own.
 */
export function Awards() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section id="awards" ref={ref} className="relative py-16 md:py-20">
      <div className="shell">
        <Reveal className="mb-5">
          <MarqueeLabel text="Recognition" />
        </Reveal>

        {/* Masthead. The year range sits on the last line's baseline. */}
        <div className="mb-10 flex flex-col gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
          <h2 className="text-[clamp(2.75rem,7vw,7.5rem)] font-medium uppercase leading-[0.88] tracking-tighter">
            <MaskLine>Awards &amp;</MaskLine>
            <MaskLine delay={0.08}>Honors</MaskLine>
          </h2>
          <Reveal delay={0.2}>
            <span className="block font-sans text-sm font-medium tracking-wide text-accent md:pb-[0.35em] md:text-base">
              2017 — 2025
            </span>
          </Reveal>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:self-start">
            <ZoomPlate
              src={accolade.src}
              alt={accolade.alt}
              track={ref}
              className="aspect-[8/9] rounded-xl border border-hair bg-surface"
            />
          </div>

          <RevealGroup className="flex flex-col lg:self-center" stagger={0.09}>
            {awards.map((a) => (
              <RevealItem
                key={a.org}
                className="grid grid-cols-1 gap-2 border-t border-hair py-5 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8 md:py-6"
              >
                <h3 className="text-[clamp(1.15rem,2.1vw,1.6rem)] font-semibold uppercase leading-none tracking-tight text-accent">
                  {a.org}
                </h3>
                <ul className="flex flex-col gap-1 sm:text-right">
                  {a.lines.map((l) => (
                    <li
                      key={l}
                      className="font-sans text-2xs font-medium uppercase tracking-wide text-paper/80 md:text-xs"
                    >
                      {l}
                    </li>
                  ))}
                </ul>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

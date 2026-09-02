import { useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { ZoomPlate } from "@/components/ui/ZoomPlate";
import { awards, honors } from "@/data/site";
import { SectionHead } from "./Experience";

/**
 * The recognition ledger: the plate holds the left column while the awards
 * list runs down the right, organisation and citations side by side.
 */
export function Honors() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section ref={ref} className="relative py-20 md:py-28">
      <div className="shell">
        <SectionHead
          eyebrow={honors.eyebrow}
          heading={honors.heading}
          years={honors.years}
        />

        {/* The plate travels with the page. Pinning it needs the ledger beside
            it to be a good deal taller; it is only ~80px taller, so a sticky
            plate caught for a moment and then lurched back into the scroll —
            which is what read as the image suddenly dropping. The reference
            does not pin it either. */}
        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-[minmax(0,30rem)_1fr] lg:gap-16">
          <Reveal className="lg:self-start">
            <ZoomPlate
              src={honors.plate.src}
              alt={honors.plate.alt}
              track={ref}
              className="aspect-[490/590] w-full rounded-[10px]"
            />
          </Reveal>

          <div>
            {awards.map((a, i) => (
              <Reveal
                key={a.org}
                delay={i * 0.06}
                className="grid gap-4 border-b border-hair py-8 last:border-b-0 sm:grid-cols-2 sm:gap-10 md:py-10"
              >
                <h3 className="text-[clamp(1.35rem,2.1vw,1.9rem)] font-medium uppercase leading-[0.9] tracking-snug text-accent">
                  {a.org}
                </h3>
                <ul className="space-y-1.5">
                  {a.lines.map((line) => (
                    <li
                      key={line}
                      className="text-sm font-medium uppercase leading-[1.2] tracking-normalish"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

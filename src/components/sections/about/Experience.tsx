import { AnimatedHeadline } from "@/components/ui/AnimatedText";
import { MarqueeLabel } from "@/components/ui/MarqueeLabel";
import { Reveal } from "@/components/ui/Reveal";
import { experience } from "@/data/site";

/**
 * The work history, as a ruled ledger: period on the left, employer and role
 * on the right, one hairline between each.
 */
export function Experience() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="shell">
        <SectionHead
          eyebrow={experience.eyebrow}
          heading={experience.heading}
          years={experience.years}
        />

        <div className="mt-14 md:mt-20">
          {experience.roles.map((r, i) => (
            <Reveal
              key={r.period}
              delay={i * 0.06}
              className="grid gap-4 border-b border-hair py-9 md:grid-cols-2 md:gap-10 md:py-12"
            >
              <p className="text-md font-medium uppercase leading-[1.1] tracking-normalish text-accent">
                {r.period}
              </p>

              <div>
                <p className="font-sans text-xs uppercase tracking-wide text-accent">
                  <span aria-hidden="true">@ </span>
                  {r.company}
                </p>
                <h3 className="mt-3 text-[clamp(1.35rem,2.1vw,1.9rem)] font-medium uppercase leading-[0.9] tracking-snug">
                  <span aria-hidden="true" className="text-paper/45">
                    —{" "}
                  </span>
                  {r.role}
                </h3>
                <p className="mt-4 max-w-[46ch] text-md font-medium uppercase leading-[1.1] tracking-normalish text-paper/55">
                  {r.blurb}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Shared masthead for the two ledgers on this page: ticker eyebrow, the
 * heading rising character by character, and the span of years sitting on the
 * baseline at the right.
 */
export function SectionHead({
  eyebrow,
  heading,
  years,
}: {
  eyebrow: string;
  heading: string;
  years: string;
}) {
  return (
    <header>
      <Reveal className="mb-8 md:mb-10">
        <MarqueeLabel text={eyebrow} />
      </Reveal>

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <h2 className="max-w-[11ch] text-[clamp(2.75rem,8.35vw,7.5rem)] font-bold uppercase leading-[0.85] tracking-tighter">
          <AnimatedHeadline
            words={heading.split(" ").map((text) => ({ text }))}
            wordClassName="mr-[0.14em]"
            stagger={0.02}
          />
        </h2>
        <p className="pb-2 font-sans text-xs uppercase text-accent">{years}</p>
      </div>
    </header>
  );
}

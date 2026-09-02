import { Reveal } from "@/components/ui/Reveal";
import { RisingText } from "@/components/ui/RisingText";
import { aboutPage, identity } from "@/data/site";

/**
 * The pull quote: an attribution card on the left, an oversized quote mark,
 * and the statement itself rising a character at a time.
 *
 * Characters are staggered rather than words because the reference does the
 * same, and at this size a word-level stagger reads as a series of jumps.
 */
export function Statement() {
  return (
    <section className="relative py-24 md:py-36">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
        <Reveal className="self-start">
          <figcaption className="flex items-center gap-4 not-italic">
            <img
              src={aboutPage.avatar.src}
              alt={aboutPage.avatar.alt}
              className="h-[70px] w-[70px] shrink-0 rounded-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <span className="block">
              <span className="block text-md font-medium uppercase leading-[1.1] tracking-normalish">
                {identity.name}
              </span>
              <span className="mt-1 block font-sans text-xs uppercase text-[#8f8f8f]">
                {identity.role}
              </span>
            </span>
          </figcaption>
        </Reveal>

        <blockquote className="relative">
          <Reveal>
            <span
              aria-hidden="true"
              className="block text-[clamp(3.25rem,5.5vw,5rem)] font-bold leading-[0.55] text-paper"
            >
              &ldquo;
            </span>
          </Reveal>

          <p className="mt-8 text-[clamp(1.6rem,3.05vw,2.75rem)] font-semibold uppercase leading-[1] tracking-tight md:mt-10">
            <RisingText text={aboutPage.statement} />
          </p>
        </blockquote>
      </div>
    </section>
  );
}

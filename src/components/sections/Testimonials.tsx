import { Reveal, MaskLine } from "../ui/Reveal";
import { Marquee } from "../ui/Marquee";
import { testimonials } from "@/data/site";
import { MarqueeLabel } from "../ui/MarqueeLabel";

/**
 * Two counter-scrolling rows of quote cards; hovering pauses the row.
 *
 * Laid out to fill exactly one screen and never more. It is pinned under the
 * archive wall that follows it (see StackedLayer), and it holds still there
 * while the sheet approaches — so any part of it that does not fit the screen
 * is a part nobody ever sees, whichever end that part happens to be. Every
 * vertical measurement here is therefore bounded by `vh` as well as by `rem`:
 * the type, the gaps and the cards all give ground on a short window instead
 * of pushing the heading off the top or the last row off the bottom.
 *
 * The cards get a fixed height for the same reason. Their text varies, and a
 * card that sizes to its longest quote makes the section's height depend on
 * the copy — which is exactly the dependency that has to go.
 */
export function Testimonials() {
  const half = Math.ceil(testimonials.length / 2);
  const rowA = testimonials.slice(0, half);
  const rowB = testimonials.slice(half);

  return (
    <section
      id="testimonials"
      className="relative flex h-full flex-col justify-center overflow-hidden py-[clamp(1rem,4vh,3.5rem)]"
    >
      <div className="shell mb-[clamp(1rem,3.5vh,2rem)]">
        <Reveal className="mb-[clamp(0.5rem,1.5vh,1rem)]">
          <MarqueeLabel text="Testimonials" />
        </Reveal>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
          <h2 className="text-[clamp(1.75rem,min(5vw,7.5vh),4.25rem)] font-medium leading-[0.9] tracking-tighter">
            <MaskLine>Trusted</MaskLine>
            <MaskLine delay={0.08} className="text-dimmer">
              Feedback
            </MaskLine>
          </h2>
          <Reveal delay={0.2}>
            <p className="max-w-sm font-sans text-sm leading-relaxed text-dim">
              A few words from the people whose projects ended up on this page.
            </p>
          </Reveal>
        </div>
      </div>

      <Reveal amount={0.05}>
        <div className="flex flex-col gap-[clamp(0.5rem,1.2vh,0.75rem)]">
          <Marquee duration={62} pauseOnHover fade>
            {rowA.map((t) => (
              <QuoteCard key={t.name} {...t} />
            ))}
          </Marquee>
          <Marquee duration={72} reverse pauseOnHover fade>
            {rowB.map((t) => (
              <QuoteCard key={t.name} {...t} />
            ))}
          </Marquee>
        </div>
      </Reveal>
    </section>
  );
}

function QuoteCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <figure
      data-cursor="drag"
      className="group mx-2 flex h-[clamp(11.5rem,32.5vh,16rem)] w-[80vw] shrink-0 flex-col justify-between overflow-hidden rounded-lg border border-hair bg-surface p-[clamp(0.85rem,2vh,1.5rem)] transition-colors duration-500 hover:border-hairStrong hover:bg-surfaceUp sm:w-[380px] md:w-[420px]"
    >
      {/* The quote is clamped by the line, not by the box. Letting the flex
          box decide its height instead gives a height that is not a whole
          number of lines, and the last one comes out sliced through the
          middle. The count comes down with the window, because on a short
          screen there are fewer lines to spend. */}
      <div>
        <span
          aria-hidden="true"
          className="mb-[clamp(0.25rem,1vh,0.75rem)] block text-xl leading-none text-accent"
        >
          &ldquo;
        </span>
        <blockquote className="line-clamp-2 font-sans text-sm leading-relaxed text-paper/85 [@media(min-height:640px)]:line-clamp-3 [@media(min-height:780px)]:line-clamp-4">
          {quote}
        </blockquote>
      </div>
      <figcaption className="mt-[clamp(0.5rem,1.5vh,1rem)] flex shrink-0 items-center gap-3 border-t border-hair pt-[clamp(0.5rem,1.5vh,1rem)]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairStrong font-sans text-2xs font-semibold tracking-wide transition-colors duration-500 group-hover:border-accent group-hover:bg-accent">
          {initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-sans text-sm font-semibold">{name}</span>
          <span className="block truncate font-sans text-2xs uppercase tracking-wide text-dim">
            {role}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

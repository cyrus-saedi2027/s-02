import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { aboutFigures, aboutNotes } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * The five-card ledger.
 *
 * A four-column grid: the opening figure and the two closing notes take two
 * columns each, the middle pair one apiece. Below `md` everything stacks,
 * because a 330px card is already narrow at desktop width.
 */
export function Ledger() {
  return (
    <section className="relative pb-24 md:pb-36">
      <div className="shell grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {aboutFigures.map((f, i) => (
          <Card
            key={f.index}
            index={f.index}
            span={f.span}
            delay={i * 0.07}
            feature={f.feature}
          >
            <div className="mt-auto">
              <CountUp
                to={f.value}
                suffix={f.suffix}
                className={cn(
                  "block text-[clamp(3.25rem,5vw,4.5rem)] font-semibold leading-none tracking-[-0.1em]",
                  f.feature ? "text-paper" : "text-paper"
                )}
              />
              <p
                className={cn(
                  "mt-5 text-md font-medium uppercase leading-[1.1] tracking-normalish",
                  f.feature ? "text-white/75" : "text-white/60"
                )}
              >
                {f.label}
              </p>
            </div>
          </Card>
        ))}

        {aboutNotes.map((nte, i) => (
          <Card key={nte.index} index={nte.index} span={nte.span} delay={(i + 3) * 0.07}>
            <div className="mt-auto">
              <h3 className="text-[clamp(1.35rem,2.1vw,1.9rem)] font-medium uppercase leading-[0.9] tracking-snug">
                {nte.title}
              </h3>
              <p className="mt-5 max-w-[42ch] text-md font-medium uppercase leading-[1.1] tracking-normalish text-white/60">
                {nte.body}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Card({
  index,
  span,
  delay,
  feature,
  children,
}: {
  index: string;
  span: 1 | 2;
  delay: number;
  feature?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Reveal
      delay={delay}
      className={cn(
        span === 2 && "md:col-span-2",
        // The feature card carries an accent bloom of its own, so it needs room
        // around it — without the isolation the glow lands under its neighbour.
        feature && "isolate"
      )}
    >
      <article
        className={cn(
          "relative flex h-full min-h-[clamp(17rem,26vw,23.75rem)] flex-col rounded-[10px] p-[clamp(1.25rem,2vw,1.75rem)]",
          feature
            ? "bg-[linear-gradient(134deg,#fd321c_0%,#ff8a00_100%)] shadow-[0_0_50px_0_rgba(255,94,39,0.5)]"
            : "bg-surfaceUp"
        )}
      >
        <span
          className={cn(
            "font-sans text-2xs font-semibold uppercase tracking-wider",
            feature ? "text-white/80" : "text-accent"
          )}
        >
          {index}
        </span>
        {children}
      </article>
    </Reveal>
  );
}

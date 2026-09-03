import { motion } from "framer-motion";
import { PageMasthead } from "@/components/sections/PageMasthead";
import { CTA } from "@/components/sections/CTA";
import { longDate } from "@/lib/date";
import { notes } from "@/data/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The index of notes.
 *
 * A list, not a grid of cards. These are pieces of writing and the thing that
 * makes somebody open one is the sentence under the title, so the sentence
 * gets the room — a card layout would crop it to make the tiles line up.
 */
export default function WritingPage({ onBook }: { onBook: () => void }) {
  return (
    <main>
      <PageMasthead title="Writing" />

      <section className="relative py-16 md:py-24">
        <div className="shell">
          <ul className="border-t border-hair">
            {notes.map((n, i) => (
              <motion.li
                key={n.slug}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, ease: EASE, delay: Math.min(i, 3) * 0.06 }}
                className="group border-b border-hair"
              >
                <a
                  href={`/writing/${n.slug}`}
                  data-cursor="read"
                  className="block py-10 md:py-14"
                >
                  <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 font-sans text-2xs uppercase tracking-wider text-dim">
                    <span className="text-accent">{n.topic}</span>
                    <span>{longDate(n.date)}</span>
                    <span>{n.minutes} min</span>
                  </div>

                  <h2 className="mt-5 max-w-[22ch] text-[clamp(1.75rem,4.4vw,3.5rem)] font-medium leading-[1.02] tracking-tighter transition-colors duration-500 group-hover:text-accent">
                    {n.title}
                  </h2>

                  <p className="mt-5 max-w-[62ch] font-sans text-sm leading-relaxed text-dim md:text-base">
                    {n.standfirst}
                  </p>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <CTA onBook={onBook} />
    </main>
  );
}

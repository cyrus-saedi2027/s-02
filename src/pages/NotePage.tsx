import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { RisingText } from "@/components/ui/RisingText";
import { MarqueeLabel } from "@/components/ui/MarqueeLabel";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { CTA } from "@/components/sections/CTA";
import NotFound from "./NotFound";
import { longDate } from "./WritingPage";
import { notes } from "@/data/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * One note.
 *
 * A single measured column — around 68 characters — with everything else out
 * of its way. The rest of this site is built to be looked at; this page is
 * built to be read, and the two want opposite things. No plates, no scroll
 * effects on the body, nothing entering from the side while somebody is
 * halfway through a sentence.
 *
 * The pull quote is the one exception, set large between paragraphs, because
 * it is the sentence the note is actually about.
 */
export default function NotePage({ onBook }: { onBook: () => void }) {
  const { slug } = useParams();
  const i = notes.findIndex((n) => n.slug === slug);
  if (i === -1) return <NotFound onBook={onBook} />;

  const note = notes[i];
  const next = notes[(i + 1) % notes.length];
  // Two thirds of the way down is where a pull quote earns its place: far
  // enough in that the argument is made, early enough to still be a signpost.
  const pullAfter = Math.max(1, Math.floor(note.body.length * 0.66));

  return (
    <main>
      <article>
        <header className="relative pt-[calc(var(--shell-x)+3.5rem)]">
          <div className="shell">
            <Reveal className="mb-6">
              <MarqueeLabel text={note.topic} width="10rem" />
            </Reveal>

            <h1 className="max-w-[20ch] text-[clamp(2.25rem,6vw,5rem)] font-medium leading-[0.98] tracking-tighter">
              <RisingText text={note.title} stagger={0.01} />
            </h1>

            <p className="mt-8 max-w-[52ch] text-[clamp(1.1rem,1.9vw,1.5rem)] font-medium leading-[1.45] text-paper/80">
              {note.standfirst}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-hair pt-6 font-sans text-2xs uppercase tracking-wider text-dim">
              <span>{longDate(note.date)}</span>
              <span>{note.minutes} min read</span>
            </div>
          </div>
        </header>

        <div className="shell py-14 md:py-20">
          <div className="max-w-[68ch]">
            {note.body.map((paragraph, n) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <p className="font-sans text-base leading-[1.75] text-paper/75 md:text-lg md:leading-[1.7]">
                  {paragraph}
                </p>

                {n === pullAfter - 1 && (
                  <p className="my-12 border-l-2 border-accent pl-6 text-[clamp(1.25rem,2.4vw,1.9rem)] font-medium leading-[1.3] tracking-tight text-paper md:my-16 md:pl-10">
                    {note.pull}
                  </p>
                )}

                {n !== note.body.length - 1 && n !== pullAfter - 1 && (
                  <div className="h-7 md:h-8" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <footer className="shell pb-20 md:pb-28">
          <div className="flex flex-wrap items-center gap-4 border-t border-hair pt-10">
            <MagneticButton label={`Next: ${next.title}`} href={`/writing/${next.slug}`} variant="accent" />
            <MagneticButton label="All writing" href="/writing" variant="outline" />
          </div>
        </footer>
      </article>

      <CTA onBook={onBook} />
    </main>
  );
}

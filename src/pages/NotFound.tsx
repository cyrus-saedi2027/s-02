import { motion } from "framer-motion";
import { FitText } from "@/components/ui/FitText";
import { RisingText } from "@/components/ui/RisingText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { MarqueeLabel } from "@/components/ui/MarqueeLabel";
import { navLinks } from "@/data/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * What an unrecognised URL gets.
 *
 * It used to get the home page. That is worse than it sounds: a mistyped or
 * dead link would render as if it had worked, so the visitor had no way of
 * knowing they were not where they meant to be — and no reason to check the
 * address. This says what happened and offers the five places they might have
 * been going.
 *
 * Built out of the same masthead the other pages open on, so a wrong turn
 * still looks like this site rather than like something broken.
 */
export default function NotFound({ onBook }: { onBook: () => void }) {
  return (
    <main>
      <section className="relative pt-[calc(var(--shell-x)+3.5rem)]">
        <div className="shell">
          <Reveal className="mb-6">
            <MarqueeLabel text="Page not found" width="13rem" />
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
          >
            <FitText
              text="404"
              style={{
                backgroundImage: "linear-gradient(273deg, #ff8a00 0%, #fd321c 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            />
          </motion.div>

          <p className="mt-8 max-w-[34ch] text-[clamp(1.15rem,1.9vw,1.6rem)] font-medium uppercase leading-[1.15] tracking-snug text-white/55 md:mt-10">
            <RisingText text="There is nothing at this address. It may have moved, or the link may have been wrong to begin with." />
          </p>

          <nav aria-label="Go somewhere that exists" className="mt-14 md:mt-20">
            <ul className="flex flex-col gap-4 border-t border-hair pt-10 sm:flex-row sm:flex-wrap sm:gap-8">
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.3 + i * 0.06 }}
                >
                  <a
                    href={l.href}
                    className="text-[clamp(1.5rem,3.2vw,2.5rem)] font-medium leading-none tracking-tighter transition-colors duration-300 hover:text-accent"
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="mt-14 flex flex-wrap gap-4 pb-24 md:mt-20 md:pb-32">
            <MagneticButton label="Back to the work" href="/projects" variant="accent" />
            <MagneticButton
              label="Book a call"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                onBook();
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

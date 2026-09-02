import { motion } from "framer-motion";
import { FitText } from "@/components/ui/FitText";
import { RisingText } from "@/components/ui/RisingText";

/**
 * How every page other than the home page opens: one word set edge to edge in
 * the accent ramp, with a line of standfirst under it.
 *
 * The word is not revealed on scroll — it is already on screen when the page
 * arrives, so it plays on mount instead, timed to land just after the wipe
 * hands over.
 */
export function PageMasthead({
  title,
  intro,
  className,
}: {
  title: string;
  intro?: string;
  className?: string;
}) {
  return (
    <section className={className ?? "relative pt-[calc(var(--shell-x)+3.5rem)]"}>
      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          <FitText
            text={title}
            style={{
              backgroundImage: `linear-gradient(273deg, rgb(var(--c-accent-warm)) 0%, rgb(var(--c-accent)) 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          />
        </motion.div>

        {intro && (
          <p className="mt-8 max-w-[38ch] text-[clamp(1.15rem,1.9vw,1.6rem)] font-medium uppercase leading-[1.15] tracking-snug text-paper/55 md:mt-10">
            <RisingText text={intro} />
          </p>
        )}
      </div>
    </section>
  );
}

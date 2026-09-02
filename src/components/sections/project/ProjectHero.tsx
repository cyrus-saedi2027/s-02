import { motion } from "framer-motion";
import { RisingText } from "@/components/ui/RisingText";
import type { Project } from "@/data/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * How a project page opens: the cover full-bleed, the title over it, and the
 * facts of the job in a rule underneath.
 *
 * The cover carries `view-transition-name: project-cover`, which is what lets
 * the same plate in the index grow into this one rather than the page cutting.
 * The name has to be unique in the document at any moment, so only ever one
 * plate wears it — the index gives it to the row being opened and takes it
 * back afterwards.
 */
export function ProjectHero({ project }: { project: Project }) {
  return (
    <section className="relative pt-[calc(var(--shell-x)+3.5rem)]">
      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative overflow-hidden rounded-2xl"
          style={{ viewTransitionName: "project-cover" }}
        >
          <img
            src={project.cover}
            alt={`${project.title} — cover artwork`}
            className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]"
          />
          {/* The title sits on the plate, so it needs the plate darkened
              underneath it rather than a scrim over the whole thing. */}
          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.82),transparent)] p-6 pt-24 md:p-10 md:pt-32">
            <p className="font-sans text-2xs font-semibold uppercase tracking-wider text-accent">
              {project.index} — {project.year}
            </p>
            <h1 className="mt-3 text-[clamp(2.5rem,8vw,7rem)] font-medium leading-[0.9] tracking-tighter">
              {project.title}
            </h1>
          </div>
        </motion.div>

        <p className="mt-10 max-w-[24ch] text-[clamp(1.5rem,3.4vw,2.75rem)] font-medium leading-[1.15] tracking-snug md:mt-14">
          <RisingText text={project.lede} />
        </p>

        <dl className="mt-12 grid gap-8 border-t border-hair pt-8 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
          {[
            ["Client", project.client],
            ["Role", project.role],
            ["Disciplines", project.tags],
            ["Duration", project.duration],
          ].map(([label, value], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
            >
              <dt className="font-sans text-2xs uppercase tracking-wider text-dim">
                {label}
              </dt>
              <dd className="mt-2 font-sans text-sm leading-relaxed">{value}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}

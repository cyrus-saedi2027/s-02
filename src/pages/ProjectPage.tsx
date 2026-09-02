import { useParams } from "react-router-dom";
import { ProjectHero } from "@/components/sections/project/ProjectHero";
import {
  ProjectProblem,
  ProjectChapters,
  ProjectOutcome,
  ProjectNext,
} from "@/components/sections/project/ProjectBody";
import { CTA } from "@/components/sections/CTA";
import { projects } from "@/data/site";

/**
 * One project, in full.
 *
 * An unknown slug renders nothing rather than guessing at a project — the
 * router's catch-all decides what an unrecognised URL should look like, and
 * quietly showing the wrong case study would be worse than showing none.
 */
export default function ProjectPage({ onBook }: { onBook: () => void }) {
  const { slug } = useParams();
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return null;

  const project = projects[i];
  // Wraps, so the last project sends you back to the first rather than
  // dead-ending the reader at the bottom of the set.
  const next = projects[(i + 1) % projects.length];

  return (
    <main>
      <ProjectHero project={project} />
      <ProjectProblem project={project} />
      <ProjectChapters project={project} />
      <ProjectOutcome project={project} />
      <ProjectNext next={next} />
      <CTA onBook={onBook} />
    </main>
  );
}

import { useParams } from "react-router-dom";
import { ProjectHero } from "@/components/sections/project/ProjectHero";
import {
  ProjectProblem,
  ProjectChapters,
  ProjectOutcome,
  ProjectNext,
} from "@/components/sections/project/ProjectBody";
import { CTA } from "@/components/sections/CTA";
import NotFound from "./NotFound";
import { projects } from "@/data/site";

/**
 * One project, in full.
 *
 * `/projects/anything` matches this route, so an unknown slug lands here
 * rather than at the router's catch-all — and has to answer for itself. It
 * renders the 404 directly. Returning null, which is what it did before there
 * was a 404 to render, left a blank page: no work, no explanation, and a title
 * that said the page was not found while the body said nothing at all.
 */
export default function ProjectPage({ onBook }: { onBook: () => void }) {
  const { slug } = useParams();
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return <NotFound onBook={onBook} />;

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

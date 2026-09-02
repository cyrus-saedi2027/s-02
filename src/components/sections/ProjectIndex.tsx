import { FeatureRows } from "./FeatureRow";
import { projects } from "@/data/site";

/**
 * The full projects index.
 *
 * The same row the home page's In Detail section uses, over the whole list
 * rather than the featured four — which is how the reference builds it: one
 * row component, four on the home page and seven here.
 *
 * Each row's button opens that project's own page.
 */
export function ProjectIndex() {
  return (
    <section id="projects" className="relative py-20 md:py-28">
      <FeatureRows items={projects} headingLevel={2} />
    </section>
  );
}

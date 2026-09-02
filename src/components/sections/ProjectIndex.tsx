import { FeatureRows } from "./FeatureRow";
import { projects } from "@/data/site";

/**
 * The full projects index.
 *
 * The same row the home page's In Detail section uses, over the whole list
 * rather than the featured four — which is how the reference builds it: one
 * row component, four on the home page and seven here.
 *
 * The button on each row has nowhere deeper to go from the index, so it opens
 * the booking panel at the foot of the page instead of looping back here.
 */
export function ProjectIndex() {
  return (
    <section id="projects" className="relative py-20 md:py-28">
      <FeatureRows items={projects} href="#contact" headingLevel={2} />
    </section>
  );
}

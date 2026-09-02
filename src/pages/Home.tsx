import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Works } from "@/components/sections/Works";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { Solutions } from "@/components/sections/Solutions";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { Showcase } from "@/components/sections/Showcase";
import { Awards } from "@/components/sections/Awards";
import { CTA } from "@/components/sections/CTA";
import { StackedLayer } from "@/components/ui/StackedLayer";

export default function Home({
  ready,
  onBook,
}: {
  ready: boolean;
  onBook: () => void;
}) {
  return (
    <main>
      <Hero ready={ready} />
      <About />
      <Works />
      <CaseStudies />
      <Solutions />
      <Process />
      {/* The page stops being one column here: the testimonials play out,
          hold for a beat, and the archive wall comes over them as a sheet. */}
      <StackedLayer beneath={<Testimonials />}>
        <Showcase />
      </StackedLayer>

      <Awards />
      <CTA onBook={onBook} />
    </main>
  );
}

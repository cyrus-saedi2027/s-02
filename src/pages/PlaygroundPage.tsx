import { PageMasthead } from "@/components/sections/PageMasthead";
import { Wall } from "@/components/sections/Wall";
import { CTA } from "@/components/sections/CTA";
import { playgroundPage } from "@/data/site";

export default function PlaygroundPage({ onBook }: { onBook: () => void }) {
  return (
    <main>
      <PageMasthead title={playgroundPage.title} />
      <Wall />
      <CTA onBook={onBook} />
    </main>
  );
}

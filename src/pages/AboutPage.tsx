import { Intro } from "@/components/sections/about/Intro";
import { Statement } from "@/components/sections/about/Statement";
import { Ledger } from "@/components/sections/about/Ledger";
import { Experience } from "@/components/sections/about/Experience";
import { Honors } from "@/components/sections/about/Honors";
import { CTA } from "@/components/sections/CTA";

export default function AboutPage({ onBook }: { onBook: () => void }) {
  return (
    <main>
      <Intro />
      <Statement />
      <Ledger />
      <Experience />
      <Honors />
      <CTA onBook={onBook} />
    </main>
  );
}

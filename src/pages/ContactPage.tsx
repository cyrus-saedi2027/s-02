import { PageMasthead } from "@/components/sections/PageMasthead";
import { Enquiry } from "@/components/sections/contact/Enquiry";
import { Faq } from "@/components/sections/contact/Faq";
import { CTA } from "@/components/sections/CTA";
import { contactPage } from "@/data/site";

export default function ContactPage({ onBook }: { onBook: () => void }) {
  return (
    <main>
      <PageMasthead title={contactPage.title} />
      <Enquiry />
      <Faq />
      <CTA onBook={onBook} />
    </main>
  );
}

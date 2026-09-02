import { useState } from "react";
import { HoverStaggerLabel } from "./AnimatedText";
import type { Social } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * One account, in the footer or on the contact page.
 *
 * A configured `href` gets a real link, opened in a new tab and marked as
 * such. An empty one gets plain text — dimmed, not hoverable, not focusable.
 * The alternative, which is what this site shipped with, is a link to `#`: it
 * looks live, takes the click, and does nothing with it. Worse than that on a
 * site whose routes live in the hash, where the browser's default for a bare
 * `#` rewrites the address and drops the reader back on the home page.
 *
 * So there is nothing to configure but the URL. Fill one in and it becomes a
 * link; leave it out and the name still reads, as a fact rather than an offer.
 */
export function SocialLink({
  social,
  className,
}: {
  social: Social;
  className?: string;
}) {
  const [hover, setHover] = useState(false);

  if (!social.href) {
    return (
      <span className={cn("inline-flex text-dimmer", className)}>{social.label}</span>
    );
  }

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "inline-flex transition-colors duration-300 hover:text-accent",
        className
      )}
    >
      <HoverStaggerLabel text={social.label} active={hover} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

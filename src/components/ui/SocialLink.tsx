import { useState } from "react";
import { HoverStaggerLabel } from "./AnimatedText";
import type { Social } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * One account, in the footer or on the contact page.
 *
 * A configured `href` gets a real link, opened in a new tab and marked as
 * such. An empty one is not a link at all — nothing takes the click, and
 * nothing is focusable. A link to `#` was the old behaviour: it looked live,
 * took the click and did nothing with it, and on a site whose routes live in
 * the hash the browser's default for a bare `#` rewrote the address and
 * dropped the reader back on the home page.
 *
 * Both states carry the same letter stagger on hover. Turning it off for the
 * unconfigured ones made them look switched off rather than simply not linked
 * yet, and the stagger is decoration — unlike a pointer or a cursor label, it
 * does not promise that a click will go anywhere.
 *
 * So there is nothing to configure but the URL. Fill one in and the name
 * becomes a link, with no other change anywhere.
 */
export function SocialLink({
  social,
  className,
}: {
  social: Social;
  className?: string;
}) {
  const [hover, setHover] = useState(false);

  const label = <HoverStaggerLabel text={social.label} active={hover} />;
  const watch = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  };

  if (!social.href) {
    return (
      <span {...watch} className={cn("inline-flex text-dimmer", className)}>
        {label}
      </span>
    );
  }

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      {...watch}
      className={cn(
        "inline-flex transition-colors duration-300 hover:text-accent",
        className
      )}
    >
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

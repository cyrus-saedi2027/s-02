import { useState } from "react";
import { Reveal } from "../ui/Reveal";
import { HoverStaggerLabel } from "../ui/AnimatedText";
import { SocialLink } from "../ui/SocialLink";
import { identity, navLinks, socials } from "@/data/site";

export function Footer() {
  const [hover, setHover] = useState<string | null>(null);
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-hair pt-16 md:pt-20">
      <div className="shell">
        <div className="grid gap-12 pb-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Identity */}
          <Reveal className="lg:col-span-2">
            <h3 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-none tracking-tighter">
              {identity.name}
            </h3>
            <p className="mt-3 font-sans text-2xs uppercase tracking-wider text-accent">
              {identity.role}
            </p>
            <address className="mt-8 max-w-xs font-sans text-sm not-italic leading-relaxed text-dim">
              {identity.address}
            </address>
            <a
              href={`mailto:${identity.email}`}
              onMouseEnter={() => setHover("email")}
              onMouseLeave={() => setHover(null)}
              className="mt-6 inline-flex items-center gap-3 font-sans text-2xs font-semibold uppercase tracking-wider"
            >
              <HoverStaggerLabel text="Email me" active={hover === "email"} />
              <span className="h-px w-8 bg-accent" />
            </a>
          </Reveal>

          {/* Sitemap */}
          <Reveal delay={0.08}>
            <p id="footer-sitemap" className="mb-6 font-sans text-2xs uppercase tracking-wider text-dim">
              Sitemap
            </p>
            {/* The only navigation landmark on a page with the menu closed —
                without it the site has no nav at rest. */}
            <nav aria-labelledby="footer-sitemap">
              <ul className="flex flex-col gap-3">
                {navLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      onMouseEnter={() => setHover(l.label)}
                      onMouseLeave={() => setHover(null)}
                      className="inline-flex font-sans text-sm font-medium uppercase tracking-wide transition-colors duration-300 hover:text-accent"
                    >
                      <HoverStaggerLabel text={l.label} active={hover === l.label} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          {/* Socials */}
          <Reveal delay={0.16}>
            <p className="mb-6 font-sans text-2xs uppercase tracking-wider text-dim">Elsewhere</p>
            <ul className="flex flex-col gap-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <SocialLink
                    social={s}
                    className="font-sans text-sm font-medium uppercase tracking-wide"
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="flex flex-col gap-4 border-t border-hair py-7 font-sans text-2xs uppercase tracking-wider text-dim sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} {identity.name}. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Designed &amp; built in Amsterdam
          </span>
          <a href="#top" className="transition-colors hover:text-paper">
            Back to top ↑
          </a>
        </div>
      </div>

    </footer>
  );
}

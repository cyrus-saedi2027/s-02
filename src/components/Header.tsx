import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HoverStaggerLabel } from "./ui/AnimatedText";
import { MenuTrigger } from "./MenuTrigger";

/**
 * Fixed bar: wordmark left, the menu control centred, contact right.
 * It stays pinned for the whole page — the menu trigger lives here, so it has
 * to be reachable at any scroll position.
 */
export function Header({
  onMenu,
  menuOpen,
  ready,
}: {
  onMenu: () => void;
  menuOpen: boolean;
  ready: boolean;
}) {
  const [hoverContact, setHoverContact] = useState(false);
  const [hoverMark, setHoverMark] = useState(false);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: ready ? 1 : 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: ready ? 0.15 : 0 }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[80]"
    >
      <div className="relative flex items-start justify-between px-[var(--shell-x)] py-5 md:py-6">
        <a
          href="#home"
          onMouseEnter={() => setHoverMark(true)}
          onMouseLeave={() => setHoverMark(false)}
          className="pointer-events-auto inline-flex font-sans text-xs font-bold uppercase tracking-wide md:text-base"
        >
          <HoverStaggerLabel text="Zayla" active={hoverMark} />
        </a>

        {/* Centred independently of the flanking items so it never drifts. */}
        <div className="pointer-events-auto absolute left-1/2 top-5 -translate-x-1/2 md:top-6">
          <MenuTrigger open={menuOpen} onToggle={onMenu} />
        </div>

        {/* Contact is one of the menu's own entries, so it steps aside while
            the panel is open rather than sitting on top of it. */}
        <motion.a
          href="/contact"
          onMouseEnter={() => setHoverContact(true)}
          onMouseLeave={() => setHoverContact(false)}
          animate={{ opacity: menuOpen ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          aria-hidden={menuOpen}
          className={cn(
            "inline-flex font-sans text-xs font-bold uppercase tracking-wide md:text-base",
            menuOpen ? "pointer-events-none" : "pointer-events-auto"
          )}
        >
          <HoverStaggerLabel text="Contact" active={hoverContact} />
        </motion.a>
      </div>
    </motion.header>
  );
}

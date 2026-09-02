import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks } from "@/data/site";
import { GLASS_BLUR, GLASS_GRAIN, GLASS_GRAIN_OPACITY, GLASS_SATURATE } from "@/lib/glass";
import { playMenu } from "@/lib/sound";

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Navigation panel that drops from the top edge over roughly half the
 * viewport.
 *
 * Two things keep it smooth. The panel has a fixed height and animates
 * `translateY`, so opening is a composited transform rather than a per-frame
 * layout pass. And the grain is a static tile — an animated element carrying a
 * large `blur()` has to re-rasterise every frame, which is what made the
 * earlier version stutter.
 */
export function MenuOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const panel = useRef<HTMLElement>(null);
  const restoreTo = useRef<Element | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /**
   * Send focus into the panel when it opens and hand it back on close.
   *
   * Not trapped: the panel is deliberately not modal — the page keeps scrolling
   * behind it — so shutting the rest of the document out would misdescribe it.
   * What matters is that a keyboard visitor who opens the menu starts inside it
   * rather than on <body>, several tabs away from the thing they just opened.
   */
  // Both directions, so the panel sounds like one object rather than
  // announcing itself and then leaving in silence.
  useEffect(() => {
    playMenu(open);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement;
    const frame = requestAnimationFrame(() => {
      panel.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(frame);
      (restoreTo.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="fixed inset-0 z-[70] cursor-default bg-ink/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />

          <motion.nav
            ref={panel}
            id="site-menu"
            className="fixed inset-x-0 top-0 z-[72] h-[min(56svh,560px)] overflow-hidden rounded-b-2xl border-b border-paper/10 bg-glass/55"
            style={{
              willChange: "transform",
              backdropFilter: `blur(${GLASS_BLUR}px) saturate(${GLASS_SATURATE})`,
              WebkitBackdropFilter: `blur(${GLASS_BLUR}px) saturate(${GLASS_SATURATE})`,
            }}
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.68, ease: EASE }}
          >
            {/* Fine grain over the glass. The texture is a static tile — it is
                painted once and never animated, so it costs nothing per frame. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 mix-blend-screen"
              style={{
                backgroundImage: GLASS_GRAIN,
                backgroundRepeat: "repeat",
                opacity: GLASS_GRAIN_OPACITY,
              }}
            />

            <div className="relative flex h-full items-center justify-center px-[var(--shell-x)] pt-14">
              <ul className="flex flex-col items-center">
                {navLinks.map((link, i) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={onClose}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      className="block px-4 py-[0.15em]"
                    >
                      <SwapLabel
                        text={link.label}
                        active={hovered === i}
                        delay={0.26 + i * 0.055}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * One nav label. The resting copy rises out of the mask while a tinted copy
 * rises in behind it, each letter a beat after the last.
 */
function SwapLabel({
  text,
  active,
  delay,
}: {
  text: string;
  active: boolean;
  delay: number;
}) {
  const chars = [...text];

  return (
    <motion.span
      className="relative block overflow-hidden text-[clamp(1.05rem,2.6vw,2.1rem)] font-semibold uppercase leading-[1.2] tracking-tight"
      initial={{ y: "110%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      exit={{ y: "110%", opacity: 0 }}
      transition={{ duration: 0.62, delay, ease: EASE }}
    >
      <span className="flex">
        {chars.map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block whitespace-pre will-change-transform"
            animate={{ y: active ? "-105%" : "0%" }}
            transition={{ duration: 0.61, ease: EASE, delay: i * 0.027 }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </span>
      <span className="absolute inset-0 flex text-accent" aria-hidden="true">
        {chars.map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block whitespace-pre will-change-transform"
            initial={{ y: "105%" }}
            animate={{ y: active ? "0%" : "105%" }}
            transition={{ duration: 0.61, ease: EASE, delay: i * 0.027 }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
}

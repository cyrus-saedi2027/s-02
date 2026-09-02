import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  activeTheme,
  setThemeChoice,
  subscribeTheme,
  themeChoice,
  type ThemeChoice,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const ORDER: ThemeChoice[] = ["system", "dark", "light"];
const LABEL: Record<ThemeChoice, string> = {
  system: "Theme: auto",
  dark: "Theme: dark",
  light: "Theme: light",
};

/**
 * Cycles system → dark → light.
 *
 * A single button rather than three, because this is the third control in a
 * row of small print and a segmented group would outweigh everything around
 * it. The mark shows what is on screen — a filled disc for dark, a ring for
 * light — and the label says which of the three states got you there, so
 * "auto" is never mistaken for a fourth appearance.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const choice = useSyncExternalStore(subscribeTheme, themeChoice, () => "system" as ThemeChoice);
  const theme = useSyncExternalStore(subscribeTheme, activeTheme, () => "dark" as const);

  return (
    <button
      type="button"
      onClick={() => setThemeChoice(ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length])}
      aria-label={`${LABEL[choice]}. Change it.`}
      className={cn(
        "group inline-flex items-center gap-3 font-sans text-2xs uppercase tracking-wider text-dim transition-colors duration-300 hover:text-paper",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="grid h-4 w-4 place-items-center rounded-full border border-current"
      >
        <motion.span
          className="rounded-full bg-current"
          animate={theme === "dark" ? { width: 8, height: 8 } : { width: 4, height: 4 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
      {LABEL[choice]}
    </button>
  );
}

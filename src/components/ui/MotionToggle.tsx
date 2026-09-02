import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import {
  motionReducedByChoice,
  setMotionReducedByChoice,
} from "@/lib/motionPreference";
import { cn } from "@/lib/utils";

/**
 * The switch that asks the site to hold still.
 *
 * It disappears when the operating system has already said so: offering to
 * turn motion off to somebody who has turned it off is noise, and offering to
 * turn it back on would be arguing with a decision they made on their own
 * machine.
 *
 * The mark is a dot that drifts when motion is on and sits still when it is
 * not, which means the control demonstrates what it does.
 */
export function MotionToggle({ className }: { className?: string }) {
  const calm = useReducedMotion();
  const chosen = motionReducedByChoice();

  // Reduced but not by the switch means the system asked, so there is nothing
  // here to offer.
  if (calm && !chosen) return null;

  return (
    <button
      type="button"
      onClick={() => setMotionReducedByChoice(!chosen)}
      aria-pressed={chosen}
      aria-label={chosen ? "Allow motion" : "Reduce motion"}
      className={cn(
        "group inline-flex items-center gap-3 font-sans text-2xs uppercase tracking-wider transition-colors duration-300",
        chosen ? "text-paper" : "text-dim hover:text-paper",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="relative flex h-4 w-4 items-center justify-center rounded-full border border-current"
      >
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-current"
          animate={chosen ? { x: 0 } : { x: [-2.5, 2.5, -2.5] }}
          transition={
            chosen
              ? { duration: 0.3 }
              : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
          }
        />
      </span>
      {chosen ? "Motion off" : "Motion on"}
    </button>
  );
}

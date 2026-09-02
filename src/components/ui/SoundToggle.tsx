import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { isSoundEnabled, playMenu, setSoundEnabled, soundWasEnabled } from "@/lib/sound";
import { cn } from "@/lib/utils";

const BARS = [0.35, 0.75, 0.5, 0.95, 0.55];

/**
 * The switch that lets the site make a noise.
 *
 * Five bars that stand still when sound is off and rise and fall when it is
 * on, so the control shows its own state without a label. It sits in the
 * footer rather than the header: this is a preference, not a navigation
 * control, and putting it where the visitor is already reading the small
 * print keeps it from competing with the work.
 */
export function SoundToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(false);

  // The stored preference is only applied once mounted, because switching it
  // on builds an AudioContext and the browser wants that inside a gesture.
  // Restoring it here leaves the context suspended until the first click
  // anywhere, which is the correct and quiet behaviour.
  useEffect(() => {
    if (soundWasEnabled()) {
      setSoundEnabled(true);
      setOn(true);
    }
  }, []);

  const toggle = () => {
    const next = !isSoundEnabled();
    setSoundEnabled(next);
    setOn(next);
    // Play the tick on the way on, so the switch answers in its own currency.
    if (next) playMenu(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      className={cn(
        "group inline-flex items-center gap-3 font-sans text-2xs uppercase tracking-wider transition-colors duration-300",
        on ? "text-paper" : "text-dim hover:text-paper",
        className
      )}
    >
      <span aria-hidden="true" className="flex h-4 items-center gap-[3px]">
        {BARS.map((h, i) => (
          <motion.span
            className="w-[2px] rounded-full bg-current"
            key={i}
            animate={on ? { scaleY: [h, 1, h * 0.6, h] } : { scaleY: 0.28 }}
            transition={
              on
                ? { duration: 1.1 + i * 0.17, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 }
            }
            style={{ height: 16, originY: 0.5 }}
          />
        ))}
      </span>
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}

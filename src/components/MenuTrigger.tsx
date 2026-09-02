import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The menu control: a slim bar centred at the top of the page. It lengthens
 * slightly on hover and its caption swaps between MENU and CLOSE.
 */
export function MenuTrigger({
  open,
  onToggle,
  className,
}: {
  open: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  // The bar has to shrink on narrow screens or it collides with the wordmark
  // and the contact link flanking it.
  const wide = useMediaQuery("(min-width: 768px)");
  const base = wide ? 214 : 104;
  const grown = wide ? 248 : 124;

  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-expanded={open}
      aria-controls="site-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      className={cn(
        "group flex flex-col items-center gap-2 outline-none",
        className
      )}
    >
      <motion.span
        aria-hidden="true"
        className="block h-[5px] rounded-full bg-paper"
        initial={false}
        animate={{ width: hover || open ? grown : base }}
        transition={{ duration: 0.5, ease: EASE }}
      />
      <span className="relative block h-[14px] overflow-hidden font-sans text-[11px] font-medium uppercase tracking-[0.05em] text-paper [text-shadow:0_1px_6px_rgba(0,0,0,0.55)]">
        {/* The two captions ride in the same slot so one pushes the other out. */}
        {/* The stack is two lines tall, so -50% advances it exactly one line.
            -100% would clear the whole stack and show nothing. */}
        <motion.span
          className="block"
          animate={{ y: open ? "-50%" : "0%" }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <span className="block leading-[14px]">Menu</span>
          <span className="block leading-[14px]">Close</span>
        </motion.span>
      </span>
    </button>
  );
}

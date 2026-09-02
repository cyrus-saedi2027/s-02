import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { HoverStaggerLabel } from "./AnimatedText";

/**
 * Pill button that leans toward the pointer and swaps its label with a
 * per-character stagger — the interaction used on every CTA in the reference.
 */
export function MagneticButton({
  label,
  href = "#contact",
  className,
  variant = "solid",
  strength = 0.32,
  icon,
  onClick,
  type,
  disabled,
}: {
  label: string;
  href?: string;
  className?: string;
  variant?: "solid" | "outline" | "accent";
  strength?: number;
  icon?: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  /** Set to make this a real form control rather than a link. */
  type?: "submit" | "button";
  disabled?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
    setHover(false);
  };

  const skin =
    variant === "solid"
      ? "bg-paper text-ink"
      : variant === "accent"
        ? "text-paper"
        : "border border-hairStrong text-paper";

  // A submit button has to be a <button> — an anchor cannot submit a form —
  // but everything else about it is the same, so only the tag changes.
  const Tag = type ? motion.button : motion.a;

  return (
    <Tag
      ref={ref}
      {...(type ? { type, disabled } : { href })}
      onClick={onClick}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={reset}
      data-cursor="hide"
      className={cn(
        "group relative inline-flex select-none items-center gap-3 overflow-hidden rounded-md px-8 py-[18px] font-sans text-2xs font-semibold uppercase tracking-wider transition-colors duration-500 ease-soft",
        skin,
        className
      )}
    >
      {/* The accent button is filled with the site's gradient and answers a
          hover by swelling it rather than wiping over it — a colour wipe on
          top of the gradient would throw the harmony away. The others take
          the wipe rising from the bottom edge. */}
      {variant === "accent" ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(135deg,theme(colors.accent.DEFAULT)_0%,theme(colors.accent.warm)_100%)] transition-transform duration-[800ms] ease-button group-hover:scale-105"
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-soft group-hover:scale-y-100",
            variant === "solid" ? "bg-accent" : "bg-paper"
          )}
        />
      )}
      <span
        className={cn(
          "relative z-10 transition-colors duration-500 ease-soft",
          variant === "solid" && "group-hover:text-paper",
          variant === "outline" && "group-hover:text-ink"
        )}
      >
        <HoverStaggerLabel text={label} active={hover} />
      </span>
      {icon && <span className="relative z-10">{icon}</span>}
    </Tag>
  );
}

/** Circular rotating-text button, as used beside the about copy. */
export function CircleTextButton({
  text,
  href = "#contact",
  className,
  size = 148,
}: {
  text: string;
  href?: string;
  className?: string;
  size?: number;
}) {
  const chars = [...text];
  const step = 360 / chars.length;

  return (
    <a
      href={href}
      data-cursor="hide"
      className={cn(
        "group relative grid shrink-0 place-items-center rounded-full border border-hair transition-colors duration-500 hover:border-accent",
        className
      )}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 animate-spin-slow">
        {chars.map((ch, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 font-sans text-[11px] font-semibold uppercase tracking-wider text-dim transition-colors duration-500 group-hover:text-paper"
            style={{
              transform: `rotate(${i * step}deg) translateY(-${size / 2 - 16}px)`,
              transformOrigin: "0 0",
            }}
          >
            {ch}
          </span>
        ))}
      </span>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-paper text-ink transition-all duration-500 ease-soft group-hover:scale-110 group-hover:bg-accent group-hover:text-paper">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 13L13 3M13 3H5.5M13 3V10.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}

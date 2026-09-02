import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Seamless CSS ticker. The track holds the content twice and translates by
 * exactly -50%, so the loop point is invisible regardless of content width.
 */
export function Marquee({
  children,
  duration = 28,
  reverse = false,
  className,
  trackClassName,
  pauseOnHover = false,
  fade = false,
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
  trackClassName?: string;
  pauseOnHover?: boolean;
  fade?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        fade && "edge-fade-x",
        className
      )}
    >
      <div
        className={cn(
          "flex w-max flex-nowrap items-center",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "hover:[animation-play-state:paused]",
          trackClassName
        )}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className="flex flex-nowrap items-center">{children}</div>
        <div className="flex flex-nowrap items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

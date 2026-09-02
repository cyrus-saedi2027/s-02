import { useEffect, useState, useSyncExternalStore } from "react";
import {
  motionReducedByChoice,
  subscribeMotionPreference,
} from "@/lib/motionPreference";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/**
 * Whether to hold still: the system preference, or the switch in the page.
 *
 * Everything that moves on this site reads this one hook, so the in-page
 * control reaches all of it — the scroll-linked plates, the live previews on
 * the wall, the pointer lean — without any of them knowing the switch exists.
 */
export function useReducedMotion() {
  const system = useMediaQuery("(prefers-reduced-motion: reduce)");
  const chosen = useSyncExternalStore(
    subscribeMotionPreference,
    motionReducedByChoice,
    () => false
  );
  return system || chosen;
}

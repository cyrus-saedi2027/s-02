/**
 * Whether the site should hold still, and who gets to decide.
 *
 * The operating system already answers this through `prefers-reduced-motion`,
 * and that answer is honoured. But plenty of people who would rather this page
 * sat still have never found that setting, or have it on for one machine and
 * not the one they are reading on. So the site carries its own switch, and the
 * two combine: reduced if either says so.
 *
 * Deliberately one-way. The switch can ask for less motion but not for more —
 * overriding a system preference that says "reduce" would be taking a decision
 * back from someone who has already made it, on their own machine.
 */

const KEY = "zayla:motion";

/**
 * The switch has to reach the CSS as well as the components.
 *
 * `@media (prefers-reduced-motion)` answers the operating system and nothing
 * else, so the marquees — which are CSS animations, not Framer ones — kept
 * running after the switch was thrown. Stamping the root lets index.css carry
 * the same rules a second time, keyed on the choice instead of the system.
 */
function stamp(on: boolean) {
  if (typeof document === "undefined") return;
  if (on) document.documentElement.dataset.motion = "reduced";
  else delete document.documentElement.dataset.motion;
}

type Listener = () => void;
const listeners = new Set<Listener>();

let asked = read();
stamp(asked);

function read() {
  try {
    return localStorage.getItem(KEY) === "reduced";
  } catch {
    return false;
  }
}

/** True when the visitor has asked for less motion in the page itself. */
export function motionReducedByChoice() {
  return asked;
}

export function setMotionReducedByChoice(next: boolean) {
  asked = next;
  stamp(next);
  try {
    localStorage.setItem(KEY, next ? "reduced" : "system");
  } catch {
    // Storage blocked. The choice still holds for this visit.
  }
  listeners.forEach((l) => l());
}

export function subscribeMotionPreference(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

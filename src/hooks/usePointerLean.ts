import { useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "./useMediaQuery";

/**
 * The lean the buttons already do, for anything else that wants it.
 *
 * The pointer's distance from the element's centre becomes a small translation
 * toward it, sprung so the piece keeps moving for a moment after the hand
 * stops. `MagneticButton` has carried this since the beginning; putting the
 * same feel on the plates is what ties the two together — the work answers the
 * pointer the way the controls do, rather than the site having one interactive
 * language for buttons and another for everything else.
 *
 * `strength` is the fraction of that distance travelled: the buttons use 0.32,
 * which is right for something 180px wide and far too much for a plate half
 * the screen across.
 *
 * The translation comes with a tilt, and the tilt is what you actually see —
 * a plate turning toward your hand reads where a translation of any size does
 * not. `tilt` is that angle in degrees at the far corner.
 *
 * Both are deliberately small. An earlier pass ran four times these numbers,
 * and at that size the tilt stopped reading as a plate answering the pointer
 * and started reading as the artwork being distorted: a perspective rotation
 * that steep foreshortens the image, and on a cover half the screen wide there
 * is enough of it to see the picture bend. The point is to acknowledge the
 * pointer, not to throw the work around.
 *
 * Returns nothing to bind under a reduced-motion preference: the values stay
 * at zero and the handlers are no-ops, so callers need no branch of their own.
 */
export function usePointerLean(strength = 0.025, tilt = 1.5) {
  const ref = useRef<HTMLElement>(null);
  const calm = useReducedMotion();

  const spring = { stiffness: 150, damping: 20, mass: 0.6 };
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const mrx = useMotionValue(0);
  const mry = useMotionValue(0);

  const x = useSpring(mx, spring);
  const y = useSpring(my, spring);
  const rotateX = useSpring(mrx, spring);
  const rotateY = useSpring(mry, spring);

  const onMouseMove = (e: React.MouseEvent) => {
    if (calm) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    mx.set(dx * strength);
    my.set(dy * strength);
    // Halved because the pointer only ever reaches the edge, not past it, so
    // dividing by the half-width already gives -1..1 across the whole plate.
    mry.set((dx / (r.width / 2)) * tilt);
    mrx.set((-dy / (r.height / 2)) * tilt);
  };

  const onMouseLeave = () => {
    mx.set(0);
    my.set(0);
    mrx.set(0);
    mry.set(0);
  };

  return { ref, x, y, rotateX, rotateY, onMouseMove, onMouseLeave };
}

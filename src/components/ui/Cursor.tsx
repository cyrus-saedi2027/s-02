import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Custom pointer.
 *
 * Two variants ship here — pick one with the `variant` prop on <Cursor/>:
 *
 *   "ring"    a precise dot with a hollow outlined circle trailing behind it,
 *             swelling into a labelled disc over flagged elements.
 *   "comet"   a precise dot sitting at the centre of a filled circle, which
 *             draws out into a tail behind it as the pointer moves.
 *
 * Elements opt into states through `data-cursor`, and the vocabulary is
 * deliberately small: a verb for what the thing under the pointer does, or
 * nothing. Adding one is a line in LOOK below and the attribute on the element.
 */
export type CursorVariant = "ring" | "comet";
type State = "default" | "hide" | "view" | "read" | "drag";

/**
 * What the pointer looks like in each state.
 *
 * One table rather than a chain of ternaries, so a new state cannot be added
 * to the shape and forgotten in the label, or sized in one variant and not the
 * other.
 *
 * The colours are the palette's own variables, which is what makes this work
 * in both themes: `--c-paper` is the foreground and `--c-ink` the ground, so
 * they swap together and the disc is always the opposite of the page. The disc
 * used to be a hard-coded `#ffffff` with dark text — white on white once the
 * light theme existed, which is to say invisible.
 *
 * The accent disc keeps a white label in both themes rather than following the
 * palette: the accent is a saturated red either way, and near-black on it
 * measures 4.2:1 where white measures 5.0:1.
 */
const LOOK: Record<
  State,
  { size: number; border: number; bg: string; label?: string; fg?: string; opacity?: number }
> = {
  default: { size: 34, border: 1, bg: "rgba(255,255,255,0)" },
  hide: { size: 54, border: 1, bg: "rgba(255,255,255,0)", opacity: 0.5 },
  view: { size: 104, border: 0, bg: "rgb(var(--c-accent))", label: "View", fg: "#fff" },
  read: { size: 92, border: 0, bg: "rgb(var(--c-paper))", label: "Read", fg: "rgb(var(--c-ink))" },
  drag: { size: 76, border: 0, bg: "rgb(var(--c-paper))", label: "Drag", fg: "rgb(var(--c-ink))" },
};

/** How often to re-check what sits under the pointer. */
const HIT_TEST_MS = 70;

export function Cursor({ variant = "ring" }: { variant?: CursorVariant }) {
  const fine = useMediaQuery("(pointer: fine)");
  const [state, setState] = useState<State>("default");
  const [visible, setVisible] = useState(false);
  const seen = useRef(false);

  // Raw pointer position. Everything reads these; nothing re-renders on move.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    if (!fine) return;
    document.body.classList.add("has-custom-cursor");

    let lastHitTest = 0;

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!seen.current) {
        seen.current = true;
        setVisible(true);
      }

      // Hit testing is the costly part, so it runs on its own slow cadence
      // instead of once per mouse event.
      const now = performance.now();
      if (now - lastHitTest < HIT_TEST_MS) return;
      lastHitTest = now;

      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const flagged = el?.closest<HTMLElement>("[data-cursor]");
      const next: State = flagged
        ? ((flagged.dataset.cursor as State) ?? "default")
        : el?.closest("a,button,input,textarea,select,[role='button']")
          ? "hide"
          : "default";
      // React bails out on an unchanged value, so this only renders on a real
      // state transition.
      setState(next);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  return (
    <div
      className="site-cursor pointer-events-none fixed inset-0 z-[100] hidden md:block"
      style={{ opacity: visible ? 1 : 0, transition: "opacity .25s" }}
      aria-hidden="true"
    >
      {variant === "comet" ? (
        <CometFollower x={x} y={y} state={state} />
      ) : (
        <>
          <RingFollower x={x} y={y} state={state} />
          <motion.div
            className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-paper"
            style={{ x, y, translateX: "-50%", translateY: "-50%" }}
            animate={{ opacity: LOOK[state].label ? 0 : 1 }}
          />
        </>
      )}
    </div>
  );
}

type MV = ReturnType<typeof useMotionValue<number>>;

/** Hollow circle that lags the dot and swells into a labelled disc. */
function RingFollower({ x, y, state }: { x: MV; y: MV; state: State }) {
  const rx = useSpring(x, { stiffness: 380, damping: 34, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 380, damping: 34, mass: 0.5 });

  const look = LOOK[state];
  const shape = {
    width: look.size,
    height: look.size,
    borderWidth: look.border,
    background: look.bg,
    opacity: look.opacity ?? 1,
  };

  return (
    <motion.div
      className="absolute left-0 top-0 grid place-items-center rounded-full border-paper"
      style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
      animate={shape}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      <CursorLabel state={state} />
    </motion.div>
  );
}

/**
 * Outline wrapping a head circle of radius R centred on the ORIGIN and a tail
 * circle of radius r trailing at -d: the convex hull of the two, being the
 * external tangent lines plus an arc at each end.
 *
 * Anchoring the head at the origin is the whole point — the origin is what
 * gets pinned to the pointer, so the dot always sits at the centre of the
 * round head. With d = 0 it degenerates to a plain circle, so a resting
 * pointer needs no special case.
 */
function taperedCapsule(R: number, r: number, d: number) {
  if (d < 0.001 || d <= Math.abs(R - r)) {
    const b = Math.max(R, r);
    return `M ${-b} 0 a ${b} ${b} 0 1 0 ${b * 2} 0 a ${b} ${b} 0 1 0 ${-b * 2} 0`;
  }
  const phi = Math.PI / 2 + Math.asin((R - r) / d);
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  const p = (n: number) => n.toFixed(2);

  return [
    `M ${p(-R * c)} ${p(R * s)}`,
    `A ${p(R)} ${p(R)} 0 1 0 ${p(-R * c)} ${p(-R * s)}`,
    `L ${p(-d - r * c)} ${p(-r * s)}`,
    `A ${p(r)} ${p(r)} 0 0 0 ${p(-d - r * c)} ${p(r * s)}`,
    "Z",
  ].join(" ");
}

/** The comet's head radius per state — half the ring's diameter, near enough. */
const BASE_FOR: Record<State, number> = {
  view: 50,
  read: 44,
  drag: 36,
  hide: 24,
  default: 14,
};

/**
 * Filled shape pinned to the pointer, trailing a tail when you move.
 *
 * The head is locked to the live pointer rather than springing toward it, so
 * the dot is always dead centre in the circle. Only the tail lags: a single
 * point eased toward the pointer each frame, with the gap between the two
 * driving both the tail's length and how far it narrows. Stop moving and the
 * lagged point catches up, the gap closes, and the shape relaxes back into a
 * circle on its own — no separate "settle" animation needed.
 *
 * The loop writes to the DOM directly. Driving the path or the rotation from
 * React state re-rendered on every frame and stuttered badly; springs fed from
 * that state restarted each frame and jittered on top of it.
 */
function CometFollower({ x, y, state }: { x: MV; y: MV; state: State }) {
  const pathRef = useRef<SVGPathElement>(null);
  const rotorRef = useRef<HTMLDivElement>(null);
  const base = BASE_FOR[state];

  // How far the tail may fall behind, and how thin it gets at full stretch.
  const maxLag = base * 2.4;

  useEffect(() => {
    let frame = 0;
    // The lagged point starts on the pointer so the first frame is a circle.
    let lagX = x.get();
    let lagY = y.get();
    let shownAngle = 0;
    let haveAngle = false;

    const tick = () => {
      const px = x.get();
      const py = y.get();

      // Ease the tail toward the pointer. This single lerp is the whole
      // physics: the residual gap is the stretch.
      lagX += (px - lagX) * 0.16;
      lagY += (py - lagY) * 0.16;

      const dx = px - lagX;
      const dy = py - lagY;
      const gap = Math.min(Math.hypot(dx, dy), maxLag);
      const t = gap / maxLag;

      // Below a pixel or so the direction is noise, so hold the last heading.
      if (gap > 1) {
        const want = Math.atan2(dy, dx);
        if (!haveAngle) {
          shownAngle = want;
          haveAngle = true;
        } else {
          // Unwrap: atan2 flips between +pi and -pi, and following that jump
          // literally spins the shape a full turn.
          let delta = want - shownAngle;
          while (delta > Math.PI) delta -= Math.PI * 2;
          while (delta < -Math.PI) delta += Math.PI * 2;
          shownAngle += delta;
        }
      }

      const tail = base * (1 - 0.55 * t);
      pathRef.current?.setAttribute("d", taperedCapsule(base, tail, gap));
      if (rotorRef.current) {
        rotorRef.current.style.transform = `rotate(${shownAngle}rad)`;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [x, y, base, maxLag]);

  const extent = base + maxLag + 4;

  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ x, y }}
    >
      {/* Centred on the anchor, so rotate() spins about the pointer itself. */}
      <div
        ref={rotorRef}
        className="absolute"
        style={{
          left: -extent,
          top: -extent,
          width: extent * 2,
          height: extent * 2,
          willChange: "transform",
        }}
      >
        <svg
          width={extent * 2}
          height={extent * 2}
          viewBox={`${-extent} ${-extent} ${extent * 2} ${extent * 2}`}
          className="block"
        >
          <path
            ref={pathRef}
            d={taperedCapsule(base, base, 0)}
            fill={state === "view" ? "var(--accent)" : "rgb(var(--c-paper))"}
            opacity={state === "hide" ? 0.45 : state === "default" ? 0.85 : 1}
          />
        </svg>
      </div>

      {/* The precise dot sits at the anchor — the head's exact centre. */}
      <motion.div
        className="absolute left-0 top-0 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
        animate={{ opacity: state === "view" || state === "drag" ? 0 : 0.85 }}
      />

      {(state === "view" || state === "drag") && (
        <span className="absolute left-0 top-0 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
          <CursorLabel state={state} />
        </span>
      )}
    </motion.div>
  );
}

function CursorLabel({ state }: { state: State }) {
  const { label, fg } = LOOK[state];
  if (!label) return null;
  return (
    <motion.span
      key={label}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ color: fg }}
      className="font-sans text-[10px] font-bold uppercase tracking-wider"
    >
      {label}
    </motion.span>
  );
}

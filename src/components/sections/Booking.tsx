import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { booking, identity } from "@/data/site";
import { GLASS_BLUR, GLASS_GRAIN, GLASS_GRAIN_OPACITY, GLASS_SATURATE } from "@/lib/glass";
import {
  type CivilDate,
  addMonths,
  civilDateIn,
  dateKey,
  formatTime,
  monthGrid,
  openCountOn,
  sameDate,
  slotsOn,
  timeZoneChoices,
  weekdayOf,
  zoneLabel,
} from "@/lib/schedule";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

const EASE = [0.22, 1, 0.36, 1] as const;
/** Slow away, quick through the middle, slow in — the sweep between steps. */
const SWEEP_EASE = [0.65, 0, 0.35, 1] as const;
const SWEEP = 2.7;
/** Steps in order, so a move between two of them has a direction. */
const ORDER: Step[] = ["pick", "details", "done"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Step = "pick" | "details" | "done";
type Guest = { id: number; email: string };
type Filled = { name: string; email: string; phone: string; notes: string; links: Record<string, string> };

/* ------------------------------------------------------------------ dialog */

/**
 * The booking panel, over the page rather than in it.
 *
 * The ground around the card is the same glass as the menu, read from the same
 * constants, so the two surfaces cannot drift apart. Clicking it closes, as
 * does Escape and the button on the card.
 */
export function BookingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const card = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement;
    lockScroll();

    // Focus has to be moved into the card, and not only for the reason it
    // usually is. The Tab handler below wraps at the card's first and last
    // focusable — but it can only recognise those once focus is already
    // inside. Left on <body>, `activeElement` never matched an edge and Tab
    // walked the whole page behind the dialog instead: 18 of 20 presses landed
    // on links the visitor could not see.
    const frame = requestAnimationFrame(() => {
      const el = card.current;
      if (!el) return;
      const first = el.querySelector<HTMLElement>(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
      );
      (first ?? el).focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      // Keep Tab inside the card while it is up.
      const focusable = card.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const list = [...focusable].filter((el) => el.offsetParent !== null);
      const edge = e.shiftKey ? list[0] : list[list.length - 1];
      if (document.activeElement === edge) {
        e.preventDefault();
        (e.shiftKey ? list[list.length - 1] : list[0]).focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      unlockScroll();
      // Plain focus() scrolls its target into view, which would move the page
      // the lock just went to the trouble of holding still.
      (restoreTo.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain">
          {/* The glass. A button so a click anywhere off the card dismisses. */}
          {/* The glass fades on its own and briskly: it is a full-viewport
              backdrop filter, and every frame of a long fade re-blurs the whole
              page behind it. */}
          <motion.button
            type="button"
            aria-label="Close booking"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 cursor-default bg-[#0a0a0c]/30"
            style={{
              backdropFilter: `blur(${GLASS_BLUR}px) saturate(${GLASS_SATURATE})`,
              WebkitBackdropFilter: `blur(${GLASS_BLUR}px) saturate(${GLASS_SATURATE})`,
            }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 mix-blend-screen"
              style={{
                backgroundImage: GLASS_GRAIN,
                backgroundRepeat: "repeat",
                opacity: GLASS_GRAIN_OPACITY,
              }}
            />
          </motion.button>

          {/* The scroller is the outer box and the centring happens in here, on
              a row that is at least a screen tall. Centring on the scroller
              itself puts the overflow half above its own top edge, where no
              amount of scrolling reaches it — which is what the details step
              ran into as soon as it grew past the viewport. */}
          <div className="relative flex min-h-full items-center justify-center p-4 md:p-8">
          <motion.div
            ref={card}
            role="dialog"
            aria-modal="true"
            // Focusable as a last resort, for a card with nothing to focus.
            tabIndex={-1}
            aria-label={`${booking.title} — pick a time`}
            initial={{ opacity: 0, y: 34, scale: 0.965 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            // Closing is its own, quicker motion: the opening delay lets the
            // glass land first, but on the way out it just reads as lag.
            exit={{ opacity: 0, y: 14, scale: 0.985, transition: { duration: 0.28, ease: "easeIn" } }}
            transition={{ duration: 0.62, ease: EASE, delay: 0.06 }}
            style={{ willChange: "transform, opacity" }}
            className="relative z-10 w-full max-w-6xl overflow-hidden rounded-2xl border border-hairStrong bg-surface shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close booking"
              className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-hairStrong bg-ink/70 text-dim transition-colors duration-300 hover:border-paper hover:text-paper"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>

            <BookingFlow onClose={onClose} />
          </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------- sweep */

type Frame = { key: string; node: ReactNode; index: number };

/**
 * Swaps one step for the next behind a travelling line.
 *
 * The incoming step is laid over the outgoing one and revealed by a clip that
 * follows the line, so nothing pops: what appears is already in place. Forward
 * the line runs right to left; going back it runs the other way, because a
 * transition that leaves and returns along the same path does not read as
 * having been undone. The card's height is tweened alongside on the same curve,
 * or the swap would end with a jump wherever two steps differ in length.
 *
 * The timing is the delicate part. React commits the new step before any effect
 * runs, so an ordinary `useEffect` lets the browser paint one frame of it —
 * unclipped, at its own height — before the sweep has a chance to start. That
 * single frame is the flicker you feel just ahead of the line. Everything that
 * sets the sweep up therefore happens in a layout effect, and the clip and the
 * height are set on the motion values *before* the render that binds them, so
 * the first painted frame is already the frozen one.
 */
function Wipe({ frame }: { frame: Frame }) {
  // The live node is rendered every time. Only the *outgoing* step is frozen —
  // it is on its way out, so a snapshot is right for it, and snapshotting the
  // incoming one instead would leave the panel showing stale markup for as long
  // as the step lasted.
  const [outgoing, setOutgoing] = useState<ReactNode | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [busy, setBusy] = useState(false);
  const shown = useRef(frame);
  const shownNode = useRef<ReactNode>(frame.node);
  /** The panel's height while it is at rest — the height to sweep away from. */
  const resting = useRef(0);

  const shell = useRef<HTMLDivElement>(null);
  const outBox = useRef<HTMLDivElement>(null);
  const inBox = useRef<HTMLDivElement>(null);

  const cut = useMotionValue(100);
  const height = useMotionValue(0);
  const clipL = useMotionTemplate`inset(0 0 0 ${cut}%)`;
  const clipR = useMotionTemplate`inset(0 ${cut}% 0 0)`;
  const edgeL = useMotionTemplate`${cut}%`;
  const edgeR = useMotionTemplate`calc(100% - ${cut}%)`;
  const clip = dir === 1 ? clipL : clipR;
  const edge = dir === 1 ? edgeL : edgeR;

  useLayoutEffect(() => {
    if (frame.key === shown.current.key) return;
    // Set up before the state change, so the render that first binds these
    // styles already reads the frozen values rather than last sweep's.
    height.set(resting.current || inBox.current?.offsetHeight || 0);
    cut.set(100);
    setDir(frame.index >= shown.current.index ? 1 : -1);
    setOutgoing(shownNode.current);
    setBusy(true);
    shown.current = frame;
  }, [frame, cut, height]);

  // Declared after the effect above, so on the render where the step changes
  // that one still sees the previous node before this replaces it.
  useEffect(() => {
    shownNode.current = frame.node;
  });

  /*
   * Hand the swept properties back when the sweep ends.
   *
   * Framer writes a tweened value straight to the element, outside React, so
   * rendering `style={undefined}` afterwards does not take it off again —
   * React never knew it was there. The panel kept the exact height it last
   * swept to and the clip path it finished on, and both of those clip. Open a
   * field or add a guest after that and the form grew into a box that could no
   * longer grow with it: the rest of it was cut off, and there was nothing to
   * scroll to reach it.
   */
  useLayoutEffect(() => {
    if (busy) return;
    for (const el of [shell.current, inBox.current]) {
      if (!el) continue;
      for (const prop of ["height", "clip-path", "-webkit-clip-path", "will-change"]) {
        el.style.removeProperty(prop);
      }
    }
  }, [busy]);

  // Kept current while the panel is at rest — including as a step grows a field
  // or opens a menu — so a sweep always starts from the height on screen.
  useEffect(() => {
    if (busy) return;
    const el = inBox.current;
    if (!el) return;
    const measure = () => {
      resting.current = el.offsetHeight;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [busy]);

  useLayoutEffect(() => {
    if (!busy) return;
    const to = inBox.current?.offsetHeight ?? height.get();

    const sweep = animate(cut, 0, { duration: SWEEP, ease: SWEEP_EASE });
    const grow = animate(height, to, { duration: SWEEP, ease: SWEEP_EASE });
    let finished = false;
    sweep.then(() => {
      finished = true;
      setOutgoing(null);
      setBusy(false);
    });
    return () => {
      if (!finished) {
        sweep.stop();
        grow.stop();
      }
    };
  }, [busy, cut, height]);

  return (
    <motion.div
      ref={shell}
      className="relative overflow-hidden"
      style={busy ? { height, willChange: "height" } : undefined}
    >
      {/* Outgoing sits underneath and still; incoming is clipped open over it. */}
      {outgoing && (
        <div ref={outBox} className="absolute inset-x-0 top-0 bg-surface" aria-hidden="true">
          {outgoing}
        </div>
      )}

      {/* Opaque, or the step underneath reads through the part already swept. */}
      <motion.div
        ref={inBox}
        style={busy ? { clipPath: clip, WebkitClipPath: clip, willChange: "clip-path" } : undefined}
        className={busy ? "relative bg-surface" : undefined}
      >
        {frame.node}
      </motion.div>

      {busy && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-accent"
          style={{ left: edge, boxShadow: "0 0 24px 2px rgba(253,50,28,0.55)" }}
        />
      )}
    </motion.div>
  );
}

/* --------------------------------------------------------------------- flow */

function BookingFlow({ onClose }: { onClose: () => void }) {
  const [now] = useState(() => Date.now());
  const zones = useMemo(() => timeZoneChoices(), []);

  const [zone, setZone] = useState(zones[0]);
  const duration = booking.duration;

  const today = useMemo(() => civilDateIn(now, zone), [now, zone]);
  const [month, setMonth] = useState<CivilDate>({ y: today.y, m: today.m, d: 1 });
  const [selected, setSelected] = useState<CivilDate | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [filled, setFilled] = useState<Filled | null>(null);
  const [step, setStep] = useState<Step>("pick");

  const avail = booking.availability;
  const grid = useMemo(() => monthGrid(month.y, month.m, 0), [month]);

  // Counts for the grid, instants only for the day on show. Resolving all
  // forty-two days to instants is the same answer arrived at some thousands of
  // conversions later, and that walk is what the panel used to open through.
  const openByDay = useMemo(() => {
    const map = new Map<number, number>();
    for (const d of grid) map.set(dateKey(d), openCountOn(d, avail, now, zone));
    return map;
  }, [grid, avail, now, zone]);

  const daySlots = useMemo(
    () => (selected ? slotsOn(selected, avail, now, zone) : []),
    [selected, avail, now, zone]
  );

  useEffect(() => {
    if (selected) return;
    const open = grid.find((d) => (openByDay.get(dateKey(d)) ?? 0) > 0);
    if (open) setSelected(open);
  }, [selected, grid, openByDay]);

  useEffect(() => {
    if (slot !== null && !daySlots.includes(slot)) setSlot(null);
  }, [slot, daySlots]);

  const atMonthStart = month.y === today.y && month.m === today.m;

  const summary = (
    <Summary
      duration={duration}
      zone={zone}
      onZone={step === "pick" ? setZone : undefined}
      zones={zones}
      now={now}
      slot={step === "pick" ? null : slot}
    />
  );

  const node =
    step === "done" ? (
      <Confirmation
        slot={slot!}
        duration={duration}
        zone={zone}
        filled={filled!}
        onRestart={() => {
          setFilled(null);
          setSlot(null);
          setStep("pick");
        }}
        onClose={onClose}
      />
    ) : (
      <div
        className={cn(
          "grid divide-hair",
          step === "pick"
            ? "lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,15rem)] lg:divide-x"
            : "md:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] md:divide-x"
        )}
      >
        {summary}
        {step === "pick" ? (
          <>
            <Calendar
              month={month}
              today={today}
              grid={grid}
              openByDay={openByDay}
              selected={selected}
              onSelect={(d) => {
                setSelected(d);
                setSlot(null);
              }}
              onMonth={(n) => setMonth((m) => addMonths(m, n))}
              canGoBack={!atMonthStart}
            />
            <SlotList
              selected={selected}
              slots={daySlots}
              zone={zone}
              onPick={(at) => {
                setSlot(at);
                setStep("details");
              }}
            />
          </>
        ) : (
          <DetailsForm
            onBack={() => setStep("pick")}
            onConfirm={(v) => {
              setFilled(v);
              setStep("done");
            }}
          />
        )}
      </div>
    );

  return <Wipe frame={{ key: step, node, index: ORDER.indexOf(step) }} />;
}

/* ------------------------------------------------------------------ summary */

function Summary({
  duration,
  zone,
  onZone,
  zones,
  now,
  slot,
}: {
  duration: number;
  zone: string;
  onZone?: (z: string) => void;
  zones: string[];
  now: number;
  slot: number | null;
}) {
  return (
    <div className="flex flex-col gap-5 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent font-sans text-xs font-semibold tracking-wide">
          ZM
        </span>
        <span className="font-sans text-sm text-dim">{identity.name}</span>
      </div>

      <h3 className="text-2xl font-medium tracking-tight md:text-[1.75rem]">{booking.title}</h3>

      {slot !== null && (
        <Row icon="date">
          <span className="block">{longDate(slot, zone)}</span>
          <span className="block text-dim">
            {formatTime(slot, zone)} – {formatTime(slot + duration * 60000, zone)}
          </span>
        </Row>
      )}

      <Row icon="clock">{duration} minutes</Row>

      <Row icon="place">{booking.place}</Row>

      <Row icon="globe">
        {onZone ? (
          <ZonePicker zone={zone} zones={zones} now={now} onPick={onZone} />
        ) : (
          <span>{zoneLabel(zone, now)}</span>
        )}
      </Row>
    </div>
  );
}

/**
 * Time-zone picker.
 *
 * A listbox rather than a native select: the native control cannot be animated
 * or styled to match anything around it, and on desktop it drops a menu in the
 * operating system's colours in the middle of a dark panel.
 */
function ZonePicker({
  zone,
  zones,
  now,
  onPick,
}: {
  zone: string;
  zones: string[];
  now: number;
  onPick: (z: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, zones.indexOf(zone)));
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      setActive((i) => (i + (e.key === "ArrowDown" ? 1 : zones.length - 1)) % zones.length);
    }
    if (open && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onPick(zones[active]);
      setOpen(false);
    }
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-hairStrong bg-ink py-1.5 pl-2.5 pr-2 font-sans text-sm text-paper transition-colors duration-300 hover:border-paper/50"
      >
        <span className="truncate">{zoneLabel(zone, now)}</span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="shrink-0 text-dim"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-3.5 w-3.5">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
            transition={{ duration: 0.24, ease: EASE }}
            style={{ transformOrigin: "top" }}
            className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 max-h-56 overflow-y-auto rounded-md border border-hairStrong bg-ink p-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]"
          >
            {zones.map((z, i) => (
              <li key={z}>
                <button
                  type="button"
                  role="option"
                  aria-selected={z === zone}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    onPick(z);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded px-2.5 py-1.5 text-left font-sans text-xs transition-colors duration-200",
                    i === active ? "bg-surfaceUp text-paper" : "text-dim"
                  )}
                >
                  <span className="truncate">{zoneLabel(z, now)}</span>
                  {z === zone && <span className="shrink-0 text-accent">✓</span>}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

const ICONS = {
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.5-2.4 3.75-5.4 3.75-9S14.5 5.4 12 3M12 21c-2.5-2.4-3.75-5.4-3.75-9S9.5 5.4 12 3M3.5 9h17M3.5 15h17",
  place: "M15 10.5V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2.5l6 3.5V7l-6 3.5Z",
  date: "M8 3v3m8-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
} as const;

function Row({ icon, children }: { icon: keyof typeof ICONS; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 font-sans text-sm text-paper/85">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 h-4 w-4 shrink-0 text-dim"
      >
        <path d={ICONS[icon]} />
      </svg>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}

/* ----------------------------------------------------------------- calendar */

function Calendar({
  month,
  today,
  grid,
  openByDay,
  selected,
  onSelect,
  onMonth,
  canGoBack,
}: {
  month: CivilDate;
  today: CivilDate;
  grid: CivilDate[];
  openByDay: Map<number, number>;
  selected: CivilDate | null;
  onSelect: (d: CivilDate) => void;
  onMonth: (n: number) => void;
  canGoBack: boolean;
}) {
  const cells = useRef(new Map<number, HTMLButtonElement>());
  const [roving, setRoving] = useState<number>(() =>
    dateKey(selected ?? firstOpen(grid, openByDay) ?? today)
  );

  useEffect(() => {
    if (!grid.some((d) => dateKey(d) === roving)) {
      setRoving(dateKey(firstOpen(grid, openByDay) ?? grid[0]));
    }
  }, [grid, openByDay, roving]);

  const move = (from: number, by: number) => {
    const i = grid.findIndex((d) => dateKey(d) === from);
    const next = grid[Math.max(0, Math.min(grid.length - 1, i + by))];
    if (!next) return;
    setRoving(dateKey(next));
    cells.current.get(dateKey(next))?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const by = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (by !== undefined) {
      e.preventDefault();
      return move(roving, by);
    }
    if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      if (e.key === "PageUp" && !canGoBack) return;
      onMonth(e.key === "PageUp" ? -1 : 1);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto mb-5 flex max-w-[32rem] items-center justify-between">
        <h3 className="font-sans text-base font-medium">
          {monthName(month)} <span className="text-dim">{month.y}</span>
        </h3>
        <div className="flex gap-1">
          <Step dir="prev" onClick={() => onMonth(-1)} disabled={!canGoBack} />
          <Step dir="next" onClick={() => onMonth(1)} />
        </div>
      </div>

      <div role="grid" aria-label="Choose a day" onKeyDown={onKeyDown} className="mx-auto max-w-[32rem]">
        <div role="row" className="mb-1.5 grid grid-cols-7">
          {WEEKDAYS.map((w) => (
            <span
              key={w}
              role="columnheader"
              aria-label={w}
              className="py-1 text-center font-sans text-2xs font-medium uppercase tracking-wider text-dim"
            >
              {w}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((d) => {
            const key = dateKey(d);
            const open = openByDay.get(key) ?? 0;
            const inMonth = d.m === month.m;
            const isSelected = selected != null && sameDate(d, selected);
            const isToday = sameDate(d, today);

            return (
              <button
                key={key}
                ref={(el) => {
                  if (el) cells.current.set(key, el);
                  else cells.current.delete(key);
                }}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                aria-current={isToday ? "date" : undefined}
                aria-label={`${longDateOf(d)}${open ? `, ${open} times` : ", no times"}`}
                disabled={!open}
                tabIndex={key === roving ? 0 : -1}
                onFocus={() => setRoving(key)}
                onClick={() => onSelect(d)}
                className={cn(
                  "relative aspect-square rounded-md font-sans text-sm outline-none transition-colors duration-300",
                  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  isSelected
                    ? "bg-paper font-semibold text-ink"
                    : open
                      ? "bg-surfaceUp font-medium text-paper ring-1 ring-inset ring-white/10 hover:bg-hairStrong hover:ring-white/30"
                      : "text-white/20",
                  !inMonth && !isSelected && "opacity-50"
                )}
              >
                {d.d}
                {open > 0 && !isSelected && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 bottom-1 mx-auto h-1 w-1 rounded-full",
                      open <= 3 ? "bg-accent" : "bg-paper/70"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const firstOpen = (grid: CivilDate[], open: Map<number, number>) =>
  grid.find((d) => (open.get(dateKey(d)) ?? 0) > 0);

function Step({ dir, onClick, disabled }: { dir: "prev" | "next"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous month" : "Next month"}
      className="grid h-8 w-8 place-items-center rounded-md border border-hairStrong text-dim transition-colors duration-300 hover:border-paper/50 hover:text-paper disabled:pointer-events-none disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
        <path d={dir === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* ---------------------------------------------------------------- slot list */

function SlotList({
  selected,
  slots,
  zone,
  onPick,
}: {
  selected: CivilDate | null;
  slots: number[];
  zone: string;
  onPick: (at: number) => void;
}) {
  return (
    <div className="flex min-h-[22rem] flex-col p-6 md:p-8">
      <div className="mb-4 pr-10">
        <h3 className="whitespace-nowrap font-sans text-sm font-medium">
          {selected ? WEEKDAYS[weekdayOf(selected)] : <span className="text-dim">Choose a day</span>}
        </h3>
      </div>

      <div className="-mr-2 flex max-h-[24rem] flex-col gap-2 overflow-y-auto pr-2">
        {selected == null ? (
          <p className="font-sans text-sm text-dimmer">Days with a mark have time open.</p>
        ) : slots.length === 0 ? (
          <p className="font-sans text-sm text-dimmer">Nothing open on this day.</p>
        ) : (
          slots.map((at, i) => (
            <motion.button
              key={at}
              type="button"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.32, ease: EASE, delay: Math.min(i * 0.025, 0.3) }}
              onClick={() => onPick(at)}
              className="shrink-0 rounded-md border border-hairStrong py-2.5 text-center font-sans text-sm transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
            >
              {formatTime(at, zone)}
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ socials */

type Platform = { key: string; name: string; brand: string; hint: string; icon: ReactNode };

const PLATFORMS: Platform[] = [
  {
    key: "telegram",
    name: "Telegram",
    brand: "#229ED9",
    hint: "@username",
    icon: (
      <path d="M21.6 3.7 2.7 11c-.9.35-.9 1.6.03 1.9l4.7 1.5 1.8 5.5c.28.85 1.35 1.05 1.9.36l2.5-3.1 4.9 3.6c.7.5 1.7.13 1.9-.72l3-15.4c.2-.95-.75-1.7-1.6-1.36Z" />
    ),
  },
  {
    key: "instagram",
    name: "Instagram",
    brand: "#E1306C",
    hint: "@username",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.9" />
        <circle cx="12" cy="12" r="3.9" fill="none" stroke="currentColor" strokeWidth="1.9" />
        <circle cx="17.2" cy="6.8" r="1.2" />
      </>
    ),
  },
  {
    key: "discord",
    name: "Discord",
    brand: "#5865F2",
    hint: "username#0000",
    icon: (
      <path d="M18.9 5.6A16 16 0 0 0 15 4.4l-.25.5a12 12 0 0 1 3.2 1.6 15 15 0 0 0-11.9 0 12 12 0 0 1 3.2-1.6L9 4.4A16 16 0 0 0 5.1 5.6C2.7 9.2 2 12.7 2.3 16.2a16 16 0 0 0 4.9 2.5l1-1.7a10 10 0 0 1-1.6-.8l.4-.3a11 11 0 0 0 10 0l.4.3a10 10 0 0 1-1.6.8l1 1.7a16 16 0 0 0 4.9-2.5c.4-4-.6-7.5-2.8-10.6ZM8.7 14.2c-1 0-1.7-.9-1.7-1.9s.75-2 1.7-2 1.75.9 1.73 2c0 1-.75 1.9-1.73 1.9Zm6.6 0c-1 0-1.7-.9-1.7-1.9s.75-2 1.7-2 1.74.9 1.72 2c0 1-.74 1.9-1.72 1.9Z" />
    ),
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    brand: "#0A66C2",
    hint: "linkedin.com/in/…",
    icon: (
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3.2 9h3.6v12H3.2zM10 9h3.5v1.7h.05A3.9 3.9 0 0 1 17.1 8.7c3.7 0 4.4 2.4 4.4 5.6V21h-3.6v-5.6c0-1.3 0-3-1.85-3s-2.15 1.4-2.15 2.9V21H10z" />
    ),
  },
  {
    key: "facebook",
    name: "Facebook",
    brand: "#1877F2",
    hint: "facebook.com/…",
    icon: (
      <path d="M14.2 8.6h2.6V5.4h-2.6c-2.3 0-4.1 1.9-4.1 4.2v2.1H7.6v3.2h2.5V21h3.3v-6.1h2.6l.6-3.2h-3.2V9.6c0-.6.4-1 .8-1Z" />
    ),
  },
];

/**
 * Social handles.
 *
 * The bar opens from the trigger, an icon opens a field beneath it, and
 * confirming folds the field back into the icon that opened it — the field's
 * transform origin is set to that icon's column, so it collapses toward the
 * thing it belongs to rather than toward the middle of the row.
 */
function SocialBar({
  links,
  onChange,
}: {
  links: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) input.current?.focus({ preventScroll: true });
  }, [editing]);

  const start = (key: string) => {
    if (editing === key) return setEditing(null);
    setDraft(links[key] ?? "");
    setEditing(key);
  };

  const commit = () => {
    if (!editing) return;
    const value = draft.trim();
    const next = { ...links };
    if (value) next[editing] = value;
    else delete next[editing];
    onChange(next);
    setEditing(null);
  };

  const index = PLATFORMS.findIndex((p) => p.key === editing);
  const origin = index < 0 ? "50%" : `${((index + 0.5) / PLATFORMS.length) * 100}%`;
  const filled = PLATFORMS.filter((p) => links[p.key]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="rounded-full border border-hairStrong px-4 py-1.5 font-sans text-2xs font-medium uppercase tracking-wider text-dim transition-colors duration-300 hover:border-paper/60 hover:text-paper"
        >
          {open ? "Profiles" : filled.length ? "Edit profiles" : "+ Add profiles"}
        </button>

        {/* When the bar is closed, the ones that were filled stay on show. */}
        <AnimatePresence>
          {!open && filled.length > 0 && (
            <motion.span
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {filled.map((p) => (
                <span key={p.key} title={`${p.name}: ${links[p.key]}`} style={{ color: p.brand }}>
                  <Glyph platform={p} />
                </span>
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.42, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="flex items-stretch gap-1 rounded-lg border border-hairStrong bg-ink p-1.5">
              <div className="flex flex-1 items-center justify-around gap-1">
                {PLATFORMS.map((p, i) => {
                  const on = Boolean(links[p.key]);
                  return (
                    <motion.button
                      key={p.key}
                      type="button"
                      onClick={() => start(p.key)}
                      aria-label={`${p.name}${on ? ` — ${links[p.key]}` : ""}`}
                      aria-pressed={editing === p.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: EASE, delay: 0.05 + i * 0.045 }}
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-md transition-colors duration-300",
                        editing === p.key && "bg-surfaceUp",
                        !on && "text-dimmer hover:text-paper"
                      )}
                      style={on ? { color: p.brand } : undefined}
                    >
                      <Glyph platform={p} />
                    </motion.button>
                  );
                })}
              </div>

              <span aria-hidden="true" className="w-px shrink-0 bg-hairStrong" />

              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setOpen(false);
                }}
                aria-label="Close profiles"
                className="grid w-10 shrink-0 place-items-center rounded-md text-dim transition-colors duration-300 hover:bg-surfaceUp hover:text-paper"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {editing && (
                <motion.div
                  key={editing}
                  initial={{ opacity: 0, scaleX: 0.15, scaleY: 0.4, y: -6 }}
                  animate={{ opacity: 1, scaleX: 1, scaleY: 1, y: 0 }}
                  exit={{ opacity: 0, scaleX: 0.15, scaleY: 0.4, y: -6 }}
                  transition={{ duration: 0.34, ease: EASE }}
                  style={{ transformOrigin: `${origin} 0%` }}
                  className="mt-2 flex gap-2"
                >
                  <input
                    ref={input}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commit();
                      }
                      if (e.key === "Escape") setEditing(null);
                    }}
                    placeholder={PLATFORMS[index]?.hint}
                    aria-label={`${PLATFORMS[index]?.name} handle`}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={commit}
                    aria-label="Save handle"
                    className="shrink-0 rounded-md border border-hairStrong px-4 text-dim transition-colors duration-300 hover:border-accent hover:text-accent"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Glyph({ platform }: { platform: Platform }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[1.15rem] w-[1.15rem]" aria-hidden="true">
      {platform.icon}
    </svg>
  );
}

/* -------------------------------------------------------------- the details */

function DetailsForm({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: (v: Filled) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [links, setLinks] = useState<Record<string, string>>({});
  const [guests, setGuests] = useState<Guest[]>([]);
  const [touched, setTouched] = useState(false);
  const first = useRef<HTMLInputElement>(null);

  // Without preventScroll the dialog jumps to put this field mid-view.
  useEffect(() => first.current?.focus({ preventScroll: true }), []);

  const mail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const errors = {
    name: name.trim() ? "" : "Please tell me your name.",
    email: mail(email) ? "" : "That does not look like an email address.",
    // Optional, but if given it has to be dialable.
    phone: !phone.trim() || /^\+?[\d\s()-]{6,}$/.test(phone.trim()) ? "" : "That does not look like a phone number.",
    guests: guests.some((g) => g.email && !mail(g.email)) ? "One of the guest addresses is not valid." : "",
  };
  const valid = !errors.name && !errors.email && !errors.phone && !errors.guests;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (valid) onConfirm({ name: name.trim(), email: email.trim(), phone: phone.trim(), notes: notes.trim(), links });
      }}
      className="flex flex-col gap-5 p-6 md:p-8"
    >
      <Field label="Your name" required error={touched ? errors.name : ""}>
        <input ref={first} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} />
      </Field>

      {/* Email does not need a whole row to itself; the phone shares it. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email address" required error={touched ? errors.email : ""}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={inputClass}
          />
        </Field>
        <Field label="Phone number" error={touched ? errors.phone : ""}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="+31 6 1234 5678"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="What would you like to cover?">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="A sentence or two is plenty — it just means we can skip the warm-up."
          className={cn(inputClass, "resize-y")}
        />
      </Field>

      <Field label="Social profiles">
        <SocialBar links={links} onChange={setLinks} />
      </Field>

      <Field label="Guests" error={touched ? errors.guests : ""}>
        <div className="flex flex-col gap-2">
          {guests.map((g, i) => (
            <div key={g.id} className="flex gap-2">
              <input
                type="email"
                value={g.email}
                onChange={(e) =>
                  setGuests((list) => list.map((x) => (x.id === g.id ? { ...x, email: e.target.value } : x)))
                }
                placeholder="name@company.com"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setGuests((list) => list.filter((x) => x.id !== g.id))}
                aria-label={`Remove guest ${i + 1}`}
                className="shrink-0 rounded-md border border-hairStrong px-3 text-dim transition-colors duration-300 hover:border-paper/50 hover:text-paper"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setGuests((list) => [...list, { id: Date.now(), email: "" }])}
            className="self-start font-sans text-sm text-dim transition-colors duration-300 hover:text-accent"
          >
            + Add {guests.length ? "another" : "a guest"}
          </button>
        </div>
      </Field>

      <div className="mt-1 flex items-center justify-end gap-4">
        <button type="button" onClick={onBack} className="font-sans text-sm text-dim transition-colors duration-300 hover:text-paper">
          Back
        </button>
        <button
          type="submit"
          className="rounded-full bg-paper px-6 py-2.5 font-sans text-sm font-semibold text-ink transition-opacity duration-300 hover:opacity-85"
        >
          Confirm
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-hairStrong bg-ink px-3 py-2.5 font-sans text-sm text-paper outline-none transition-colors duration-300 placeholder:text-dimmer hover:border-paper/40 focus-visible:border-accent";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-sans text-2xs font-medium uppercase tracking-wider text-dim">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="font-sans text-2xs text-accent">
          {error}
        </span>
      )}
    </label>
  );
}

/* ------------------------------------------------------------- confirmation */

function Confirmation({
  slot,
  duration,
  zone,
  filled,
  onRestart,
  onClose,
}: {
  slot: number;
  duration: number;
  zone: string;
  filled: Filled;
  onRestart: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number>();
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);
  const end = slot + duration * 60000;

  const profiles = PLATFORMS.filter((p) => filled.links[p.key]);
  const when = `${longDate(slot, zone)}, ${formatTime(slot, zone)} – ${formatTime(end, zone)} (${zoneLabel(zone, slot)})`;

  /**
   * Everything the invite should carry, in the order it reads best. Google
   * takes the times as UTC stamps with a trailing Z, which is unambiguous —
   * no separate zone parameter to contradict them.
   */
  const details = [
    `${booking.title} — ${duration} minutes`,
    `Host: ${identity.name} (${identity.email})`,
    `Guest: ${filled.name} (${filled.email})`,
    filled.phone && `Phone: ${filled.phone}`,
    profiles.length && profiles.map((p) => `${p.name}: ${filled.links[p.key]}`).join("\n"),
    filled.notes && `\nNotes\n${filled.notes}`,
  ]
    .filter(Boolean)
    .join("\n");

  const gcal =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(`${booking.title}: ${identity.name} & ${filled.name}`)}` +
    `&dates=${stamp(slot)}/${stamp(end)}` +
    `&details=${encodeURIComponent(details)}` +
    `&location=${encodeURIComponent(booking.place)}` +
    `&add=${encodeURIComponent([identity.email, filled.email].join(","))}`;

  const copyText = `${booking.title}\n${when}\n${booking.place}\n\n${details}`;

  /*
   * Two columns and the panel's own padding, rather than a narrow centred
   * column: a column leaves the card walls uneven — inches of margin at the
   * sides against a hand's width top and bottom — and stacks what is really a
   * short receipt into something taller than the screen. Across, at the sizes
   * the other steps use, the whole of it lands inside one view.
   */
  return (
    <div className="grid gap-7 p-6 md:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] md:gap-12 md:p-8">
      <div className="flex flex-col items-start gap-4">
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
          className="grid h-10 w-10 place-items-center rounded-full border border-accent text-accent"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <motion.path
              d="m5 13 4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
            />
          </svg>
        </motion.span>

        <div>
          <h3 className="text-xl font-medium tracking-tight md:text-2xl">This time is held</h3>
          <p className="mt-1.5 font-sans text-xs leading-relaxed text-dim">
            Add it to your calendar and I will see you then.
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-1">
          <a
            href={gcal}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-paper px-4 py-2 font-sans text-xs font-semibold text-ink transition-opacity duration-300 hover:opacity-85"
          >
            Add to calendar
          </a>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(copyText);
                setCopied(true);
                window.clearTimeout(copyTimer.current);
                copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
              } catch {
                setCopied(false);
              }
            }}
            className="rounded-full border border-hairStrong px-4 py-2 font-sans text-xs transition-colors duration-300 hover:border-paper"
          >
            {copied ? "Copied" : "Copy details"}
          </button>
        </div>

        <p className="font-sans text-2xs text-dimmer">
          <button
            type="button"
            onClick={onRestart}
            className="underline underline-offset-4 transition-colors duration-300 hover:text-paper"
          >
            Pick another time
          </button>
          {" · "}
          <button
            type="button"
            onClick={onClose}
            className="underline underline-offset-4 transition-colors duration-300 hover:text-paper"
          >
            Back to the site
          </button>
        </p>
      </div>

      <dl className="grid content-start gap-x-8 gap-y-4 border-t border-hair pt-5 sm:grid-cols-2 md:border-l md:border-t-0 md:pl-12 md:pt-0">
        <Line term="What">
          {booking.title} with {identity.name}
        </Line>
        <Line term="When">
          {longDate(slot, zone)}
          <span className="block text-dim">
            {formatTime(slot, zone)} – {formatTime(end, zone)} · {zoneLabel(zone, slot)}
          </span>
        </Line>
        <Line term="Who">
          {filled.name}
          <span className="block text-dim">{filled.email}</span>
          {filled.phone && <span className="block text-dim">{filled.phone}</span>}
          {profiles.length > 0 && (
            <span className="mt-1.5 flex flex-wrap items-center gap-2.5">
              {profiles.map((p) => (
                <span key={p.key} className="flex items-center gap-1" style={{ color: p.brand }}>
                  <Glyph platform={p} />
                  <span className="font-sans text-2xs">{filled.links[p.key]}</span>
                </span>
              ))}
            </span>
          )}
        </Line>
        <Line term="Where">{booking.place}</Line>
        {filled.notes && (
          <div className="sm:col-span-2">
            <Line term="Notes">{filled.notes}</Line>
          </div>
        )}
      </dl>
    </div>
  );
}

/** One labelled entry on the receipt: the label over the value, not beside it. */
function Line({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="font-sans text-2xs font-medium uppercase tracking-wider text-dimmer">{term}</dt>
      <dd className="mt-1 font-sans text-xs leading-relaxed text-paper/90">{children}</dd>
    </div>
  );
}

/* -------------------------------------------------------------------- dates */

const monthName = (d: CivilDate) =>
  new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(d.y, d.m, 1)));

const longDate = (at: number, timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(at)
  );

const longDateOf = (d: CivilDate) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(
    new Date(Date.UTC(d.y, d.m, d.d))
  );

/** Google Calendar wants UTC basic-format stamps. */
const stamp = (at: number) => new Date(at).toISOString().replace(/[-:]|\.\d{3}/g, "");

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playgroundWall, type WallKind, type WallTile } from "@/data/site";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { usePointerLean } from "@/hooks/usePointerLean";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Three ways to look at the same thirteen plates.
 *
 * "wall" is the one the reference builds and the one that ships by default —
 * four columns where every plate keeps its own shape. The other two are for
 * different questions: "grid" squares everything off into a contact sheet,
 * which is how you compare thirteen things; "list" gives one plate the full
 * column, which is how you look at one.
 */
type View = "wall" | "grid" | "list";

const KINDS: WallKind[] = ["Interface", "Type", "Line", "Form"];

/**
 * The playground wall.
 *
 * Four columns, and each row only as tall as its own tallest tile. Every plate
 * keeps its own shape — the heights come from the plates, not from a track — so
 * a short one simply stops and leaves the rest of its row empty. That air is
 * the point: filling the grid is what turns a wall of studies into wallpaper.
 *
 * Above it, a filter and a layout switch. Both animate rather than cut, and
 * both do it the same way: every plate carries `layout`, so a plate that
 * survives a filter change travels to its new place instead of disappearing
 * from one and appearing in the other. That is the whole reason to animate a
 * filter — it shows what stayed.
 */
export function Wall() {
  const [view, setView] = useState<View>("wall");
  /** null is "everything" rather than a fifth kind, so no chip owns the default. */
  const [kind, setKind] = useState<WallKind | null>(null);
  const calm = useReducedMotion();

  const counts = useMemo(() => {
    const m = new Map<WallKind, number>();
    for (const t of playgroundWall) m.set(t.kind, (m.get(t.kind) ?? 0) + 1);
    return m;
  }, []);

  const shown = useMemo(
    () => (kind ? playgroundWall.filter((t) => t.kind === kind) : playgroundWall),
    [kind]
  );

  return (
    <section className="relative py-10 md:py-14">
      <div className="shell flex flex-col gap-[30px]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <KindFilter kinds={KINDS} counts={counts} active={kind} onChange={setKind} />
          <ViewToggle view={view} onChange={setView} />
        </div>

        <div
          className={cn(
            "grid w-full gap-4 md:gap-[30px]",
            view === "wall" && "grid-cols-2 lg:grid-cols-4",
            view === "grid" && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
            view === "list" && "mx-auto max-w-[700px] grid-cols-1"
          )}
          style={{ gridAutoRows: "min-content" }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((t, i) => (
              <motion.figure
                key={t.src}
                // What makes a plate travel to its new place rather than blink
                // out of one layout and into the other. Off under a reduced
                // motion preference, where a plate crossing the screen on its
                // own is exactly the thing being asked for less of.
                layout={calm ? false : "position"}
                className={cn(
                  "relative overflow-hidden rounded-[10px] bg-surface",
                  // The wide plates take two of the four columns. Anywhere the
                  // track is narrower that span would overflow, so it is only
                  // spent on the wall.
                  view === "wall" && t.wide && "col-span-2"
                )}
                // The contact sheet squares everything off; the other two let
                // each plate keep the shape it was drawn at.
                style={{ aspectRatio: view === "grid" ? 1 : t.ratio }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, ease: EASE, delay: Math.min(i % 4, 3) * 0.05 }}
              >
                <Plate tile={t} />
              </motion.figure>
            ))}
          </AnimatePresence>
        </div>

        {shown.length === 0 && (
          <p className="py-16 text-center font-sans text-sm text-dim">
            Nothing under that heading yet.
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * The filter, as chips carrying their own counts.
 *
 * The count is what stops a group of one reading as a bug: "Interface 1" is a
 * fact about the collection, where a bare "Interface" that opens onto a single
 * plate looks like the rest failed to load.
 */
function KindFilter({
  kinds,
  counts,
  active,
  onChange,
}: {
  kinds: WallKind[];
  counts: Map<WallKind, number>;
  active: WallKind | null;
  onChange: (k: WallKind | null) => void;
}) {
  const chip = (label: string, on: boolean, n: number, set: () => void) => (
    <button
      key={label}
      type="button"
      aria-pressed={on}
      onClick={set}
      className={cn(
        "rounded-full border px-4 py-1.5 font-sans text-2xs font-semibold uppercase tracking-wider transition-colors duration-300",
        on
          ? "border-transparent bg-paper text-ink"
          : "border-hairStrong text-dim hover:border-paper/60 hover:text-paper"
      )}
    >
      {label}
      <span className={cn("ml-2 tabular-nums", on ? "text-ink/50" : "text-dimmer")}>{n}</span>
    </button>
  );

  return (
    <div role="group" aria-label="Filter the wall" className="flex flex-wrap items-center gap-2">
      {chip("All", active === null, playgroundWall.length, () => onChange(null))}
      {kinds.map((k) =>
        chip(k, active === k, counts.get(k) ?? 0, () => onChange(active === k ? null : k))
      )}
    </div>
  );
}

/**
 * One study: the still, and the live take that plays over it while the pointer
 * is on it.
 *
 * The live version is a second SVG that carries its own CSS animation, so
 * nothing on this page drives it — mounting it starts it and unmounting stops
 * it, which is also why it is mounted only on hover. That keeps it off the
 * wire until somebody asks for it and stops thirteen plates animating at once
 * behind a page nobody is looking at.
 *
 * It is skipped entirely under a reduced-motion preference: this is motion for
 * its own sake, which is exactly what that preference is about.
 */
function Plate({ tile }: { tile: WallTile }) {
  const calm = useReducedMotion();
  const [live, setLive] = useState(false);
  const canPlay = !calm;
  // Gentler than the project plates: these sit shoulder to shoulder, and a
  // tile leaning as far as a half-width cover would knock into its neighbours.
  const lean = usePointerLean(0.015, 2.25);

  return (
    <motion.div
      ref={lean.ref as React.RefObject<HTMLDivElement>}
      style={{
        x: lean.x,
        y: lean.y,
        rotateX: lean.rotateX,
        rotateY: lean.rotateY,
        transformPerspective: 700,
      }}
      className="h-full w-full"
      onMouseMove={lean.onMouseMove}
      onMouseEnter={() => canPlay && setLive(true)}
      onMouseLeave={() => {
        setLive(false);
        lean.onMouseLeave();
      }}
    >
      <img
        src={tile.src}
        alt={tile.alt}
        loading="lazy"
        decoding="async"
        className={cn(
          "h-full w-full object-cover transition-transform duration-700 ease-soft",
          canPlay && "hover:scale-[1.04]"
        )}
      />
      {live && (
        <motion.img
          src={tile.src.replace(/\.svg$/, "-live.svg")}
          alt=""
          aria-hidden="true"
          decoding="async"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      )}
    </motion.div>
  );
}

/**
 * Three marks: the reference's four-up and single squares, and a nine-up
 * between them for the contact sheet. Drawn rather than labelled, because the
 * shape of the mark is the shape of the layout it gives you.
 */
function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  const base = "transition-opacity duration-300";
  const lit = (on: boolean) => (on ? "opacity-100" : "opacity-40 hover:opacity-70");

  return (
    <div role="group" aria-label="Wall layout" className="flex items-center gap-[10px]">
      <button
        type="button"
        aria-label="The wall — four across, every plate its own shape"
        aria-pressed={view === "wall"}
        onClick={() => onChange("wall")}
        className={cn("grid h-[23px] w-[23px] grid-cols-2 gap-[3px]", base, lit(view === "wall"))}
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="rounded-[2px] bg-paper" />
        ))}
      </button>

      <button
        type="button"
        aria-label="Contact sheet — every plate squared off"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className={cn("grid h-[23px] w-[23px] grid-cols-3 gap-[2px]", base, lit(view === "grid"))}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <span key={i} className="rounded-[1px] bg-paper" />
        ))}
      </button>

      <button
        type="button"
        aria-label="One across"
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        className={cn("h-[23px] w-[23px] rounded-[3px] bg-paper", base, lit(view === "list"))}
      />
    </div>
  );
}

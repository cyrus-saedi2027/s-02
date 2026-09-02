import { useState } from "react";
import { motion } from "framer-motion";
import { playgroundWall } from "@/data/site";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

type View = "grid" | "list";

/**
 * The playground wall.
 *
 * Four columns, and each row only as tall as its own tallest tile. Every plate
 * keeps its own shape — the heights come from the plates, not from a track — so
 * a short one simply stops and leaves the rest of its row empty. That air is
 * the point: filling the grid is what turns a wall of studies into wallpaper.
 *
 * The control above it swaps that for a single wide column, one plate at a
 * time, for reading rather than scanning.
 */
export function Wall() {
  const [view, setView] = useState<View>("grid");

  return (
    <section className="relative py-10 md:py-14">
      <div className="shell flex flex-col items-end gap-[30px]">
        <ViewToggle view={view} onChange={setView} />

        <div
          className={cn(
            "grid w-full gap-4 md:gap-[30px]",
            view === "grid"
              ? "grid-cols-2 lg:grid-cols-4"
              : "mx-auto max-w-[700px] grid-cols-1"
          )}
          style={{ gridAutoRows: "min-content" }}
        >
          {playgroundWall.map((t, i) => (
            <motion.figure
              key={t.src}
              className={cn(
                "relative overflow-hidden rounded-[10px] bg-surface",
                // The wide plates take two of the four columns. In the single
                // column that span would overflow the track, so it is dropped.
                view === "grid" && t.wide && "col-span-2"
              )}
              style={{ aspectRatio: t.ratio }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.75, ease: EASE, delay: (i % 4) * 0.06 }}
            >
              <img
                src={t.src}
                alt={t.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-soft hover:scale-[1.04]"
              />
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Two 23px squares: a four-up mark and a single one, matching the control the
 * reference puts above its wall.
 */
function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <div role="group" aria-label="Wall layout" className="flex items-center gap-[10px]">
      <button
        type="button"
        aria-label="Four across"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className={cn(
          "grid h-[23px] w-[23px] grid-cols-2 gap-[3px] transition-opacity duration-300",
          view === "grid" ? "opacity-100" : "opacity-40 hover:opacity-70"
        )}
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="rounded-[2px] bg-paper" />
        ))}
      </button>

      <button
        type="button"
        aria-label="One across"
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        className={cn(
          "h-[23px] w-[23px] rounded-[3px] bg-paper transition-opacity duration-300",
          view === "list" ? "opacity-100" : "opacity-40 hover:opacity-70"
        )}
      />
    </div>
  );
}

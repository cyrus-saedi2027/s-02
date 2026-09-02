import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal, MaskLine } from "../ui/Reveal";
import { MagneticButton } from "../ui/MagneticButton";
import { solutions } from "@/data/site";
import { MarqueeLabel } from "../ui/MarqueeLabel";
import { ParallaxImage } from "../ui/ParallaxImage";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Capabilities: four columns that expand on hover, with the hovered panel
 * taking extra width on desktop and its sub-items staggering in.
 */
export function Solutions() {
  const [open, setOpen] = useState(0);

  return (
    <section id="solutions" className="relative py-24 md:py-36">
      <div className="shell">
        <div className="mb-14 flex flex-col gap-8 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal className="mb-6">
              <MarqueeLabel text="Capabilities" />
            </Reveal>
            <h2 className="text-[clamp(2.75rem,7vw,7.5rem)] font-medium leading-[0.9] tracking-tighter">
              <MaskLine>Solutions</MaskLine>
              <MaskLine delay={0.08} className="text-dimmer">
                I Provide
              </MaskLine>
            </h2>
          </div>
          <Reveal delay={0.2}>
            <MagneticButton label="Let's connect" href="#contact" variant="outline" />
          </Reveal>
        </div>

        <div className="flex flex-col gap-px lg:h-[520px] lg:flex-row">
          {solutions.map((s, i) => {
            const active = open === i;
            return (
              <Reveal
                key={s.title}
                delay={i * 0.09}
                className={`min-w-0 lg:transition-[flex] lg:duration-[700ms] lg:ease-soft ${
                  active ? "lg:flex-[2.2]" : "lg:flex-[1]"
                }`}
              >
                <div
                  onMouseEnter={() => setOpen(i)}
                  onFocus={() => setOpen(i)}
                  tabIndex={0}
                  className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-lg border p-6 outline-none transition-colors duration-[700ms] ease-soft md:p-8 ${
                    active
                      ? "border-transparent bg-accent text-paper"
                      : "border-hair bg-surface text-paper hover:border-hairStrong"
                  }`}
                >
                  {/* Panel art. It sits under the content and lifts in as the
                      panel opens; the scrim keeps the list legible over it. */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%]"
                    initial={false}
                    animate={{ opacity: active ? 0.24 : 0.12 }}
                    transition={{ duration: 0.7, ease: EASE }}
                  >
                    <ParallaxImage
                      src={s.art}
                      alt=""
                      className="pointer-events-auto h-full w-full"
                      scale={1.12}
                      shift={7}
                      stiffness={80}
                      damping={22}
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-transparent via-black/35 to-black/90" />
                  </motion.div>

                  <div className="relative flex items-start justify-between gap-4">
                    <span
                      className={`font-sans text-2xs font-semibold uppercase tracking-wider transition-colors duration-500 ${
                        active ? "text-paper" : "text-dim"
                      }`}
                    >
                      {s.n}
                    </span>
                    <motion.span
                      animate={{ rotate: active ? 45 : 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors duration-500 ${
                        active ? "border-paper/40" : "border-hairStrong"
                      }`}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path
                          d="M6 1v10M1 6h10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </motion.span>
                  </div>

                  <div className="relative mt-16 lg:mt-0">
                    {/* Collapsed panels are too narrow for the title, so it
                        stands vertically until the panel opens. */}
                    <h3
                      className={`font-medium leading-none tracking-tighter transition-all duration-[700ms] ease-soft ${
                        active
                          ? "text-[clamp(1.75rem,3.4vw,3rem)] lg:[writing-mode:horizontal-tb] lg:rotate-0"
                          : "text-[clamp(1.75rem,3.4vw,2.25rem)] lg:[writing-mode:vertical-rl] lg:rotate-180"
                      }`}
                    >
                      {s.title}
                    </h3>

                    {/* Sub-items collapse to a hairline list when inactive. */}
                    <motion.ul
                      className="mt-6 flex flex-col gap-2 overflow-hidden"
                      animate={{
                        height: active ? "auto" : 0,
                        opacity: active ? 1 : 0,
                      }}
                      initial={false}
                      transition={{ duration: 0.55, ease: EASE }}
                    >
                      {s.items.map((item, k) => (
                        <motion.li
                          key={item}
                          initial={false}
                          animate={{
                            y: active ? 0 : 12,
                            opacity: active ? 1 : 0,
                          }}
                          transition={{
                            duration: 0.45,
                            delay: active ? 0.08 + k * 0.05 : 0,
                            ease: EASE,
                          }}
                          className="flex items-center gap-3 border-b border-paper/20 pb-2 font-sans text-sm"
                        >
                          <span className="h-1 w-1 rounded-full bg-paper/70" />
                          {item}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

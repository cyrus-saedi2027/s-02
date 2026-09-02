import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MarqueeLabel } from "@/components/ui/MarqueeLabel";
import { MaskLine, Reveal } from "@/components/ui/Reveal";
import { faqs } from "@/data/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The questions people ask before they write.
 *
 * Any number of panels can be open at once: these are eight small, unrelated
 * answers, and closing one to read another would make the reader work for no
 * reason. The heading stays put on the left while the column runs beside it.
 */
export function Faq() {
  const [open, setOpen] = useState<number[]>([]);

  const toggle = (i: number) =>
    setOpen((prev) => (prev.includes(i) ? prev.filter((n) => n !== i) : [...prev, i]));

  return (
    <section id="faq" className="relative py-20 md:py-28">
      <div className="shell flex flex-col gap-12 lg:flex-row lg:gap-0">
        <div className="lg:w-1/2">
          <Reveal className="mb-[30px]">
            <MarqueeLabel text="Frequently asked questions" width="17rem" />
          </Reveal>
          <h2 className="text-[clamp(3rem,8vw,7.5rem)] font-bold leading-[0.85] tracking-tighter">
            <MaskLine>FAQ&rsquo;S</MaskLine>
          </h2>
        </div>

        <div className="flex flex-col gap-[10px] lg:w-1/2">
          {faqs.map((f, i) => (
            <Panel
              key={f.q}
              index={i}
              question={f.q}
              answer={f.a}
              open={open.includes(i)}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Panel({
  index,
  question,
  answer,
  open,
  onToggle,
}: {
  index: number;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const id = `faq-panel-${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: EASE, delay: Math.min(index, 4) * 0.05 }}
      className="overflow-hidden rounded-[10px] bg-white/[0.06] transition-colors duration-300 hover:bg-white/[0.09]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center gap-5 px-6 py-7 text-left md:px-9"
      >
        <span className="flex-1 text-sm font-medium uppercase leading-snug tracking-normalish">
          {question}
        </span>
        {/* A plus that turns a quarter-eighth into a cross, as the reference
            does — one mark, one move, so open and close read as the same
            gesture run in either direction. */}
        <motion.span
          aria-hidden="true"
          className="relative h-[18px] w-[18px] shrink-0 text-dim"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-7 text-xs uppercase leading-[1.6] text-dim md:px-9">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

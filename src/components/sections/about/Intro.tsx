import { motion } from "framer-motion";
import { FitText } from "@/components/ui/FitText";
import { Reveal } from "@/components/ui/Reveal";
import { RisingText } from "@/components/ui/RisingText";
import { ZoomPlate } from "@/components/ui/ZoomPlate";
import { aboutPage } from "@/data/site";

/**
 * The page opener: the word ABOUT set edge to edge in the accent gradient,
 * the two-part standfirst beneath it, and the portrait plate alongside.
 *
 * The standfirst rises character by character, the same way the pull quote
 * further down does, so the two blocks of oversized type on this page read as
 * one idea rather than two different treatments.
 */
export function Intro() {
  return (
    <section className="relative pt-[calc(var(--shell-x)+3.5rem)]">
      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          <FitText
            text={aboutPage.title}
            style={{
              backgroundImage: `linear-gradient(273deg, rgb(var(--c-accent-warm)) 0%, rgb(var(--c-accent)) 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          />
        </motion.div>

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col justify-start">
            <h2 className="max-w-[22ch] text-[clamp(1.6rem,3.05vw,2.75rem)] font-semibold uppercase leading-[1] tracking-tight">
              <RisingText text={aboutPage.lead} />
            </h2>

            <p className="mt-7 max-w-[24ch] text-[clamp(1.6rem,3.05vw,2.75rem)] font-semibold uppercase leading-[1] tracking-tight text-paper/35">
              <RisingText text={aboutPage.secondary} />
            </p>

            <Reveal delay={0.3} className="mt-auto pt-12">
              <Signature />
            </Reveal>
          </div>

          <div className="lg:justify-self-end lg:pl-6">
            <Reveal delay={0.18}>
              <ZoomPlate
                src={aboutPage.portrait.src}
                alt={aboutPage.portrait.alt}
                loading="eager"
                className="aspect-[675/770] w-full rounded-[10px]"
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The signed-off flourish under the copy. Drawn as a stroke so it can be
 * written on rather than faded in.
 */
function Signature() {
  return (
    <svg
      viewBox="0 0 250 150"
      className="h-[clamp(5rem,9vw,8.5rem)] w-auto"
      fill="none"
      role="img"
      aria-label="Zayla's signature"
    >
      <motion.path
        d="M16 40 C40 18 84 12 128 16 C100 52 70 88 40 122 C74 108 112 104 152 110
           C176 114 196 104 206 84 C212 70 202 60 192 68 C182 76 186 96 200 108
           C212 118 228 116 236 106"
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1], delay: 0.15 }}
      />
    </svg>
  );
}

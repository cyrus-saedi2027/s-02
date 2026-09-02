import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { HoverStaggerLabel } from "@/components/ui/AnimatedText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SocialLink } from "@/components/ui/SocialLink";
import { contactPage, identity, socials } from "@/data/site";
import { hasEndpoint, sendEnquiry } from "@/lib/sendEnquiry";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The top half of the contact page: an invitation on the left, the form and
 * the studio's details on the right.
 *
 * The two columns are exact halves of the shell with no gutter between them —
 * the left column's copy is narrow enough that the space between the two
 * reads as air rather than as a missing column.
 */
export function Enquiry() {
  return (
    <section className="relative pb-20 md:pb-28">
      <div className="shell flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-0">
        <Invitation />
        <div className="flex flex-col gap-16 lg:w-1/2 lg:gap-[100px]">
          <EnquiryForm />
          <PlusRule />
          <Details />
        </div>
      </div>
    </section>
  );
}

/** Left column: the quote, and who is answering it. */
function Invitation() {
  return (
    <Reveal className="flex flex-col gap-[30px] lg:w-1/2 lg:pr-12">
      <svg
        width="28"
        height="21"
        viewBox="0 0 28 21"
        fill="none"
        aria-hidden="true"
        className="text-accent"
      >
        <path
          d="M0 21V12.6C0 8.68 0.88 5.53 2.64 3.15C4.4 0.77 6.99 0 10.4 0V4.62C8.53 4.62 7.17 5.11 6.32 6.09C5.47 7.07 5.04 8.4 5.04 10.08H10.4V21H0ZM17.6 21V12.6C17.6 8.68 18.48 5.53 20.24 3.15C22 0.77 24.59 0 28 0V4.62C26.13 4.62 24.77 5.11 23.92 6.09C23.07 7.07 22.64 8.4 22.64 10.08H28V21H17.6Z"
          fill="currentColor"
        />
      </svg>

      <p className="max-w-[30ch] text-[clamp(1.05rem,1.5vw,1.15rem)] font-medium uppercase leading-[1.2] tracking-normalish text-paper">
        {contactPage.quote}
      </p>

      <div className="flex items-center gap-5">
        <img
          src="/art/about-avatar.svg"
          alt={`${identity.name}, portrait`}
          width={70}
          height={70}
          className="h-[70px] w-[70px] shrink-0 rounded-full object-cover"
        />
        <div>
          <p className="text-[1.15rem] font-medium uppercase leading-tight tracking-normalish">
            {identity.name}
          </p>
          <p className="mt-1 text-xs uppercase text-dim">
            {identity.role}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

/**
 * The form.
 *
 * Where it sends is configuration, not a decision baked in here: with
 * `VITE_CONTACT_ENDPOINT` set it posts, and without it the composed message
 * goes to the visitor's own mail client. The confirmation says which of the
 * two happened, because "sent" and "ready to send in your mail app" ask
 * different things of the reader and telling them apart is the difference
 * between a form that works and one that only looks like it does.
 */
function EnquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [via, setVia] = useState<"endpoint" | "mail">("mail");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;

    const data = new FormData(e.currentTarget);
    // A field no person can see and no person fills in. A bot fills in
    // everything, so anything in here means the submission is not from a
    // reader — accepted silently, so whatever filled it learns nothing.
    if (String(data.get("company") ?? "").trim()) {
      setState("sent");
      return;
    }

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setError("Please fill in your name, email and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email address does not look right.");
      return;
    }

    setError(null);
    setState("sending");
    try {
      const result = await sendEnquiry({ name, email, message });
      setVia(result.via);
      setState("sent");
    } catch (err) {
      setState("idle");
      setError(
        err instanceof Error
          ? `${err.message} Write to ${identity.email} instead and it will reach me.`
          : `Something went wrong. Write to ${identity.email} instead.`
      );
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state === "sent" ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="rounded-[10px] border border-hair bg-paper/[0.03] p-8"
          role="status"
        >
          <p className="text-lg font-medium">
            {via === "endpoint" ? "Message sent." : "Your message is ready to send."}
          </p>
          <p className="mt-3 max-w-[46ch] font-sans text-sm leading-relaxed text-dim">
            {via === "endpoint"
              ? `It is with me now. I answer everything within a day or two — if you do not hear back, ${identity.email} reaches me directly.`
              : `It has been handed to your mail app, addressed to ${identity.email}. Nothing leaves this page on its own — press send there and it is on its way.`}
          </p>
          <button
            type="button"
            onClick={() => setState("idle")}
            className="mt-6 font-sans text-2xs font-semibold uppercase tracking-wider text-accent"
          >
            Write another
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={onSubmit}
          noValidate
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-col gap-5"
        >
          <Field name="name" label="Your Name*" type="text" autoComplete="name" />
          <Field name="email" label="Your Email*" type="email" autoComplete="email" />
          <Field name="message" label="Your Message*" textarea />

          {/* The honeypot: parked off-screen rather than hidden with
              `display: none`, which the cruder bots know to skip. Out of the
              tab order and out of the accessibility tree, so nobody reading
              the page in any way is offered it. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden"
          >
            <input
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
          </div>

          {error && (
            <p role="alert" className="font-sans text-xs text-accent">
              {error}
            </p>
          )}

          <div className="pt-[10px]">
            <MagneticButton
              label={state === "sending" ? "Sending" : "Send message"}
              type="submit"
              disabled={state === "sending"}
              variant="accent"
            />
          </div>

          {!hasEndpoint() && (
            <p className="font-sans text-2xs leading-relaxed text-dimmer">
              This form opens your mail app. Set VITE_CONTACT_ENDPOINT to post
              it instead.
            </p>
          )}
        </motion.form>
      )}
    </AnimatePresence>
  );
}

/**
 * One field. The label doubles as the placeholder, as in the reference, so the
 * rule under the field is the only chrome — and it takes the accent while the
 * field has focus.
 */
function Field({
  name,
  label,
  type = "text",
  textarea = false,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  autoComplete?: string;
}) {
  const shared =
    "w-full bg-transparent font-sans text-base text-paper outline-none placeholder:text-paper/40";

  return (
    <label className="block border-b border-paper/20 transition-colors duration-300 ease-swift focus-within:border-accent">
      <span className="sr-only">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={5}
          placeholder={label}
          className={`${shared} h-[150px] resize-none py-4`}
        />
      ) : (
        <input
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={label}
          className={`${shared} py-4`}
        />
      )}
    </label>
  );
}

/** The small cross the reference sets between the form and the details. */
function PlusRule() {
  return (
    <div aria-hidden="true" className="text-paper/25">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M14 3v22M3 14h22"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** Address and lines of contact on the left, the accounts on the right. */
function Details() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-12 sm:flex-row sm:gap-10">
      <div className="flex flex-col gap-[30px] sm:w-1/2">
        <address className="max-w-[24ch] text-[1.05rem] font-medium not-italic uppercase leading-[1.2] tracking-normalish">
          {identity.address}
        </address>
        <div className="flex flex-col gap-[10px]">
          <a
            href={`tel:${contactPage.phone.replace(/\s/g, "")}`}
            onMouseEnter={() => setHover("phone")}
            onMouseLeave={() => setHover(null)}
            className="inline-flex text-sm font-semibold uppercase tracking-normalish transition-colors duration-300 hover:text-accent"
          >
            <HoverStaggerLabel text={contactPage.phone} active={hover === "phone"} />
          </a>
          <a
            href={`mailto:${identity.email}`}
            onMouseEnter={() => setHover("email")}
            onMouseLeave={() => setHover(null)}
            className="inline-flex text-sm font-semibold uppercase tracking-normalish transition-colors duration-300 hover:text-accent"
          >
            <HoverStaggerLabel text={identity.email} active={hover === "email"} />
          </a>
        </div>
      </div>

      <ul className="flex flex-col gap-[5px] sm:w-1/2">
        {socials.map((s) => (
          <li key={s.label}>
            <SocialLink
              social={s}
              className="text-[clamp(2rem,3.2vw,2.75rem)] font-bold uppercase leading-[1.1] tracking-tight"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

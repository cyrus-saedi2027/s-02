/**
 * The page-to-page wipe.
 *
 * The reference hands navigation to the View Transitions API with a single
 * bottom-to-top wipe, and the numbers below are lifted from its config rather
 * than eyeballed:
 *
 *   exit   opacity 1 → 0, translateY 0 → -30%, wipe 0 → 1, 1s, no delay
 *   enter  opacity 0 → 1, translateY 30% → 0,  wipe 0 → 1, 1s, delayed 0.5s
 *   both   cubic-bezier(.73, 0, .33, 1)
 *
 * The wipe is a hard-edged mask travelling up the viewport: it takes the old
 * page away from the bottom edge and brings the new one back the same way. The
 * two overlap for half a second in the middle, and because the page ground is
 * the accent red (see `html` in index.css) that is what shows between them —
 * the red flash that gives the change of page its character.
 *
 * The CSS lives in index.css, where `@property --vt-wipe` can register the
 * custom property; an unregistered one is not interpolable and the mask would
 * jump rather than sweep.
 *
 * Where the API is missing the navigation simply happens, with no animation.
 * That is what the reference does too, and it is the honest fallback: a
 * half-built imitation of a wipe reads worse than a clean cut.
 */

const canAnimate = () =>
  typeof document !== "undefined" &&
  typeof (document as Document & { startViewTransition?: unknown })
    .startViewTransition === "function" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type StartViewTransition = (cb: () => void | Promise<void>) => {
  finished: Promise<void>;
};

/**
 * Runs `commit` — the actual route change — inside a view transition.
 *
 * `commit` must apply the new page synchronously, which is why callers pass a
 * `flushSync`-wrapped state update: the API captures the "after" state as soon
 * as the callback resolves, so a change still sitting in React's queue would
 * be captured as the old page and nothing would appear to move.
 */
export function withPageTransition(commit: () => void) {
  if (!canAnimate()) {
    commit();
    return;
  }

  const doc = document as Document & { startViewTransition: StartViewTransition };
  document.documentElement.dataset.pageTransition = "true";

  const vt = doc.startViewTransition(() => {
    commit();
  });

  vt.finished
    .catch(() => {})
    .finally(() => {
      delete document.documentElement.dataset.pageTransition;
    });
}

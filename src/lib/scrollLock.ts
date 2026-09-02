/**
 * Freeze the page behind a full-screen layer without moving it.
 *
 * The lock has to leave the document's height alone. Shrinking the page to the
 * viewport — the obvious `body { overflow: hidden; height: 100vh }` — puts the
 * current offset past the end of a one-screen document, so the browser clamps
 * it to zero: open a dialog from the foot of the page and the page behind it
 * jumps to the top, which is the one thing a dialog must not do. Hiding
 * overflow on the scrolling element leaves the layout, and with it the offset,
 * exactly where it was.
 *
 * Taking the scrollbar away widens the content box by its width and shifts the
 * whole page sideways; the padding puts that width back.
 *
 * Counted, because the preloader and a dialog can overlap.
 */
let depth = 0;
let padWas = "";

export function lockScroll() {
  if (depth++ > 0) return;
  const root = document.documentElement;
  const bar = window.innerWidth - root.clientWidth;
  padWas = root.style.paddingRight;
  if (bar > 0) root.style.paddingRight = `${bar}px`;
  root.dataset.locked = "true";
}

export function unlockScroll() {
  if (depth === 0 || --depth > 0) return;
  const root = document.documentElement;
  root.style.paddingRight = padWas;
  delete root.dataset.locked;
}

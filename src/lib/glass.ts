/**
 * Blur radius of the site's frosted glass, in pixels.
 *
 * Two surfaces share it: the menu panel, and the graduated band at the top of
 * the page (whose strongest point has to read as the same glass). Keeping one
 * number means they cannot drift apart.
 */
export const GLASS_BLUR = 15;

/** Saturation lift applied alongside the blur, so the glass keeps some colour. */
export const GLASS_SATURATE = 1.4;

/** Opacity of the grain tile below. Read it as a percentage: 0.027 is 2.7%. */
export const GLASS_GRAIN_OPACITY = 0.027;

/**
 * Fine grain laid over the glass as a static tile — painted once, never
 * animated, so it costs nothing per frame.
 */
export const GLASS_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23g)'/%3E%3C/svg%3E\")";

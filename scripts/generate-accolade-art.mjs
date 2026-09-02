/**
 * Draws the award seal that stands beside the recognition ledger.
 *
 * Sized 8:9 to match its frame exactly, and built from hard-edged geometry
 * rather than soft gradients: the plate is scaled through a scroll animation
 * from well past its frame back to fitting it, and a wash of gradients has
 * nothing to reveal on the way. Rings, ticks and a burst do — cropped you read
 * the bezel, pulled back you read the whole seal.
 *
 * No SVG filters anywhere. A filter is re-run every time the browser rasters a
 * tile the image touches, and this one is under a scroll transform, so it
 * would be re-rastering the entire way down the page.
 *
 * Usage: node scripts/generate-accolade-art.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/art/accolade.svg");

const W = 900;
const H = 1013; // 8:9, the frame's own ratio

const RED = "#fd321c";
const EMBER = "#ff8a00";
const PAPER = "#f4f1ea";

const CX = W / 2;
const CY = H * 0.455;
const R = 348; // outer bezel

// Everything inside the seal is a fraction of R, so the whole thing scales as
// one drawing rather than drifting apart when the bezel is resized.
const RING = R * 0.878;   // the bright inner ring
const BRANCH = R * 0.735; // radius the laurel sits on
const DISC = R * 0.6;     // the dark centre
const HAIR = R * 0.53;    // the thin ring inside it
const STAR = R * 0.44;    // the star's long points

const n = (v) => Number(v.toFixed(1));
const pt = (a, r) => [n(CX + Math.cos(a) * r), n(CY + Math.sin(a) * r)];
const rad = (deg) => (deg * Math.PI) / 180;

/** The graduated bezel: a tick every four degrees, every fifth one long. */
function ticks() {
  let s = "";
  for (let i = 0; i < 90; i++) {
    const a = rad(i * 4 - 90);
    const major = i % 5 === 0;
    const [x1, y1] = pt(a, R - R * 0.012);
    const [x2, y2] = pt(a, R - R * (major ? 0.093 : 0.05));
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${major ? RED : PAPER}" stroke-opacity="${
      major ? 0.95 : 0.42
    }" stroke-width="${major ? 5 : 2.5}" stroke-linecap="square"/>`;
  }
  return s;
}

/**
 * A laurel branch climbing one side of the seal.
 *
 * `dir` is +1 for the branch up the right side, -1 for the left. The pair
 * starts either side of the base — leaving the gap the ribbon comes out of —
 * and runs up past the shoulder. Each leaf sits on the tangent and leans
 * outward along the branch, which is what stops the two arcs reading as a
 * string of beads.
 */
function laurel(dir) {
  const leaves = 12;
  const from = 78;   // just off the base
  const to = -34;    // up past the shoulder
  let s = "";

  for (let i = 0; i < leaves; i++) {
    const t = i / (leaves - 1);
    const deg = from + (to - from) * t;
    const a = rad(dir > 0 ? deg : 180 - deg);
    const rr = BRANCH + Math.sin(t * Math.PI) * R * 0.024;
    const [x, y] = pt(a, rr);
    // Tangent, then leaned back down the branch so the tips point outward.
    const lean = (dir > 0 ? deg : 180 - deg) + 90 + dir * 30;
    const rx = R * (0.102 - t * 0.028);
    const ry = R * (0.037 - t * 0.009);
    // A lens rather than an ellipse: two arcs meeting at a point on each end.
    const leaf = `M ${n(-rx)} 0 Q 0 ${n(-ry)} ${n(rx)} 0 Q 0 ${n(ry)} ${n(-rx)} 0 Z`;
    s += `<path d="${leaf}" fill="url(#leaf)" opacity="${(0.92 - t * 0.18).toFixed(2)}" transform="translate(${x} ${y}) rotate(${n(lean)})"/>`;
  }

  const [sx, sy] = pt(rad(dir > 0 ? from : 180 - from), BRANCH);
  const [ex, ey] = pt(rad(dir > 0 ? to : 180 - to), BRANCH);
  s += `<path d="M ${sx} ${sy} A ${n(BRANCH)} ${n(BRANCH)} 0 0 ${dir > 0 ? 0 : 1} ${ex} ${ey}" fill="none" stroke="${RED}" stroke-opacity="0.45" stroke-width="3"/>`;
  return s;
}

/** The eight-point star at the centre: long cardinals, short diagonals. */
function star() {
  const long = STAR;
  const short = STAR * 0.36;
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const a = rad(i * 22.5 - 90);
    const r = i % 2 === 0 ? (i % 4 === 0 ? long : long * 0.62) : short;
    pts.push(pt(a, r).join(" "));
  }
  return `<polygon points="${pts.join(" ")}" fill="url(#burst)"/>`;
}

/** Two narrow bands falling from behind the seal, notched at the ends. */
function ribbon() {
  const top = CY + DISC * 0.6;
  const foot = H - 34;
  const band = (dir) => {
    const headIn = CX + dir * 10;
    const headOut = CX + dir * 74;
    const footIn = CX + dir * 46;
    const footOut = CX + dir * 122;
    return `<path d="M ${n(headIn)} ${n(top)} L ${n(headOut)} ${n(top)} L ${n(footOut)} ${n(foot)} L ${n(
      (footOut + footIn) / 2
    )} ${n(foot - 44)} L ${n(footIn)} ${n(foot)} Z" fill="url(#${dir > 0 ? "bandA" : "bandB"})"/>`;
  };
  return band(-1) + band(1);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="#150809"/>
      <stop offset="0.5" stop-color="#0b0507"/>
      <stop offset="1" stop-color="#07070c"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.45" r="0.55">
      <stop offset="0" stop-color="${EMBER}" stop-opacity="0.34"/>
      <stop offset="0.45" stop-color="${RED}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${RED}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="disc" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#20120f"/>
      <stop offset="0.55" stop-color="#12090b"/>
      <stop offset="1" stop-color="#0a0810"/>
    </linearGradient>
    <linearGradient id="burst" x1="0.15" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="#fff4dd"/>
      <stop offset="0.4" stop-color="${EMBER}"/>
      <stop offset="1" stop-color="${RED}"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${EMBER}"/>
      <stop offset="1" stop-color="${RED}"/>
    </linearGradient>
    <linearGradient id="bandA" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${RED}"/>
      <stop offset="1" stop-color="#8d1a08"/>
    </linearGradient>
    <linearGradient id="bandB" x1="1" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${EMBER}"/>
      <stop offset="1" stop-color="#a33208"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.66">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.6" stop-color="#000" stop-opacity="0.12"/>
      <stop offset="0.85" stop-color="#000" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.88"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#ground)"/>
  <circle cx="${CX}" cy="${n(CY)}" r="${n(R * 1.55)}" fill="url(#halo)"/>

  ${ribbon()}

  <circle cx="${CX}" cy="${n(CY)}" r="${n(R)}" fill="none" stroke="${PAPER}" stroke-opacity="0.22" stroke-width="3"/>
  ${ticks()}
  <circle cx="${CX}" cy="${n(CY)}" r="${n(RING)}" fill="none" stroke="${RED}" stroke-opacity="0.75" stroke-width="6"/>

  ${laurel(1)}
  ${laurel(-1)}

  <circle cx="${CX}" cy="${n(CY)}" r="${n(DISC)}" fill="url(#disc)" stroke="${PAPER}" stroke-opacity="0.3" stroke-width="2"/>
  <circle cx="${CX}" cy="${n(CY)}" r="${n(HAIR)}" fill="none" stroke="${EMBER}" stroke-opacity="0.35" stroke-width="1.5"/>
  ${star()}
  <circle cx="${CX}" cy="${n(CY)}" r="14" fill="#0b0507" stroke="${PAPER}" stroke-opacity="0.7" stroke-width="2"/>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
</svg>`;

fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(ROOT, OUT)} (${(svg.length / 1024).toFixed(1)} kB)`);

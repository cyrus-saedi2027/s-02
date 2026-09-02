/**
 * Generates the three plates the About page needs:
 *
 *   about-portrait.svg   the tall figure beside the intro copy
 *   about-avatar.svg     the round crop that labels the pull quote
 *   about-honors.svg     the plate that stands beside the recognition ledger
 *
 * All three are drawn from the same silhouette so they read as one sitting:
 * a figure lit hot from behind and rimmed cold along one edge, which is the
 * palette the rest of the site already uses (accent red into warm orange,
 * with a single cool highlight).
 *
 * Everything is paths and gradients — no filters, no bitmaps — so the files
 * stay small, scale cleanly and inline into the standalone build.
 *
 * Usage: node scripts/generate-about-art.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/art");

const RED = "#fd321c";
const WARM = "#ff8a00";
const DEEP = "#c31d12";
const INK = "#08080b";
const COOL = "#3d7bff";
const COOL_PALE = "#8fc2ff";

const n = (v) => Number(v.toFixed(2));

function makeRng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ---------------------------------------------------------------------------
 * Silhouette
 *
 * One closed path for head + neck + shoulders, plus a separate mass for the
 * hair. Both are built from cubic segments in a unit-ish space and then placed,
 * so the same geometry can be framed three different ways.
 * ------------------------------------------------------------------------- */

/**
 * Head and shoulders, facing slightly up and to the right.
 * `x`,`y` place the crown; `s` scales; the path closes off the bottom edge at
 * `floor` so the figure sits flush with the frame.
 */
function figure(x, y, s, floor) {
  const p = (dx, dy) => `${n(x + dx * s)} ${n(y + dy * s)}`;
  return [
    `M ${p(0, 0)}`,
    // crown over to the brow on the right
    `C ${p(46, -3)} ${p(80, 30)} ${p(84, 74)}`,
    // brow, nose, lips, chin — the profile edge
    `C ${p(86, 96)} ${p(80, 104)} ${p(88, 112)}`,
    `C ${p(94, 118)} ${p(84, 122)} ${p(82, 130)}`,
    `C ${p(80, 140)} ${p(86, 146)} ${p(78, 152)}`,
    `C ${p(72, 157)} ${p(60, 158)} ${p(52, 160)}`,
    // jaw back toward the neck
    `C ${p(46, 170)} ${p(48, 184)} ${p(44, 196)}`,
    // neck down into the shoulder line
    `C ${p(40, 210)} ${p(28, 214)} ${p(6, 222)}`,
    `C ${p(-26, 233)} ${p(-52, 252)} ${p(-66, 286)}`,
    `L ${p(-66, floor)}`,
    `L ${p(96, floor)}`,
    `C ${p(96, 250)} ${p(74, 226)} ${p(52, 214)}`,
    `C ${p(34, 204)} ${p(26, 190)} ${p(24, 172)}`,
    // back of the skull closing the loop
    `C ${p(2, 160)} ${p(-16, 128)} ${p(-14, 88)}`,
    `C ${p(-12, 44)} ${p(-16, 6)} ${p(0, 0)}`,
    `Z`,
  ].join(" ");
}

/** The hair mass: falls behind the shoulder and lifts away from the crown. */
function hair(x, y, s, floor) {
  const p = (dx, dy) => `${n(x + dx * s)} ${n(y + dy * s)}`;
  return [
    `M ${p(2, -2)}`,
    `C ${p(48, -8)} ${p(88, 26)} ${p(86, 70)}`,
    `C ${p(84, 92)} ${p(74, 96)} ${p(70, 88)}`,
    `C ${p(64, 60)} ${p(44, 34)} ${p(10, 34)}`,
    `C ${p(-22, 34)} ${p(-40, 62)} ${p(-46, 104)}`,
    `C ${p(-52, 150)} ${p(-46, 196)} ${p(-58, 240)}`,
    `C ${p(-66, 272)} ${p(-84, 300)} ${p(-96, floor)}`,
    `L ${p(-150, floor)}`,
    `C ${p(-140, 250)} ${p(-116, 150)} ${p(-104, 96)}`,
    `C ${p(-92, 40)} ${p(-44, 4)} ${p(2, -2)}`,
    `Z`,
  ].join(" ");
}

/**
 * The lit contour on its own — crown, brow, nose, lips, chin, jaw, neck, then
 * out along the shoulder. Open, so stroking it lays a rim light along the edge
 * instead of outlining the whole silhouette (which drew lines across the body
 * where the hair and shoulder paths overlapped).
 */
function litEdge(x, y, s) {
  const p = (dx, dy) => `${n(x + dx * s)} ${n(y + dy * s)}`;
  return [
    `M ${p(-6, 22)}`,
    `C ${p(40, 2)} ${p(80, 30)} ${p(84, 74)}`,
    `C ${p(86, 96)} ${p(80, 104)} ${p(88, 112)}`,
    `C ${p(94, 118)} ${p(84, 122)} ${p(82, 130)}`,
    `C ${p(80, 140)} ${p(86, 146)} ${p(78, 152)}`,
    `C ${p(72, 157)} ${p(60, 158)} ${p(52, 160)}`,
    `C ${p(46, 170)} ${p(48, 184)} ${p(44, 196)}`,
    `C ${p(40, 210)} ${p(28, 214)} ${p(6, 222)}`,
  ].join(" ");
}

/** Fine tonal grain: short translucent strokes, deterministic per seed. */
function grain(w, h, seed, count, opacity) {
  const rnd = makeRng(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const cx = rnd() * w;
    const cy = rnd() * h;
    const len = 6 + rnd() * 34;
    const a = rnd() * Math.PI;
    out.push(
      `<line x1="${n(cx)}" y1="${n(cy)}" x2="${n(cx + Math.cos(a) * len)}" y2="${n(
        cy + Math.sin(a) * len
      )}" stroke="#ffffff" stroke-opacity="${n(opacity * rnd())}" stroke-width="${n(
        0.6 + rnd() * 1.1
      )}"/>`
    );
  }
  return out.join("");
}

/** The hot field the figure stands against. */
function field(id, w, h) {
  return `
  <radialGradient id="${id}-glow" cx="0.62" cy="0.4" r="0.78">
    <stop offset="0" stop-color="${WARM}"/>
    <stop offset="0.45" stop-color="${RED}"/>
    <stop offset="1" stop-color="${DEEP}"/>
  </radialGradient>
  <linearGradient id="${id}-floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${DEEP}" stop-opacity="0"/>
    <stop offset="1" stop-color="#5c0b06" stop-opacity="0.85"/>
  </linearGradient>
  <linearGradient id="${id}-body" x1="0.1" y1="0" x2="0.9" y2="1">
    <stop offset="0" stop-color="#101018"/>
    <stop offset="0.55" stop-color="${INK}"/>
    <stop offset="1" stop-color="#05050a"/>
  </linearGradient>
  <linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="0.35">
    <stop offset="0" stop-color="${COOL_PALE}" stop-opacity="0"/>
    <stop offset="0.55" stop-color="${COOL_PALE}" stop-opacity="0.9"/>
    <stop offset="1" stop-color="${COOL}" stop-opacity="0.15"/>
  </linearGradient>`;
}

function plate({ w, h, x, y, s, floor, seed, label, grainCount = 260 }) {
  const id = `p${seed}`;
  const body = figure(x, y, s, floor);
  const mane = hair(x, y, s, floor);
  const edge = litEdge(x, y, s);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">
<defs>${field(id, w, h)}
  <clipPath id="${id}-frame"><rect width="${w}" height="${h}"/></clipPath>
  <!-- Keeps the rim inside the silhouette: a centred stroke would otherwise
       spill half its width onto the orange and read as an outline. -->
  <mask id="${id}-figure">
    <path d="${mane}" fill="#fff"/>
    <path d="${body}" fill="#fff"/>
  </mask>
</defs>
<g clip-path="url(#${id}-frame)">
  <rect width="${w}" height="${h}" fill="url(#${id}-glow)"/>
  <rect width="${w}" height="${h}" fill="url(#${id}-floor)"/>
  ${grain(w, h, seed, grainCount, 0.05)}
  <!-- hair sits behind the body so the shoulder reads in front of it -->
  <path d="${mane}" fill="url(#${id}-body)"/>
  <path d="${body}" fill="url(#${id}-body)"/>
  <g mask="url(#${id}-figure)">
    <path d="${edge}" fill="none" stroke="url(#${id}-rim)" stroke-width="${n(s * 5)}"
          stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${edge}" fill="none" stroke="${COOL_PALE}" stroke-opacity="0.5" stroke-width="${n(s * 1.4)}"
          stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</g>
</svg>
`;
}

/* --------------------------------------------------------------------------- */

const files = [
  {
    name: "about-portrait.svg",
    svg: plate({
      w: 900,
      h: 1026,
      x: 440,
      y: 80,
      s: 2.4,
      floor: 400,
      seed: 20260901,
      label:
        "A figure in three-quarter profile, dark against a hot orange field, with a cold highlight along the lit edge",
    }),
  },
  {
    name: "about-avatar.svg",
    svg: plate({
      w: 320,
      h: 320,
      x: 125,
      y: 47,
      s: 1.45,
      floor: 300,
      seed: 20260902,
      grainCount: 160,
      label: "Portrait crop of the same figure against an orange field",
    }),
  },
  {
    name: "about-honors.svg",
    svg: plate({
      w: 900,
      h: 1084,
      x: 400,
      y: 120,
      s: 2.3,
      floor: 420,
      seed: 20260903,
      label:
        "The same figure lit from behind, framed for the recognition ledger",
    }),
  },
];

fs.mkdirSync(OUT, { recursive: true });
for (const f of files) {
  fs.writeFileSync(path.join(OUT, f.name), f.svg);
  console.log(`wrote ${f.name} (${(f.svg.length / 1024).toFixed(1)} kB)`);
}

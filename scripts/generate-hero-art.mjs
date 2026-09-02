/**
 * Generates the hero artwork: a portrait ink-wash landscape in the site's
 * red / charcoal / paper palette.
 *
 * Everything is drawn procedurally, so the output is deterministic and has no
 * bitmap dependencies. Swap the output file if you'd rather supply your own
 * photograph — Hero reads its source from `heroImage` in src/data/site.ts.
 *
 * Usage: node scripts/generate-hero-art.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = 900;
const H = 1200;

function makeRng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const rnd = makeRng(20260827);
const rand = (a, b) => a + rnd() * (b - a);
const n = (v) => Number(v.toFixed(1));

const RED = "#d32b1e";
const RED_DEEP = "#9e1710";
const INK = "#14141a";

const sky = [];      // behind the mountain
const land = [];     // mountain, pagoda, trees
const surface = [];  // water and its reflections
const canopy = [];   // branches and leaves, drawn last

/* ---------------------------------------------------------------------------
 * Maple leaf
 *
 * Polar sampling with a lobe function. The low exponent on |cos(2.5θ)| gives
 * broad lobes separated by narrow sinuses — the thing that separates a leaf
 * silhouette from a five-pointed star.
 * ------------------------------------------------------------------------- */
function mapleLeaf(cx, cy, r, rot, fill, opacity) {
  const LOBES = 5;
  const SINUS = 0.3;   // how deep the notches cut between lobes
  const REACH = 0.94;  // how far the control points push the lobe shoulders out
  const pt = (a, rr) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.96];

  const step = (Math.PI * 2) / LOBES;
  let d = "";
  for (let i = 0; i < LOBES; i++) {
    const tipA = rot + i * step;
    // The lower lobes are shorter, which keeps the leaf from reading as a rosette.
    const tipR = r * (1 - 0.16 * Math.abs(Math.sin((tipA - rot) / 2)));
    const sinusA = tipA + step / 2;
    const [tx, ty] = pt(tipA, tipR);
    const [sx, sy] = pt(sinusA, r * SINUS);
    // Shoulders sit wide of the tip, so each lobe is broad but ends in a point.
    const [c1x, c1y] = pt(tipA + step * 0.28, r * REACH);
    const [c2x, c2y] = pt(sinusA - step * 0.1, r * (SINUS + 0.34));

    if (i === 0) d += `M ${n(tx)} ${n(ty)}`;
    else d += ` L ${n(tx)} ${n(ty)}`;
    d += ` Q ${n(c1x)} ${n(c1y)} ${n(sx)} ${n(sy)}`;
    d += ` Q ${n(c2x)} ${n(c2y)} ${n(pt(sinusA + step * 0.22, r * (SINUS + 0.4))[0])} ${n(pt(sinusA + step * 0.22, r * (SINUS + 0.4))[1])}`;
  }
  d += " Z";

  const stemA = rot + Math.PI / 2;
  const stem = `<line x1="${n(cx)}" y1="${n(cy)}" x2="${n(cx + Math.cos(stemA) * r * 1.3)}" y2="${n(cy + Math.sin(stemA) * r * 1.3)}" stroke="${fill}" stroke-width="${n(Math.max(0.7, r * 0.09))}" stroke-linecap="round" opacity="${opacity}"/>`;
  return `<path d="${d}" fill="${fill}" opacity="${opacity}"/>${stem}`;
}

const leafFill = () => (rnd() > 0.7 ? RED_DEEP : RED);

/* ---------------------------------------------------------------------------
 * Sky and sun
 * ------------------------------------------------------------------------- */
sky.push(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`);
sky.push(`<circle cx="642" cy="252" r="120" fill="url(#sunGlow)" opacity="0.5"/>`);
sky.push(`<circle cx="642" cy="252" r="104" fill="${RED}"/>`);

/* ---------------------------------------------------------------------------
 * Mountain
 * ------------------------------------------------------------------------- */
const PEAK_X = 420;
const PEAK_Y = 452;
const BASE_Y = 815;

/* Slope helper: x position on the mountain edge at a given y. */
const SPREAD = 640; // half-width at the base
const slopeX = (y, side) =>
  PEAK_X + side * SPREAD * Math.pow((y - PEAK_Y) / (BASE_Y - PEAK_Y), 1.12);

let ridge = `M ${n(slopeX(BASE_Y, -1))} ${BASE_Y}`;
for (let y = BASE_Y; y > PEAK_Y; y -= 24) {
  ridge += ` L ${n(slopeX(y, -1) + rand(-3, 3))} ${n(y)}`;
}
ridge += ` L ${PEAK_X} ${PEAK_Y}`;
for (let y = PEAK_Y + 24; y <= BASE_Y; y += 24) {
  ridge += ` L ${n(slopeX(y, 1) + rand(-3, 3))} ${n(y)}`;
}
ridge += " Z";
land.push(`<path d="${ridge}" fill="url(#mountain)"/>`);

/* Snow cap: bounded by the slopes, with a ragged lower edge. */
const SNOW_Y = PEAK_Y + 128;
let cap = `M ${PEAK_X} ${PEAK_Y}`;
cap += ` L ${n(slopeX(SNOW_Y, 1))} ${SNOW_Y}`;
for (let i = 1; i <= 9; i++) {
  const t = 1 - i / 10;
  const y = SNOW_Y - rand(6, 34);
  cap += ` L ${n(PEAK_X + (slopeX(SNOW_Y, 1) - PEAK_X) * t)} ${n(y)}`;
}
for (let i = 1; i <= 9; i++) {
  const t = i / 10;
  const y = SNOW_Y - rand(6, 34);
  cap += ` L ${n(PEAK_X - (PEAK_X - slopeX(SNOW_Y, -1)) * t)} ${n(y)}`;
}
cap += ` L ${n(slopeX(SNOW_Y, -1))} ${SNOW_Y} Z`;
land.push(`<path d="${cap}" fill="#f4f2ef"/>`);
/* A couple of shadowed gullies running off the cap. */
land.push(
  `<path d="M ${PEAK_X - 16} ${PEAK_Y + 16} L ${PEAK_X - 44} ${SNOW_Y - 12} L ${PEAK_X - 22} ${SNOW_Y - 16} Z" fill="#d8d6d3" opacity="0.8"/>`
);
land.push(
  `<path d="M ${PEAK_X + 22} ${PEAK_Y + 20} L ${PEAK_X + 52} ${SNOW_Y - 20} L ${PEAK_X + 30} ${SNOW_Y - 24} Z" fill="#d8d6d3" opacity="0.7"/>`
);

/* ---------------------------------------------------------------------------
 * Pagoda — wide flared roofs over narrow bodies, widest tier at the bottom.
 * ------------------------------------------------------------------------- */
function pagoda(px, groundY, scale) {
  const g = [];
  const TIERS = 5;
  const tierH = 46 * scale;
  for (let i = 0; i < TIERS; i++) {
    const y = groundY - i * tierH;
    const roofW = (168 - i * 22) * scale;
    const bodyW = roofW * 0.42;
    // Body sits under this tier's roof.
    g.push(
      `<rect x="${n(px - bodyW / 2)}" y="${n(y - tierH)}" width="${n(bodyW)}" height="${n(tierH + 2)}" fill="${INK}"/>`
    );
    // Flared roof: sweeps up at both eaves.
    g.push(
      `<path d="M ${n(px - roofW / 2)} ${n(y - tierH)} Q ${n(px - roofW * 0.22)} ${n(y - tierH - 17 * scale)} ${n(px)} ${n(y - tierH - 20 * scale)} Q ${n(px + roofW * 0.22)} ${n(y - tierH - 17 * scale)} ${n(px + roofW / 2)} ${n(y - tierH)} Q ${n(px + roofW * 0.26)} ${n(y - tierH + 9 * scale)} ${n(px)} ${n(y - tierH + 7 * scale)} Q ${n(px - roofW * 0.26)} ${n(y - tierH + 9 * scale)} ${n(px - roofW / 2)} ${n(y - tierH)} Z" fill="${INK}"/>`
    );
  }
  // Spire above the top roof.
  const topY = groundY - TIERS * tierH - 20 * scale;
  g.push(`<rect x="${n(px - 2 * scale)}" y="${n(topY - 62 * scale)}" width="${n(4 * scale)}" height="${n(64 * scale)}" fill="${INK}"/>`);
  for (let r = 0; r < 4; r++) {
    const rw = (20 - r * 3) * scale;
    g.push(`<rect x="${n(px - rw / 2)}" y="${n(topY - 54 * scale + r * 13 * scale)}" width="${n(rw)}" height="${n(2.4 * scale)}" fill="${INK}"/>`);
  }
  return g.join("");
}

/* Conifers along the shoreline, behind and beside the pagoda. */
function conifer(x, groundY, h) {
  const w = h * 0.38;
  const layers = 4;
  const g = [];
  for (let i = 0; i < layers; i++) {
    const t = i / layers;
    const ly = groundY - t * h * 0.78;
    const lw = w * (1 - t * 0.55);
    g.push(
      `<path d="M ${n(x - lw / 2)} ${n(ly)} L ${n(x)} ${n(ly - h * 0.34)} L ${n(x + lw / 2)} ${n(ly)} Z" fill="${INK}"/>`
    );
  }
  g.push(`<rect x="${n(x - h * 0.022)}" y="${n(groundY - 3)}" width="${n(h * 0.044)}" height="6" fill="${INK}"/>`);
  return g.join("");
}

const SHORE_Y = 862;
for (let i = 0; i < 9; i++) {
  land.push(conifer(rand(596, 890), SHORE_Y - rand(0, 5), rand(48, 96)));
}
land.push(pagoda(716, SHORE_Y - 4, 0.82));
for (let i = 0; i < 5; i++) {
  land.push(conifer(rand(560, 660), SHORE_Y - rand(0, 4), rand(40, 70)));
}
/* A low bank grounding the buildings. */
land.push(
  `<path d="M 520 ${SHORE_Y} Q 700 ${SHORE_Y - 14} ${W} ${SHORE_Y - 6} L ${W} ${SHORE_Y + 12} L 520 ${SHORE_Y + 12} Z" fill="${INK}" opacity="0.9"/>`
);

/* Mist: a single soft veil across the lower slopes. Stacked blurred ellipses
   read as hard horizontal plates, so this uses one gradient band plus a couple
   of faint wisps instead. */
land.push(
  `<rect x="0" y="640" width="${W}" height="230" fill="url(#mist)"/>`
);
for (let i = 0; i < 3; i++) {
  const y = 700 + i * 46;
  land.push(
    `<ellipse cx="${n(rand(320, 540))}" cy="${n(y)}" rx="${n(rand(200, 300))}" ry="${n(rand(8, 14))}" fill="#f3f1ee" opacity="${rand(0.2, 0.34).toFixed(2)}" filter="url(#soften)"/>`
  );
}

/* ---------------------------------------------------------------------------
 * Water
 * ------------------------------------------------------------------------- */
const WATER_Y = 866;
surface.push(`<rect x="0" y="${WATER_Y}" width="${W}" height="${H - WATER_Y}" fill="url(#water)"/>`);
surface.push(`<ellipse cx="642" cy="${WATER_Y + 96}" rx="98" ry="40" fill="${RED}" opacity="0.22" filter="url(#blur)"/>`);
surface.push(`<ellipse cx="${PEAK_X}" cy="${WATER_Y + 62}" rx="230" ry="38" fill="#8b8b90" opacity="0.2" filter="url(#blur)"/>`);
surface.push(`<ellipse cx="716" cy="${WATER_Y + 54}" rx="58" ry="26" fill="${INK}" opacity="0.28" filter="url(#blur)"/>`);
for (let i = 0; i < 34; i++) {
  const y = WATER_Y + 16 + i * 9.6;
  const cx = rand(110, 790);
  const len = rand(70, 290);
  surface.push(
    `<line x1="${n(cx - len / 2)}" y1="${n(y)}" x2="${n(cx + len / 2)}" y2="${n(y)}" stroke="#6d6d74" stroke-opacity="${rand(0.05, 0.17).toFixed(2)}" stroke-width="${rand(0.8, 1.8).toFixed(1)}" stroke-linecap="round"/>`
  );
}

/* Boat: a shallow hull, a seated figure, and a raised pole. */
const BX = 296;
const BY = 1064;
surface.push(
  `<path d="M ${BX - 104} ${BY} Q ${BX - 92} ${BY + 21} ${BX - 58} ${BY + 25} L ${BX + 62} ${BY + 25} Q ${BX + 96} ${BY + 20} ${BX + 106} ${BY} Q ${BX} ${BY + 9} ${BX - 104} ${BY} Z" fill="${INK}"/>`
);
/* Figure: torso as a leaning wedge, plus a head and hat brim. */
surface.push(
  `<path d="M ${BX - 16} ${BY} Q ${BX - 20} ${BY - 34} ${BX - 4} ${BY - 42} L ${BX + 12} ${BY - 40} Q ${BX + 18} ${BY - 16} ${BX + 16} ${BY} Z" fill="${INK}"/>`
);
surface.push(`<circle cx="${BX + 2}" cy="${BY - 50}" r="8.5" fill="${INK}"/>`);
surface.push(
  `<path d="M ${BX - 17} ${BY - 50} Q ${BX + 2} ${BY - 62} ${BX + 21} ${BY - 50} Q ${BX + 2} ${BY - 55} ${BX - 17} ${BY - 50} Z" fill="${INK}"/>`
);
surface.push(
  `<line x1="${BX + 14}" y1="${BY - 34}" x2="${BX + 128}" y2="${BY - 118}" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`
);
surface.push(
  `<line x1="${BX + 128}" y1="${BY - 118}" x2="${BX + 136}" y2="${BY - 30}" stroke="${INK}" stroke-opacity="0.4" stroke-width="1" stroke-linecap="round"/>`
);

/* ---------------------------------------------------------------------------
 * Maple bough entering from the top-left
 * ------------------------------------------------------------------------- */
const clusters = [];
function branch(x, y, angle, len, width, depth) {
  if (depth === 0 || len < 11) {
    clusters.push([x, y]);
    return;
  }
  const x2 = x + Math.cos(angle) * len;
  const y2 = y + Math.sin(angle) * len;
  const cx = x + Math.cos(angle + rand(-0.26, 0.26)) * len * 0.5;
  const cy = y + Math.sin(angle + rand(-0.26, 0.26)) * len * 0.5;
  canopy.push(
    `<path d="M ${n(x)} ${n(y)} Q ${n(cx)} ${n(cy)} ${n(x2)} ${n(y2)}" stroke="${INK}" stroke-width="${width.toFixed(1)}" fill="none" stroke-linecap="round"/>`
  );
  if (depth <= 2 && rnd() > 0.45) clusters.push([x2, y2]);
  branch(x2, y2, angle - rand(0.3, 0.66), len * rand(0.6, 0.76), width * 0.64, depth - 1);
  branch(x2, y2, angle + rand(0.3, 0.66), len * rand(0.6, 0.76), width * 0.64, depth - 1);
}
branch(-40, 76, 0.3, 150, 16, 6);
branch(48, -44, 1.0, 128, 12, 5);

/* Leaves grow in small clumps at the branch tips. */
for (const [x, y] of clusters) {
  const count = Math.round(rand(2, 4));
  for (let i = 0; i < count; i++) {
    canopy.push(
      mapleLeaf(x + rand(-16, 16), y + rand(-16, 16), rand(11, 20), rand(0, 6.28), leafFill(), rand(0.85, 1).toFixed(2))
    );
  }
}
/* A sparse drift of leaves falling across the sky. */
for (let i = 0; i < 22; i++) {
  canopy.push(mapleLeaf(rand(60, 880), rand(90, 760), rand(7, 15), rand(0, 6.28), leafFill(), rand(0.5, 0.9).toFixed(2)));
}
/* And a few resting on the water. */
for (let i = 0; i < 14; i++) {
  canopy.push(mapleLeaf(rand(60, 850), rand(950, 1170), rand(6, 12), rand(0, 6.28), leafFill(), rand(0.4, 0.72).toFixed(2)));
}

/* ---------------------------------------------------------------------------
 * Assemble
 * ------------------------------------------------------------------------- */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Ink-wash landscape: a red sun over a snow-capped mountain, a pagoda among pines, maple leaves and a boat on still water">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#efedea"/><stop offset="0.6" stop-color="#e5e3e0"/><stop offset="1" stop-color="#dbd9d6"/>
  </linearGradient>
  <radialGradient id="sunGlow">
    <stop offset="0.5" stop-color="${RED}" stop-opacity="0.85"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="mountain" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9d9da2"/><stop offset="1" stop-color="#67676d"/>
  </linearGradient>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ceccc9"/><stop offset="1" stop-color="#b5b3b0"/>
  </linearGradient>
  <filter id="blur"><feGaussianBlur stdDeviation="16"/></filter>
  <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#eeece9" stop-opacity="0"/>
    <stop offset="0.45" stop-color="#eeece9" stop-opacity="0.72"/>
    <stop offset="0.8" stop-color="#eeece9" stop-opacity="0.5"/>
    <stop offset="1" stop-color="#eeece9" stop-opacity="0"/>
  </linearGradient>
  <filter id="soften" x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="paper" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.12"/></feComponentTransfer>
  </filter>
</defs>
${sky.join("\n")}
${land.join("\n")}
${surface.join("\n")}
${canopy.join("\n")}
<rect width="${W}" height="${H}" filter="url(#paper)" opacity="0.5" style="mix-blend-mode:multiply"/>
</svg>`;

const out = path.join(ROOT, "public/art/hero.svg");
fs.writeFileSync(out, svg);
console.log(`wrote ${path.relative(ROOT, out)} — ${(svg.length / 1024).toFixed(0)} KB`);

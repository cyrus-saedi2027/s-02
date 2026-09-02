/**
 * Generates the site's abstract artwork as SVG: panel art for the capabilities
 * section, cover art for the works rows, tiles for the gallery, and the plates
 * on the showcase wall.
 *
 * Everything is drawn procedurally from a seeded PRNG, so output is stable
 * across runs and there are no bitmap dependencies. All of it stays inside the
 * site palette — near-black grounds lit by the vermilion accent.
 *
 * Nothing here uses an SVG filter, deliberately. A filter is re-run every time
 * the browser rasters a tile the image touches, not once when it loads, so a
 * grid of these was paying for full-area fractal noise and a 42px blur on
 * every frame it scrolled. The bloom is a radial gradient that already fades
 * to nothing at its edge, and the page lays its own grain over everything.
 *
 * Usage: node scripts/generate-artwork.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/art");

const RED = "#fd321c";
const EMBER = "#ff8a00";
const DEEP = "#8f1405";

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const n = (v) => Number(v.toFixed(1));

/** Shared defs: grain, soft blur, and a warm bloom gradient. */
const defs = (id) => `
  <defs>
    <radialGradient id="bloom${id}">
      <stop offset="0" stop-color="${EMBER}" stop-opacity="0.95"/>
      <stop offset="0.45" stop-color="${RED}" stop-opacity="0.7"/>
      <stop offset="1" stop-color="${RED}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sweep${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${DEEP}"/>
      <stop offset="0.55" stop-color="${RED}"/>
      <stop offset="1" stop-color="${EMBER}"/>
    </linearGradient>
  </defs>`;

const frame = (id, w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
${defs(id)}
  <rect width="${w}" height="${h}" fill="#0a0a0b"/>
${inner}
</svg>`;

/**
 * The same plate, alive.
 *
 * An SVG rendered through <img> runs the CSS inside it, so the motion needs no
 * script and nothing on the page has to drive it — the wall mounts one of
 * these only while the pointer is over a tile, and unmounting is what stops it.
 *
 * Deliberately not a frame strip: six frames of each plate would have been six
 * times the artwork, and this build inlines every byte of it. Two moves do the
 * work instead, and they are motif-agnostic — the whole composition breathes,
 * and a soft band travels down over it. Every plate reads as a live capture
 * without a line of per-motif code.
 */
const liveFrame = (id, w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
${defs(id)}
  <defs>
    <linearGradient id="scan${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="0.09"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <style>
    .breathe { transform-origin: 50% 50%; animation: breathe 7s ease-in-out infinite alternate; }
    @keyframes breathe {
      from { transform: scale(1.015) translate(-0.6%, 0.4%); }
      to   { transform: scale(1.055) translate(0.6%, -0.6%); }
    }
    .scan { animation: scan 3.4s linear infinite; }
    @keyframes scan {
      from { transform: translateY(-${n(h * 0.35)}px); }
      to   { transform: translateY(${n(h * 1.05)}px); }
    }
  </style>
  <rect width="${w}" height="${h}" fill="#0a0a0b"/>
  <g class="breathe">
${inner}
  </g>
  <rect class="scan" width="${w}" height="${n(h * 0.3)}" fill="url(#scan${id})"/>
</svg>`;

/* ------------------------------------------------------------------ motifs
 *
 * Each motif fills the frame edge to edge and places its focal point off
 * centre, so a wall of these does not read as a row of identical blobs.
 * ------------------------------------------------------------------------ */

/** Abstract interface: a chrome bar, a hero block and stacked cards. */
function mockup(id, w, h, seed) {
  const r = rng(seed);
  const pad = w * 0.05;
  let s = `<rect width="${w}" height="${h}" fill="#111114"/>`;
  s += `<ellipse cx="${n(w * (0.2 + r() * 0.6))}" cy="${n(h * (0.2 + r() * 0.5))}" rx="${n(w * 0.55)}" ry="${n(h * 0.45)}" fill="url(#bloom${id})" opacity="0.5"/>`;
  // chrome
  s += `<rect x="${n(pad)}" y="${n(pad)}" width="${n(w - pad * 2)}" height="${n(h * 0.055)}" rx="${n(h * 0.012)}" fill="#fff" opacity="0.07"/>`;
  for (let i = 0; i < 3; i++) {
    s += `<circle cx="${n(pad + h * 0.022 + i * h * 0.026)}" cy="${n(pad + h * 0.0275)}" r="${n(h * 0.007)}" fill="#fff" opacity="0.2"/>`;
  }
  // hero band
  const heroH = h * (0.26 + r() * 0.12);
  s += `<rect x="${n(pad)}" y="${n(pad + h * 0.075)}" width="${n(w - pad * 2)}" height="${n(heroH)}" rx="${n(h * 0.014)}" fill="url(#sweep${id})" opacity="0.5"/>`;
  // headline + rule bars inside the hero
  s += `<rect x="${n(pad * 1.8)}" y="${n(pad + h * 0.075 + heroH * 0.3)}" width="${n(w * 0.42)}" height="${n(h * 0.035)}" rx="3" fill="#fff" opacity="0.7"/>`;
  s += `<rect x="${n(pad * 1.8)}" y="${n(pad + h * 0.075 + heroH * 0.45)}" width="${n(w * 0.3)}" height="${n(h * 0.018)}" rx="3" fill="#fff" opacity="0.32"/>`;
  // card row
  const cardsY = pad + h * 0.075 + heroH + h * 0.035;
  const cols = 3;
  const cw = (w - pad * 2 - (cols - 1) * pad * 0.5) / cols;
  for (let i = 0; i < cols; i++) {
    const x = pad + i * (cw + pad * 0.5);
    const ch = h * (0.15 + r() * 0.1);
    s += `<rect x="${n(x)}" y="${n(cardsY)}" width="${n(cw)}" height="${n(ch)}" rx="${n(h * 0.012)}" fill="#fff" opacity="${(0.05 + r() * 0.07).toFixed(3)}"/>`;
    s += `<rect x="${n(x + cw * 0.1)}" y="${n(cardsY + ch * 0.62)}" width="${n(cw * 0.55)}" height="${n(h * 0.014)}" rx="2" fill="${i === 1 ? RED : "#fff"}" opacity="${i === 1 ? 0.8 : 0.3}"/>`;
  }
  // footer rules
  for (let i = 0; i < 4; i++) {
    const y = cardsY + h * 0.28 + i * h * 0.035;
    if (y > h - pad) break;
    s += `<rect x="${n(pad)}" y="${n(y)}" width="${n((w - pad * 2) * (0.9 - i * 0.16))}" height="${n(h * 0.012)}" rx="2" fill="#fff" opacity="${(0.14 - i * 0.025).toFixed(3)}"/>`;
  }
  return s;
}

/** Oversized letterform, cropped by the frame — a type specimen. */
function specimen(id, w, h, seed) {
  const r = rng(seed);
  const glyphs = "AZMRSNKV";
  const ch = glyphs[Math.floor(r() * glyphs.length)];
  let s = `<rect width="${w}" height="${h}" fill="#0d0d10"/>`;
  s += `<ellipse cx="${n(w * (0.15 + r() * 0.7))}" cy="${n(h * (0.55 + r() * 0.3))}" rx="${n(w * 0.5)}" ry="${n(h * 0.4)}" fill="url(#bloom${id})" opacity="0.72"/>`;
  const size = Math.max(w, h) * (1.05 + r() * 0.3);
  s += `<text x="${n(w * (0.1 + r() * 0.3))}" y="${n(h * (0.86 + r() * 0.08))}" font-family="Poppins, Inter, sans-serif" font-weight="700" font-size="${n(size)}" fill="#fff" opacity="0.9" letter-spacing="-0.06em">${ch}</text>`;
  s += `<rect width="${w}" height="${h}" fill="url(#sweep${id})" opacity="0.16" style="mix-blend-mode:overlay"/>`;
  return s;
}

/** Perspective grid receding to a lit horizon. */
function mesh(id, w, h, seed) {
  const r = rng(seed);
  const hy = h * (0.42 + r() * 0.16);
  const vx = w * (0.3 + r() * 0.4);
  let s = `<rect width="${w}" height="${n(hy)}" fill="#0c0c10"/>`;
  s += `<ellipse cx="${n(vx)}" cy="${n(hy)}" rx="${n(w * 0.45)}" ry="${n(h * 0.2)}" fill="url(#bloom${id})" opacity="0.95"/>`;
  s += `<rect y="${n(hy)}" width="${w}" height="${n(h - hy)}" fill="#08080a"/>`;
  for (let i = -12; i <= 12; i++) {
    s += `<line x1="${n(vx)}" y1="${n(hy)}" x2="${n(vx + i * w * 0.16)}" y2="${h}" stroke="#fff" stroke-opacity="${i === 0 ? 0.3 : 0.12}" stroke-width="1"/>`;
  }
  for (let i = 1; i <= 14; i++) {
    const t = Math.pow(i / 14, 2.1);
    const y = hy + t * (h - hy);
    s += `<line x1="0" y1="${n(y)}" x2="${w}" y2="${n(y)}" stroke="${i % 5 === 0 ? RED : "#fff"}" stroke-opacity="${i % 5 === 0 ? 0.5 : 0.14}" stroke-width="1"/>`;
  }
  return s;
}

/** Overlapping translucent shapes, off-centre. */
function shapes(id, w, h, seed) {
  const r = rng(seed);
  let s = `<rect width="${w}" height="${h}" fill="#0b0b0e"/>`;
  s += `<ellipse cx="${n(w * (0.25 + r() * 0.5))}" cy="${n(h * (0.3 + r() * 0.4))}" rx="${n(w * 0.4)}" ry="${n(h * 0.35)}" fill="url(#bloom${id})" opacity="0.6"/>`;
  const kinds = ["circle", "square", "tri"];
  for (let i = 0; i < 6; i++) {
    const kind = kinds[Math.floor(r() * 3)];
    const size = Math.min(w, h) * (0.2 + r() * 0.4);
    const cx = w * (0.1 + r() * 0.8);
    const cy = h * (0.1 + r() * 0.8);
    const fill = r() > 0.55 ? RED : r() > 0.5 ? EMBER : "#fff";
    const op = (0.1 + r() * 0.3).toFixed(2);
    if (kind === "circle") {
      s += `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(size / 2)}" fill="${fill}" opacity="${op}"/>`;
    } else if (kind === "square") {
      s += `<rect x="${n(cx - size / 2)}" y="${n(cy - size / 2)}" width="${n(size)}" height="${n(size)}" rx="${n(size * 0.08)}" fill="${fill}" opacity="${op}" transform="rotate(${n(r() * 45)} ${n(cx)} ${n(cy)})"/>`;
    } else {
      s += `<path d="M ${n(cx)} ${n(cy - size / 2)} L ${n(cx + size / 2)} ${n(cy + size / 2)} L ${n(cx - size / 2)} ${n(cy + size / 2)} Z" fill="${fill}" opacity="${op}"/>`;
    }
  }
  return s;
}

/** A field of vertical bars, a few lit in accent. */
function bars(id, w, h, seed) {
  const r = rng(seed);
  let s = `<rect width="${w}" height="${h}" fill="#0a0a0c"/>`;
  s += `<ellipse cx="${n(w * (0.2 + r() * 0.6))}" cy="${n(h * (0.4 + r() * 0.3))}" rx="${n(w * 0.42)}" ry="${n(h * 0.4)}" fill="url(#bloom${id})" opacity="0.62"/>`;
  const count = 26 + Math.floor(r() * 16);
  for (let i = 0; i < count; i++) {
    const x = (i / count) * w;
    const bh = h * (0.14 + r() * 0.72);
    const y = (h - bh) / 2 + (r() - 0.5) * h * 0.28;
    const hot = r() > 0.84;
    s += `<rect x="${n(x)}" y="${n(y)}" width="${n(w / count - 4)}" height="${n(bh)}" rx="2" fill="${hot ? RED : "#fff"}" opacity="${hot ? 0.92 : (0.05 + r() * 0.16).toFixed(3)}"/>`;
  }
  return s;
}

/** Flowing contour lines, topographic. */
function contours(id, w, h, seed) {
  const r = rng(seed);
  let s = `<rect width="${w}" height="${h}" fill="#0a0a0c"/>`;
  s += `<circle cx="${n(w * (0.15 + r() * 0.7))}" cy="${n(h * (0.25 + r() * 0.5))}" r="${n(w * 0.36)}" fill="url(#bloom${id})" opacity="0.8"/>`;
  const lines = 26 + Math.floor(r() * 12);
  for (let i = 0; i < lines; i++) {
    const base = (i / lines) * h;
    const amp = h * (0.03 + r() * 0.07);
    const pts = [];
    for (let x = 0; x <= w; x += Math.max(18, w / 40)) {
      pts.push(`${n(x)},${n(base + Math.sin((x / w) * Math.PI * 2 + i * 0.5) * amp)}`);
    }
    const hot = i % 8 === 0;
    s += `<polyline points="${pts.join(" ")}" fill="none" stroke="${hot ? RED : "#fff"}" stroke-opacity="${hot ? 0.9 : 0.15}" stroke-width="${hot ? 2.2 : 1}"/>`;
  }
  return s;
}

const MOTIFS = [mockup, specimen, mesh, shapes, bars, contours];

/* ------------------------------------------------------------------ output */

fs.mkdirSync(OUT, { recursive: true });
let count = 0;
const write = (name, w, h, motif, seed) => {
  const id = name.replace(/[^a-z0-9]/gi, "");
  fs.writeFileSync(path.join(OUT, name), frame(id, w, h, motif(id, w, h, seed)));
  count++;
};

/** Writes the still and, beside it, the `-live` twin the wall plays on hover. */
const writePair = (name, w, h, motif, seed) => {
  const id = name.replace(/[^a-z0-9]/gi, "");
  const inner = motif(id, w, h, seed);
  fs.writeFileSync(path.join(OUT, name), frame(id, w, h, inner));
  fs.writeFileSync(path.join(OUT, name.replace(/\.svg$/, "-live.svg")), liveFrame(id, w, h, inner));
  count += 2;
};

// Capabilities panels — tall, one motif each.
["strategy", "design", "development", "production"].forEach((slug, i) => {
  write(`panel-${slug}.svg`, 600, 760, MOTIFS[[3, 1, 2, 5][i]], 1000 + i * 137);
});

// Works covers — wide. Seven of them: four carry the feature rows on the home
// page, and the projects index shows the whole set.
for (let i = 1; i <= 7; i++) {
  write(`cover-0${i}.svg`, 1200, 800, MOTIFS[[0, 2, 4, 1, 5, 3, 2][i - 1]], 2000 + i * 211);
}

// Gallery tiles — mixed aspect ratios.
const tileShapes = [
  [900, 640], [900, 900], [900, 620], [900, 1100],
  [900, 700], [900, 900], [900, 580], [900, 1000], [900, 760],
];
tileShapes.forEach(([w, h], i) => {
  write(`tile-${String(i + 1).padStart(2, "0")}.svg`, w, h, MOTIFS[[0, 3, 1, 0, 4, 2, 0, 5, 3][i]], 3000 + i * 313);
});

// Showcase wall — six plates in one aspect, so the grid reads as a set.
for (let i = 1; i <= 6; i++) {
  write(`showcase-0${i}.svg`, 900, 675, MOTIFS[[1, 4, 0, 5, 2, 3][i - 1]], 4000 + i * 173);
}

// Playground wall. Each plate is cut to the ratio of the frame it goes in, so
// the grid crops nothing — the wall's rhythm comes from the plates being
// genuinely different shapes rather than from cropping one shape many ways.
// The four wide ones (index 4, 9, 10) span two columns.
const playShapes = [
  [900, 684], [900, 1202], [900, 1027], [900, 687],
  [1350, 1157], [900, 684], [900, 687], [900, 1027],
  [900, 687], [1350, 1095], [1350, 1095], [900, 687], [900, 1027],
];
playShapes.forEach(([w, h], i) => {
  writePair(`play-${String(i + 1).padStart(2, "0")}.svg`, w, h,
            MOTIFS[[0, 2, 5, 3, 1, 4, 0, 5, 2, 1, 3, 4, 5][i]], 5000 + i * 197);
});

console.log(`wrote ${count} files to ${path.relative(ROOT, OUT)}`);

/**
 * Bundles the production build into a single self-contained HTML file.
 *
 * Fonts and artwork are inlined as data URIs, so the resulting page makes no
 * external requests at all — it can be opened straight from disk or dropped
 * anywhere that serves a single file.
 *
 * Usage: npm run build && node scripts/build-standalone.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const OUT = path.join(ROOT, "zaylamonroe-standalone.html");
/* Some hosts wrap the page in their own document skeleton, so `--fragment`
   emits the same bundle without the outer html/head/body tags. */
const FRAGMENT = process.argv.includes("--fragment");
const OUT_FRAGMENT = path.join(ROOT, "zaylamonroe-embed.html");

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found — run "npm run build" first.');
  process.exit(1);
}

const assets = fs.readdirSync(path.join(DIST, "assets"));
const cssFile = assets.find((f) => f.endsWith(".css"));
const jsFile = assets.find((f) => f.endsWith(".js"));

if (!cssFile || !jsFile) {
  console.error("Could not find built CSS/JS in dist/assets.");
  process.exit(1);
}

let css = fs.readFileSync(path.join(DIST, "assets", cssFile), "utf8");
let js = fs.readFileSync(path.join(DIST, "assets", jsFile), "utf8");

const b64 = (p) => fs.readFileSync(p).toString("base64");

// Fonts referenced from the stylesheet.
let fontCount = 0;
css = css.replace(/url\(\/fonts\/([^)"']+\.woff2)\)/g, (_, name) => {
  fontCount++;
  return `url(data:font/woff2;base64,${b64(path.join(ROOT, "public/fonts", name))})`;
});

// Artwork referenced from either bundle.
let artCount = 0;
const artDir = path.join(ROOT, "public/art");
const MIME = {
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".gif": "image/gif",
};
for (const file of fs.readdirSync(artDir)) {
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime) {
    console.warn(`skipping ${file}: unknown image type`);
    continue;
  }
  const uri = `data:${mime};base64,${b64(path.join(artDir, file))}`;
  const before = js + css;
  js = js.split(`/art/${file}`).join(uri);
  css = css.split(`/art/${file}`).join(uri);
  if (js + css !== before) artCount++;
}

// A module script must not contain a literal closing script tag.
js = js.replace(/<\/script>/gi, "<\\/script>");

const body = `<title>Zayla Monroe</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`;

const target = FRAGMENT ? OUT_FRAGMENT : OUT;
fs.writeFileSync(
  target,
  FRAGMENT
    ? body
    : `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
${body}</body>
</html>
`
);

console.log(`inlined ${fontCount} fonts, ${artCount} artwork files`);
console.log(`wrote ${path.relative(ROOT, target)} (${(fs.statSync(target).size / 1024 / 1024).toFixed(2)} MB)`);

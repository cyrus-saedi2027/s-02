/**
 * Writes robots.txt and sitemap.xml from the routes the site actually has.
 *
 * Generated rather than hand-kept so the sitemap cannot drift from the project
 * list: the slugs are read out of src/data/site.ts, and adding a project adds a
 * URL with no second edit.
 *
 * A caveat worth stating plainly. Routes on this site live in the hash, and a
 * fragment is never sent to a server — a crawler asking for
 * `https://site/#/about` requests `https://site/` and is handed the same
 * document every time. So this sitemap is not what makes the pages indexable;
 * it describes the URLs the site *would* serve behind a host with a rewrite,
 * and it is correct and ready the day one is put in front of it. Until then it
 * costs nothing and misleads nobody, because every URL in it does resolve to a
 * page — the router just picks which one on the client.
 *
 * Usage: node scripts/generate-seo.mjs   (runs as part of npm run build)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");

const SITE = (process.env.VITE_SITE_URL || "https://zaylamonroe.com").replace(/\/+$/, "");

const source = fs.readFileSync(path.join(ROOT, "src/data/site.ts"), "utf8");

/**
 * Slugs, per array.
 *
 * A plain search for `slug:` across the file is what this did first, and it
 * was wrong the moment a second thing had slugs: the notes were emitted as
 * project URLs. Each array is sliced out by name and read on its own, so a
 * third list cannot quietly join the wrong one.
 */
function slugsIn(arrayName) {
  const start = source.indexOf(`export const ${arrayName}`);
  if (start === -1) return [];
  const end = source.indexOf("\n];", start);
  if (end === -1) return [];
  return [...source.slice(start, end).matchAll(/^\s*slug:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);
}

const projectSlugs = slugsIn("projects");
const noteSlugs = slugsIn("notes");

if (!projectSlugs.length || !noteSlugs.length) {
  console.error(
    `Expected project and note slugs in src/data/site.ts; found ${projectSlugs.length} and ${noteSlugs.length}. ` +
      "Refusing to write a sitemap that would be wrong."
  );
  process.exit(1);
}

/** Weekly for the pages that change, monthly for the case studies that do not. */
const routes = [
  ["/", "1.0", "weekly"],
  ["/about", "0.8", "monthly"],
  ["/projects", "0.9", "weekly"],
  ["/playground", "0.7", "weekly"],
  ["/writing", "0.7", "weekly"],
  ["/contact", "0.6", "monthly"],
  ...projectSlugs.map((s) => [`/projects/${s}`, "0.8", "monthly"]),
  ...noteSlugs.map((s) => [`/writing/${s}`, "0.6", "yearly"]),
];

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    ([loc, priority, freq]) => `  <url>
    <loc>${SITE}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const robots = `# ${SITE}
User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

fs.writeFileSync(path.join(PUBLIC, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(PUBLIC, "robots.txt"), robots);
console.log(`wrote sitemap.xml (${routes.length} urls) and robots.txt for ${SITE}`);

# Roadmap

Fourteen things agreed as the next stretch of work on this site, in the order
they will be built. Each one is ticked here when it is finished and pushed —
so this file is the record of where the work stands.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## A — Content

These change what the site *says*, which is where the biggest gap is.

- [ ] **1. A page per project** (`/projects/halcyon`, and one for each of the
      seven). Right now every "View project" button leads nowhere, which is the
      largest hole in the site: the work is announced but never shown. Each page
      wants the problem, the work, and the outcome — with real numbers.

- [ ] **2. Real social links.** The four accounts in the footer and on the
      contact page are `href="#"`. They no longer break the route (fixed in
      `b61fa37`) but they still do nothing when clicked.

- [ ] **3. A form that actually sends.** The contact form hands the composed
      message to the visitor's mail client, because there is no server behind
      this site. A real endpoint (Formspree, Resend, or a small function)
      would close it properly. The booking panel has the same gap: it says a
      time is held, and nothing is holding it.

## B — Motion and feel

- [ ] **4. Shared-element transition into a project page.** The cover in the
      index grows into the hero of the project page rather than the page
      cutting. The View Transitions API already drives the route wipe, so the
      machinery is in place.

- [ ] **5. Live previews on the playground wall.** A short, silent video that
      plays only on hover, so a study can show its motion instead of a still.

- [ ] **6. Magnetic pull on images.** The plates lean toward the pointer the
      way the buttons already do, tying the two interactions together.

- [ ] **7. Sound, off by default.** A soft click on the menu and a low sweep on
      the page change, behind a control the visitor turns on.

## C — Technical

- [ ] **8. Split the routes.** All 434 kB of JavaScript loads at once, so the
      home page parses the code for four pages nobody has asked for yet.

- [ ] **9. Font metric overrides** (`size-adjust` on a fallback face). Lab CLS
      on `/about` is 0.22, almost all of it one font swap. *No visitor sees
      it* — every shift lands behind the preloader, which clears at ~3.4s, and
      visible CLS measured 0 on all five routes — but field tooling reports it.

- [ ] **10. `prefers-contrast`, and a motion control in the page.** Reduced
      motion is honoured from the OS as of `b61fa37`; a switch in the page
      serves the visitor who has not set a system preference.

- [ ] **11. `sitemap.xml`, `robots.txt`, JSON-LD.** Nothing about this site is
      currently legible to a search engine beyond the one meta description.

## D — Bolder

- [ ] **12. A real 404.** Any unrecognised route silently renders the home
      page, so a mistyped URL lies about where you are.

- [ ] **13. A light theme.** The site is dark only. The tokens are already
      centralised in `tailwind.config.ts`, so the work is mostly in choosing
      the second palette rather than in plumbing.

- [ ] **14. Writing.** Short technical notes — the thing that separates a
      portfolio that lists work from one that shows how its author thinks.

---

## Notes

- `.env` was left behind deliberately. It carried Supabase credentials from the
  scaffold this project started from, nothing in the source reads them, and
  copying them into a second public repository would only spread them further.
  The `@supabase/supabase-js` dependency is still in `package.json` and is
  unused; item 3 will either use it or it should go.

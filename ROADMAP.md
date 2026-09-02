# Roadmap

Fourteen things agreed as the next stretch of work on this site, in the order
they will be built. Each one is ticked here when it is finished and pushed —
so this file is the record of where the work stands.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## A — Content

These change what the site *says*, which is where the biggest gap is.

- [x] **1. A page per project** (`/projects/halcyon`, and one for each of the
      seven). Every "View project" button now opens the work rather than
      nothing. Each page runs lede → the problem → the work in two or three
      chapters → three figures that count up → the next project.

- [x] **2. Real social links.** One `SocialLink` decides it now: a configured
      `href` becomes a real link opened in a new tab, an empty one renders as
      plain text. A name nobody has an account for reads as a fact rather than
      as an offer, instead of a link that takes the click and does nothing.
      **The four URLs in `socials` are still empty — fill one in and it turns
      into a link with no other change.**

- [x] **3. A form that actually sends.** Set `VITE_CONTACT_ENDPOINT` (see
      `.env.example`) and the form posts JSON to it, with sending, sent and
      failed states, and a confirmation that says which of "sent" and "handed
      to your mail app" actually happened. Unset, it keeps the mail-client
      fallback — the single-file build can be opened from disk where there is
      no server to post to. A honeypot field is parked off-screen.
      **No endpoint is configured yet.** The booking panel still says a time is
      held with nothing holding it; that needs a calendar, not a form endpoint,
      and is its own piece of work.

## B — Motion and feel

- [x] **4. Shared-element transition into a project page.** The clicked plate
      is lent `view-transition-name: project-cover` and lands on the hero of
      the page it opens. Measured travelling from the index box
      `x=516 y=-30 563x375` to exactly the hero box `x=44 y=100 1012x569`.
      Only when the plate is on screen, and only forwards — coming back plays
      the ordinary wipe.

- [x] **5. Live previews on the playground wall.** Each study has a `-live`
      twin carrying its own CSS animation — the composition breathes and a soft
      band travels down it. Mounted only while the pointer is on a tile, so it
      is not fetched until asked for and unmounting is what stops it. Not a
      frame strip: six frames of each plate would have been six times the
      artwork, and this build inlines every byte. Skipped entirely under
      reduced motion. Retuned after the first pass read as nothing at all:
      91.8% of a plate's pixels now change over a second.

- [x] **6. Magnetic pull on images.** `usePointerLean` gives the plates the
      lean `MagneticButton` has always had, so the work answers the pointer the
      way the controls do. The shift comes with a 3D tilt, which is the half
      you actually notice — twenty pixels across a thousand-pixel cover is a
      change you can measure and not one you can see. Measured: 43px and 6° on
      a project plate, 11px and 9° on a wall tile, 0 under reduced motion.

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

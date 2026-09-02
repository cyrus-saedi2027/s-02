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

- [x] **7. Sound, off by default.** Two synthesised voices — a tick when the
      menu opens or closes, a low sweep under the page wipe — behind a switch
      in the footer that shows its own state and remembers the choice. Web
      Audio rather than two clips: everything else here is generated, and the
      single-file build would have had to inline audio most visitors never
      turn on. Verified silent until switched on.

## C — Technical

- [x] **8. Split the routes.** The home page now loads one 395 kB file
      (128 kB gzipped), down from 455 kB (144 kB). Every other page is a chunk
      fetched on the click that opens it, and so is the booking panel — 36 kB
      of scheduler nobody sees until they ask for one. `SINGLE_FILE=1` puts it
      all back into one chunk for the standalone build, which has no server to
      fetch from.

- [x] **9. Font metric overrides.** Nine fallback faces, one per weight, each
      the local system sans rescaled so its metrics match the webfont it stands
      in for — `size-adjust` from the measured width ratio, ascent and descent
      divided by it because size-adjust scales the overrides too. `/about` lab
      CLS went 0.217 to 0.012, worst single shift 0.2027 to 0.0048. Every route
      is now well inside the 0.1 "good" threshold.

- [x] **10. `prefers-contrast`, and a motion control in the page.** The dimmed
      tiers and hairlines lift under `prefers-contrast: more` (0.56 to 0.88 for
      body copy, 0.14 to 0.42 for rules) and the focus ring goes to a 3px white
      outline. A switch in the footer asks the site to hold still — one-way, so
      it cannot argue with a system preference that already says reduce, and it
      hides itself entirely in that case. Measured: 9 elements moving to 0, and
      the choice survives a reload.

- [x] **11. `sitemap.xml`, `robots.txt`, JSON-LD.** All three, plus a title,
      description, canonical and Open Graph pair per route. The sitemap is
      generated from the project list at build time so it cannot drift.
      **One thing to be straight about:** routes live in the hash, and a
      fragment never reaches a server — a crawler asking for `/#/about` is
      handed `/`. None of this makes the pages indexable on its own. What it
      does buy is real (tabs, history, bookmarks, link cards), and it is
      already correct the day the site sits behind a host with a rewrite.
      Switching to `BrowserRouter` is what would finish the job, and it would
      cost the single-file build.

### Also, along the way

- **Opening a project no longer plays the wipe.** The gradient change-of-page
  screen is for moving between the main pages; opening a project gets a short
  plain fade, because the cover growing into the next hero already says a page
  has changed and running both read as a stutter. Two bugs surfaced fixing it,
  both diagnosed from what the browser reported rather than guessed at: React
  reuses the very same hero and next-project-card DOM nodes across one project
  and the next, so the handoff has to be undone inside the commit — after the
  old capture, before the new one — or the plate is lifted out with nowhere to
  land, or two elements claim one `view-transition-name` and the browser drops
  the transition outright ("Unexpected duplicate view-transition-name", which
  it says in the console). And `React.lazy` suspends for a microtask even with
  the module cached, which `flushSync` cannot wait for — so a first visit to a
  project snapshotted the Suspense fallback, a 1539px empty screen where a
  6036px page should have been. `lib/pageLoader` replaces it with a loader that
  renders synchronously once preloaded.

- **The pointer lean is a quarter of what it was.** At the first size the tilt
  stopped reading as a plate answering the pointer and started reading as the
  artwork being bent.

## D — Bolder

- [x] **12. A real 404.** An unrecognised route now says so and offers the six
      places you might have been going, instead of rendering the home page and
      letting a dead link look like it worked. An unknown project or note slug
      lands there too.

- [x] **13. A light theme.** Every colour is now a CSS variable and the
      palette is defined twice; one attribute on the root swaps it. The switch
      in the footer cycles auto → dark → light, and auto keeps following the
      system rather than throwing the preference away the moment anybody
      touches it. Stamped before the first paint from `index.html`, so a
      light-preference visitor never sees the dark ground flash past.

      Two things the plumbing had to get right. The dimmed tiers and hairlines
      are alphas of the foreground rather than colours of their own, so they
      invert with it — but the same alpha does not buy the same contrast in
      both directions: 56% of near-black on off-white measured 4.37:1, under
      AA, where 56% of white on black is 6.48:1. The alphas are per-theme now
      and it is 6.64:1. And image scrims stay dark in both, because what a
      gradient under a title on a photograph has to beat is the picture, not
      the page.

- [x] **14. Writing.** `/writing` and a page per note — three to start,
      each about something that actually went wrong on this site and what it
      turned out to be. A single measured column with the scroll effects kept
      off the body: the rest of the site is built to be looked at, this page is
      built to be read, and the two want opposite things.

---

## Notes

- `.env` was left behind deliberately. It carried Supabase credentials from the
  scaffold this project started from, nothing in the source reads them, and
  copying them into a second public repository would only spread them further.
  The `@supabase/supabase-js` dependency is still in `package.json` and is
  unused; item 3 will either use it or it should go.

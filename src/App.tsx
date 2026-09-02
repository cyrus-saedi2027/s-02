import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { MotionConfig } from "framer-motion";
import { HashRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { Preloader } from "./components/ui/Preloader";
import { Cursor, type CursorVariant } from "./components/ui/Cursor";
import { ScrollProgress } from "./components/ui/ScrollProgress";
import { TopGlass } from "./components/ui/TopGlass";
import { Header } from "./components/Header";
import { MenuOverlay } from "./components/MenuOverlay";
import { Footer } from "./components/sections/Footer";
import { ClosingMark } from "./components/sections/ClosingMark";
import { DocumentHead } from "./components/DocumentHead";

import Home from "./pages/Home";

/**
 * Every page but the home page is fetched when it is first asked for.
 *
 * The whole site used to arrive as one bundle, so opening the home page paid
 * to parse four other pages and seven case studies nobody had asked to see.
 *
 * The import functions are kept beside the lazy components on purpose: the
 * click handler calls one directly before starting a transition. Left to
 * Suspense, the view transition would snapshot the fallback — the API captures
 * the new state the moment the commit returns, and a chunk still in flight
 * means what it captures is an empty page rather than the one arriving.
 */
const load = {
  "/about": () => import("./pages/AboutPage"),
  "/projects": () => import("./pages/ProjectsPage"),
  "/playground": () => import("./pages/PlaygroundPage"),
  "/contact": () => import("./pages/ContactPage"),
  project: () => import("./pages/ProjectPage"),
};

/**
 * The booking panel is the largest thing on the site and nobody sees it until
 * they ask for one — a scheduler, a month of dates, a timezone table. It is
 * fetched on the click that opens it.
 */
const BookingDialog = lazy(() =>
  import("./components/sections/Booking").then((m) => ({ default: m.BookingDialog }))
);

const AboutPage = lazy(load["/about"]);
const ProjectsPage = lazy(load["/projects"]);
const PlaygroundPage = lazy(load["/playground"]);
const ContactPage = lazy(load["/contact"]);
const ProjectPage = lazy(load.project);

import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useReducedMotion } from "./hooks/useMediaQuery";
import { withPageTransition } from "./lib/pageTransition";

/**
 * Pointer style. "ring" is a precise dot with a hollow outlined circle
 * trailing it; "comet" trails a solid shape that tapers along the direction of
 * travel. Both live in components/ui/Cursor.tsx.
 */
const CURSOR_VARIANT: CursorVariant = "ring";

/** Paths the in-page router owns. Anything else is left to the browser. */
const ROUTES = ["/", "/about", "/projects", "/playground", "/contact"];

/** Every project has its own page under /projects, so the list is not exhaustive. */
const PROJECT_PATH = /^\/projects\/([a-z0-9-]+)$/;
const isSiteRoute = (path: string) =>
  ROUTES.includes(path) || PROJECT_PATH.test(path);

/** The chunk a path needs, or undefined for one already here. */
const chunkFor = (path: string) =>
  PROJECT_PATH.test(path) ? load.project : load[path as keyof typeof load];

/**
 * The plate on this page for `slug`, if the visitor can see it.
 *
 * Lending it `view-transition-name: project-cover` makes it morph into the
 * hero of the project page rather than being wiped away with everything else —
 * the same picture, carried across the change of page.
 *
 * Only when it is on screen. A name given to a plate the visitor cannot see
 * still animates: the browser slides it in from wherever it sits in the
 * document, which from three screens down reads as a long unexplained swoop.
 * The typographic works list links to the same projects from far above their
 * plates, so this case is reached in normal use, not in theory.
 */
function visibleCover(slug: string) {
  const el = document.querySelector<HTMLElement>(`[data-project-cover="${slug}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const seen = r.bottom > 0 && r.top < window.innerHeight;
  return seen ? el : null;
}

/**
 * Routes live in the hash.
 *
 * Path routing needs the host to answer `/about` with the same document, and
 * nothing this site ships to does: not the single file opened from disk, not
 * the published page, not a static bucket without a rewrite rule. On all of
 * them a pushed `/about` lands on a URL the host does not own and the route
 * never renders — which is exactly what went wrong. The hash is carried by the
 * document itself, so it works the same everywhere, at the cost of a `#` in
 * the address bar. Swap this for BrowserRouter only alongside a server rewrite.
 */
const Router = HashRouter;

export default function App() {
  return (
    // Framer drives its animations from JS, so the `prefers-reduced-motion`
    // block in index.css — which only reaches CSS animations and transitions —
    // never touched them: 36 elements still moved on a page with the
    // preference set. `reducedMotion="user"` hands that decision to the OS for
    // every motion component at once, keeping opacity fades and dropping the
    // transforms that actually cause trouble.
    <Router>
      <MotionGate>
        <Shell />
      </MotionGate>
    </Router>
  );
}

/**
 * Framer's own reduced-motion handling reads the system preference directly,
 * so it has to be told about the switch in the page: "always" forces it,
 * "user" leaves it to the OS. Inside the router, because the hook it reads
 * subscribes to a store and wants to be under React's tree.
 */
function MotionGate({ children }: { children: React.ReactNode }) {
  const calm = useReducedMotion();
  return <MotionConfig reducedMotion={calm ? "always" : "user"}>{children}</MotionConfig>;
}

function Shell() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Inertial wheel scrolling. It stays on while the menu is up: the panel is
  // fixed, so the page reads normally as it scrolls past behind it.
  //
  // Set up while the preloader is still covering the page rather than at the
  // moment it lifts. Mounting costs a forced layout of the whole document —
  // ~35ms on the home page — and behind the curtain nothing else is competing
  // for that frame, whereas the lift itself is the busiest frame on the page.
  // Wheel events are ignored while the scroll is locked, so nothing moves early.
  useSmoothScroll(true);

  const openBooking = useCallback(() => setBookingOpen(true), []);

  /**
   * One handler for every link on the site.
   *
   * In-page anchors scroll; links to another route run through the wipe. Doing
   * it here rather than in a link component means the menu, the footer and the
   * page bodies can all stay plain anchors — which is also what keeps them
   * working (opened in a new tab, copied, crawled) when the script has not run.
   */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // A link that has already handled its own click is not an anchor jump.
      // The CTA is an <a href="#contact"> that opens the booking panel instead,
      // and without this it also scrolled the page to the contact section —
      // so the panel appeared to open only from one place on the page.
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as HTMLElement)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!link) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;

      const raw = link.getAttribute("href")!;

      // Same-page anchor.
      //
      // Anything starting with `#` is handled here and nowhere else, including
      // a bare `#` and an id that is not on this page. Letting those fall
      // through to the browser was a real bug: routes live in the hash, so the
      // default action rewrote `#/contact` to `#` and the router, seeing no
      // route, dropped the visitor back on the home page. A placeholder link
      // now does what it looks like it does — nothing.
      if (raw.startsWith("#")) {
        e.preventDefault();
        const id = raw.slice(1);
        if (!id) return;
        const target = id === "top" ? document.body : document.getElementById(id);
        if (!target) return;
        window.scrollTo({
          top: id === "top" ? 0 : target.getBoundingClientRect().top + window.scrollY - 70,
          behavior: "smooth",
        });
        return;
      }

      // Another route on this site, optionally with an anchor to land on.
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const path = url.pathname.replace(/\/+$/, "") || "/";
      if (!isSiteRoute(path)) return;

      e.preventDefault();
      setMenuOpen(false);

      if (path === location.pathname) {
        // Already here — treat it as "back to the top of this page".
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const go = () => {
        // Going to a project page, the plate that was clicked travels with you.
        const cover = visibleCover(path.match(PROJECT_PATH)?.[1] ?? "");
        if (cover) cover.style.viewTransitionName = "project-cover";

        withPageTransition(
          () => {
            // flushSync so the new page is committed before the API snapshots
            // it. And the page goes to the top here rather than in the effect
            // below, which does not run until after the snapshot. Left to the
            // effect, the new page was captured still sitting at the old
            // page's offset: the wipe covered that, but the travelling cover
            // did not — it was measured against a hero that had not reached
            // its resting place, so the plate stopped short of where it was
            // going.
            flushSync(() => navigate(path + url.hash));
            if (!url.hash) window.scrollTo(0, 0);
          },
          () => {
            // Hand the name back: two elements wearing it at once is invalid
            // and the browser drops the transition entirely.
            if (cover) cover.style.viewTransitionName = "";
          }
        );
      };

      // Have the page in hand before the wipe starts, so the transition
      // snapshots the page and not a Suspense fallback: the API captures the
      // new state the moment the commit returns, and a chunk still in flight
      // means what it captures is an empty page. An already-loaded chunk
      // resolves from cache, so a second visit to a route pays nothing.
      const chunk = chunkFor(path);
      if (chunk) void chunk().then(go);
      else go();
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [location.pathname, navigate]);

  /**
   * Every page starts at the top, and an incoming `#hash` is honoured once the
   * new page has laid out. The reference resets the offset the same way — the
   * wipe would otherwise reveal the new page already scrolled halfway down.
   */
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70 });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [location.pathname, location.hash]);

  return (
    <div id="top" className="grain relative min-h-screen text-paper">
      <DocumentHead />
      <Preloader onDone={() => setReady(true)} />
      <Cursor variant={CURSOR_VARIANT} />

      <ScrollProgress />

      {/* Hidden while the menu is open — the panel brings its own glass, and
          stacking the two would deepen the blur under the header alone. */}
      <TopGlass hidden={menuOpen} />

      <Header
        ready={ready}
        menuOpen={menuOpen}
        onMenu={() => setMenuOpen((v) => !v)}
      />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      {/* Not mounted at all until it is wanted, so its chunk is not fetched
          either. No fallback: there is nothing on screen to hold a place for,
          and the panel arriving a beat late reads as it opening. */}
      {bookingOpen && (
        <Suspense fallback={null}>
          <BookingDialog open onClose={() => setBookingOpen(false)} />
        </Suspense>
      )}

      {/* The page body is opaque and rides above the closing wordmark, which
          is pinned to the bottom of the viewport behind it. Scrolling to the
          end slides this block up off the strip and uncovers it. */}
      <div className="relative z-10 bg-ink">
        {/* One screen of nothing rather than a spinner. A route change is
            already covered by the wipe, and on a cold load of a deep link the
            preloader is still up — so this is only ever seen if a chunk is
            genuinely slow, where a blank hold reads better than a flash of
            loading furniture. */}
        <Suspense fallback={<div className="min-h-screen" />}>
          <Routes>
            <Route path="/" element={<Home ready={ready} onBook={openBooking} />} />
            <Route path="/about" element={<AboutPage onBook={openBooking} />} />
            <Route path="/projects" element={<ProjectsPage onBook={openBooking} />} />
            <Route path="/projects/:slug" element={<ProjectPage onBook={openBooking} />} />
            <Route path="/playground" element={<PlaygroundPage onBook={openBooking} />} />
            <Route path="/contact" element={<ContactPage onBook={openBooking} />} />
            {/* Anything unrecognised falls back to the home page. */}
            <Route path="*" element={<Home ready={ready} onBook={openBooking} />} />
          </Routes>
        </Suspense>

        <Footer />
      </div>

      <ClosingMark />
    </div>
  );
}

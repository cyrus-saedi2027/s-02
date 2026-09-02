import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { MotionConfig } from "framer-motion";
import { HashRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { Preloader } from "./components/ui/Preloader";
import { Cursor, type CursorVariant } from "./components/ui/Cursor";
import { ScrollProgress } from "./components/ui/ScrollProgress";
import { TopGlass } from "./components/ui/TopGlass";
import { Header } from "./components/Header";
import { MenuOverlay } from "./components/MenuOverlay";
import { BookingDialog } from "./components/sections/Booking";
import { Footer } from "./components/sections/Footer";
import { ClosingMark } from "./components/sections/ClosingMark";

import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ProjectsPage from "./pages/ProjectsPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import ContactPage from "./pages/ContactPage";

import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { withPageTransition } from "./lib/pageTransition";

/**
 * Pointer style. "ring" is a precise dot with a hollow outlined circle
 * trailing it; "comet" trails a solid shape that tapers along the direction of
 * travel. Both live in components/ui/Cursor.tsx.
 */
const CURSOR_VARIANT: CursorVariant = "ring";

/** Paths the in-page router owns. Anything else is left to the browser. */
const ROUTES = ["/", "/about", "/projects", "/playground", "/contact"];

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
    <MotionConfig reducedMotion="user">
      <Router>
        <Shell />
      </Router>
    </MotionConfig>
  );
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
      if (!ROUTES.includes(path)) return;

      e.preventDefault();
      setMenuOpen(false);

      if (path === location.pathname) {
        // Already here — treat it as "back to the top of this page".
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      withPageTransition(() => {
        // flushSync so the new page is committed before the API snapshots it.
        flushSync(() => navigate(path + url.hash));
      });
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
      <BookingDialog open={bookingOpen} onClose={() => setBookingOpen(false)} />

      {/* The page body is opaque and rides above the closing wordmark, which
          is pinned to the bottom of the viewport behind it. Scrolling to the
          end slides this block up off the strip and uncovers it. */}
      <div className="relative z-10 bg-ink">
        <Routes>
          <Route path="/" element={<Home ready={ready} onBook={openBooking} />} />
          <Route path="/about" element={<AboutPage onBook={openBooking} />} />
          <Route path="/projects" element={<ProjectsPage onBook={openBooking} />} />
          <Route path="/playground" element={<PlaygroundPage onBook={openBooking} />} />
          <Route path="/contact" element={<ContactPage onBook={openBooking} />} />
          {/* Anything unrecognised falls back to the home page. */}
          <Route path="*" element={<Home ready={ready} onBook={openBooking} />} />
        </Routes>

        <Footer />
      </div>

      <ClosingMark />
    </div>
  );
}

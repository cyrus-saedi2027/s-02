/**
 * Which palette the site is wearing.
 *
 * Three states, not two. "System" follows `prefers-color-scheme` and keeps
 * following it, so a visitor whose machine turns light at sunrise gets a site
 * that does too; dark and light are a decision that outranks it until they
 * change their mind. A two-state switch would have quietly thrown the system
 * preference away the first time anybody touched it.
 *
 * The stamp is the whole mechanism: index.css defines the palette twice, once
 * on `:root` and once on `:root[data-theme="light"]`, and every colour in the
 * site is a variable from that block. Nothing else has to know.
 */

const KEY = "zayla:theme";

export type ThemeChoice = "system" | "dark" | "light";
export type Theme = "dark" | "light";

type Listener = () => void;
const listeners = new Set<Listener>();

let choice = read();

function read(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "dark" || v === "light" ? v : "system";
  } catch {
    return "system";
  }
}

function systemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/** What is actually on screen, once the choice and the system are combined. */
export function activeTheme(): Theme {
  return choice === "system" ? systemTheme() : choice;
}

export function themeChoice() {
  return choice;
}

function stamp() {
  if (typeof document === "undefined") return;
  // Only light needs marking: dark is what `:root` already is, so leaving the
  // attribute off is both the default and one less thing to keep in step.
  if (activeTheme() === "light") document.documentElement.dataset.theme = "light";
  else delete document.documentElement.dataset.theme;
}

export function setThemeChoice(next: ThemeChoice) {
  choice = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Storage blocked. The choice still holds for this visit.
  }
  stamp();
  listeners.forEach((l) => l());
}

export function subscribeTheme(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// Keep following the system while that is what was asked for.
if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
    if (choice !== "system") return;
    stamp();
    listeners.forEach((l) => l());
  });
  stamp();
}

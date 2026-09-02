/**
 * The site's few sounds, synthesised rather than shipped.
 *
 * Two reasons for the Web Audio API over a pair of audio files. Everything
 * else on this site is generated — the artwork, the type specimens, the
 * plates — so buying two MP3s to sit beside them would be the odd one out. And
 * the single-file build inlines every asset: two short clips would have been
 * tens of kilobytes of base64 for sounds most visitors will never turn on.
 * Synthesis costs a few hundred bytes of code and nothing at rest.
 *
 * Off unless asked for, and remembered per visitor. A portfolio that makes a
 * noise at someone who did not ask has picked the wrong fight — this is a
 * thing you switch on because you want it, and it stays on next time.
 */

const KEY = "zayla:sound";

let ctx: AudioContext | null = null;
let enabled = false;

/** Reads the stored preference. Private browsing throws; that reads as off. */
export function soundWasEnabled() {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

export function isSoundEnabled() {
  return enabled;
}

/**
 * Turning it on has to happen inside the click that turned it on: a context
 * created outside a gesture starts suspended, and every later sound is
 * silently dropped.
 */
export function setSoundEnabled(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // A visitor with storage blocked still gets sound for this visit.
  }
  if (!on) return;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (Ctor) ctx = new Ctor();
  }
  void ctx?.resume();
}

/**
 * One voice: a sine sliding between two pitches under a short envelope.
 *
 * The envelope is the whole difference between a sound and a click of noise.
 * A gain that starts and stops at a hard zero pops, because the waveform is
 * cut mid-cycle — these ramp up over a few milliseconds and decay
 * exponentially, which is what makes a synthesised tone read as an object
 * being touched rather than as a beep.
 */
function tone(from: number, to: number, seconds: number, peak: number) {
  if (!enabled || !ctx || ctx.state !== "running") return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const t = ctx.currentTime;

  osc.type = "sine";
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + seconds);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);

  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + seconds + 0.02);
}

/** The menu opening and closing: a short tick, up then down. */
export const playMenu = (opening: boolean) =>
  opening ? tone(420, 620, 0.13, 0.05) : tone(620, 380, 0.13, 0.04);

/** A change of page: a low sweep under the wipe, long enough to carry it. */
export const playTransition = () => tone(180, 90, 0.55, 0.045);

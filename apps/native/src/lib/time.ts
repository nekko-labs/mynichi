import { useSyncExternalStore } from 'react';

// One clock for the whole app.
//
// Screens used to call Date.now() while rendering, which is impure: two
// renders of the same state could disagree about what is due. This is the
// same value for every subscriber, it changes on a slow tick (so a card that
// becomes due while the app is open starts showing as due), and the timer only
// runs while something is watching it.

const TICK_MS = 60_000;

let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function tick() {
  now = Date.now();
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  if (timer == null) {
    now = Date.now();
    timer = setInterval(tick, TICK_MS);
  }
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && timer != null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot(): number {
  return now;
}

/** The current time, safe to read during render. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** For code paths outside render (event handlers, store writes). */
export function currentTime(): number {
  return Date.now();
}

/**
 * Pull the clock forward now instead of waiting for the tick. Stores call
 * this when they write, so a word captured a second ago counts as due
 * straight away rather than a tick later.
 */
export function syncNow() {
  tick();
}

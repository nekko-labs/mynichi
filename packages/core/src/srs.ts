// Spaced-repetition scheduler (SM-2 family, Anki-style learning steps).
// Pure functions over a small state record so it is trivially testable and
// storable as JSON. Times are epoch milliseconds; intervals are days.

export type SrsGrade = 'again' | 'hard' | 'good' | 'easy';

export type SrsPhase = 'new' | 'learning' | 'review';

export type SrsState = {
  phase: SrsPhase;
  /** When this item is next due, epoch ms. */
  due: number;
  /** Current review interval in days (0 while learning). */
  intervalDays: number;
  /** Ease factor, starts at 2.5, floors at 1.3. */
  ease: number;
  /** Successful reviews in a row within the current phase. */
  reps: number;
  /** Times the item fell out of review back to learning. */
  lapses: number;
};

const MIN_EASE = 1.3;
const MINUTE = 60_000;
const DAY = 86_400_000;

export function initialSrs(now: number): SrsState {
  return { phase: 'new', due: now, intervalDays: 0, ease: 2.5, reps: 0, lapses: 0 };
}

export function isDue(state: SrsState, now: number): boolean {
  return state.due <= now;
}

export function reviewSrs(state: SrsState, grade: SrsGrade, now: number): SrsState {
  if (state.phase === 'review') {
    return reviewPhase(state, grade, now);
  }
  return learningPhase(state, grade, now);
}

function learningPhase(state: SrsState, grade: SrsGrade, now: number): SrsState {
  switch (grade) {
    case 'again':
      return { ...state, phase: 'learning', reps: 0, due: now + 1 * MINUTE };
    case 'hard':
      return { ...state, phase: 'learning', due: now + 5 * MINUTE };
    case 'good':
      if (state.reps >= 1) {
        // Graduate to review at 1 day.
        return { ...state, phase: 'review', reps: 0, intervalDays: 1, due: now + DAY };
      }
      return { ...state, phase: 'learning', reps: state.reps + 1, due: now + 10 * MINUTE };
    case 'easy':
      // Skip the remaining steps and graduate at 4 days.
      return { ...state, phase: 'review', reps: 0, intervalDays: 4, due: now + 4 * DAY };
  }
}

function reviewPhase(state: SrsState, grade: SrsGrade, now: number): SrsState {
  switch (grade) {
    case 'again':
      return {
        ...state,
        phase: 'learning',
        reps: 0,
        lapses: state.lapses + 1,
        ease: Math.max(MIN_EASE, state.ease - 0.2),
        // Relearn quickly, then come back at half the old interval (min 1d).
        intervalDays: Math.max(1, Math.round(state.intervalDays * 0.5)),
        due: now + 10 * MINUTE
      };
    case 'hard': {
      const interval = Math.max(1, Math.round(state.intervalDays * 1.2));
      return {
        ...state,
        ease: Math.max(MIN_EASE, state.ease - 0.15),
        intervalDays: interval,
        reps: state.reps + 1,
        due: now + interval * DAY
      };
    }
    case 'good': {
      const interval = Math.max(1, Math.round(state.intervalDays * state.ease));
      return { ...state, intervalDays: interval, reps: state.reps + 1, due: now + interval * DAY };
    }
    case 'easy': {
      const interval = Math.max(1, Math.round(state.intervalDays * state.ease * 1.3));
      return {
        ...state,
        ease: state.ease + 0.15,
        intervalDays: interval,
        reps: state.reps + 1,
        due: now + interval * DAY
      };
    }
  }
}

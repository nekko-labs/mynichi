import { describe, expect, test } from 'bun:test';

import { initialSrs, isDue, reviewSrs } from './srs';

const NOW = 1_700_000_000_000;
const MINUTE = 60_000;
const DAY = 86_400_000;

describe('srs scheduler', () => {
  test('new items are due immediately', () => {
    const s = initialSrs(NOW);
    expect(s.phase).toBe('new');
    expect(isDue(s, NOW)).toBe(true);
  });

  test('learning: good twice graduates to review at 1 day', () => {
    let s = initialSrs(NOW);
    s = reviewSrs(s, 'good', NOW);
    expect(s.phase).toBe('learning');
    expect(s.due).toBe(NOW + 10 * MINUTE);

    s = reviewSrs(s, 'good', NOW + 10 * MINUTE);
    expect(s.phase).toBe('review');
    expect(s.intervalDays).toBe(1);
    expect(s.due).toBe(NOW + 10 * MINUTE + DAY);
  });

  test('learning: again resets the step', () => {
    let s = initialSrs(NOW);
    s = reviewSrs(s, 'good', NOW);
    s = reviewSrs(s, 'again', NOW);
    expect(s.phase).toBe('learning');
    expect(s.reps).toBe(0);
    expect(s.due).toBe(NOW + 1 * MINUTE);
  });

  test('learning: easy graduates straight to 4 days', () => {
    const s = reviewSrs(initialSrs(NOW), 'easy', NOW);
    expect(s.phase).toBe('review');
    expect(s.intervalDays).toBe(4);
  });

  test('review: good multiplies interval by ease', () => {
    let s = reviewSrs(initialSrs(NOW), 'easy', NOW); // 4d, ease 2.5
    s = reviewSrs(s, 'good', s.due);
    expect(s.intervalDays).toBe(10); // 4 * 2.5
  });

  test('review: again lapses back to learning, halves interval, drops ease', () => {
    let s = reviewSrs(initialSrs(NOW), 'easy', NOW); // 4d
    s = reviewSrs(s, 'good', s.due); // 10d
    const before = s;
    s = reviewSrs(s, 'again', s.due);
    expect(s.phase).toBe('learning');
    expect(s.lapses).toBe(1);
    expect(s.ease).toBeCloseTo(before.ease - 0.2);
    expect(s.intervalDays).toBe(5);
    expect(s.due).toBe(before.due + 10 * MINUTE);
  });

  test('ease never drops below 1.3', () => {
    let s = reviewSrs(initialSrs(NOW), 'easy', NOW);
    for (let i = 0; i < 12; i++) {
      s = reviewSrs(s, 'again', s.due);
      s = reviewSrs(s, 'good', s.due);
      s = reviewSrs(s, 'good', s.due);
    }
    expect(s.ease).toBeGreaterThanOrEqual(1.3);
  });

  test('review: hard grows slowly and drops ease slightly', () => {
    let s = reviewSrs(initialSrs(NOW), 'easy', NOW); // 4d, ease 2.5
    s = reviewSrs(s, 'hard', s.due);
    expect(s.intervalDays).toBe(5); // round(4 * 1.2)
    expect(s.ease).toBeCloseTo(2.35);
    expect(s.phase).toBe('review');
  });
});

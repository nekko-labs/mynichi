import { describe, expect, test } from 'bun:test';

import { dailyWord, dailyWordTimeline } from './daily-word';
import type { PracticeList } from './lists';
import { initialSrs } from './srs';

const item = (id: string, text: string, createdAt: number) => ({
  id,
  kind: 'word' as const,
  text,
  reading: `${text}よみ`,
  meaning: `${text} meaning`,
  source: 'manual' as const,
  createdAt,
  srs: initialSrs(0)
});

const lists: PracticeList[] = [
  { id: 'a', name: 'Work', category: 'work', createdAt: 0, items: [item('2', '納期', 2), item('1', '残業', 1)] },
  { id: 'b', name: 'Food', category: 'food', createdAt: 0, items: [item('3', '定食', 3)] }
];

describe('daily word', () => {
  test('empty pool yields nothing', () => {
    expect(dailyWord([], new Date())).toBeUndefined();
    expect(dailyWordTimeline([], new Date())).toEqual([]);
  });

  test('same day always picks the same item, consecutive days cycle the pool', () => {
    const d = new Date(2026, 9, 22, 15, 30);
    expect(dailyWord(lists, d)).toEqual(dailyWord(lists, new Date(2026, 9, 22, 1)));
    const seen = [0, 1, 2].map((i) => dailyWord(lists, new Date(2026, 9, 22 + i))!.text);
    expect(new Set(seen).size).toBe(3);
    expect(dailyWord(lists, new Date(2026, 9, 25))!.text).toBe(seen[0]!);
  });

  test('timeline starts now and then at each local midnight', () => {
    const now = new Date(2026, 9, 22, 15, 30);
    const tl = dailyWordTimeline(lists, now, 3);
    expect(tl.map((e) => e.date.getTime())).toEqual([
      now.getTime(),
      new Date(2026, 9, 23).getTime(),
      new Date(2026, 9, 24).getTime()
    ]);
    expect(tl[0]!.props.listId).toMatch(/^[ab]$/);
    expect(tl[0]!.props.reading).toEndWith('よみ');
  });
});

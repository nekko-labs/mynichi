import type { PracticeList } from './lists';

// The Lock Screen "daily word": one item per local calendar day, drawn from
// every list. Deterministic from the date so the app and the widget agree
// without talking, and consecutive days walk the pool in order so nothing
// repeats until the whole pool has been shown.

export type DailyWord = {
  listId: string;
  text: string;
  reading: string;
  meaning: string;
};

const DAY = 86_400_000;

function localMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function dailyWord(lists: PracticeList[], day: Date): DailyWord | undefined {
  const pool = lists
    .flatMap((l) => l.items.map((i) => ({ listId: l.id, item: i })))
    .sort((a, b) => a.item.createdAt - b.item.createdAt || a.item.id.localeCompare(b.item.id));
  if (pool.length === 0) return undefined;
  const dayNumber = Math.floor(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) / DAY);
  const { listId, item } = pool[dayNumber % pool.length]!;
  return { listId, text: item.text, reading: item.reading ?? '', meaning: item.meaning ?? '' };
}

/** Timeline entries from today onwards, one per local midnight. */
export function dailyWordTimeline(
  lists: PracticeList[],
  from: Date,
  days = 7
): { date: Date; props: DailyWord }[] {
  const start = localMidnight(from);
  const out: { date: Date; props: DailyWord }[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const props = dailyWord(lists, date);
    if (props) out.push({ date: i === 0 ? from : date, props });
  }
  return out;
}

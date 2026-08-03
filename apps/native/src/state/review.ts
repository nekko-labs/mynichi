import { useState } from 'react';
import type { ListItem, SrsGrade } from '@mynichi/core';

import { currentTime } from '../lib/time';
import { dueItems, getList, gradeItem } from '../store/lists';

// One review session: the queue is snapshotted when the session starts so
// grading cannot reshuffle the cards under the user, and the tally is kept for
// the "done" page.

export type GradeTally = Record<SrsGrade, number>;

const EMPTY_TALLY: GradeTally = { again: 0, hard: 0, good: 0, easy: 0 };

function snapshotQueue(listId: string | undefined): ListItem[] {
  const list = listId ? getList(listId) : undefined;
  if (!list) return [];
  return dueItems(list, currentTime()).map((item) => ({ ...item }));
}

export type ReviewSession = {
  queue: ListItem[];
  index: number;
  item: ListItem | null;
  done: boolean;
  revealed: boolean;
  reveal: () => void;
  graded: GradeTally;
  grade: (grade: SrsGrade) => void;
};

export function useReviewSession(listId: string | undefined): ReviewSession {
  const [snapshot, setSnapshot] = useState(() => ({ listId, queue: snapshotQueue(listId) }));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState<GradeTally>(EMPTY_TALLY);

  // Navigating to a different list restarts the session rather than grading
  // the previous list's cards.
  if (snapshot.listId !== listId) {
    setSnapshot({ listId, queue: snapshotQueue(listId) });
    setIndex(0);
    setRevealed(false);
    setGraded(EMPTY_TALLY);
  }

  const queue = snapshot.queue;
  const done = index >= queue.length;
  const item = done ? null : queue[index];

  function grade(value: SrsGrade) {
    if (!item || !listId) return;
    gradeItem(listId, item.id, value);
    setGraded((prev) => ({ ...prev, [value]: prev[value] + 1 }));
    setRevealed(false);
    setIndex((prev) => prev + 1);
  }

  return {
    queue,
    index,
    item,
    done,
    revealed,
    reveal: () => setRevealed(true),
    graded,
    grade
  };
}

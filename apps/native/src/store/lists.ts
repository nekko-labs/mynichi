import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import {
  initialSrs,
  reviewSrs,
  type ItemKind,
  type ItemSource,
  type ListCategory,
  type ListItem,
  type ListsDoc,
  type PracticeList,
  type SrsGrade
} from '@mynichi/core';

// Local-first lists store. The free tier owns its data on the device; cloud
// sync arrives as a premium feature (T51). Web persists to localStorage; the
// native build swaps this driver for expo-sqlite when the iOS app lands (T53).

const KEY = 'mynichi.lists.v1';

type Driver = {
  read: () => string | null;
  write: (value: string) => void;
};

const memory = new Map<string, string>();

const driver: Driver =
  Platform.OS === 'web' && typeof localStorage !== 'undefined'
    ? {
        read: () => localStorage.getItem(KEY),
        write: (v) => localStorage.setItem(KEY, v)
      }
    : {
        read: () => memory.get(KEY) ?? null,
        write: (v) => memory.set(KEY, v)
      };

const EMPTY: ListsDoc = { version: 1, lists: [] };

function load(): ListsDoc {
  try {
    const raw = driver.read();
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as ListsDoc;
    if (parsed.version !== 1 || !Array.isArray(parsed.lists)) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

let doc: ListsDoc = load();
const listeners = new Set<() => void>();

function commit(next: ListsDoc) {
  doc = next;
  try {
    driver.write(JSON.stringify(doc));
  } catch {
    // Storage full or unavailable; keep the in-memory state alive.
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useListsDoc(): ListsDoc {
  return useSyncExternalStore(
    subscribe,
    () => doc,
    () => EMPTY
  );
}

export function getList(id: string): PracticeList | undefined {
  return doc.lists.find((l) => l.id === id);
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function createList(name: string, category: ListCategory): PracticeList {
  const list: PracticeList = {
    id: newId(),
    name: name.trim(),
    category,
    createdAt: Date.now(),
    items: []
  };
  commit({ ...doc, lists: [list, ...doc.lists] });
  return list;
}

export function deleteList(id: string) {
  commit({ ...doc, lists: doc.lists.filter((l) => l.id !== id) });
}

export type NewItem = {
  kind: ItemKind;
  text: string;
  reading?: string;
  meaning?: string;
  example?: string;
  source: ItemSource;
};

export function addItem(listId: string, item: NewItem): ListItem | undefined {
  const target = getList(listId);
  if (!target || !item.text.trim()) return undefined;
  const created: ListItem = {
    id: newId(),
    kind: item.kind,
    text: item.text.trim(),
    reading: item.reading?.trim() || undefined,
    meaning: item.meaning?.trim() || undefined,
    example: item.example?.trim() || undefined,
    source: item.source,
    createdAt: Date.now(),
    srs: initialSrs(Date.now())
  };
  commit({
    ...doc,
    lists: doc.lists.map((l) => (l.id === listId ? { ...l, items: [created, ...l.items] } : l))
  });
  return created;
}

export function deleteItem(listId: string, itemId: string) {
  commit({
    ...doc,
    lists: doc.lists.map((l) =>
      l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l
    )
  });
}

export function gradeItem(listId: string, itemId: string, grade: SrsGrade) {
  commit({
    ...doc,
    lists: doc.lists.map((l) =>
      l.id === listId
        ? {
            ...l,
            items: l.items.map((i) =>
              i.id === itemId ? { ...i, srs: reviewSrs(i.srs, grade, Date.now()) } : i
            )
          }
        : l
    )
  });
}

export function dueItems(list: PracticeList, now: number): ListItem[] {
  return list.items.filter((i) => i.srs.due <= now);
}

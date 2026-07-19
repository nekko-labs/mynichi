import type { ListCategory } from './index';
import type { SrsState } from './srs';

// Practice-list domain types, shared by the app store and (later) the sync
// engine. Persisted as JSON, so keep everything structurally serializable.

export type ItemKind = 'word' | 'kanji' | 'phrase' | 'grammar';

export type ItemSource = 'manual' | 'dictionary' | 'translation';

export type ListItem = {
  id: string;
  kind: ItemKind;
  /** The Japanese as captured (kanji/kana). */
  text: string;
  /** Kana reading, when known. */
  reading?: string;
  meaning?: string;
  example?: string;
  source: ItemSource;
  createdAt: number;
  /** Recognition-axis SRS state; writing axis arrives with stroke practice. */
  srs: SrsState;
};

export type PracticeList = {
  id: string;
  name: string;
  category: ListCategory;
  createdAt: number;
  items: ListItem[];
};

export type ListsDoc = {
  version: 1;
  lists: PracticeList[];
};

export const CATEGORY_META: Record<ListCategory, { label: string; kanji: string }> = {
  life: { label: 'Life admin', kanji: '暮' },
  work: { label: 'Work', kanji: '仕' },
  'real-estate': { label: 'Housing', kanji: '家' },
  health: { label: 'Health', kanji: '医' },
  tech: { label: 'Tech', kanji: '技' },
  food: { label: 'Food', kanji: '食' },
  travel: { label: 'Travel', kanji: '旅' },
  custom: { label: 'Custom', kanji: '自' }
};

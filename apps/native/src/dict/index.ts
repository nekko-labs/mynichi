import { isRomaji, toHiragana } from 'wanakana';
import { katakanaToHiragana } from '@mynichi/core';

// Bundled common-words dictionary (JMdict via jmdict-simplified, EDRDG
// licence). Served as a static asset and fetched lazily on first use so the
// JS bundle stays small; ~22.6k common entries.

export type DictWord = {
  /** JMdict sequence id. */
  s: number;
  /** Kanji form (absent for kana-only words). */
  k?: string;
  /** Kana reading. */
  r: string;
  /** English glosses. */
  g: string[];
  /** Part-of-speech tags for the first sense. */
  p?: string[];
};

type DictFile = { source: string; license: string; built: string; words: DictWord[] };

export type Dict = {
  words: DictWord[];
  byText: Map<string, DictWord[]>;
  attribution: string;
};

let promise: Promise<Dict> | null = null;

// The web app is served under /app (experiments.baseUrl); dev serves at /.
const CANDIDATE_URLS = [
  `${process.env.EXPO_BASE_URL ?? ''}/data/dict-common.json`,
  '/app/data/dict-common.json',
  '/data/dict-common.json'
];

async function fetchDict(): Promise<DictFile> {
  let lastError: unknown = null;
  const tried = new Set<string>();
  for (const url of CANDIDATE_URLS) {
    if (tried.has(url)) continue;
    tried.add(url);
    try {
      const res = await fetch(url);
      if (res.ok) return (await res.json()) as DictFile;
      lastError = new Error(`HTTP ${res.status} for ${url}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('dictionary fetch failed');
}

export function loadDict(): Promise<Dict> {
  promise ??= fetchDict()
    .then((file) => {
      const byText = new Map<string, DictWord[]>();
      for (const w of file.words) {
        const keys = new Set<string>();
        if (w.k) keys.add(w.k);
        keys.add(w.r);
        keys.add(katakanaToHiragana(w.r));
        for (const key of keys) {
          const bucket = byText.get(key);
          if (bucket) bucket.push(w);
          else byText.set(key, [w]);
        }
      }
      return { words: file.words, byText, attribution: `${file.source}, ${file.license}` };
    })
    .catch((err) => {
      promise = null; // allow retry on the next call
      throw err;
    });
  return promise;
}

/** Exact lookup by kanji or kana surface (used by quick-add enrichment). */
export function lookupExact(dict: Dict, raw: string): DictWord | undefined {
  const text = raw.trim();
  if (!text) return undefined;
  const direct = dict.byText.get(text) ?? dict.byText.get(katakanaToHiragana(text));
  if (direct?.length) return direct[0];
  if (isRomaji(text)) {
    const kana = toHiragana(text);
    return dict.byText.get(kana)?.[0];
  }
  return undefined;
}

export type SearchHit = { word: DictWord; score: number };

/**
 * Ranked search: exact match, then Japanese prefix, then English gloss match.
 * Romaji queries are converted to hiragana for the Japanese passes.
 */
export function searchDict(dict: Dict, rawQuery: string, limit = 30): DictWord[] {
  const query = rawQuery.trim();
  if (!query) return [];
  const qLower = query.toLowerCase();
  const qKana = isRomaji(query) ? toHiragana(qLower) : katakanaToHiragana(query);

  const hits: SearchHit[] = [];
  const seen = new Set<number>();

  // Exact matches come from the index so the scan cap can never drop them.
  for (const key of [query, qKana]) {
    for (const w of dict.byText.get(key) ?? []) {
      if (!seen.has(w.s)) {
        seen.add(w.s);
        hits.push({ word: w, score: 0 });
      }
    }
  }

  for (const w of dict.words) {
    if (seen.has(w.s)) continue;
    const kana = katakanaToHiragana(w.r);
    let score = -1;

    if (w.k?.startsWith(query) || kana.startsWith(qKana)) {
      score = 10 + (w.k?.length ?? w.r.length);
    } else {
      const gi = w.g.findIndex((g) => g.toLowerCase().includes(qLower));
      if (gi >= 0) {
        const exactGloss = w.g[gi].toLowerCase() === qLower;
        score = exactGloss ? 5 : 100 + gi * 5 + w.g[gi].length;
      }
    }

    if (score >= 0) {
      hits.push({ word: w, score });
    }
    if (hits.length > 600) break; // plenty to rank from
  }

  hits.sort((a, b) => a.score - b.score);
  return hits.slice(0, limit).map((h) => h.word);
}

/** Human-readable part-of-speech, e.g. ["n","adv"] -> "noun · adverb". */
export function posLabel(p?: string[]): string | undefined {
  if (!p?.length) return undefined;
  const names: Record<string, string> = {
    n: 'noun',
    v1: 'ichidan verb',
    v5u: 'godan verb',
    v5k: 'godan verb',
    v5s: 'godan verb',
    v5r: 'godan verb',
    v5g: 'godan verb',
    v5b: 'godan verb',
    v5m: 'godan verb',
    v5n: 'godan verb',
    v5t: 'godan verb',
    vs: 'suru verb',
    vk: 'kuru verb',
    'adj-i': 'i-adjective',
    'adj-na': 'na-adjective',
    'adj-no': 'no-adjective',
    adv: 'adverb',
    exp: 'expression',
    int: 'interjection',
    prt: 'particle',
    conj: 'conjunction',
    pn: 'pronoun',
    ctr: 'counter',
    'aux-v': 'auxiliary verb'
  };
  const labels = [...new Set(p.map((tag) => names[tag] ?? tag))].slice(0, 2);
  return labels.join(' · ');
}

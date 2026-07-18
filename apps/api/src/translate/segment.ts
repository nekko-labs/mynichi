import path from 'node:path';
import { createRequire } from 'node:module';

import kuromoji from 'kuromoji';
import { toRomaji } from 'wanakana';
import { fitFurigana, hasKanji, katakanaToHiragana, type Token } from '@mynichi/core';

const require = createRequire(import.meta.url);
const DICT_DIR = path.join(path.dirname(require.resolve('kuromoji/package.json')), 'dict');

type Tokenizer = kuromoji.Tokenizer<kuromoji.IpadicFeatures>;

let tokenizerPromise: Promise<Tokenizer> | null = null;

function getTokenizer(): Promise<Tokenizer> {
  tokenizerPromise ??= new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: DICT_DIR }).build((err, tokenizer) => {
      if (err) reject(err);
      else resolve(tokenizer);
    });
  });
  return tokenizerPromise;
}

// Warm the dictionary at server start so the first request doesn't pay ~1s.
export function warmTokenizer(): void {
  void getTokenizer().catch((err) => {
    console.error('kuromoji dictionary failed to load:', err);
    tokenizerPromise = null;
  });
}

export async function segment(text: string): Promise<{ tokens: Token[]; romaji: string }> {
  const tokenizer = await getTokenizer();
  const tokens: Token[] = [];
  const romajiWords: string[] = [];

  for (const t of tokenizer.tokenize(text)) {
    const readingKata = t.reading && t.reading !== '*' ? t.reading : undefined;
    const reading = readingKata ? katakanaToHiragana(readingKata) : undefined;
    const romaji = reading ? toRomaji(reading) : undefined;

    tokens.push({
      surface: t.surface_form,
      reading,
      romaji,
      parts:
        hasKanji(t.surface_form) && reading
          ? fitFurigana(t.surface_form, reading)
          : [{ text: t.surface_form }]
    });
    if (romaji) romajiWords.push(romaji);
  }

  return { tokens, romaji: romajiWords.join(' ') };
}

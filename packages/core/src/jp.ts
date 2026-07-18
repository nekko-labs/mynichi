import type { RubyPart } from './translate';

const KANJI_RE = /[㐀-䶿一-鿿々]/;

export function hasKanji(text: string): boolean {
  return KANJI_RE.test(text);
}

export function katakanaToHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

function isKana(ch: string): boolean {
  return /[ぁ-ゟ゠-ヿー]/.test(ch);
}

// Align a token's hiragana reading to its surface so ruby sits only over the
// kanji run: kana shared at the start and end of the surface (okurigana,
// prefixes like お) is stripped from the reading before annotating.
// "お願い" + "おねがい" -> [お][願:ねが][い]
export function fitFurigana(surface: string, readingHira: string): RubyPart[] {
  if (!hasKanji(surface) || !readingHira) {
    return [{ text: surface }];
  }

  const s = [...surface];
  const r = [...readingHira];

  let head = 0;
  while (
    head < s.length &&
    isKana(s[head]) &&
    katakanaToHiragana(s[head]) === r[head]
  ) {
    head++;
  }

  let tail = 0;
  while (
    tail < s.length - head &&
    tail < r.length - head &&
    isKana(s[s.length - 1 - tail]) &&
    katakanaToHiragana(s[s.length - 1 - tail]) === r[r.length - 1 - tail]
  ) {
    tail++;
  }

  const parts: RubyPart[] = [];
  if (head > 0) parts.push({ text: s.slice(0, head).join('') });

  const body = s.slice(head, s.length - tail).join('');
  const ruby = r.slice(head, r.length - tail).join('');
  if (body) parts.push(ruby ? { text: body, ruby } : { text: body });

  if (tail > 0) parts.push({ text: s.slice(s.length - tail).join('') });

  return parts;
}

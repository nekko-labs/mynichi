import { describe, expect, test } from 'bun:test';

import { fitFurigana, hasKanji, katakanaToHiragana } from './jp';

describe('katakanaToHiragana', () => {
  test('converts katakana, leaves the long vowel mark and hiragana alone', () => {
    expect(katakanaToHiragana('ノウフ')).toBe('のうふ');
    expect(katakanaToHiragana('コーヒー')).toBe('こーひー');
    expect(katakanaToHiragana('ねがい')).toBe('ねがい');
  });
});

describe('hasKanji', () => {
  test('detects kanji including the iteration mark', () => {
    expect(hasKanji('納付')).toBe(true);
    expect(hasKanji('人々')).toBe(true);
    expect(hasKanji('おねがい')).toBe(false);
    expect(hasKanji('カタカナ')).toBe(false);
  });
});

describe('fitFurigana', () => {
  test('all-kanji token gets one annotated run', () => {
    expect(fitFurigana('納付', 'のうふ')).toEqual([{ text: '納付', ruby: 'のうふ' }]);
  });

  test('kana-only token is passed through untouched', () => {
    expect(fitFurigana('する', 'する')).toEqual([{ text: 'する' }]);
  });

  test('leading kana prefix is split off', () => {
    expect(fitFurigana('お願い', 'おねがい')).toEqual([
      { text: 'お' },
      { text: '願', ruby: 'ねが' },
      { text: 'い' }
    ]);
  });

  test('trailing okurigana is split off', () => {
    expect(fitFurigana('難しけれ', 'むずかしけれ')).toEqual([
      { text: '難', ruby: 'むずか' },
      { text: 'しけれ' }
    ]);
  });

  test('mixed run keeps interior kana attached to the kanji body', () => {
    expect(fitFurigana('行き違い', 'いきちがい')).toEqual([
      { text: '行き違', ruby: 'いきちが' },
      { text: 'い' }
    ]);
  });
});

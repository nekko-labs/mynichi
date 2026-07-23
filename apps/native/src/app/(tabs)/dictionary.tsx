import { useEffect, useRef, useState } from 'react';
import { css, html } from 'react-strict-dom';
import { katakanaToHiragana } from '@mynichi/core';

import { ListPicker } from '@/components/list-picker';
import { Screen } from '@/components/screen';
import { Card, EmptyState } from '@/components/ui';
import { loadDict, posLabel, searchDict, type Dict, type DictWord } from '@/dict';
import { useWideLayout } from '@/lib/layout';
import { addItem } from '@/store/lists';
import { colors, text } from '../../theme/tokens.css';

type DictState = 'idle' | 'loading' | 'ready' | 'error';

export default function DictionaryScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DictWord[]>([]);
  const [dictState, setDictState] = useState<DictState>('idle');
  const [openId, setOpenId] = useState<number | null>(null);
  const [savedTo, setSavedTo] = useState<Record<number, string>>({});
  const dictRef = useRef<Dict | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wide = useWideLayout();

  async function ensureDict(): Promise<Dict | null> {
    if (dictRef.current) return dictRef.current;
    setDictState('loading');
    try {
      const dict = await loadDict();
      dictRef.current = dict;
      setDictState('ready');
      return dict;
    } catch {
      setDictState('error');
      return null;
    }
  }

  function onQuery(value: string) {
    setQuery(value);
    setOpenId(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const dict = await ensureDict();
      if (!dict) return;
      setResults(searchDict(dict, value));
    }, 120);
  }

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  function saveToList(word: DictWord, listId: string, listName: string) {
    addItem(listId, {
      kind: word.k && [...word.k].length === 1 ? 'kanji' : 'word',
      text: word.k ?? word.r,
      reading: word.k ? katakanaToHiragana(word.r) : undefined,
      meaning: word.g.slice(0, 2).join('; '),
      source: 'dictionary'
    });
    setSavedTo((prev) => ({ ...prev, [word.s]: listName }));
  }

  const trimmed = query.trim();

  return (
    <Screen reading="じしょ" kanji="辞書" title="Dictionary" accent={colors.yuzu}>
      <html.input
        style={styles.search}
        placeholder="Japanese, romaji, or English… 例: byouin / hospital / 病院"
        value={query}
        onChange={(e: { target: { value: string } }) => onQuery(e.target.value)}
      />

      {dictState === 'loading' ? (
        <html.p style={styles.hint}>Opening the dictionary… (first time takes a moment)</html.p>
      ) : null}
      {dictState === 'error' ? (
        <html.p style={styles.errorText}>
          Could not load the offline dictionary. Check your connection once and it will stay
          available.
        </html.p>
      ) : null}

      {trimmed.length === 0 ? (
        <EmptyState
          kanji="辞"
          title="Look it up your way"
          hint="Type kana, kanji, romaji, or the English meaning. 22,000 common words, fully offline. Kanji drawing and radicals are on the way."
        />
      ) : dictState === 'ready' && results.length === 0 ? (
        <EmptyState
          kanji="無"
          title="No matches"
          hint="This starter dictionary covers common words. Rarer entries arrive with the full offline dictionary."
        />
      ) : (
        <html.div style={[styles.results, wide && styles.resultsWide]}>
          {results.map((w) => {
            const open = openId === w.s;
            const saved = savedTo[w.s];
            return (
              <html.div key={w.s} style={wide ? styles.cellWide : styles.cell}>
              <Card onClick={open ? undefined : () => setOpenId(w.s)}>
                <html.div style={styles.resultRow}>
                  <html.div style={styles.resultBody}>
                    <html.div style={styles.wordRow}>
                      <html.span style={styles.word}>{w.k ?? w.r}</html.span>
                      {w.k ? <html.span style={styles.kana}>{katakanaToHiragana(w.r)}</html.span> : null}
                    </html.div>
                    <html.span style={styles.gloss}>{w.g.join('; ')}</html.span>
                    {open && posLabel(w.p) ? (
                      <html.span style={styles.pos}>{posLabel(w.p)}</html.span>
                    ) : null}
                  </html.div>
                </html.div>

                {open ? (
                  <html.div style={styles.addBlock}>
                    {saved ? (
                      <html.span style={styles.savedNote}>Saved to “{saved}”</html.span>
                    ) : (
                      <ListPicker
                        tint={colors.yuzuSoft}
                        accent={colors.yuzu}
                        onPick={(listId, listName) => saveToList(w, listId, listName)}
                      />
                    )}
                  </html.div>
                ) : null}
              </Card>
              </html.div>
            );
          })}
        </html.div>
      )}

      {trimmed.length > 0 && dictState === 'ready' ? (
        <html.p style={styles.attribution}>JMdict (EDRDG) · CC BY-SA 4.0</html.p>
      ) : null}
    </Screen>
  );
}

const styles = css.create({
  search: {
    fontFamily: text.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.paperShade,
    borderRadius: 12,
    borderStyle: 'none',
    borderWidth: 0,
    padding: 14,
    marginBottom: 14
  },
  hint: {
    fontFamily: text.body,
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: 4
  },
  errorText: {
    fontFamily: text.body,
    fontSize: 14,
    color: colors.hanko,
    marginTop: 4
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 8
  },
  resultsWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 10
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  cellWide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 320
  },
  resultRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  resultBody: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  wordRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    columnGap: 10
  },
  word: {
    fontFamily: text.bodyBold,
    fontSize: 22,
    color: colors.ink
  },
  kana: {
    fontFamily: text.body,
    fontSize: 14,
    color: colors.inkSoft
  },
  gloss: {
    fontFamily: text.body,
    fontSize: 14,
    lineHeight: 1.5,
    color: colors.inkSoft,
    marginTop: 2
  },
  pos: {
    fontFamily: text.body,
    fontSize: 12,
    color: colors.yuzu,
    marginTop: 4
  },
  addBlock: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 12
  },
  savedNote: {
    fontFamily: text.bodyMedium,
    fontSize: 13,
    color: colors.matcha
  },
  attribution: {
    fontFamily: text.body,
    fontSize: 11,
    color: colors.inkSoft,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 20
  }
});

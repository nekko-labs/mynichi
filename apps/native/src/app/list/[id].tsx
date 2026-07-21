import { useState } from 'react';
import { css, html } from 'react-strict-dom';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { toHiragana } from 'wanakana';
import { CATEGORY_META, fitFurigana, type ItemKind, type ItemSource, hasKanji } from '@mynichi/core';

import { Screen } from '@/components/screen';
import { Button, Card, EmptyState, Label } from '@/components/ui';
import { loadDict, lookupExact } from '@/dict';
import { enrichTerm } from '@/lib/api';
import { addItem, deleteItem, deleteList, useListsDoc } from '@/store/lists';
import { colors, text } from '../../theme/tokens.css';

// How the draft's reading + meaning got filled, which drives the note under
// the captured word and how the saved item's source is recorded.
type DraftStatus = 'enriching' | 'dictionary' | 'enriched' | 'reading-only' | 'manual';

type Draft = {
  text: string;
  reading: string;
  meaning: string;
  example: string;
  status: DraftStatus;
};

const STATUS_NOTE: Record<DraftStatus, string> = {
  enriching: 'reading it the way a local would…',
  dictionary: 'filled in from the dictionary',
  enriched: 'filled in for you',
  'reading-only': 'reading filled in; add the meaning you know',
  manual: 'not found automatically, add what you know'
};

const STATUS_TO_SOURCE: Record<Exclude<DraftStatus, 'enriching'>, ItemSource> = {
  dictionary: 'dictionary',
  enriched: 'enriched',
  'reading-only': 'manual',
  manual: 'manual'
};

function guessKind(textRaw: string): ItemKind {
  const t = textRaw.trim();
  if ([...t].length === 1 && hasKanji(t)) return 'kanji';
  if ([...t].length > 6 || /[はがをにでへとや、。]/.test(t)) return 'phrase';
  return 'word';
}

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const doc = useListsDoc();
  const list = doc.lists.find((l) => l.id === id);

  const [capture, setCapture] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const now = Date.now();

  if (!list) {
    return (
      <Screen reading="れんしゅうちょう" kanji="練習帳" accent={colors.matcha} back>
        <EmptyState kanji="?" title="List not found" hint="It may have been deleted." />
      </Screen>
    );
  }

  const due = list.items.filter((i) => i.srs.due <= now).length;

  async function startDraft() {
    const textValue = capture.trim();
    if (!textValue || busy) return;
    setBusy(true);

    // 1. Offline dictionary first: instant, works with no connection.
    let reading = '';
    let meaning = '';
    let example = '';
    let hitDict = false;
    try {
      const dict = await loadDict();
      const hit = lookupExact(dict, textValue);
      if (hit) {
        reading = hit.k ? hit.r : '';
        meaning = hit.g.slice(0, 3).join('; ');
        hitDict = true;
      }
    } catch {
      // Dictionary unavailable (offline first load): fall through to the API.
    }

    if (hitDict) {
      setDraft({ text: textValue, reading, meaning, example, status: 'dictionary' });
      setBusy(false);
      return;
    }

    // 2. Not in the common dictionary (e.g. 納期): auto-fill from the API.
    //    Reading comes from kuromoji, meaning + example from the model. Show
    //    the card immediately in an "enriching" state so capture feels instant.
    setDraft({ text: textValue, reading, meaning, example, status: 'enriching' });
    let status: DraftStatus = 'manual';
    try {
      const e = await enrichTerm(textValue);
      reading = reading || e.reading;
      meaning = meaning || e.meaning;
      example = e.example?.jp ?? '';
      status = e.meaning ? 'enriched' : e.reading ? 'reading-only' : 'manual';
    } catch {
      // API unreachable / not hosted yet: keep whatever we have, go manual.
      status = reading ? 'reading-only' : 'manual';
    }
    setDraft({ text: textValue, reading, meaning, example, status });
    setBusy(false);
  }

  function saveDraft() {
    if (!draft || !list || draft.status === 'enriching') return;
    addItem(list.id, {
      kind: guessKind(draft.text),
      text: draft.text,
      reading: draft.reading,
      meaning: draft.meaning,
      example: draft.example,
      source: STATUS_TO_SOURCE[draft.status]
    });
    setDraft(null);
    setCapture('');
  }

  function removeList() {
    if (!list) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteList(list.id);
    router.back();
  }

  return (
    <Screen
      reading={CATEGORY_META[list.category].label.toLowerCase()}
      kanji={list.name}
      accent={colors.matcha}
      back
      action={
        due > 0 ? (
          <Button
            label={`Review ${due}`}
            accent={colors.matcha}
            onClick={() => router.push(`/review/${list.id}`)}
          />
        ) : undefined
      }
    >
      {/* Quick capture: type it now, keep moving. */}
      {draft === null ? (
        <html.div style={styles.captureRow}>
          <html.input
            style={styles.captureInput}
            placeholder="Word you just heard… 例: 納期"
            value={capture}
            onChange={(e: { target: { value: string } }) => setCapture(e.target.value)}
            onKeyDown={(e: { key: string }) => {
              if (e.key === 'Enter') startDraft();
            }}
          />
          <Button
            label={busy ? '…' : 'Add'}
            accent={colors.matcha}
            onClick={startDraft}
            disabled={!capture.trim() || busy}
          />
        </html.div>
      ) : (
        <Card tint={colors.matchaSoft}>
          {/* Furigana preview: the reading rendered over the kanji, updating live. */}
          <html.div style={styles.draftRuby}>
            {fitFurigana(draft.text, draft.reading).map((part, i) => (
              <html.div key={`${part.text}-${i}`} style={styles.rubyPart}>
                <html.span style={styles.draftRubyReading}>{part.ruby ?? ' '}</html.span>
                <html.span style={styles.draftWord}>{part.text}</html.span>
              </html.div>
            ))}
          </html.div>
          <html.span style={styles.enrichedNote}>{STATUS_NOTE[draft.status]}</html.span>

          <Label color={colors.ink}>Reading (kana)</Label>
          <html.input
            style={styles.input}
            placeholder={draft.status === 'enriching' ? '…' : 'のうき (type romaji, it becomes kana)'}
            value={draft.reading}
            onChange={(e: { target: { value: string } }) =>
              setDraft({ ...draft, reading: toHiragana(e.target.value, { IMEMode: true }) })
            }
          />
          <Label color={colors.ink}>Meaning</Label>
          <html.input
            style={styles.input}
            placeholder={draft.status === 'enriching' ? '…' : 'deadline; delivery date'}
            value={draft.meaning}
            onChange={(e: { target: { value: string } }) => setDraft({ ...draft, meaning: e.target.value })}
          />
          <Label color={colors.ink}>Example (optional)</Label>
          <html.input
            style={styles.input}
            placeholder="a sentence using it"
            value={draft.example}
            onChange={(e: { target: { value: string } }) => setDraft({ ...draft, example: e.target.value })}
          />
          <html.div style={styles.draftActions}>
            <Button label="Cancel" kind="soft" tint={colors.paperLift} onClick={() => setDraft(null)} />
            <Button
              label={draft.status === 'enriching' ? 'Filling in…' : 'Save to list'}
              accent={colors.matcha}
              onClick={saveDraft}
              disabled={draft.status === 'enriching'}
            />
          </html.div>
        </Card>
      )}

      {list.items.length === 0 ? (
        <EmptyState
          kanji="聞"
          title="Nothing captured yet"
          hint="A coworker says a word you don't know. Type it above; reading and meaning fill themselves in."
        />
      ) : (
        <html.div style={styles.items}>
          {list.items.map((item) => (
            <Card key={item.id}>
              <html.div style={styles.itemRow}>
                <html.div style={styles.itemBody}>
                  <html.div style={styles.rubyRow}>
                    {fitFurigana(item.text, item.reading ?? '').map((part, i) => (
                      <html.div key={`${part.text}-${i}`} style={styles.rubyPart}>
                        <html.span style={styles.ruby}>{part.ruby ?? ' '}</html.span>
                        <html.span style={styles.itemText}>{part.text}</html.span>
                      </html.div>
                    ))}
                  </html.div>
                  {item.meaning ? <html.span style={styles.meaning}>{item.meaning}</html.span> : null}
                </html.div>
                <html.button style={styles.delete} onClick={() => deleteItem(list.id, item.id)} aria-label="Delete item">
                  ×
                </html.button>
              </html.div>
            </Card>
          ))}
        </html.div>
      )}

      <html.div style={styles.footer}>
        <html.button style={styles.deleteList} onClick={removeList}>
          {confirmDelete ? 'Tap again to delete this list and its items' : 'Delete this list'}
        </html.button>
      </html.div>
    </Screen>
  );
}

const styles = css.create({
  captureRow: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 10,
    alignItems: 'stretch'
  },
  captureInput: {
    fontFamily: text.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.paperShade,
    borderRadius: 12,
    borderStyle: 'none',
    borderWidth: 0,
    padding: 13,
    flexGrow: 1
  },
  input: {
    fontFamily: text.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.paperLift,
    borderRadius: 10,
    borderStyle: 'none',
    borderWidth: 0,
    padding: 12,
    marginBottom: 12
  },
  draftRuby: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end'
  },
  draftRubyReading: {
    fontFamily: text.body,
    fontSize: 12,
    lineHeight: 1,
    color: colors.inkSoft
  },
  draftWord: {
    fontFamily: text.bodyBold,
    fontSize: 24,
    lineHeight: 1.2,
    color: colors.ink
  },
  enrichedNote: {
    fontFamily: text.body,
    fontSize: 12,
    color: colors.inkSoft,
    marginBottom: 12
  },
  draftActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    columnGap: 8
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 10,
    marginTop: 20
  },
  itemRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemBody: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  rubyRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end'
  },
  rubyPart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  ruby: {
    fontFamily: text.body,
    fontSize: 10,
    lineHeight: 1,
    color: colors.inkSoft
  },
  itemText: {
    fontFamily: text.bodyMedium,
    fontSize: 20,
    lineHeight: 1.3,
    color: colors.ink
  },
  meaning: {
    fontFamily: text.body,
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: 3
  },
  delete: {
    fontFamily: text.body,
    fontSize: 20,
    color: colors.inkSoft,
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    paddingLeft: 12,
    paddingRight: 4,
    cursor: 'pointer'
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32
  },
  deleteList: {
    fontFamily: text.body,
    fontSize: 13,
    color: colors.hanko,
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    cursor: 'pointer',
    opacity: 0.8
  }
});

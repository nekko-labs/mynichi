import { useCallback, useEffect, useRef, useState } from 'react';
import { toHiragana } from 'wanakana';
import { hasKanji, katakanaToHiragana, type ItemKind, type ItemSource } from '@mynichi/core';

import { useToast } from '../components/toast';
import { loadDict, lookupExact, searchDict, type DictWord } from '../dict';
import { enrichTerm } from '../lib/api';
import { LIMITS, optional, validateCapture, type Validation } from '../lib/validation';
import { addItem } from '../store/lists';

// The capture brain behind the list detail screen: search-as-you-type against
// the offline dictionary, the draft a captured word becomes, and what happens
// when the network is not there. The screen renders it; it owns no layout.

/** How the draft's reading + meaning got filled, which drives the note under
 * the captured word and how the saved item's source is recorded. */
export type DraftStatus = 'enriching' | 'dictionary' | 'enriched' | 'reading-only' | 'manual';

export type Draft = {
  text: string;
  reading: string;
  meaning: string;
  example: string;
  status: DraftStatus;
};

export const STATUS_NOTE: Record<DraftStatus, string> = {
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

const SEARCH_DEBOUNCE_MS = 140;
const FLASH_MS = 1800;

export function guessKind(textRaw: string): ItemKind {
  const t = textRaw.trim();
  if ([...t].length === 1 && hasKanji(t)) return 'kanji';
  if ([...t].length > 6 || /[はがをにでへとや、。]/.test(t)) return 'phrase';
  return 'word';
}

export type DraftErrors = {
  reading: Validation;
  meaning: Validation;
  example: Validation;
};

export type CaptureState = {
  capture: string;
  captureError: Validation;
  suggestions: DictWord[];
  busy: boolean;
  draft: Draft | null;
  draftErrors: DraftErrors;
  /** Surface form of the word most recently added straight from a suggestion. */
  flash: string | null;
  onCapture: (value: string) => void;
  addSuggestion: (word: DictWord) => void;
  startDraft: () => void;
  updateDraft: (patch: Partial<Draft>) => void;
  cancelDraft: () => void;
  saveDraft: () => void;
};

export function useCapture(listId: string | undefined): CaptureState {
  const toast = useToast();
  const [capture, setCapture] = useState('');
  const [captureError, setCaptureError] = useState<Validation>(null);
  const [suggestions, setSuggestions] = useState<DictWord[]>([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The dictionary is bundled but loaded lazily; warn about it once per screen
  // rather than on every keystroke.
  const warnedRef = useRef(false);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (flashRef.current) clearTimeout(flashRef.current);
    },
    []
  );

  // Search-as-you-type: partial English, romaji, kana, or kanji pulls up
  // dictionary candidates so most words are one tap away.
  const onCapture = useCallback(
    (value: string) => {
      setCapture(value);
      setCaptureError(null);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const trimmed = value.trim();
      if (!trimmed) {
        setSuggestions([]);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        try {
          const dict = await loadDict();
          setSuggestions(searchDict(dict, trimmed, 6));
        } catch {
          setSuggestions([]);
          if (!warnedRef.current) {
            warnedRef.current = true;
            toast.show('The offline dictionary is not loaded, so there are no suggestions yet.', {
              tone: 'error'
            });
          }
        }
      }, SEARCH_DEBOUNCE_MS);
    },
    [toast]
  );

  function addSuggestion(word: DictWord) {
    if (!listId) return;
    const surface = word.k ?? word.r;
    addItem(listId, {
      kind: word.k && [...word.k].length === 1 ? 'kanji' : 'word',
      text: surface,
      reading: word.k ? katakanaToHiragana(word.r) : undefined,
      meaning: word.g.slice(0, 3).join('; '),
      source: 'dictionary'
    });
    setFlash(surface);
    if (flashRef.current) clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => setFlash(null), FLASH_MS);
  }

  async function startDraft() {
    const textValue = capture.trim();
    const problem = validateCapture(capture);
    if (problem) {
      setCaptureError(problem);
      return;
    }
    if (busy) return;
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
      const enriched = await enrichTerm(textValue);
      reading = reading || enriched.reading;
      meaning = meaning || enriched.meaning;
      example = enriched.example?.jp ?? '';
      status = enriched.meaning ? 'enriched' : enriched.reading ? 'reading-only' : 'manual';
    } catch {
      // API unreachable / not hosted yet: keep whatever we have, go manual.
      status = reading ? 'reading-only' : 'manual';
      toast.show('Could not reach the server to fill this word in. Add what you know and save.', {
        tone: 'error'
      });
    }
    setDraft({ text: textValue, reading, meaning, example, status });
    setBusy(false);
  }

  function updateDraft(patch: Partial<Draft>) {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      // Romaji becomes kana as it is typed, the way the reading field is meant
      // to be used.
      if (patch.reading != null) next.reading = toHiragana(patch.reading, { IMEMode: true });
      return next;
    });
  }

  function cancelDraft() {
    setDraft(null);
  }

  const draftErrors: DraftErrors = {
    reading: draft ? optional(draft.reading, 'the reading', LIMITS.reading) : null,
    meaning: draft ? optional(draft.meaning, 'the meaning', LIMITS.meaning) : null,
    example: draft ? optional(draft.example, 'the example', LIMITS.example) : null
  };

  function saveDraft() {
    if (!draft || !listId || draft.status === 'enriching') return;
    if (draftErrors.reading || draftErrors.meaning || draftErrors.example) return;
    addItem(listId, {
      kind: guessKind(draft.text),
      text: draft.text,
      reading: draft.reading,
      meaning: draft.meaning,
      example: draft.example,
      source: STATUS_TO_SOURCE[draft.status]
    });
    setDraft(null);
    setCapture('');
    setSuggestions([]);
  }

  return {
    capture,
    captureError,
    suggestions,
    busy,
    draft,
    draftErrors,
    flash,
    onCapture,
    addSuggestion,
    startDraft,
    updateDraft,
    cancelDraft,
    saveDraft
  };
}

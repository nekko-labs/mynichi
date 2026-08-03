import { useState } from 'react';
import type { PracticeMessage, PracticeReply } from '@mynichi/core';

import { useToast } from '../components/toast';
import { postJson } from '../lib/api';
import { LIMITS, optional, validateScenario, type Validation } from '../lib/validation';
import { useListsDoc } from '../store/lists';

// The practice conversation, as state: which model the user chose, the
// scenario, the turns, and what to say when the partner cannot be reached.
// The screen below it is only chrome.

export type AiMode = 'cloud' | 'local';

export type Turn = PracticeMessage & { en?: string; hint?: string };

export type Session = { scenario: string; words: string[] };

export const SCENARIOS = [
  { label: 'Call the dentist', prompt: 'Reschedule a dentist appointment by phone' },
  { label: 'Ward office', prompt: 'Ask at the ward office about moving-in paperwork' },
  { label: 'Izakaya order', prompt: 'Order food and drinks at an izakaya' },
  { label: 'Apartment viewing', prompt: 'View an apartment and ask about the contract' },
  { label: 'Konbini pickup', prompt: 'Pick up a package at a convenience store' },
  { label: 'Work small talk', prompt: 'Monday morning small talk with a coworker' }
] as const;

const NOT_CONFIGURED =
  'The cloud practice partner is not connected to this build yet. It is coming soon; the on-device model arrives with the iOS app.';
const UNREACHABLE = 'Could not reach the practice partner. Check your connection and try again.';

/** Words drilled into a session come from one list, most recent first. */
const MAX_INJECTED_WORDS = 8;

export type PracticeState = {
  mode: AiMode | null;
  setMode: (mode: AiMode | null) => void;
  scenario: string;
  setScenario: (value: string) => void;
  scenarioError: Validation;
  wordsFrom: string | null;
  toggleWordsFrom: (listId: string) => void;
  session: Session | null;
  turns: Turn[];
  input: string;
  setInput: (value: string) => void;
  inputError: Validation;
  busy: boolean;
  /** The last failure, kept on screen as well as announced. */
  error: string | null;
  start: (prompt: string) => void;
  send: () => void;
  end: () => void;
};

export function usePractice(): PracticeState {
  const toast = useToast();
  const doc = useListsDoc();
  const [mode, setMode] = useState<AiMode | null>(null);
  const [scenario, setScenarioValue] = useState('');
  const [scenarioError, setScenarioError] = useState<Validation>(null);
  const [wordsFrom, setWordsFrom] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const injectedWords = wordsFrom
    ? (doc.lists.find((l) => l.id === wordsFrom)?.items ?? [])
        .slice(0, MAX_INJECTED_WORDS)
        .map((i) => i.text)
    : [];

  async function requestTurn(sess: Session, history: Turn[]) {
    setBusy(true);
    setError(null);
    try {
      const reply = await postJson<PracticeReply>('/practice', {
        scenario: sess.scenario,
        words: sess.words,
        messages: history.map(({ role, text: t }) => ({ role, text: t }))
      });
      setTurns([...history, { role: 'assistant', text: reply.jp, en: reply.en, hint: reply.hint }]);
    } catch (err) {
      const message =
        err instanceof Error && err.message === 'api-not-configured' ? NOT_CONFIGURED : UNREACHABLE;
      setError(message);
      toast.show(message, { tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  function setScenario(value: string) {
    setScenarioValue(value);
    if (scenarioError) setScenarioError(validateScenario(value));
  }

  function start(prompt: string) {
    if (busy) return;
    const problem = validateScenario(prompt);
    if (problem) {
      setScenarioError(problem);
      return;
    }
    const sess: Session = { scenario: prompt.trim(), words: injectedWords };
    setScenarioError(null);
    setSession(sess);
    setTurns([]);
    requestTurn(sess, []);
  }

  function send() {
    const trimmed = input.trim();
    if (!trimmed || !session || busy) return;
    if (optional(input, 'a reply', LIMITS.reply)) return;
    const history: Turn[] = [...turns, { role: 'user', text: trimmed }];
    setTurns(history);
    setInput('');
    requestTurn(session, history);
  }

  function end() {
    setSession(null);
    setTurns([]);
    setError(null);
  }

  return {
    mode,
    setMode,
    scenario,
    setScenario,
    scenarioError,
    wordsFrom,
    toggleWordsFrom: (listId: string) => setWordsFrom((prev) => (prev === listId ? null : listId)),
    session,
    turns,
    input,
    setInput,
    inputError: optional(input, 'a reply', LIMITS.reply),
    busy,
    error,
    start,
    send,
    end
  };
}

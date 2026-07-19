import { useState } from 'react';
import { css, html } from 'react-strict-dom';
import type { PracticeMessage, PracticeReply } from '@mynichi/core';

import { Screen } from '@/components/screen';
import { Button, Card, Chip, Label } from '@/components/ui';
import { postJson } from '@/lib/api';
import { useListsDoc } from '@/store/lists';
import { colors, text } from '../../theme/tokens.css';

type AiMode = 'cloud' | 'local';

const SCENARIOS = [
  { label: 'Call the dentist', prompt: 'Reschedule a dentist appointment by phone' },
  { label: 'Ward office', prompt: 'Ask at the ward office about moving-in paperwork' },
  { label: 'Izakaya order', prompt: 'Order food and drinks at an izakaya' },
  { label: 'Apartment viewing', prompt: 'View an apartment and ask about the contract' },
  { label: 'Konbini pickup', prompt: 'Pick up a package at a convenience store' },
  { label: 'Work small talk', prompt: 'Monday morning small talk with a coworker' }
];

type Turn = PracticeMessage & { en?: string; hint?: string };

export default function PracticeScreen() {
  const doc = useListsDoc();
  const [mode, setMode] = useState<AiMode | null>(null);
  const [scenario, setScenario] = useState('');
  const [wordsFrom, setWordsFrom] = useState<string | null>(null);
  const [session, setSession] = useState<{ scenario: string; words: string[] } | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const injectedWords = wordsFrom
    ? (doc.lists.find((l) => l.id === wordsFrom)?.items ?? []).slice(0, 8).map((i) => i.text)
    : [];

  async function requestTurn(sess: { scenario: string; words: string[] }, history: Turn[]) {
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
      setError(
        err instanceof Error && err.message === 'api-not-configured'
          ? 'The cloud practice partner is not connected to this build yet. It is coming soon; the on-device model arrives with the iOS app.'
          : 'Could not reach the practice partner. Check your connection and try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  function start(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || busy) return;
    const sess = { scenario: trimmed, words: injectedWords };
    setSession(sess);
    setTurns([]);
    requestTurn(sess, []);
  }

  function send() {
    const trimmed = input.trim();
    if (!trimmed || !session || busy) return;
    const history: Turn[] = [...turns, { role: 'user', text: trimmed }];
    setTurns(history);
    setInput('');
    requestTurn(session, history);
  }

  // Stage 1: privacy explainer, the heart of the promise.
  if (mode === null) {
    return (
      <Screen reading="かいわ" kanji="会話" title="Practice" accent={colors.sakura}>
        <html.p style={styles.hook}>Too embarrassed to practice in front of another person?</html.p>
        <html.p style={styles.hookSub}>
          This is the judgment-free room. Before you start, choose where your conversation lives.
        </html.p>

        <Card tint={colors.sakuraSoft}>
          <html.span style={styles.choiceTitle}>Our cloud model</html.span>
          <html.p style={styles.choiceBody}>
            The smartest partner. Your words are never used for training, your voice is never
            stored, and transcripts are not kept on our servers.
          </html.p>
          <html.div style={styles.choiceAction}>
            <Button label="Practice with cloud" accent={colors.sakura} onClick={() => setMode('cloud')} />
          </html.div>
        </Card>

        <html.div style={styles.spacer} />

        <Card>
          <html.span style={styles.choiceTitle}>Fully on-device</html.span>
          <html.p style={styles.choiceBody}>
            Nothing ever leaves your phone. Requires Apple Intelligence (iPhone 15 Pro or newer,
            iOS 18+). Arrives with the iOS app.
          </html.p>
          <html.div style={styles.choiceAction}>
            <Button label="Coming with the iOS app" kind="soft" tint={colors.paperShade} onClick={() => {}} disabled />
          </html.div>
        </Card>
      </Screen>
    );
  }

  // Stage 2: pick or type a scenario.
  if (!session) {
    return (
      <Screen reading="かいわ" kanji="会話" title="Practice" accent={colors.sakura}>
        <Label>Tomorrow&apos;s conversation, practiced today</Label>
        <html.div style={styles.chipWrap}>
          {SCENARIOS.map((s) => (
            <Chip key={s.label} label={s.label} tint={colors.sakuraSoft} onClick={() => start(s.prompt)} />
          ))}
        </html.div>

        <html.div style={styles.freeRow}>
          <html.input
            style={styles.freeInput}
            placeholder="Or describe your own scenario…"
            value={scenario}
            onChange={(e: { target: { value: string } }) => setScenario(e.target.value)}
            onKeyDown={(e: { key: string }) => {
              if (e.key === 'Enter') start(scenario);
            }}
          />
          <Button label="Start" accent={colors.sakura} onClick={() => start(scenario)} disabled={!scenario.trim() || busy} />
        </html.div>

        {doc.lists.some((l) => l.items.length > 0) ? (
          <html.div style={styles.listsBlock}>
            <Label>Drill words from a list (optional)</Label>
            <html.div style={styles.chipWrap}>
              {doc.lists
                .filter((l) => l.items.length > 0)
                .map((l) => (
                  <Chip
                    key={l.id}
                    label={`${l.name} (${Math.min(l.items.length, 8)})`}
                    selected={wordsFrom === l.id}
                    accent={colors.sakura}
                    onClick={() => setWordsFrom(wordsFrom === l.id ? null : l.id)}
                  />
                ))}
            </html.div>
          </html.div>
        ) : null}

        {error ? <html.p style={styles.error}>{error}</html.p> : null}
        {busy ? <html.p style={styles.busyNote}>Setting the scene…</html.p> : null}

        <html.button style={styles.switchMode} onClick={() => setMode(null)}>
          Using the {mode === 'cloud' ? 'cloud' : 'on-device'} model · change
        </html.button>
      </Screen>
    );
  }

  // Stage 3: the conversation.
  return (
    <Screen reading="かいわ" kanji="会話" title="Practice" accent={colors.sakura}>
      <html.div style={styles.scenarioBar}>
        <html.span style={styles.scenarioText}>{session.scenario}</html.span>
        <html.button
          style={styles.endButton}
          onClick={() => {
            setSession(null);
            setTurns([]);
            setError(null);
          }}
        >
          End
        </html.button>
      </html.div>

      <html.div style={styles.chat}>
        {turns.map((t, i) => (
          <html.div key={i} style={[styles.turnRow, t.role === 'user' && styles.turnRowUser]}>
            {t.role === 'assistant' ? <html.span style={styles.avatar}>話</html.span> : null}
            <html.div style={[styles.bubble, t.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
              <html.span style={[styles.jp, t.role === 'user' && styles.jpUser]}>{t.text}</html.span>
              {t.en ? <html.span style={styles.en}>{t.en}</html.span> : null}
            </html.div>
          </html.div>
        ))}
        {busy ? (
          <html.div style={styles.turnRow}>
            <html.span style={styles.avatar}>話</html.span>
            <html.div style={[styles.bubble, styles.bubbleAi]}>
              <html.span style={styles.thinking}>…</html.span>
            </html.div>
          </html.div>
        ) : null}
        {error ? <html.p style={styles.error}>{error}</html.p> : null}

        {!busy && turns.length > 0 && turns[turns.length - 1].hint ? (
          <html.div style={styles.hintRow}>
            <Chip
              label={`Try: ${turns[turns.length - 1].hint}`}
              tint={colors.sakuraSoft}
              onClick={() => setInput(turns[turns.length - 1].hint ?? '')}
            />
          </html.div>
        ) : null}
      </html.div>

      <html.div style={styles.inputRow}>
        <html.input
          style={styles.chatInput}
          placeholder="Reply in Japanese (romaji is fine too)…"
          value={input}
          onChange={(e: { target: { value: string } }) => setInput(e.target.value)}
          onKeyDown={(e: { key: string }) => {
            if (e.key === 'Enter') send();
          }}
        />
        <Button label="Send" accent={colors.sakura} onClick={send} disabled={!input.trim() || busy} />
      </html.div>
    </Screen>
  );
}

const styles = css.create({
  hook: {
    fontFamily: text.brandBold,
    fontSize: 20,
    lineHeight: 1.4,
    color: colors.ink,
    margin: 0,
    marginBottom: 6
  },
  hookSub: {
    fontFamily: text.body,
    fontSize: 15,
    lineHeight: 1.6,
    color: colors.inkSoft,
    margin: 0,
    marginBottom: 20,
    maxWidth: 440
  },
  choiceTitle: {
    fontFamily: text.bodyBold,
    fontSize: 17,
    color: colors.ink,
    marginBottom: 4
  },
  choiceBody: {
    fontFamily: text.body,
    fontSize: 14,
    lineHeight: 1.6,
    color: colors.inkSoft,
    margin: 0,
    marginBottom: 14
  },
  choiceAction: {
    display: 'flex',
    flexDirection: 'row'
  },
  spacer: { height: 12 },
  chipWrap: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 20
  },
  freeRow: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 10,
    marginBottom: 20
  },
  freeInput: {
    fontFamily: text.body,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.paperShade,
    borderRadius: 12,
    borderStyle: 'none',
    borderWidth: 0,
    padding: 13,
    flexGrow: 1
  },
  listsBlock: {
    display: 'flex',
    flexDirection: 'column'
  },
  switchMode: {
    fontFamily: text.body,
    fontSize: 13,
    color: colors.inkSoft,
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    marginTop: 24,
    cursor: 'pointer',
    alignSelf: 'flex-start',
    padding: 0
  },
  busyNote: {
    fontFamily: text.body,
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: 8
  },
  scenarioBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.sakuraSoft,
    borderRadius: 12,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 14,
    paddingRight: 8,
    marginBottom: 16
  },
  scenarioText: {
    fontFamily: text.bodyMedium,
    fontSize: 13,
    color: colors.ink,
    flexShrink: 1
  },
  endButton: {
    fontFamily: text.bodyBold,
    fontSize: 13,
    color: colors.hanko,
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    cursor: 'pointer',
    paddingLeft: 12,
    paddingRight: 8
  },
  chat: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 12,
    flexGrow: 1,
    marginBottom: 16
  },
  turnRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    columnGap: 8
  },
  turnRowUser: {
    justifyContent: 'flex-end'
  },
  avatar: {
    fontFamily: text.brandBold,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: colors.sakura,
    borderRadius: 999,
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  bubble: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 14,
    paddingRight: 14,
    maxWidth: '82%'
  },
  bubbleAi: {
    backgroundColor: colors.paperLift
  },
  bubbleUser: {
    backgroundColor: colors.indigo
  },
  jp: {
    fontFamily: text.bodyMedium,
    fontSize: 16,
    lineHeight: 1.5,
    color: colors.ink
  },
  jpUser: {
    color: '#FFFFFF'
  },
  en: {
    fontFamily: text.body,
    fontSize: 12,
    lineHeight: 1.5,
    color: colors.inkSoft,
    marginTop: 4
  },
  thinking: {
    fontFamily: text.bodyBold,
    fontSize: 18,
    color: colors.inkSoft
  },
  hintRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  inputRow: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 10
  },
  chatInput: {
    fontFamily: text.body,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.paperShade,
    borderRadius: 12,
    borderStyle: 'none',
    borderWidth: 0,
    padding: 13,
    flexGrow: 1
  },
  error: {
    fontFamily: text.body,
    fontSize: 14,
    lineHeight: 1.6,
    color: colors.hanko,
    marginTop: 8,
    maxWidth: 420
  }
});

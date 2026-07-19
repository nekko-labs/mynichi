import { useState } from 'react';
import { css, html } from 'react-strict-dom';
import type { TranslateResponse } from '@mynichi/core';

import { RubyText } from '@/components/ruby-text';
import { Screen } from '@/components/screen';
import { Button, Chip, Label } from '@/components/ui';
import { colors, text } from '../../theme/tokens.css';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? 'http://localhost:4300' : undefined);

const SAMPLES = [
  { label: 'Work chat', text: '納期ちょっと巻きでお願いします' },
  { label: 'A letter', text: '下記の納付期限までにお支払いください' },
  { label: 'Door sign', text: '本日は貸切営業となっております' }
];

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'result'; data: TranslateResponse };

export default function TranslateScreen() {
  const [input, setInput] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function translate(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || state.kind === 'loading') return;
    if (!API_URL) {
      setState({
        kind: 'error',
        message: 'The translate engine is not connected to this build yet. It is coming soon.'
      });
      return;
    }
    setState({ kind: 'loading' });
    try {
      const res = await fetch(`${API_URL}/translate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: trimmed })
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      setState({ kind: 'result', data: (await res.json()) as TranslateResponse });
    } catch {
      setState({
        kind: 'error',
        message: 'Could not reach the translate engine. Check your connection and try again.'
      });
    }
  }

  return (
    <Screen reading="ほんやく" kanji="翻訳" title="Translate" accent={colors.indigo}>
      <html.textarea
        style={styles.input}
        placeholder="Paste or type Japanese... 例: 納付期限までにお支払いください"
        value={input}
        rows={3}
        onChange={(e: { target: { value: string } }) => setInput(e.target.value)}
      />
      <html.div style={styles.actionRow}>
        <Button
          label={state.kind === 'loading' ? 'Translating…' : 'Translate'}
          accent={colors.indigo}
          onClick={() => translate(input)}
          disabled={state.kind === 'loading' || input.trim().length === 0}
        />
      </html.div>

      {state.kind === 'idle' ? (
        <html.div style={styles.samples}>
          <Label>Try one from real life</Label>
          <html.div style={styles.sampleRow}>
            {SAMPLES.map((s) => (
              <Chip
                key={s.label}
                label={s.label}
                tint={colors.indigoSoft}
                onClick={() => {
                  setInput(s.text);
                  translate(s.text);
                }}
              />
            ))}
          </html.div>
          <html.p style={styles.hint}>
            The scary letter, the overheard phrase, the sign you walked past. Paste it here and
            see the kanji, furigana, and what it actually means.
          </html.p>
        </html.div>
      ) : null}

      {state.kind === 'loading' ? (
        <html.p style={styles.hint}>Reading it the way a local would…</html.p>
      ) : null}

      {state.kind === 'error' ? <html.p style={styles.error}>{state.message}</html.p> : null}

      {state.kind === 'result' ? (
        <html.div style={styles.result}>
          <RubyText tokens={state.data.tokens} />
          <html.p style={styles.romaji}>{state.data.romaji}</html.p>

          <Label color={colors.indigo}>Literal</Label>
          <html.p style={styles.body}>{state.data.literal}</html.p>

          <Label color={colors.indigo}>What it really means</Label>
          <html.p style={styles.body}>{state.data.practical}</html.p>
        </html.div>
      ) : null}
    </Screen>
  );
}

const styles = css.create({
  input: {
    fontFamily: text.body,
    fontSize: 17,
    lineHeight: 1.6,
    color: colors.ink,
    backgroundColor: colors.paperShade,
    borderRadius: 14,
    borderStyle: 'none',
    borderWidth: 0,
    padding: 16,
    minHeight: 96,
    marginBottom: 12
  },
  actionRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  samples: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 24
  },
  sampleRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  hint: {
    fontFamily: text.body,
    fontSize: 14,
    lineHeight: 1.6,
    color: colors.inkSoft,
    marginTop: 16,
    maxWidth: 420
  },
  error: {
    fontFamily: text.body,
    fontSize: 14,
    lineHeight: 1.6,
    color: colors.hanko,
    marginTop: 16,
    maxWidth: 420
  },
  result: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 24
  },
  romaji: {
    fontFamily: text.body,
    fontSize: 13,
    color: colors.inkSoft,
    margin: 0,
    marginTop: 8,
    marginBottom: 16
  },
  body: {
    fontFamily: text.body,
    fontSize: 16,
    lineHeight: 1.6,
    color: colors.ink,
    margin: 0,
    marginBottom: 14,
    maxWidth: 480
  }
});

import { useState } from 'react';
import { css, html } from 'react-strict-dom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TranslateResponse } from '@mynichi/core';

import { RubyText } from '@/components/ruby-text';
import { colors, text } from '../../theme/tokens.css';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? 'http://localhost:4300' : undefined);

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'result'; data: TranslateResponse };

export default function TranslateScreen() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function onTranslate() {
    const trimmed = input.trim();
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
    <html.div style={[styles.screen, styles.inset(insets.top + 24)]}>
      <html.div style={styles.header}>
        <html.span style={styles.reading}>ほんやく</html.span>
        <html.h1 style={styles.kanji}>翻訳</html.h1>
        <html.div style={styles.brush} />
      </html.div>

      <html.textarea
        style={styles.input}
        placeholder="Paste or type Japanese... 例: 納付期限までにお支払いください"
        value={input}
        rows={3}
        onChange={(e: { target: { value: string } }) => setInput(e.target.value)}
      />
      <html.button
        style={[styles.button, state.kind === 'loading' && styles.buttonBusy]}
        onClick={onTranslate}
        disabled={state.kind === 'loading'}
      >
        {state.kind === 'loading' ? 'Translating…' : 'Translate'}
      </html.button>

      {state.kind === 'loading' ? (
        <html.p style={styles.hint}>Reading it the way a local would…</html.p>
      ) : null}

      {state.kind === 'error' ? <html.p style={styles.error}>{state.message}</html.p> : null}

      {state.kind === 'result' ? (
        <html.div style={styles.result}>
          <RubyText tokens={state.data.tokens} />
          <html.p style={styles.romaji}>{state.data.romaji}</html.p>

          <html.span style={styles.label}>Literal</html.span>
          <html.p style={styles.body}>{state.data.literal}</html.p>

          <html.span style={styles.label}>What it really means</html.span>
          <html.p style={styles.body}>{state.data.practical}</html.p>
        </html.div>
      ) : null}

      {state.kind === 'idle' ? (
        <html.p style={styles.hint}>
          The scary letter, the overheard phrase, the sign you walked past. Paste it here and see
          the kanji, furigana, and what it actually means.
        </html.p>
      ) : null}
    </html.div>
  );
}

const styles = css.create({
  screen: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    backgroundColor: colors.paper,
    paddingLeft: 24,
    paddingRight: 24
  },
  inset: (top: number) => ({ paddingTop: top }),
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  reading: { fontFamily: text.brand, fontSize: 15, color: colors.inkSoft, marginBottom: 2 },
  kanji: { fontFamily: text.brandBold, fontSize: 44, lineHeight: 1.15, color: colors.ink, margin: 0 },
  brush: {
    height: 6,
    width: 64,
    borderRadius: 3,
    backgroundColor: colors.indigo,
    opacity: 0.9,
    transform: 'rotate(-1.2deg)',
    marginTop: 5
  },
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
  button: {
    fontFamily: text.bodyBold,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: colors.indigo,
    borderRadius: 999,
    borderStyle: 'none',
    borderWidth: 0,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 28,
    paddingRight: 28,
    alignSelf: 'flex-start'
  },
  buttonBusy: { opacity: 0.6 },
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
    marginTop: 24,
    paddingBottom: 40
  },
  romaji: {
    fontFamily: text.body,
    fontSize: 13,
    color: colors.inkSoft,
    margin: 0,
    marginTop: 8,
    marginBottom: 16
  },
  label: {
    fontFamily: text.brandBold,
    fontSize: 13,
    color: colors.indigo,
    marginBottom: 2
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

import { useState } from 'react';
import { css, html } from 'react-strict-dom';
import type { TranslateResponse } from '@mynichi/core';

import { Enter } from '@/components/motion';
import { RubyText } from '@/components/ruby-text';
import { Screen } from '@/components/screen';
import { useToast } from '@/components/toast';
import { Button, Chip, Label } from '@/components/ui';
import { translateText } from '@/lib/api';
import { useWideLayout } from '@/lib/layout';
import { leading, measure, radius, size } from '../../theme/contract.css';
import { colors, text } from '../../theme/tokens.css';

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
  const wide = useWideLayout();
  const toast = useToast();

  async function translate(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || state.kind === 'loading') return;
    setState({ kind: 'loading' });
    try {
      setState({ kind: 'result', data: await translateText(trimmed) });
    } catch {
      const message =
        'Could not reach the translate engine. Check your connection and try again.';
      setState({ kind: 'error', message });
      toast.show(message, {
        tone: 'error',
        action: { label: 'Retry', onClick: () => void translate(trimmed) }
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
        onKeyDown={(e: { key: string; metaKey?: boolean; ctrlKey?: boolean; preventDefault?: () => void }) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault?.();
            translate(input);
          }
        }}
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
        <Enter kind="fade">
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
        </Enter>
      ) : null}

      {state.kind === 'loading' ? (
        <html.p style={styles.hint} aria-live="polite">
          Reading it the way a local would…
        </html.p>
      ) : null}

      {state.kind === 'error' ? (
        <html.p style={styles.error} role="alert">
          {state.message}
        </html.p>
      ) : null}

      {state.kind === 'result' ? (
        <html.div style={[styles.result, wide && styles.resultWide]}>
          <html.div style={wide ? styles.resultColWide : styles.resultCol}>
            <RubyText tokens={state.data.tokens} />
            <html.p style={styles.romaji}>{state.data.romaji}</html.p>
          </html.div>
          <html.div style={wide ? styles.resultColWide : styles.resultCol}>
            <Label color={colors.indigo}>Literal</Label>
            <html.p style={styles.body}>{state.data.literal}</html.p>

            <Label color={colors.indigo}>What it really means</Label>
            <html.p style={styles.body}>{state.data.practical}</html.p>
          </html.div>
        </html.div>
      ) : null}
    </Screen>
  );
}

const styles = css.create({
  input: {
    fontFamily: text.body,
    fontSize: 17,
    lineHeight: leading.body,
    color: colors.ink,
    backgroundColor: colors.paperShade,
    borderRadius: radius.large,
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
    fontSize: size.bodySmall,
    lineHeight: leading.bodySmall,
    color: colors.inkSoft,
    marginTop: 16,
    maxWidth: measure.note
  },
  error: {
    fontFamily: text.body,
    fontSize: size.bodySmall,
    lineHeight: leading.bodySmall,
    color: colors.hanko,
    marginTop: 16,
    maxWidth: measure.note
  },
  result: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 24
  },
  resultWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 40
  },
  resultCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  resultColWide: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexBasis: 0
  },
  romaji: {
    fontFamily: text.body,
    fontSize: size.caption,
    lineHeight: leading.caption,
    color: colors.inkSoft,
    margin: 0,
    marginTop: 8,
    marginBottom: 16
  },
  body: {
    fontFamily: text.body,
    fontSize: size.body,
    lineHeight: leading.body,
    color: colors.ink,
    margin: 0,
    marginBottom: 14,
    maxWidth: measure.prose
  }
});

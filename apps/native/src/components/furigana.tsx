import { css, html } from 'react-strict-dom';
import { fitFurigana } from '@mynichi/core';

import { leading, ruby as rubyTokens } from '../theme/contract.css';
import { colors, text } from '../theme/tokens.css';

// One implementation of "kana above kanji" for the whole app (saved items,
// the capture draft, review cards). Ruby lives in its own row above the base
// glyph, so the base line carries extra leading: without it, a wrapped line of
// ruby collides with the line above (theme/contract ruby tokens).
//
// The word is announced as a word, not as a stream of fragments: the parts are
// hidden from assistive tech and the container carries the reading.

type Variant = 'body' | 'title' | 'display';

type Props = {
  /** The surface form, e.g. 納期. */
  word: string;
  /** Kana reading, if known. Empty renders the word with no ruby. */
  reading?: string;
  variant?: Variant;
  center?: boolean;
};

export function Furigana({ word, reading, variant = 'body', center }: Props) {
  const parts = fitFurigana(word, reading ?? '');
  const label = reading ? `${word} (${reading})` : word;

  return (
    <html.div style={[styles.row, center && styles.rowCenter]} aria-label={label}>
      {parts.map((part, i) => (
        <html.div key={`${part.text}-${i}`} style={styles.part} aria-hidden>
          <html.span style={RUBY[variant]}>{part.ruby ?? ' '}</html.span>
          <html.span style={BASE[variant]}>{part.text}</html.span>
        </html.div>
      ))}
    </html.div>
  );
}

const styles = css.create({
  row: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    rowGap: rubyTokens.rowGap
  },
  rowCenter: {
    justifyContent: 'center'
  },
  part: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  rubyBody: {
    fontFamily: text.body,
    fontSize: 10,
    lineHeight: leading.flat,
    marginBottom: rubyTokens.gap,
    color: colors.inkSoft
  },
  rubyTitle: {
    fontFamily: text.body,
    fontSize: 12,
    lineHeight: leading.flat,
    marginBottom: rubyTokens.gap,
    color: colors.inkSoft
  },
  rubyDisplay: {
    fontFamily: text.body,
    fontSize: 14,
    lineHeight: leading.flat,
    marginBottom: rubyTokens.gap,
    color: colors.inkSoft
  },
  baseBody: {
    fontFamily: text.bodyMedium,
    fontSize: 20,
    lineHeight: rubyTokens.baseLeading,
    color: colors.ink
  },
  baseTitle: {
    fontFamily: text.bodyBold,
    fontSize: 24,
    lineHeight: rubyTokens.baseLeading,
    color: colors.ink
  },
  baseDisplay: {
    fontFamily: text.bodyBold,
    fontSize: 34,
    lineHeight: rubyTokens.baseLeading,
    color: colors.ink
  }
});

const RUBY = {
  body: styles.rubyBody,
  title: styles.rubyTitle,
  display: styles.rubyDisplay
} as const;

const BASE = {
  body: styles.baseBody,
  title: styles.baseTitle,
  display: styles.baseDisplay
} as const;

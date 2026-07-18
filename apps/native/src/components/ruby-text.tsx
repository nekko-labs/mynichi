import { css, html } from 'react-strict-dom';
import type { Token } from '@mynichi/core';

import { colors, text } from '../theme/tokens.css';

// Renders segmented Japanese with furigana sitting above the kanji runs.
// Wraps at token boundaries so ruby never splits from its base.
export function RubyText(props: { tokens: Token[] }) {
  return (
    <html.div style={styles.line}>
      {props.tokens.map((token, i) => (
        <html.div key={`${token.surface}-${i}`} style={styles.token}>
          {token.parts.map((part, j) => (
            <html.div key={`${part.text}-${j}`} style={styles.part}>
              <html.span style={styles.ruby}>{part.ruby ?? ' '}</html.span>
              <html.span style={styles.base}>{part.text}</html.span>
            </html.div>
          ))}
        </html.div>
      ))}
    </html.div>
  );
}

const styles = css.create({
  line: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    rowGap: 10
  },
  token: {
    display: 'flex',
    flexDirection: 'row'
  },
  part: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  ruby: {
    fontFamily: text.body,
    fontSize: 11,
    lineHeight: 1,
    color: colors.inkSoft
  },
  base: {
    fontFamily: text.bodyMedium,
    fontSize: 24,
    lineHeight: 1.35,
    color: colors.ink
  }
});

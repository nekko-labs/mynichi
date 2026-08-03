import { css, html } from 'react-strict-dom';
import { katakanaToHiragana } from '@mynichi/core';

import { Enter } from '../motion';
import { Button, Field, ListRow } from '../ui';
import { leading, size } from '../../theme/contract.css';
import type { CaptureState } from '../../state/capture';
import { colors, text } from '../../theme/tokens.css';

// Quick capture: type it now, keep moving. Dictionary matches appear under the
// field as rows that add the word in one tap; pressing Add captures whatever
// was typed, exactly as written.

export function CaptureBar({ capture }: { capture: CaptureState }) {
  const typed = capture.capture.trim();

  return (
    <html.div style={styles.captureBlock}>
      <html.div style={styles.captureRow}>
        <Field
          label="Capture a word"
          value={capture.capture}
          onChange={capture.onCapture}
          onSubmit={capture.startDraft}
          placeholder="Search or type… 例: nouki / deadline / 納期"
          error={capture.captureError}
          surface="shade"
          grow
        />
        <Button
          label={capture.busy ? '…' : 'Add'}
          accent={colors.matcha}
          onClick={capture.startDraft}
          disabled={!typed || capture.busy}
          ariaLabel="Capture this word"
        />
      </html.div>

      {capture.flash ? (
        <Enter kind="fade" speed="fast">
          <html.span style={styles.flashNote} role="status">
            「{capture.flash}」 added to the list ✓
          </html.span>
        </Enter>
      ) : null}

      {typed && capture.suggestions.length > 0 ? (
        <html.div style={styles.suggestions}>
          {capture.suggestions.map((w) => (
            <ListRow
              key={w.s}
              title={
                <html.div style={styles.suggestionWordRow}>
                  <html.span style={styles.suggestionWord}>{w.k ?? w.r}</html.span>
                  {w.k ? (
                    <html.span style={styles.suggestionKana}>{katakanaToHiragana(w.r)}</html.span>
                  ) : null}
                </html.div>
              }
              meta={w.g.slice(0, 3).join('; ')}
              trailing="＋"
              accent={colors.matcha}
              onClick={() => capture.addSuggestion(w)}
              ariaLabel={`Add ${w.k ?? w.r} to this list`}
            />
          ))}
          <html.span style={styles.suggestionHint}>
            Tap a match to add it, or press Add to capture 「{typed}」 as written.
          </html.span>
        </html.div>
      ) : null}
    </html.div>
  );
}

const styles = css.create({
  captureBlock: {
    display: 'flex',
    flexDirection: 'column'
  },
  captureRow: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 10,
    alignItems: 'flex-end'
  },
  flashNote: {
    fontFamily: text.bodyMedium,
    fontSize: size.caption,
    lineHeight: leading.caption,
    color: colors.matcha,
    marginTop: 8
  },
  suggestions: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 6,
    marginTop: 10
  },
  suggestionWordRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    columnGap: 8
  },
  suggestionWord: {
    fontFamily: text.bodyBold,
    fontSize: size.heading,
    lineHeight: leading.heading,
    color: colors.ink
  },
  suggestionKana: {
    fontFamily: text.body,
    fontSize: size.caption,
    lineHeight: leading.caption,
    color: colors.inkSoft
  },
  suggestionHint: {
    fontFamily: text.body,
    fontSize: 12,
    lineHeight: leading.caption,
    color: colors.inkSoft,
    opacity: 0.8,
    marginTop: 2
  }
});

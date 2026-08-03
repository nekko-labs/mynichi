import { css, html } from 'react-strict-dom';

import { Furigana } from '../furigana';
import { Enter } from '../motion';
import { Button, Card, Field } from '../ui';
import { leading } from '../../theme/contract.css';
import { STATUS_NOTE, type CaptureState } from '../../state/capture';
import { colors, text } from '../../theme/tokens.css';

// The captured word before it is saved: a live furigana preview on top, then
// the three fields the user can correct. While the API fills it in the card is
// already on screen, so capture feels instant even on a slow connection.

export function DraftCard({ capture }: { capture: CaptureState }) {
  const draft = capture.draft;
  if (!draft) return null;
  const filling = draft.status === 'enriching';

  return (
    <Enter kind="rise" speed="fast">
      <Card tint={colors.matchaSoft}>
        <Furigana word={draft.text} reading={draft.reading} variant="title" />
        <html.span style={styles.note} aria-live="polite">
          {STATUS_NOTE[draft.status]}
        </html.span>

        <Field
          label="Reading (kana)"
          value={draft.reading}
          onChange={(reading) => capture.updateDraft({ reading })}
          placeholder={filling ? '…' : 'のうき (type romaji, it becomes kana)'}
          error={capture.draftErrors.reading}
          labelColor={colors.ink}
        />
        <Field
          label="Meaning"
          value={draft.meaning}
          onChange={(meaning) => capture.updateDraft({ meaning })}
          placeholder={filling ? '…' : 'deadline; delivery date'}
          error={capture.draftErrors.meaning}
          labelColor={colors.ink}
        />
        <Field
          label="Example (optional)"
          value={draft.example}
          onChange={(example) => capture.updateDraft({ example })}
          placeholder="a sentence using it"
          error={capture.draftErrors.example}
          labelColor={colors.ink}
        />

        <html.div style={styles.actions}>
          <Button
            label="Cancel"
            kind="soft"
            tint={colors.paperLift}
            onClick={capture.cancelDraft}
          />
          <Button
            label={filling ? 'Filling in…' : 'Save to list'}
            accent={colors.matcha}
            onClick={capture.saveDraft}
            disabled={filling}
          />
        </html.div>
      </Card>
    </Enter>
  );
}

const styles = css.create({
  note: {
    fontFamily: text.body,
    fontSize: 12,
    lineHeight: leading.caption,
    color: colors.inkSoft,
    marginTop: 4,
    marginBottom: 12
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    columnGap: 8
  }
});

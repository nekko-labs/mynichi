import { css, html } from 'react-strict-dom';

import { Enter } from '../motion';
import { Button, Chip, Field, Label } from '../ui';
import { leading, measure, size } from '../../theme/contract.css';
import { SCENARIOS, type PracticeState } from '../../state/practice';
import { useListsDoc } from '../../store/lists';
import { colors, text } from '../../theme/tokens.css';

// Stage 2 of practice: pick a scenario, or describe one, and optionally drill
// words from a list.

export function ScenarioSetup({ practice }: { practice: PracticeState }) {
  const doc = useListsDoc();
  const listsWithItems = doc.lists.filter((l) => l.items.length > 0);

  return (
    <>
      <Label>Tomorrow&apos;s conversation, practiced today</Label>
      <html.div style={styles.chipWrap}>
        {SCENARIOS.map((s) => (
          <Chip
            key={s.label}
            label={s.label}
            tint={colors.sakuraSoft}
            onClick={() => practice.start(s.prompt)}
          />
        ))}
      </html.div>

      <html.div style={styles.freeRow}>
        <Field
          label="Your own scenario"
          value={practice.scenario}
          onChange={practice.setScenario}
          onSubmit={() => practice.start(practice.scenario)}
          placeholder="Or describe your own scenario…"
          error={practice.scenarioError}
          surface="shade"
          grow
        />
        <Button
          label="Start"
          accent={colors.sakura}
          onClick={() => practice.start(practice.scenario)}
          disabled={!practice.scenario.trim() || practice.busy}
        />
      </html.div>

      {listsWithItems.length > 0 ? (
        <html.div style={styles.listsBlock}>
          <Label>Drill words from a list (optional)</Label>
          <html.div style={styles.chipWrap}>
            {listsWithItems.map((l) => (
              <Chip
                key={l.id}
                label={`${l.name} (${Math.min(l.items.length, 8)})`}
                selected={practice.wordsFrom === l.id}
                accent={colors.sakura}
                onClick={() => practice.toggleWordsFrom(l.id)}
              />
            ))}
          </html.div>
        </html.div>
      ) : null}

      {practice.error ? (
        <Enter kind="fade" speed="fast">
          <html.p style={styles.error} role="alert">
            {practice.error}
          </html.p>
        </Enter>
      ) : null}
      {practice.busy ? (
        <html.p style={styles.busyNote} aria-live="polite">
          Setting the scene…
        </html.p>
      ) : null}

      <html.button style={styles.switchMode} onClick={() => practice.setMode(null)}>
        Using the {practice.mode === 'cloud' ? 'cloud' : 'on-device'} model · change
      </html.button>
    </>
  );
}

const styles = css.create({
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
    alignItems: 'flex-end',
    columnGap: 10,
    marginBottom: 8
  },
  listsBlock: {
    display: 'flex',
    flexDirection: 'column'
  },
  switchMode: {
    fontFamily: text.body,
    fontSize: size.caption,
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
    fontSize: size.bodySmall,
    lineHeight: leading.bodySmall,
    color: colors.inkSoft,
    marginTop: 8
  },
  error: {
    fontFamily: text.body,
    fontSize: size.bodySmall,
    lineHeight: leading.bodySmall,
    color: colors.hanko,
    marginTop: 8,
    maxWidth: measure.note
  }
});

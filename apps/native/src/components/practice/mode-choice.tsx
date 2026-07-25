import { css, html } from 'react-strict-dom';

import { Enter } from '../motion';
import { Button, Card } from '../ui';
import { leading, measure, size } from '../../theme/contract.css';
import { colors, text } from '../../theme/tokens.css';
import type { AiMode } from '../../state/practice';

// Stage 1 of practice: the privacy explainer, the heart of the promise.
// Nothing starts until the user has chosen where the conversation lives.

export function ModeChoice({ onChoose }: { onChoose: (mode: AiMode) => void }) {
  return (
    <>
      <Enter kind="fade">
        <html.p style={styles.hook}>Too embarrassed to practice in front of another person?</html.p>
        <html.p style={styles.hookSub}>
          This is the judgment-free room. Before you start, choose where your conversation lives.
        </html.p>
      </Enter>

      <Enter index={1}>
        <Card tint={colors.sakuraSoft}>
          <html.span style={styles.choiceTitle}>Our cloud model</html.span>
          <html.p style={styles.choiceBody}>
            The smartest partner. Your words are never used for training, your voice is never
            stored, and transcripts are not kept on our servers.
          </html.p>
          <html.div style={styles.choiceAction}>
            <Button
              label="Practice with cloud"
              accent={colors.sakura}
              onClick={() => onChoose('cloud')}
            />
          </html.div>
        </Card>
      </Enter>

      <html.div style={styles.spacer} />

      <Enter index={2}>
        <Card>
          <html.span style={styles.choiceTitle}>Fully on-device</html.span>
          <html.p style={styles.choiceBody}>
            Nothing ever leaves your phone. Requires Apple Intelligence (iPhone 15 Pro or newer, iOS
            18+). Arrives with the iOS app.
          </html.p>
          <html.div style={styles.choiceAction}>
            <Button
              label="Coming with the iOS app"
              kind="soft"
              tint={colors.paperShade}
              onClick={() => {}}
              disabled
            />
          </html.div>
        </Card>
      </Enter>
    </>
  );
}

const styles = css.create({
  hook: {
    fontFamily: text.brandBold,
    fontSize: 20,
    lineHeight: leading.title,
    color: colors.ink,
    margin: 0,
    marginBottom: 6,
    maxWidth: measure.prose
  },
  hookSub: {
    fontFamily: text.body,
    fontSize: 15,
    lineHeight: leading.body,
    color: colors.inkSoft,
    margin: 0,
    marginBottom: 20,
    maxWidth: measure.prose
  },
  choiceTitle: {
    fontFamily: text.bodyBold,
    fontSize: 17,
    lineHeight: leading.heading,
    color: colors.ink,
    marginBottom: 4
  },
  choiceBody: {
    fontFamily: text.body,
    fontSize: size.bodySmall,
    lineHeight: leading.bodySmall,
    color: colors.inkSoft,
    margin: 0,
    marginBottom: 14,
    maxWidth: measure.prose
  },
  choiceAction: {
    display: 'flex',
    flexDirection: 'row'
  },
  spacer: { height: 12 }
});

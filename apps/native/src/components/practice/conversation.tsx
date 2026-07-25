import { css, html } from 'react-strict-dom';

import { Enter } from '../motion';
import { Button, Chip, Field } from '../ui';
import { leading, measure, radius, size } from '../../theme/contract.css';
import type { PracticeState } from '../../state/practice';
import { colors, text } from '../../theme/tokens.css';

// Stage 3 of practice: the conversation itself. The transcript is a live
// region so a reply is announced when it lands, and the whole thing is only
// ever as long as the session (nothing is persisted anywhere).

export function Conversation({ practice }: { practice: PracticeState }) {
  const { session, turns, busy } = practice;
  if (!session) return null;
  const lastHint = !busy && turns.length > 0 ? turns[turns.length - 1].hint : undefined;

  return (
    <>
      <html.div style={styles.scenarioBar}>
        <html.span style={styles.scenarioText}>{session.scenario}</html.span>
        <html.button style={styles.endButton} onClick={practice.end} aria-label="End this practice">
          End
        </html.button>
      </html.div>

      <html.div style={styles.chat} aria-live="polite">
        {turns.map((t, i) => (
          <Enter key={i} kind="rise" speed="fast">
            <html.div style={[styles.turnRow, t.role === 'user' && styles.turnRowUser]}>
              {t.role === 'assistant' ? (
                <html.span style={styles.avatar} aria-hidden>
                  話
                </html.span>
              ) : null}
              <html.div
                style={[styles.bubble, t.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}
              >
                <html.span style={[styles.jp, t.role === 'user' && styles.jpUser]}>
                  {t.text}
                </html.span>
                {t.en ? <html.span style={styles.en}>{t.en}</html.span> : null}
              </html.div>
            </html.div>
          </Enter>
        ))}
        {busy ? (
          <html.div style={styles.turnRow}>
            <html.span style={styles.avatar} aria-hidden>
              話
            </html.span>
            <html.div style={[styles.bubble, styles.bubbleAi]}>
              <html.span style={styles.thinking} aria-label="Thinking">
                …
              </html.span>
            </html.div>
          </html.div>
        ) : null}
        {practice.error ? (
          <html.p style={styles.error} role="alert">
            {practice.error}
          </html.p>
        ) : null}

        {lastHint ? (
          <html.div style={styles.hintRow}>
            <Chip
              label={`Try: ${lastHint}`}
              tint={colors.sakuraSoft}
              onClick={() => practice.setInput(lastHint)}
            />
          </html.div>
        ) : null}
      </html.div>

      <html.div style={styles.inputRow}>
        <Field
          label="Your reply"
          value={practice.input}
          onChange={practice.setInput}
          onSubmit={practice.send}
          placeholder="Reply in Japanese (romaji is fine too)…"
          error={practice.inputError}
          surface="shade"
          grow
        />
        <Button
          label="Send"
          accent={colors.sakura}
          onClick={practice.send}
          disabled={!practice.input.trim() || busy}
        />
      </html.div>
    </>
  );
}

const styles = css.create({
  scenarioBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.sakuraSoft,
    borderRadius: radius.medium,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 14,
    paddingRight: 8,
    marginBottom: 16
  },
  scenarioText: {
    fontFamily: text.bodyMedium,
    fontSize: size.caption,
    lineHeight: leading.caption,
    color: colors.ink,
    flexShrink: 1
  },
  endButton: {
    fontFamily: text.bodyBold,
    fontSize: size.caption,
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
    fontSize: size.body,
    lineHeight: leading.flat,
    color: colors.onAccent,
    backgroundColor: colors.sakura,
    borderRadius: radius.pill,
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
    borderRadius: radius.large,
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
    fontSize: size.body,
    lineHeight: leading.body,
    color: colors.ink
  },
  jpUser: {
    color: colors.onAccent
  },
  en: {
    fontFamily: text.body,
    fontSize: 12,
    lineHeight: leading.bodySmall,
    color: colors.inkSoft,
    marginTop: 4
  },
  thinking: {
    fontFamily: text.bodyBold,
    fontSize: size.heading,
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
    alignItems: 'flex-end',
    columnGap: 10
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

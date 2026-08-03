import { useId, type ReactNode } from 'react';
import { css, html } from 'react-strict-dom';

import { leading, measure, radius, size } from '../theme/contract.css';
import { colors, text } from '../theme/tokens.css';

// The shared primitives. Every repeated shape in the app lives here: buttons,
// chips, cards, labels, empty states, form fields, list rows and review cards.
// Screens compose these and never restyle them, so a change to the sketchbook
// language happens in one file.

type ButtonProps = {
  label: string;
  onClick: () => void;
  accent?: string;
  kind?: 'solid' | 'soft';
  tint?: string;
  disabled?: boolean;
  grow?: boolean;
  /** Announce something richer than the visible label (e.g. "Review 4 cards"). */
  ariaLabel?: string;
};

export function Button({
  label,
  onClick,
  accent,
  kind = 'solid',
  tint,
  disabled,
  grow,
  ariaLabel
}: ButtonProps) {
  return (
    <html.button
      style={[
        styles.button,
        kind === 'solid'
          ? styles.buttonSolid(accent ?? colors.ink)
          : styles.buttonSoft(tint ?? colors.paperShade, accent ?? colors.ink),
        disabled && styles.disabled,
        grow && styles.grow
      ]}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {label}
    </html.button>
  );
}

type ChipProps = {
  label: string;
  onClick?: () => void;
  selected?: boolean;
  accent?: string;
  tint?: string;
  ariaLabel?: string;
};

export function Chip({ label, onClick, selected, accent, tint, ariaLabel }: ChipProps) {
  return (
    <html.button
      style={[
        styles.chip,
        styles.chipTint(tint ?? colors.paperShade),
        selected && styles.chipSelected(accent ?? colors.ink)
      ]}
      onClick={onClick}
      disabled={!onClick}
      aria-label={ariaLabel}
      aria-pressed={onClick && selected != null ? selected : undefined}
    >
      {label}
    </html.button>
  );
}

export function Card(props: {
  children: ReactNode;
  tint?: string;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  if (props.onClick) {
    return (
      <html.button
        style={[styles.card, styles.cardTint(props.tint ?? colors.paperLift), styles.cardPress]}
        onClick={props.onClick}
        aria-label={props.ariaLabel}
      >
        {props.children}
      </html.button>
    );
  }
  return (
    <html.div style={[styles.card, styles.cardTint(props.tint ?? colors.paperLift)]}>
      {props.children}
    </html.div>
  );
}

export function Label(props: { children: ReactNode; color?: string; htmlFor?: string }) {
  if (props.htmlFor) {
    return (
      <html.label
        style={[styles.label, styles.labelColor(props.color ?? colors.inkSoft)]}
        for={props.htmlFor}
      >
        {props.children}
      </html.label>
    );
  }
  return (
    <html.span style={[styles.label, styles.labelColor(props.color ?? colors.inkSoft)]}>
      {props.children}
    </html.span>
  );
}

export function EmptyState(props: { kanji: string; title: string; hint: string }) {
  return (
    <html.div style={styles.empty}>
      <html.span style={styles.emptyKanji}>{props.kanji}</html.span>
      <html.p style={styles.emptyTitle}>{props.title}</html.p>
      <html.p style={styles.emptyHint}>{props.hint}</html.p>
    </html.div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Validation message. Present means the field is invalid. */
  error?: string | null;
  /** Quiet helper text under the field. */
  hint?: string;
  /** Enter key handler, for the one-line forms this app is made of. */
  onSubmit?: () => void;
  autoFocus?: boolean;
  /** Which paper the field sits on, so it stays legible on tinted cards. */
  surface?: 'shade' | 'lift';
  labelColor?: string;
  grow?: boolean;
};

/**
 * A labelled text field: the label is really associated with the input, the
 * error is announced, and invalid state is exposed to assistive tech rather
 * than only coloured. Every form in the app is built from this.
 */
export function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  onSubmit,
  autoFocus,
  surface = 'lift',
  labelColor,
  grow
}: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <html.div style={[styles.field, grow && styles.grow]}>
      <Label htmlFor={id} color={labelColor ?? colors.ink}>
        {label}
      </Label>
      <html.input
        id={id}
        style={[
          styles.input,
          surface === 'shade' ? styles.inputShade : styles.inputLift,
          error != null && styles.inputInvalid
        ]}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-invalid={error != null ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        onChange={(e: { target: { value: string } }) => onChange(e.target.value)}
        onKeyDown={(e: { key: string }) => {
          if (e.key === 'Enter' && onSubmit) onSubmit();
        }}
      />
      {message ? (
        <html.span
          id={messageId}
          style={[styles.message, error != null ? styles.messageError : styles.messageHint]}
          role={error != null ? 'alert' : undefined}
        >
          {message}
        </html.span>
      ) : null}
    </html.div>
  );
}

type ListRowProps = {
  /** Big Klee One glyph on the left (category kanji, ＋, and so on). */
  kanji?: string;
  title: ReactNode;
  meta?: ReactNode;
  /** Right-aligned status, e.g. "4 due". */
  trailing?: string;
  accent?: string;
  tint?: string;
  onClick?: () => void;
  ariaLabel?: string;
  /** Trailing control rendered outside the row's own press target. */
  action?: ReactNode;
};

/**
 * The one row shape: a list in Lists, a saved item, a dictionary hit. Rows
 * that do something are buttons, so they are reachable by keyboard and
 * announced as controls instead of as text.
 */
export function ListRow({
  kanji,
  title,
  meta,
  trailing,
  accent,
  tint,
  onClick,
  ariaLabel,
  action
}: ListRowProps) {
  const body = (
    <html.div style={styles.rowInner}>
      {kanji ? (
        <html.span style={[styles.rowKanji, styles.rowKanjiColor(accent ?? colors.ink)]}>
          {kanji}
        </html.span>
      ) : null}
      <html.div style={styles.rowBody}>
        {typeof title === 'string' ? <html.span style={styles.rowTitle}>{title}</html.span> : title}
        {typeof meta === 'string' ? <html.span style={styles.rowMeta}>{meta}</html.span> : meta}
      </html.div>
      {trailing ? (
        <html.span style={[styles.rowTrailing, styles.rowKanjiColor(accent ?? colors.inkSoft)]}>
          {trailing}
        </html.span>
      ) : null}
    </html.div>
  );

  if (action) {
    return (
      <html.div style={[styles.card, styles.cardTint(tint ?? colors.paperLift), styles.rowWithAction]}>
        {onClick ? (
          <html.button style={styles.rowPressArea} onClick={onClick} aria-label={ariaLabel}>
            {body}
          </html.button>
        ) : (
          <html.div style={styles.rowPressArea}>{body}</html.div>
        )}
        {action}
      </html.div>
    );
  }

  return (
    <Card tint={tint} onClick={onClick} ariaLabel={ariaLabel}>
      {body}
    </Card>
  );
}

/**
 * The review surface: one large, quiet paper card that holds a card face.
 * Sized so the front and the revealed back do not jump.
 */
export function ReviewCard(props: { children: ReactNode }) {
  return <html.div style={styles.reviewCard}>{props.children}</html.div>;
}

const styles = css.create({
  button: {
    fontFamily: text.bodyBold,
    fontSize: 15,
    borderRadius: radius.pill,
    borderStyle: 'none',
    borderWidth: 0,
    paddingTop: 11,
    paddingBottom: 11,
    paddingLeft: 22,
    paddingRight: 22,
    cursor: 'pointer',
    textAlign: 'center'
  },
  buttonSolid: (bg: string) => ({ backgroundColor: bg, color: colors.onAccent }),
  buttonSoft: (bg: string, fg: string) => ({ backgroundColor: bg, color: fg }),
  disabled: { opacity: 0.5, cursor: 'default' },
  grow: { flexGrow: 1 },
  chip: {
    fontFamily: text.bodyMedium,
    fontSize: size.bodySmall,
    color: colors.ink,
    borderRadius: radius.pill,
    borderStyle: 'none',
    borderWidth: 0,
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 14,
    paddingRight: 14,
    cursor: 'pointer'
  },
  chipTint: (bg: string) => ({ backgroundColor: bg }),
  chipSelected: (accent: string) => ({ backgroundColor: accent, color: colors.onAccent }),
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    borderRadius: radius.large,
    borderStyle: 'none',
    borderWidth: 0,
    padding: 16,
    textAlign: 'start'
  },
  cardTint: (bg: string) => ({ backgroundColor: bg }),
  cardPress: { cursor: 'pointer' },
  label: {
    fontFamily: text.brandBold,
    fontSize: size.caption,
    lineHeight: leading.caption,
    marginBottom: 4
  },
  labelColor: (c: string) => ({ color: c }),
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
    textAlign: 'center'
  },
  emptyKanji: {
    fontFamily: text.brand,
    fontSize: 44,
    lineHeight: leading.display,
    color: colors.inkSoft,
    opacity: 0.5,
    marginBottom: 10
  },
  emptyTitle: {
    fontFamily: text.bodyBold,
    fontSize: size.body,
    lineHeight: leading.heading,
    color: colors.ink,
    margin: 0,
    marginBottom: 4
  },
  emptyHint: {
    fontFamily: text.body,
    fontSize: size.bodySmall,
    lineHeight: leading.bodySmall,
    color: colors.inkSoft,
    margin: 0,
    maxWidth: measure.compact
  },
  field: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    fontFamily: text.body,
    fontSize: size.body,
    lineHeight: leading.body,
    color: colors.ink,
    borderRadius: radius.small,
    borderStyle: 'none',
    borderWidth: 0,
    padding: 12,
    marginBottom: 12
  },
  inputShade: { backgroundColor: colors.paperShade },
  inputLift: { backgroundColor: colors.paperLift },
  inputInvalid: {
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.hanko
  },
  message: {
    fontFamily: text.body,
    fontSize: size.caption,
    lineHeight: leading.caption,
    marginTop: -6,
    marginBottom: 10
  },
  messageError: { color: colors.hanko },
  messageHint: { color: colors.inkSoft },
  rowInner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 14
  },
  rowKanji: {
    fontFamily: text.brandBold,
    fontSize: 26,
    lineHeight: leading.flat
  },
  rowKanjiColor: (c: string) => ({ color: c }),
  rowBody: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1
  },
  rowTitle: {
    fontFamily: text.bodyBold,
    fontSize: size.body,
    lineHeight: leading.heading,
    color: colors.ink
  },
  rowMeta: {
    fontFamily: text.body,
    fontSize: size.caption,
    lineHeight: leading.caption,
    color: colors.inkSoft,
    marginTop: 1
  },
  rowTrailing: {
    fontFamily: text.bodyBold,
    fontSize: size.caption,
    lineHeight: leading.caption
  },
  rowWithAction: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowPressArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    padding: 0,
    textAlign: 'start',
    cursor: 'pointer'
  },
  reviewCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperLift,
    borderRadius: radius.xlarge,
    minHeight: 260,
    padding: 24
  }
});

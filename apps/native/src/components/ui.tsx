import type { ReactNode } from 'react';
import { css, html } from 'react-strict-dom';

import { colors, text } from '../theme/tokens.css';

// Small shared primitives so screens stay declarative and visually consistent.

type ButtonProps = {
  label: string;
  onClick: () => void;
  accent?: string;
  kind?: 'solid' | 'soft';
  tint?: string;
  disabled?: boolean;
  grow?: boolean;
};

export function Button({ label, onClick, accent, kind = 'solid', tint, disabled, grow }: ButtonProps) {
  return (
    <html.button
      style={[
        styles.button,
        kind === 'solid' ? styles.buttonSolid(accent ?? colors.ink) : styles.buttonSoft(tint ?? colors.paperShade, accent ?? colors.ink),
        disabled && styles.disabled,
        grow && styles.grow
      ]}
      onClick={onClick}
      disabled={disabled}
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
};

export function Chip({ label, onClick, selected, accent, tint }: ChipProps) {
  return (
    <html.button
      style={[
        styles.chip,
        styles.chipTint(tint ?? colors.paperShade),
        selected && styles.chipSelected(accent ?? colors.ink)
      ]}
      onClick={onClick}
      disabled={!onClick}
    >
      {label}
    </html.button>
  );
}

export function Card(props: { children: ReactNode; tint?: string; onClick?: () => void }) {
  if (props.onClick) {
    return (
      <html.button style={[styles.card, styles.cardTint(props.tint ?? colors.paperLift), styles.cardPress]} onClick={props.onClick}>
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

export function Label(props: { children: ReactNode; color?: string }) {
  return <html.span style={[styles.label, styles.labelColor(props.color ?? colors.inkSoft)]}>{props.children}</html.span>;
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

const styles = css.create({
  button: {
    fontFamily: text.bodyBold,
    fontSize: 15,
    borderRadius: 999,
    borderStyle: 'none',
    borderWidth: 0,
    paddingTop: 11,
    paddingBottom: 11,
    paddingLeft: 22,
    paddingRight: 22,
    cursor: 'pointer',
    textAlign: 'center'
  },
  buttonSolid: (bg: string) => ({ backgroundColor: bg, color: '#FFFFFF' }),
  buttonSoft: (bg: string, fg: string) => ({ backgroundColor: bg, color: fg }),
  disabled: { opacity: 0.5, cursor: 'default' },
  grow: { flexGrow: 1 },
  chip: {
    fontFamily: text.bodyMedium,
    fontSize: 14,
    color: colors.ink,
    borderRadius: 999,
    borderStyle: 'none',
    borderWidth: 0,
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 14,
    paddingRight: 14,
    cursor: 'pointer'
  },
  chipTint: (bg: string) => ({ backgroundColor: bg }),
  chipSelected: (accent: string) => ({ backgroundColor: accent, color: '#FFFFFF' }),
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    borderRadius: 16,
    borderStyle: 'none',
    borderWidth: 0,
    padding: 16,
    textAlign: 'start'
  },
  cardTint: (bg: string) => ({ backgroundColor: bg }),
  cardPress: { cursor: 'pointer' },
  label: {
    fontFamily: text.brandBold,
    fontSize: 13,
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
    color: colors.inkSoft,
    opacity: 0.5,
    marginBottom: 10
  },
  emptyTitle: {
    fontFamily: text.bodyBold,
    fontSize: 16,
    color: colors.ink,
    margin: 0,
    marginBottom: 4
  },
  emptyHint: {
    fontFamily: text.body,
    fontSize: 14,
    lineHeight: 1.6,
    color: colors.inkSoft,
    margin: 0,
    maxWidth: 300
  }
});

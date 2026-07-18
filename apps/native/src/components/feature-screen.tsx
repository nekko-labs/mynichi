import { css, html } from 'react-strict-dom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, text } from '../theme/tokens.css';

type Props = {
  accent: string;
  kanji: string;
  reading: string;
  title: string;
  tagline: string;
  chips: string[];
};

// Placeholder scaffold for a top-level feature tab: big ruby-annotated kanji,
// a hand-drawn accent underline, and "coming soon" chips. Replaced feature by
// feature as the real screens land.
export function FeatureScreen(props: Props) {
  const { accent, kanji, reading, title, tagline, chips } = props;
  const insets = useSafeAreaInsets();

  return (
    <html.div style={[styles.screen, styles.inset(insets.top + 40)]}>
      <html.div style={styles.header}>
        <html.span style={styles.reading}>{reading}</html.span>
        <html.h1 style={styles.kanji}>{kanji}</html.h1>
        <html.div style={styles.brush(accent)} />
      </html.div>

      <html.p style={styles.title}>{title}</html.p>
      <html.p style={styles.tagline}>{tagline}</html.p>

      <html.div style={styles.chipRow}>
        {chips.map((chip) => (
          <html.span key={chip} style={styles.chip}>
            {chip}
          </html.span>
        ))}
      </html.div>
    </html.div>
  );
}

const styles = css.create({
  screen: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    backgroundColor: colors.paper,
    paddingLeft: 24,
    paddingRight: 24
  },
  inset: (top: number) => ({
    paddingTop: top
  }),
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 24
  },
  reading: {
    fontFamily: text.brand,
    fontSize: 18,
    color: colors.inkSoft,
    marginBottom: 2
  },
  kanji: {
    fontFamily: text.brandBold,
    fontSize: 64,
    lineHeight: 1.15,
    color: colors.ink,
    margin: 0
  },
  brush: (accent: string) => ({
    height: 7,
    width: 84,
    borderRadius: 4,
    backgroundColor: accent,
    opacity: 0.9,
    transform: 'rotate(-1.2deg)',
    marginTop: 6
  }),
  title: {
    fontFamily: text.bodyBold,
    fontSize: 22,
    color: colors.ink,
    margin: 0,
    marginBottom: 4
  },
  tagline: {
    fontFamily: text.body,
    fontSize: 16,
    lineHeight: 1.5,
    color: colors.inkSoft,
    margin: 0,
    marginBottom: 24,
    maxWidth: 420
  },
  chipRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    fontFamily: text.bodyMedium,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.paperShade,
    borderRadius: 999,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 14,
    paddingRight: 14
  }
});

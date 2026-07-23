import type { ReactNode } from 'react';
import { css, html } from 'react-strict-dom';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Scroll } from './scroll';
import { RAIL_WIDTH, useWideLayout } from '../lib/layout';
import { colors, text } from '../theme/tokens.css';

type Props = {
  reading: string;
  kanji: string;
  title?: string;
  accent: string;
  /** Show a back control above the header (pushed screens). */
  back?: boolean;
  /** Right-aligned slot beside the header (e.g. a primary action). */
  action?: ReactNode;
  children: ReactNode;
};

// The shared scaffold for every tab: sketchbook header (kana reading over a
// big Klee One kanji with an accent brush stroke), then a scrollable body.
export function Screen({ reading, kanji, title, accent, back, action, children }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const wide = useWideLayout();

  return (
    <html.div style={[styles.screen, wide && styles.screenPadLeft(RAIL_WIDTH)]}>
      <Scroll>
        <html.div
          style={[styles.inner, wide && styles.innerWide, styles.inset(insets.top + (wide ? 36 : 20))]}
        >
          {back ? (
            <html.button
              style={styles.back}
              onClick={() => (router.canGoBack() ? router.back() : router.navigate('/'))}
            >
              ← back
            </html.button>
          ) : null}
          <html.div style={styles.headerRow}>
            <html.div style={styles.header}>
              <html.span style={styles.reading}>{reading}</html.span>
              <html.h1 style={styles.kanji}>
                {kanji}
                {title ? <html.span style={styles.titleEn}> {title}</html.span> : null}
              </html.h1>
              <html.div style={[styles.brush, styles.brushColor(accent)]} />
            </html.div>
            {action ? <html.div style={styles.action}>{action}</html.div> : null}
          </html.div>
          {children}
        </html.div>
      </Scroll>
    </html.div>
  );
}

const styles = css.create({
  screen: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 0,
    backgroundColor: colors.paper
  },
  screenPadLeft: (w: number) => ({ paddingLeft: w }),
  inner: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 640,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  innerWide: {
    maxWidth: 1000,
    paddingLeft: 40,
    paddingRight: 40
  },
  inset: (top: number) => ({ paddingTop: top }),
  back: {
    fontFamily: text.bodyMedium,
    fontSize: 14,
    color: colors.inkSoft,
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    padding: 0,
    marginBottom: 14,
    alignSelf: 'flex-start',
    cursor: 'pointer'
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  reading: {
    fontFamily: text.brand,
    fontSize: 14,
    color: colors.inkSoft,
    marginBottom: 1
  },
  kanji: {
    fontFamily: text.brandBold,
    fontSize: 38,
    lineHeight: 1.2,
    color: colors.ink,
    margin: 0
  },
  titleEn: {
    fontFamily: text.brand,
    fontSize: 20,
    color: colors.inkSoft
  },
  brush: {
    height: 6,
    width: 64,
    borderRadius: 3,
    opacity: 0.9,
    transform: 'rotate(-1.2deg)',
    marginTop: 5
  },
  brushColor: (accent: string) => ({ backgroundColor: accent }),
  action: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10
  }
});

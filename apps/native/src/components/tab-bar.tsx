import { css, html } from 'react-strict-dom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, text } from '../theme/tokens.css';

// One kanji per feature, colored with the feature accent when active. The
// kanji doubles as ambient learning; the English label keeps it navigable.
export const TAB_META: Record<string, { title: string; kanji: string; accent: string }> = {
  index: { title: 'Translate', kanji: '訳', accent: colors.indigo },
  lists: { title: 'Lists', kanji: '帳', accent: colors.matcha },
  dictionary: { title: 'Dictionary', kanji: '辞', accent: colors.yuzu },
  practice: { title: 'Practice', kanji: '話', accent: colors.sakura },
  settings: { title: 'Settings', kanji: '設', accent: colors.hanko }
};

// Minimal structural types for react-navigation's tabBar props; importing
// @react-navigation/bottom-tabs types directly doesn't resolve under bun's
// isolated node_modules.
type TabRoute = { key: string; name: string };
type TabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
  };
};

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <html.div style={[styles.bar, styles.inset(Math.max(insets.bottom, 8))]}>
      {state.routes.map((route, i) => {
        const meta = TAB_META[route.name];
        if (!meta) return null;
        const active = state.index === i;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true
          });
          if (!active && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <html.button
            key={route.key}
            style={styles.item}
            onClick={onPress}
            aria-label={meta.title}
            role="tab"
            aria-selected={active}
          >
            <html.span
              style={[styles.kanji, active ? styles.kanjiActive(meta.accent) : styles.kanjiIdle]}
            >
              {meta.kanji}
            </html.span>
            <html.span
              style={[styles.label, active ? styles.labelActive(meta.accent) : styles.labelIdle]}
            >
              {meta.title}
            </html.span>
            <html.div style={[styles.brush, active && styles.brushActive(meta.accent)]} />
          </html.button>
        );
      })}
    </html.div>
  );
}

const styles = css.create({
  bar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'stretch',
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
    paddingTop: 8,
    paddingLeft: 8,
    paddingRight: 8,
    flexShrink: 0
  },
  inset: (bottom: number) => ({ paddingBottom: bottom }),
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 10,
    paddingRight: 10,
    minWidth: 56,
    cursor: 'pointer'
  },
  kanji: {
    fontFamily: text.brandBold,
    fontSize: 22,
    lineHeight: 1.2
  },
  kanjiActive: (accent: string) => ({ color: accent }),
  kanjiIdle: { color: colors.inkSoft, opacity: 0.75 },
  label: {
    fontFamily: text.bodyMedium,
    fontSize: 10,
    marginTop: 1
  },
  labelActive: (accent: string) => ({ color: accent }),
  labelIdle: { color: colors.inkSoft },
  brush: {
    height: 3,
    width: 26,
    borderRadius: 2,
    marginTop: 3,
    transform: 'rotate(-1.5deg)',
    backgroundColor: 'transparent'
  },
  brushActive: (accent: string) => ({ backgroundColor: accent, opacity: 0.9 })
});

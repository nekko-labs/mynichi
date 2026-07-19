import type { ReactNode } from 'react';
import { Platform, ScrollView } from 'react-native';
import { css, html } from 'react-strict-dom';

type Props = {
  children: ReactNode;
};

// The one place screens are allowed to scroll. RSD divs don't map
// overflow to a native ScrollView, so this wraps the platform primitive on
// native and a plain scrolling div on web.
export function Scroll({ children }: Props) {
  if (Platform.OS !== 'web') {
    return (
      <ScrollView style={nativeStyles.scroll} contentContainerStyle={nativeStyles.content}>
        {children}
      </ScrollView>
    );
  }
  return <html.div style={styles.scroll}>{children}</html.div>;
}

const nativeStyles = {
  scroll: { flex: 1 },
  content: { flexGrow: 1 }
} as const;

const styles = css.create({
  scroll: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexBasis: 0,
    overflowY: 'auto',
    overflowX: 'hidden'
  }
});

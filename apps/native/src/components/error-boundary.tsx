import { Component, type ErrorInfo, type ReactNode } from 'react';
import { css, html } from 'react-strict-dom';

import { Button } from './ui';
import { leading, measure, size } from '../theme/contract.css';
import { colors, text } from '../theme/tokens.css';

// Last line of defence: a render error anywhere under here shows a paper page
// with a way out instead of a white screen (web) or a red box (native).
//
// Nothing about the error is reported anywhere: privacy is a product feature,
// and a stack trace can carry the user's own Japanese in it. In development
// the error still goes to the console, which is local.

type Props = {
  children: ReactNode;
  /** Shown instead of the default page, for smaller in-screen boundaries. */
  fallback?: (reset: () => void) => ReactNode;
};

type State = { failed: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('[mynichi] render error', error, info.componentStack);
    }
  }

  reset = () => {
    this.setState({ failed: false });
  };

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.reset);

    return (
      <html.div style={styles.page} role="alert">
        <html.span style={styles.kanji}>直</html.span>
        <html.h1 style={styles.title}>Something went sideways</html.h1>
        <html.p style={styles.body}>
          The screen stopped mid-stroke. Your lists and review history are stored on this device
          and are untouched.
        </html.p>
        <Button label="Try again" accent={colors.hanko} onClick={this.reset} />
      </html.div>
    );
  }
}

const styles = css.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    backgroundColor: colors.paper,
    paddingTop: 48,
    paddingBottom: 48,
    paddingLeft: 24,
    paddingRight: 24,
    rowGap: 10
  },
  kanji: {
    fontFamily: text.brandBold,
    fontSize: 56,
    lineHeight: leading.display,
    color: colors.hanko
  },
  title: {
    fontFamily: text.bodyBold,
    fontSize: size.heading,
    lineHeight: leading.heading,
    color: colors.ink,
    margin: 0
  },
  body: {
    fontFamily: text.body,
    fontSize: size.bodySmall,
    lineHeight: leading.bodySmall,
    color: colors.inkSoft,
    margin: 0,
    marginBottom: 8,
    maxWidth: measure.note,
    textAlign: 'center'
  }
});

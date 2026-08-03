import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { css, html } from 'react-strict-dom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Enter } from './motion';
import { RAIL_WIDTH, useWideLayout } from '../lib/layout';
import { leading, measure, motion, radius, size } from '../theme/contract.css';
import { colors, text } from '../theme/tokens.css';

// The app-wide notification layer. Network paths (translate, enrich, the
// offline dictionary, the practice partner) fail quietly otherwise, and a
// silent failure on the capture path is the worst thing this app can do: the
// user loses the word their day just handed them.
//
// A toast is a status message, not a dialog: it never takes focus, it is
// announced through an aria-live region, and it always leaves on its own.

export type ToastTone = 'error' | 'success' | 'info';

export type ToastOptions = {
  tone?: ToastTone;
  /** Milliseconds on screen. Errors stay longer by default. */
  duration?: number;
  /** One optional inline action, e.g. "Retry". */
  action?: { label: string; onClick: () => void };
};

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
};

type ToastApi = {
  show: (message: string, options?: ToastOptions) => void;
  dismiss: (id: number) => void;
};

// No provider (a screen rendered in isolation) degrades to doing nothing
// rather than throwing: a missing toast must never break the screen under it.
const noop: ToastApi = { show: () => {}, dismiss: () => {} };
const ToastContext = createContext<ToastApi>(noop);

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

const DEFAULT_DURATION: Record<ToastTone, number> = {
  error: motion.toastDuration * 1.5,
  success: motion.toastDuration,
  info: motion.toastDuration
};

const TONE_FILL: Record<ToastTone, string> = {
  error: colors.hankoSoft,
  success: colors.matchaSoft,
  info: colors.paperLift
};

const TONE_ACCENT: Record<ToastTone, string> = {
  error: colors.hanko,
  success: colors.matcha,
  info: colors.indigo
};

const TONE_MARK: Record<ToastTone, string> = {
  error: '!',
  success: '✓',
  info: '·'
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const nextId = useRef(0);
  const insets = useSafeAreaInsets();
  const wide = useWideLayout();

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      const trimmed = message.trim();
      if (!trimmed) return;
      const tone = options?.tone ?? 'info';
      const id = nextId.current++;
      setToasts((prev) => {
        // Repeating the same message (a retry that fails again) refreshes the
        // existing toast instead of stacking duplicates.
        const deduped = prev.filter((t) => t.message !== trimmed);
        return [...deduped, { id, message: trimmed, tone, action: options?.action }].slice(-3);
      });
      const timer = setTimeout(() => dismiss(id), options?.duration ?? DEFAULT_DURATION[tone]);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      <html.div style={styles.host}>
        {children}
        <html.div
          style={[
            styles.viewport,
            styles.viewportInset(insets.bottom + 88),
            wide && styles.viewportWide(RAIL_WIDTH)
          ]}
          // The region itself is always mounted so assistive tech has
          // something to watch; it only takes space when a toast is in it.
          role="status"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <Enter key={toast.id} kind="rise" speed="base">
              <html.div style={[styles.toast, styles.toastFill(TONE_FILL[toast.tone])]}>
                <html.span style={[styles.mark, styles.markColor(TONE_ACCENT[toast.tone])]}>
                  {TONE_MARK[toast.tone]}
                </html.span>
                <html.span style={styles.message}>{toast.message}</html.span>
                {toast.action ? (
                  <html.button
                    style={[styles.action, styles.actionColor(TONE_ACCENT[toast.tone])]}
                    onClick={() => {
                      dismiss(toast.id);
                      toast.action?.onClick();
                    }}
                  >
                    {toast.action.label}
                  </html.button>
                ) : null}
                <html.button
                  style={styles.close}
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                >
                  ×
                </html.button>
              </html.div>
            </Enter>
          ))}
        </html.div>
      </html.div>
    </ToastContext.Provider>
  );
}

const styles = css.create({
  host: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 0
  },
  viewport: {
    position: 'absolute',
    left: 12,
    right: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: 8,
    zIndex: 20
  },
  viewportInset: (bottom: number) => ({ bottom }),
  viewportWide: (rail: number) => ({ left: rail + 24, right: 24, bottom: 24 }),
  toast: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    borderRadius: radius.large,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 10,
    maxWidth: measure.note,
    width: '100%'
  },
  toastFill: (bg: string) => ({ backgroundColor: bg }),
  mark: {
    fontFamily: text.brandBold,
    fontSize: size.heading,
    lineHeight: leading.flat
  },
  markColor: (c: string) => ({ color: c }),
  message: {
    fontFamily: text.body,
    fontSize: size.bodySmall,
    lineHeight: leading.bodySmall,
    color: colors.ink,
    flexGrow: 1,
    flexShrink: 1
  },
  action: {
    fontFamily: text.bodyBold,
    fontSize: size.caption,
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    paddingLeft: 6,
    paddingRight: 6,
    cursor: 'pointer'
  },
  actionColor: (c: string) => ({ color: c }),
  close: {
    fontFamily: text.body,
    fontSize: size.heading,
    lineHeight: leading.flat,
    color: colors.inkSoft,
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    paddingLeft: 6,
    paddingRight: 6,
    cursor: 'pointer'
  }
});

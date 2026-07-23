import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

// Desktop web gets a real desktop layout (side rail, wider content, grids)
// instead of a phone column. Native stays phone-shaped; tablets can join the
// wide path later once the iOS build exists.

export const WIDE_BREAKPOINT = 900;
export const RAIL_WIDTH = 96;

const QUERY = `(min-width: ${WIDE_BREAKPOINT}px)`;
const isWeb = Platform.OS === 'web' && typeof window !== 'undefined' && 'matchMedia' in window;

function subscribe(onChange: () => void): () => void {
  if (!isWeb) return () => {};
  // Both signals: some environments (emulated viewports, older WebKit) don't
  // dispatch matchMedia change events reliably. The snapshot dedupes anyway.
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  window.addEventListener('resize', onChange);
  return () => {
    mq.removeEventListener('change', onChange);
    window.removeEventListener('resize', onChange);
  };
}

function getSnapshot(): boolean {
  return isWeb && window.matchMedia(QUERY).matches;
}

export function useWideLayout(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

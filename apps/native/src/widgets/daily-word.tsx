import type { PracticeList } from '@mynichi/core';

// Lock Screen widget is iOS only; see daily-word.ios.tsx. Same extension on
// purpose: Metro resolves name.ts before name.ios.tsx, so a .ts stub would win.
export function pushDailyWord(_lists: PracticeList[]) {}

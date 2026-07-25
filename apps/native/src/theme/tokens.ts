// Plain design tokens for React Native chrome (tab bar, navigation, splash).
// RSD components use tokens.css.ts instead; both shells implement the same
// contract in theme/contract.css.ts, and tokens.test.ts fails if they drift.
// Source of truth for the palette: TASKS.md "Design System & UI/UX".
import { colorContract, leading, size } from './contract.css';

export const palette = {
  paper: colorContract.paper.light,
  paperShade: colorContract.paperShade.light,
  paperDark: colorContract.paper.dark,
  paperDarkShade: colorContract.paperShade.dark,
  ink: colorContract.ink.light,
  inkSoft: colorContract.inkSoft.light,
  inkOnDark: colorContract.ink.dark,
  inkSoftOnDark: colorContract.inkSoft.dark,
  hanko: colorContract.hanko.light,
  indigo: colorContract.indigo.light,
  matcha: colorContract.matcha.light,
  yuzu: colorContract.yuzu.light,
  sakura: colorContract.sakura.light
} as const;

// Each top-level feature owns an accent.
export const accents = {
  translate: palette.indigo,
  lists: palette.matcha,
  dictionary: palette.yuzu,
  practice: palette.sakura,
  settings: palette.inkSoft
} as const;

export const fonts = {
  // Handwriting-style JP+Latin, for brand and headings.
  brand: 'KleeOne_400Regular',
  brandBold: 'KleeOne_600SemiBold',
  // Clean rounded gothic for body/UI.
  body: 'ZenKakuGothicNew_400Regular',
  bodyMedium: 'ZenKakuGothicNew_500Medium',
  bodyBold: 'ZenKakuGothicNew_700Bold'
} as const;

// Japanese type needs its leading spelled out: React Native's default line
// height clips Klee One's ascenders and leaves no room above a kanji for its
// furigana. RN wants absolute line heights, so the contract multipliers are
// resolved against each size here.
export const type = {
  display: { fontSize: size.display, lineHeight: Math.round(size.display * leading.display) },
  title: { fontSize: size.title, lineHeight: Math.round(size.title * leading.title) },
  heading: { fontSize: size.heading, lineHeight: Math.round(size.heading * leading.heading) },
  body: { fontSize: size.body, lineHeight: Math.round(size.body * leading.body) },
  bodySmall: {
    fontSize: size.bodySmall,
    lineHeight: Math.round(size.bodySmall * leading.bodySmall)
  },
  caption: { fontSize: size.caption, lineHeight: Math.round(size.caption * leading.caption) },
  micro: { fontSize: size.micro, lineHeight: Math.round(size.micro * leading.micro) }
} as const;

// Plain design tokens for React Native chrome (tab bar, navigation, splash).
// RSD components use tokens.stylex.ts instead; keep the two files in sync.
// Source of truth for the palette: TASKS.md "Design System & UI/UX".

export const palette = {
  paper: '#FAF7F0',
  paperShade: '#F1ECE1',
  paperDark: '#17161A',
  paperDarkShade: '#221F27',
  ink: '#2A2732',
  inkSoft: '#6B6575',
  inkOnDark: '#F3EFE7',
  inkSoftOnDark: '#A39DAD',
  hanko: '#E4573D',
  indigo: '#3E5C9A',
  matcha: '#7FA65A',
  yuzu: '#F2B441',
  sakura: '#F2A7B8'
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

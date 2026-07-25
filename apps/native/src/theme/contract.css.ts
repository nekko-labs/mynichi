// The design token contract: one plain-data, framework-free description of
// every token the sketchbook design system is allowed to use.
//
// Why it exists: the app renders through more than one shell (Expo + RSD
// today, Lynx next, see T70-T75) and each shell needs the tokens in its own
// format (`tokens.ts` for React Native chrome, `tokens.css.ts` for RSD/StyleX,
// plain CSS custom properties for Lynx). Those files are hand-written on
// purpose (StyleX needs literal values), so this contract is what keeps them
// honest: `tokens.test.ts` reads each shell and fails when one drifts.
//
// Adding a token means adding it here first. Screens must never invent a
// colour, a line-height or a duration of their own.

export type ColorPair = { light: string; dark: string };

/**
 * Every colour in the system, as light/dark pairs. A token whose two sides are
 * identical is a fixed accent (ink on the accent is always the same paper
 * white, whatever the scheme).
 */
export const colorContract = {
  // Surfaces
  paper: { light: '#FAF7F0', dark: '#17161A' },
  paperShade: { light: '#F1ECE1', dark: '#221F27' },
  paperLift: { light: '#FFFFFF', dark: '#201E25' },
  // Ink
  ink: { light: '#2A2732', dark: '#F3EFE7' },
  inkSoft: { light: '#6B6575', dark: '#A39DAD' },
  onAccent: { light: '#FFFFFF', dark: '#FFFFFF' },
  // The one hairline the system allows (tab bar), where spacing cannot do it.
  line: { light: 'rgba(42, 39, 50, 0.10)', dark: 'rgba(243, 239, 231, 0.12)' },
  // Feature accents
  hanko: { light: '#E4573D', dark: '#E4573D' },
  indigo: { light: '#3E5C9A', dark: '#3E5C9A' },
  matcha: { light: '#7FA65A', dark: '#7FA65A' },
  yuzu: { light: '#F2B441', dark: '#F2B441' },
  sakura: { light: '#F2A7B8', dark: '#F2A7B8' },
  // Feature-tinted paper fills: colour does the work borders would.
  indigoSoft: { light: '#E9EDF7', dark: '#242B3D' },
  matchaSoft: { light: '#EBF1E3', dark: '#242B1F' },
  yuzuSoft: { light: '#FBEFD8', dark: '#302818' },
  sakuraSoft: { light: '#FBE8EC', dark: '#31232A' },
  hankoSoft: { light: '#FAE3DE', dark: '#33211E' }
} as const satisfies Record<string, ColorPair>;

export type ColorName = keyof typeof colorContract;

/**
 * Semantic roles, so feedback surfaces (toasts, field errors, the error
 * boundary) never pick a feature accent by hand.
 */
export const semanticColors = {
  danger: 'hanko',
  dangerSoft: 'hankoSoft',
  success: 'matcha',
  successSoft: 'matchaSoft',
  notice: 'indigo',
  noticeSoft: 'indigoSoft'
} as const satisfies Record<string, ColorName>;

/**
 * Japanese-first type scale.
 *
 * Klee One (handwriting, brand) and Zen Kaku Gothic New (body) both carry tall
 * ascenders and full-width glyphs, so the Latin defaults are too tight: mixed
 * JP/Latin body text needs ~1.7 leading to stay readable, and any line that
 * can carry furigana needs headroom above it. Leadings are unitless
 * multipliers; `measure` values are max line lengths in px.
 */
// Sizes and leadings are two parallel maps rather than one nested map on
// purpose: StyleX inlines constants at build time and only follows a single
// level of member access inside css.create.
export const size = {
  /** Screen header kanji (Klee One). */
  display: 38,
  /** Big JP surfaces: review card fronts, draft words. */
  title: 24,
  /** Section and card headings. */
  heading: 18,
  /** Body copy, JP or English. */
  body: 16,
  /** Secondary body, glosses, meanings. */
  bodySmall: 14,
  /** Metadata, notes, attribution. */
  caption: 13,
  /** The smallest readable size; only for labels that are never JP prose. */
  micro: 11
} as const;

export const leading = {
  display: 1.25,
  title: 1.35,
  heading: 1.45,
  body: 1.7,
  bodySmall: 1.65,
  caption: 1.55,
  micro: 1.5,
  /** Anything that is a single line by definition (kanji marks, ruby). */
  flat: 1
} as const;

export type TypeStyleName = keyof typeof size;

/**
 * Measure: the comfortable max line length per kind of text. Japanese runs
 * denser than Latin per character, so prose is capped shorter than a Latin
 * grid would suggest.
 */
export const measure = {
  /** Long-form paragraphs (privacy copy, hints). */
  prose: 460,
  /** Short explanatory notes and error text. */
  note: 420,
  /** Centred empty-state copy. */
  compact: 300
} as const;

/**
 * Furigana-safe spacing. Ruby sits above the base glyph in its own row, so the
 * base line needs extra room or ruby collides with the line above it.
 */
export const ruby = {
  /** Ruby glyph size relative to its base. */
  scale: 0.5,
  /** Ruby line-height: tight, it is one line by definition. */
  leading: 1,
  /** Gap between the ruby row and the base glyph. */
  gap: 1,
  /** Vertical gap between two wrapped ruby lines. */
  rowGap: 10,
  /** Extra leading a base line needs when it may carry ruby. */
  baseLeading: 1.3
} as const;

/**
 * Motion: paper-like, never bouncy. One duration scale and one easing for the
 * whole app so transitions read as the same material.
 */
export const motion = {
  /** Chips, presses, small state flips. */
  fast: 140,
  /** The default: cards, rows, toasts entering. */
  base: 220,
  /** Screen-level or multi-element reveals. */
  slow: 320,
  /** How far a "rise" travels, in px. */
  rise: 8,
  /** Stagger between siblings in a list reveal. */
  stagger: 40,
  /** How long a toast stays before it dismisses itself. */
  toastDuration: 4000
} as const;

/** Spacing and radii, so surfaces agree on their softness. */
export const radius = {
  small: 10,
  medium: 12,
  large: 16,
  xlarge: 20,
  pill: 999
} as const;


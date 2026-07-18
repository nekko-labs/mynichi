// StyleX design tokens for react-strict-dom styles. Dark mode is handled here
// via media-query defaults, so components never branch on color scheme.
// Values must stay in sync with tokens.ts (used by React Native chrome).
import { css } from 'react-strict-dom';

export const colors = css.defineVars({
  paper: {
    default: '#FAF7F0',
    '@media (prefers-color-scheme: dark)': '#17161A'
  },
  paperShade: {
    default: '#F1ECE1',
    '@media (prefers-color-scheme: dark)': '#221F27'
  },
  ink: {
    default: '#2A2732',
    '@media (prefers-color-scheme: dark)': '#F3EFE7'
  },
  inkSoft: {
    default: '#6B6575',
    '@media (prefers-color-scheme: dark)': '#A39DAD'
  },
  hanko: '#E4573D',
  indigo: '#3E5C9A',
  matcha: '#7FA65A',
  yuzu: '#F2B441',
  sakura: '#F2A7B8'
});

export const text = css.defineVars({
  brand: 'KleeOne_400Regular',
  brandBold: 'KleeOne_600SemiBold',
  body: 'ZenKakuGothicNew_400Regular',
  bodyMedium: 'ZenKakuGothicNew_500Medium',
  bodyBold: 'ZenKakuGothicNew_700Bold'
});

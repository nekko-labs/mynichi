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
  // Soft hairline for the rare places spacing alone can't separate (tab bar).
  line: {
    default: 'rgba(42, 39, 50, 0.10)',
    '@media (prefers-color-scheme: dark)': 'rgba(243, 239, 231, 0.12)'
  },
  // A surface slightly lifted off the paper, for cards and sheets.
  paperLift: {
    default: '#FFFFFF',
    '@media (prefers-color-scheme: dark)': '#201E25'
  },
  hanko: '#E4573D',
  indigo: '#3E5C9A',
  matcha: '#7FA65A',
  yuzu: '#F2B441',
  sakura: '#F2A7B8',
  // Feature-tinted paper fills: color does the work borders would.
  indigoSoft: {
    default: '#E9EDF7',
    '@media (prefers-color-scheme: dark)': '#242B3D'
  },
  matchaSoft: {
    default: '#EBF1E3',
    '@media (prefers-color-scheme: dark)': '#242B1F'
  },
  yuzuSoft: {
    default: '#FBEFD8',
    '@media (prefers-color-scheme: dark)': '#302818'
  },
  sakuraSoft: {
    default: '#FBE8EC',
    '@media (prefers-color-scheme: dark)': '#31232A'
  },
  hankoSoft: {
    default: '#FAE3DE',
    '@media (prefers-color-scheme: dark)': '#33211E'
  }
});

export const text = css.defineVars({
  brand: 'KleeOne_400Regular',
  brandBold: 'KleeOne_600SemiBold',
  body: 'ZenKakuGothicNew_400Regular',
  bodyMedium: 'ZenKakuGothicNew_500Medium',
  bodyBold: 'ZenKakuGothicNew_700Bold'
});

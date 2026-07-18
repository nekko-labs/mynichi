// @mynichi/core: shared types, schemas, and Japanese text utilities.
// Fills out as features land: srs/ (FSRS), api/ (typed client).

export * from './translate';
export * from './jp';

export const LIST_CATEGORIES = [
  'life',
  'work',
  'real-estate',
  'health',
  'tech',
  'food',
  'travel',
  'custom'
] as const;

export type ListCategory = (typeof LIST_CATEGORIES)[number];

export const APP_LOCALES = ['en', 'de', 'zh', 'es', 'pt', 'fr', 'it', 'tl', 'th', 'ko'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

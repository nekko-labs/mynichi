// Inline sample of the bundled dictionary, enough to exercise the search UI.
// The real port loads public/data/dict-common.json like apps/native/src/dict.

export type PocWord = {
  s: number
  k?: string
  r: string
  g: string[]
}

const WORDS: PocWord[] = [
  { s: 1, k: '病院', r: 'びょういん', g: ['hospital', 'clinic'] },
  { s: 2, k: '予約', r: 'よやく', g: ['reservation', 'appointment', 'booking'] },
  { s: 3, k: '納期', r: 'のうき', g: ['delivery deadline', 'due date'] },
  { s: 4, k: '大家', r: 'おおや', g: ['landlord', 'landlady'] },
  { s: 5, k: '会社', r: 'かいしゃ', g: ['company', 'corporation', 'firm'] },
  { s: 6, k: '貸切', r: 'かしきり', g: ['fully reserved', 'private booking'] },
  { s: 7, k: '免除', r: 'めんじょ', g: ['exemption', 'waiver'] },
  { s: 8, k: '書類', r: 'しょるい', g: ['documents', 'paperwork'] },
  { s: 9, k: '提出', r: 'ていしゅつ', g: ['submission', 'to hand in'] },
  { s: 10, k: '入院', r: 'にゅういん', g: ['hospitalization'] },
  { s: 11, r: 'おもてなし', g: ['hospitality', 'reception'] },
  { s: 12, k: '家賃', r: 'やちん', g: ['rent', 'house rent'] },
  { s: 13, k: '敷金', r: 'しききん', g: ['security deposit'] },
  { s: 14, k: '礼金', r: 'れいきん', g: ['key money', 'gratuity to landlord'] },
  { s: 15, k: '歯医者', r: 'はいしゃ', g: ['dentist'] },
  { s: 16, k: '役所', r: 'やくしょ', g: ['government office', 'ward office'] }
]

/** Tiny stand-in for the app's ranked searchDict: substring over all fields. */
export function searchWords(rawQuery: string): PocWord[] {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return []
  return WORDS.filter(
    (w) =>
      w.k?.includes(q) ||
      w.r.includes(q) ||
      w.g.some((g) => g.toLowerCase().includes(q))
  ).slice(0, 10)
}

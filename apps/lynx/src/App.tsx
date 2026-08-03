import { useMemo, useState } from '@lynx-js/react'

import './tokens.css'
import './App.css'
import { searchWords, type PocWord } from './dict.js'

/**
 * mynichi on Lynx: proof-of-concept port of the Dictionary screen (T70).
 * Exercises the parts a migration must prove: text input, list rendering,
 * search state on the background thread, and the sketchbook design tokens
 * expressed as plain CSS. Uses an inline word sample; the real port would
 * load the bundled JMdict JSON exactly like apps/native/src/dict does.
 */
export function App() {
  const [query, setQuery] = useState('')
  const [savedTo, setSavedTo] = useState<Record<number, boolean>>({})

  const results = useMemo(() => searchWords(query), [query])

  return (
    <view className="Screen">
      <view className="Header">
        <text className="Reading">じしょ</text>
        <text className="Kanji">辞書 Dictionary</text>
        <view className="Brush" />
      </view>

      {/* Lynx inputs are uncontrolled: no value prop; read content from the
          bindinput event. (Migration note: controlled-input patterns from the
          RSD app, e.g. live romaji->kana conversion, need the setValue UI
          method instead.) */}
      <input
        className="Search"
        placeholder="Japanese, romaji, or English… 例: hospital / 病院"
        bindinput={(e) => setQuery(e.detail.value)}
      />

      {query.trim().length === 0 ? (
        <view className="Empty">
          <text className="EmptyKanji">辞</text>
          <text className="EmptyTitle">Look it up your way</text>
          <text className="EmptyHint">
            Type kana, kanji, romaji, or the English meaning.
          </text>
        </view>
      ) : (
        <scroll-view scroll-orientation="vertical" className="Results">
          {results.map((w: PocWord) => (
            <view key={w.s} className="Card">
              <view className="WordRow">
                <text className="Word">{w.k ?? w.r}</text>
                {w.k ? <text className="Kana">{w.r}</text> : null}
              </view>
              <text className="Gloss">{w.g.join('; ')}</text>
              <view
                className={savedTo[w.s] ? 'Chip ChipDone' : 'Chip'}
                bindtap={() => setSavedTo((prev) => ({ ...prev, [w.s]: true }))}
              >
                <text className="ChipText">
                  {savedTo[w.s] ? 'Saved ✓' : '＋ Add to list'}
                </text>
              </view>
            </view>
          ))}
          {results.length === 0 ? (
            <text className="EmptyHint">No matches in the PoC sample.</text>
          ) : null}
        </scroll-view>
      )}
    </view>
  )
}

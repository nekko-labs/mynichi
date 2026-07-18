import { useEffect, useRef, useState } from 'react';
import { injectedWords, practiceScenario, practiceTurns } from '../data/practice';

type AiMode = 'cloud' | 'local';

/**
 * Scripted AI Practice conversation (the dentist call) with the privacy
 * chooser that greets real users before their first session.
 */
export function PracticeDemo() {
  const [aiMode, setAiMode] = useState<AiMode>('local');
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || shown >= practiceTurns.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 400 : 1700);
    return () => clearTimeout(t);
  }, [playing, shown]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [shown]);

  const speaking = playing && shown < practiceTurns.length;
  const nextIsAi = practiceTurns[Math.min(shown, practiceTurns.length - 1)]?.who === 'ai';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h3 className="font-brand text-2xl">Too embarrassed to practice in front of another person?</h3>
        <p className="leading-relaxed text-ink-soft">
          Same. That's why the other side of this conversation is an AI character, not a human with
          opinions. Rehearse the dentist call, the apartment viewing, the izakaya order. Speak or
          type. Fumble as much as you need. Nobody is watching, and we mean that technically:
        </p>
        <div className="flex gap-2 rounded-2xl bg-paper-shade p-1.5">
          {(
            [
              ['local', 'On-device', 'Runs entirely on your iPhone. Genuinely offline. Nothing leaves the device.'],
              ['cloud', 'Our cloud', 'Higher-quality model. Never trained on your data. Voice never stored.']
            ] as Array<[AiMode, string, string]>
          ).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setAiMode(m)}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                aiMode === m ? 'bg-paper shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="rounded-2xl bg-sakura/15 p-4 text-sm leading-relaxed">
          {aiMode === 'local' ? (
            <>
              <span className="font-medium">On-device mode:</span> the model runs on your iPhone
              (15 Pro or newer, iOS 18+). Airplane mode works. Your voice and words never leave your
              hand.
            </>
          ) : (
            <>
              <span className="font-medium">Cloud mode:</span> a stronger model, with the same
              promise in writing: your conversations are never used for training and your voice is
              never stored.
            </>
          )}
        </p>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-soft">Woven in from your Health list</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {injectedWords.map((w) => (
              <span key={w.word} className="rounded-full bg-sakura/25 px-3 py-1 text-sm" title={w.meaning}>
                <span className="font-brand">{w.word}</span>
                <span className="ml-1.5 text-xs text-ink-soft">{w.reading}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-paper-shade p-5 paper-grain relative">
        <div className="flex items-center gap-3">
          <CharacterFace speaking={speaking && nextIsAi} />
          <div>
            <p className="text-sm font-medium">{practiceScenario}</p>
            <p className="text-xs text-ink-soft">
              {aiMode === 'local' ? 'On-device · offline' : 'Cloud · private by promise'}
            </p>
          </div>
        </div>

        <div ref={logRef} className="mt-4 flex h-72 flex-col gap-2.5 overflow-y-auto pr-1">
          {practiceTurns.slice(0, shown).map((t, i) => (
            <div key={i} className={`flex ${t.who === 'you' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  t.who === 'you' ? 'bg-sakura/30' : 'bg-paper shadow-sm'
                }`}
              >
                <p className="font-brand leading-relaxed">{highlight(t.jp)}</p>
                {showHelp && (
                  <>
                    <p className="mt-1 text-xs text-ink-soft">{t.romaji}</p>
                    <p className="text-xs text-ink-soft/80">{t.en}</p>
                  </>
                )}
              </div>
            </div>
          ))}
          {speaking && (
            <div className={`flex ${nextIsAi ? 'justify-start' : 'justify-end'}`}>
              <div className="rounded-2xl bg-paper px-4 py-3 shadow-sm">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setShown(0);
              setPlaying(true);
            }}
            className="rounded-full bg-hanko px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
          >
            {shown > 0 ? 'Replay the call' : 'Play the call'}
          </button>
          <label className="flex items-center gap-2 text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={showHelp}
              onChange={(e) => setShowHelp(e.target.checked)}
              className="accent-hanko"
            />
            Romaji + English
          </label>
        </div>
      </div>
    </div>
  );
}

/** Bold the words injected from the user's list wherever they appear. */
function highlight(jp: string) {
  const words = injectedWords.map((w) => w.word);
  const re = new RegExp(`(${words.join('|')})`, 'g');
  return jp.split(re).map((part, i) =>
    words.includes(part) ? (
      <mark key={i} className="rounded bg-sakura/50 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

/** The illustrated conversation partner: an ink-brush ensō with a face. */
function CharacterFace({ speaking }: { speaking: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 shrink-0" aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="#E4573D"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray="150 14"
        transform="rotate(-60 32 32)"
      >
        {speaking && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="-60 32 32"
            to="300 32 32"
            dur="6s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle cx="24" cy="30" r="2.6" fill="var(--ink)" />
      <circle cx="40" cy="30" r="2.6" fill="var(--ink)" />
      {speaking ? (
        <ellipse cx="32" cy="41" rx="4" ry="3" fill="var(--ink)">
          <animate attributeName="ry" values="3;1.2;3" dur="0.5s" repeatCount="indefinite" />
        </ellipse>
      ) : (
        <path d="M26,40 Q32,45 38,40" fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
      )}
    </svg>
  );
}

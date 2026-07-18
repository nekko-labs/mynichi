import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/motion';

const CANDIDATES = [
  {
    word: '納期',
    reading: 'のうき',
    meaning: 'delivery deadline',
    example: '納期は金曜日です。',
    exampleEn: 'The deadline is Friday.',
    list: 'Work'
  },
  {
    word: '貸切',
    reading: 'かしきり',
    meaning: 'fully reserved, private booking',
    example: '本日は貸切です。',
    exampleEn: 'We are fully booked today.',
    list: 'Food & town'
  },
  {
    word: '免除',
    reading: 'めんじょ',
    meaning: 'exemption, waiver',
    example: '保険料の免除を申請した。',
    exampleEn: 'I applied for a premium exemption.',
    list: 'City hall'
  }
] as const;

type Candidate = (typeof CANDIDATES)[number];
type Stage = 'idle' | 'enriching' | 'done' | 'review';

/**
 * The five-second capture: pick a word you "overheard", watch the app enrich
 * it, then flip the SRS card it becomes.
 */
export function ListsDemo() {
  const [picked, setPicked] = useState<Candidate | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [fields, setFields] = useState(0); // how many enriched fields are visible
  const [flipped, setFlipped] = useState(false);
  const [grade, setGrade] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage !== 'enriching') return;
    setFields(0);
    const t = setInterval(() => {
      setFields((f) => {
        if (f >= 3) {
          clearInterval(t);
          setStage('done');
          return f;
        }
        return f + 1;
      });
    }, 450);
    return () => clearInterval(t);
  }, [stage, picked]);

  const pick = (c: Candidate) => {
    setPicked(c);
    setStage('enriching');
    setFlipped(false);
    setGrade(null);
  };

  const startReview = () => {
    setStage('review');
    setFlipped(false);
    setGrade(null);
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-paper-shade p-6 paper-grain relative">
        <p className="text-sm text-ink-soft">
          Someone just said a word you don't know. You have five seconds on the train. Tap it:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CANDIDATES.map((c) => (
            <button
              key={c.word}
              onClick={() => pick(c)}
              className={`rounded-full px-4 py-2 font-brand text-lg transition-all ${
                picked?.word === c.word
                  ? 'bg-matcha text-white'
                  : 'bg-paper hover:scale-105'
              }`}
            >
              {c.word}
            </button>
          ))}
        </div>

        {picked && stage !== 'review' && (
          <div className="mt-5 rounded-2xl bg-paper p-5">
            <div className="flex items-baseline justify-between">
              <p className="font-brand text-3xl">{picked.word}</p>
              <span className="rounded-full bg-matcha/20 px-3 py-0.5 text-xs text-matcha">
                → {picked.list} list
              </span>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <EnrichedField label="Reading" ready={fields >= 1} value={picked.reading} />
              <EnrichedField label="Meaning" ready={fields >= 2} value={picked.meaning} />
              <EnrichedField
                label="Example"
                ready={fields >= 3}
                value={`${picked.example} (${picked.exampleEn})`}
              />
            </dl>
            {stage === 'done' && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-matcha">
                  Saved. The app filled everything in for you.
                </p>
                <button
                  onClick={startReview}
                  className="rounded-full bg-matcha px-4 py-1.5 text-sm text-white transition-transform hover:scale-105"
                >
                  Review it later →
                </button>
              </div>
            )}
          </div>
        )}

        {stage === 'review' && picked && (
          <div className="mt-5">
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              Three days later, review time
            </p>
            <div
              ref={cardRef}
              onClick={() => setFlipped((f) => !f)}
              className="mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl bg-paper p-6 text-center shadow-sm transition-transform hover:scale-[1.01]"
            >
              {!flipped ? (
                <>
                  <p className="font-brand text-4xl">{picked.word}</p>
                  <p className="mt-2 text-xs text-ink-soft">Tap to reveal</p>
                </>
              ) : (
                <>
                  <p className="font-brand text-2xl">{picked.reading}</p>
                  <p className="mt-1">{picked.meaning}</p>
                  <p className="mt-2 text-sm text-ink-soft">{picked.example}</p>
                </>
              )}
            </div>
            {flipped && !grade && (
              <div className="mt-3 flex justify-center gap-2">
                {[
                  ['Again', '10 min'],
                  ['Good', '3 days'],
                  ['Easy', '1 week']
                ].map(([label, next]) => (
                  <button
                    key={label}
                    onClick={() => setGrade(`"${label}" noted. Next review in ${next}.`)}
                    className="rounded-full bg-paper px-4 py-1.5 text-sm hover:bg-matcha/20"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {grade && <p className="mt-3 text-center text-sm text-matcha">{grade}</p>}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center gap-4">
        <h3 className="font-brand text-2xl">Lists by life, not by level</h3>
        <p className="leading-relaxed text-ink-soft">
          City hall. Work. Real estate. Health. Your izakaya. mynichi organizes words by the part of
          your life that handed them to you, never by JLPT chapter. Capture takes five seconds
          because the app fills in the reading, meaning, and example itself.
        </p>
        <p className="leading-relaxed text-ink-soft">
          Reviews are spaced repetition (the same science as Anki), and for kanji your hand is part
          of the test: trace with guidance or draw from memory, judged stroke by stroke. A kanji you
          can read but not write stays in rotation.
        </p>
        <div className="flex flex-wrap gap-2">
          {['City hall', 'Work', 'Real estate', 'Health', 'Food & town', 'Tech'].map((c) => (
            <span key={c} className="rounded-full bg-matcha/15 px-3 py-1 text-sm text-ink">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EnrichedField({ label, ready, value }: { label: string; ready: boolean; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-16 shrink-0 text-ink-soft">{label}</dt>
      <dd className="flex-1">
        {ready ? (
          <span>{value}</span>
        ) : (
          <span className="inline-block h-4 w-32 animate-pulse rounded bg-ink/10" />
        )}
      </dd>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '../lib/motion';
import { translateSamples, type SaveableWord } from '../data/translations';
import { RubySegment } from './RubyText';

/**
 * Live demo of the translate flow using canned outputs of the real pipeline.
 * Pick a sample, watch it "type", get the four layers, tap words to save them.
 */
export function TranslateDemo() {
  const [sampleId, setSampleId] = useState(translateSamples[0].id);
  const sample = useMemo(
    () => translateSamples.find((s) => s.id === sampleId)!,
    [sampleId]
  );
  const fullText = useMemo(
    () => sample.segments.map((seg) => seg.map((p) => p.t).join('')).join(''),
    [sample]
  );
  const [typed, setTyped] = useState(0);
  const [saved, setSaved] = useState<SaveableWord[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const done = typed >= fullText.length;

  useEffect(() => {
    setTyped(0);
    const t = setInterval(() => {
      setTyped((n) => {
        if (n >= fullText.length) {
          clearInterval(t);
          return n;
        }
        return n + 1;
      });
    }, 55);
    return () => clearInterval(t);
  }, [fullText]);

  useEffect(() => {
    if (done && resultsRef.current) {
      gsap.fromTo(
        resultsRef.current.children,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' }
      );
    }
  }, [done, sampleId]);

  const save = (w: SaveableWord, el: HTMLElement) => {
    if (saved.some((s) => s.word === w.word)) return;
    setSaved((prev) => [...prev, w]);
    gsap.fromTo(el, { scale: 1 }, { scale: 1.25, yoyo: true, repeat: 1, duration: 0.15 });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input side */}
      <div className="relative rounded-3xl bg-paper-shade p-6 paper-grain">
        <div className="flex flex-wrap gap-2">
          {translateSamples.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSampleId(s.id);
                setSaved([]);
              }}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                s.id === sampleId
                  ? 'bg-aiiro text-white'
                  : 'bg-paper text-ink-soft hover:text-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-soft">{sample.scenario}</p>
        <div className="mt-3 min-h-28 rounded-2xl bg-paper p-4 font-brand text-xl leading-relaxed">
          <span className={done ? '' : 'caret'}>{fullText.slice(0, typed)}</span>
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          In the app: snap a photo, pick one from your library, or paste text. OCR does the typing.
        </p>
      </div>

      {/* Results side */}
      <div ref={resultsRef} className="flex flex-col gap-3" aria-live="polite">
        {done && (
          <>
            <div className="rounded-2xl bg-paper-shade p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Original, with furigana. Tap a highlighted word to keep it.
              </p>
              <p className="mt-2 font-brand text-2xl leading-loose">
                {sample.segments.map((seg, i) => {
                  const w = sample.saveable[i];
                  return w ? (
                    <button
                      key={i}
                      onClick={(e) => save(w, e.currentTarget)}
                      className={`rounded-md px-0.5 transition-colors ${
                        saved.some((s) => s.word === w.word)
                          ? 'bg-matcha/30'
                          : 'bg-yuzu/30 hover:bg-yuzu/50'
                      }`}
                      title={`${w.reading} · ${w.meaning}`}
                    >
                      <RubySegment parts={seg} />
                    </button>
                  ) : (
                    <RubySegment key={i} parts={seg} />
                  );
                })}
              </p>
            </div>
            <div className="rounded-2xl bg-paper-shade p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Romaji</p>
              <p className="mt-1 text-ink-soft">{sample.romaji}</p>
            </div>
            <div className="rounded-2xl bg-paper-shade p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Literal</p>
              <p className="mt-1">{sample.literal}</p>
            </div>
            <div className="rounded-2xl border-2 border-aiiro/30 bg-aiiro/10 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-aiiro">
                What it really means
              </p>
              <p className="mt-1 leading-relaxed">{sample.practical}</p>
            </div>
            {saved.length > 0 && (
              <div className="rounded-2xl bg-matcha/15 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-matcha">
                  Saved to your lists
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {saved.map((w) => (
                    <span
                      key={w.word}
                      className="rounded-full bg-paper px-3 py-1 text-sm shadow-sm"
                    >
                      <span className="font-brand">{w.word}</span>
                      <span className="ml-2 text-xs text-ink-soft">
                        {w.reading} · {w.meaning} → {w.list}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

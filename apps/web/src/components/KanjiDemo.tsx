import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import {
  CONFUSABLE_DIFF_STROKES,
  KANJI_VIEWBOX,
  hi,
  mai,
  mi,
  sue,
  type KanjiStrokes
} from '../data/kanji';

type Mode = 'watch' | 'draw' | 'confuse';

export function KanjiDemo() {
  const [mode, setMode] = useState<Mode>('watch');
  return (
    <div className="rounded-3xl bg-paper-shade p-6 paper-grain relative">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['watch', 'Watch the strokes'],
            ['draw', 'Draw it yourself'],
            ['confuse', '未 or 末?']
          ] as Array<[Mode, string]>
        ).map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              mode === m ? 'bg-yuzu text-ink' : 'bg-paper text-ink-soft hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {mode === 'watch' && <StrokeOrder />}
        {mode === 'draw' && <TraceBoard />}
        {mode === 'confuse' && <Confusables />}
      </div>
    </div>
  );
}

/* ------------------------------ watch mode ------------------------------ */

function StrokeOrder() {
  const [kanji, setKanji] = useState<KanjiStrokes>(mai);
  const svgRef = useRef<SVGSVGElement>(null);

  const play = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>('path.stroke'));
    const tl = gsap.timeline();
    paths.forEach((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
      tl.to(p, { strokeDashoffset: 0, duration: Math.max(0.35, len / 220), ease: 'power1.inOut' }, '+=0.12');
    });
  }, [kanji]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    play();
  }, [play]);

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-8">
      <div className="relative">
        <svg ref={svgRef} viewBox={KANJI_VIEWBOX} className="h-56 w-56 md:h-64 md:w-64">
          <Grid />
          {kanji.strokes.map((d, i) => (
            <path
              key={`${kanji.char}-${i}`}
              className="stroke"
              d={d}
              fill="none"
              stroke="var(--ink)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>
      <div className="max-w-xs text-center md:text-left">
        <p className="font-brand text-2xl">
          {kanji.char} <span className="text-base text-ink-soft">{kanji.reading}</span>
        </p>
        <p className="mt-1 text-sm text-ink-soft">{kanji.meaning}</p>
        <div className="mt-4 flex justify-center gap-2 md:justify-start">
          {[mai, hi].map((k) => (
            <button
              key={k.char}
              onClick={() => setKanji(k)}
              className={`h-11 w-11 rounded-xl font-brand text-xl transition-colors ${
                kanji.char === k.char ? 'bg-yuzu/60' : 'bg-paper hover:bg-yuzu/30'
              }`}
            >
              {k.char}
            </button>
          ))}
          <button
            onClick={play}
            className="rounded-xl bg-paper px-4 text-sm text-ink-soft hover:text-ink"
          >
            Replay
          </button>
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          Every kanji in the app animates from real KanjiVG stroke data, the same data that judges
          your writing next tab over.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------- draw mode ------------------------------ */

type Verdict =
  | { kind: 'ok' }
  | { kind: 'direction' }
  | { kind: 'order'; expected: number; got: number }
  | { kind: 'shape' }
  | null;

interface Pt {
  x: number;
  y: number;
}

const SAMPLES = 24;

function samplePath(p: SVGPathElement): Pt[] {
  const len = p.getTotalLength();
  return Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const pt = p.getPointAtLength((len * i) / SAMPLES);
    return { x: pt.x, y: pt.y };
  });
}

function resample(pts: Pt[]): Pt[] {
  if (pts.length < 2) return pts;
  const dists = [0];
  for (let i = 1; i < pts.length; i++) {
    dists.push(dists[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  const total = dists[dists.length - 1];
  const out: Pt[] = [];
  for (let s = 0; s <= SAMPLES; s++) {
    const target = (total * s) / SAMPLES;
    let j = dists.findIndex((d) => d >= target);
    if (j <= 0) j = 1;
    const t = (target - dists[j - 1]) / (dists[j] - dists[j - 1] || 1);
    out.push({
      x: pts[j - 1].x + (pts[j].x - pts[j - 1].x) * t,
      y: pts[j - 1].y + (pts[j].y - pts[j - 1].y) * t
    });
  }
  return out;
}

function meanDist(a: Pt[], b: Pt[]): number {
  const n = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.hypot(a[i].x - b[i].x, a[i].y - b[i].y);
  return sum / n;
}

/**
 * Draw-it-yourself board: faint template, per-stroke judgment against
 * KanjiVG geometry (order, direction, shape), exactly like review in the app.
 */
function TraceBoard() {
  const kanji = hi; // 4 strokes: friendly for a first try
  const svgRef = useRef<SVGSVGElement>(null);
  const measureRef = useRef<SVGGElement>(null);
  const [strokeIdx, setStrokeIdx] = useState(0);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [drawing, setDrawing] = useState<Pt[]>([]);
  const [doneStrokes, setDoneStrokes] = useState<Pt[][]>([]);
  const expected = useRef<Pt[][]>([]);
  const complete = strokeIdx >= kanji.strokes.length;

  useEffect(() => {
    const g = measureRef.current;
    if (!g) return;
    expected.current = Array.from(g.querySelectorAll<SVGPathElement>('path')).map(samplePath);
  }, []);

  const toViewbox = (e: React.PointerEvent): Pt => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 109,
      y: ((e.clientY - rect.top) / rect.height) * 109
    };
  };

  const judge = (raw: Pt[]) => {
    if (raw.length < 4 || complete) return;
    const user = resample(raw);
    const reversed = [...user].reverse();
    const scores = expected.current.map((exp, i) => ({
      i,
      fwd: meanDist(user, exp),
      rev: meanDist(reversed, exp)
    }));
    const target = scores[strokeIdx];
    const TOL = 11; // mean deviation tolerance in the 109-unit space

    if (target.fwd < TOL) {
      setDoneStrokes((d) => [...d, raw]);
      setStrokeIdx((i) => i + 1);
      setVerdict({ kind: 'ok' });
      return;
    }
    if (target.rev < TOL) {
      setVerdict({ kind: 'direction' });
      return;
    }
    const best = scores.reduce((a, b) => (b.fwd < a.fwd ? b : a));
    if (best.i !== strokeIdx && best.fwd < TOL) {
      setVerdict({ kind: 'order', expected: strokeIdx + 1, got: best.i + 1 });
      return;
    }
    setVerdict({ kind: 'shape' });
  };

  const reset = () => {
    setStrokeIdx(0);
    setDoneStrokes([]);
    setVerdict(null);
    setDrawing([]);
  };

  const messages: Record<string, { text: string; tone: string }> = {
    ok: { text: complete ? 'You wrote 日. Beautifully.' : 'Right stroke. Keep going.', tone: 'text-matcha' },
    direction: { text: 'Right stroke, wrong direction. Strokes flow top-left to bottom-right.', tone: 'text-yuzu' },
    shape: { text: 'Almost. Follow the faint guide a little closer.', tone: 'text-hanko' },
    order: { text: '', tone: 'text-hanko' }
  };

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-8">
      <div className="relative touch-none">
        <svg
          ref={svgRef}
          viewBox={KANJI_VIEWBOX}
          className="h-56 w-56 cursor-crosshair rounded-2xl bg-paper md:h-64 md:w-64"
          onPointerDown={(e) => {
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              // synthetic or already-released pointers can't be captured; drawing still works
            }
            setDrawing([toViewbox(e)]);
          }}
          onPointerMove={(e) => {
            if (e.buttons !== 1) return;
            setDrawing((d) => (d.length ? [...d, toViewbox(e)] : d));
          }}
          onPointerUp={() => {
            judge(drawing);
            setDrawing([]);
          }}
        >
          <Grid />
          {/* faint template */}
          {kanji.strokes.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={i === strokeIdx ? 'var(--color-yuzu, #F2B441)' : 'var(--ink)'}
              strokeOpacity={i === strokeIdx ? 0.5 : 0.12}
              strokeWidth={5}
              strokeLinecap="round"
            />
          ))}
          {/* hidden measurement copies */}
          <g ref={measureRef} visibility="hidden">
            {kanji.strokes.map((d, i) => (
              <path key={i} d={d} fill="none" />
            ))}
          </g>
          {/* accepted user strokes */}
          {doneStrokes.map((pts, i) => (
            <polyline
              key={i}
              points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#7FA65A"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* live stroke */}
          {drawing.length > 1 && (
            <polyline
              points={drawing.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="var(--ink)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
      <div className="max-w-xs text-center md:text-left">
        <p className="font-brand text-2xl">
          Write 日 <span className="text-base text-ink-soft">stroke {Math.min(strokeIdx + 1, 4)} of 4</span>
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Draw on the square with your finger or mouse. mynichi judges each stroke as it lands:
          order, direction, and shape.
        </p>
        <div className="mt-3 min-h-12" aria-live="polite">
          {verdict && verdict.kind !== 'order' && (
            <p className={`text-sm font-medium ${messages[verdict.kind].tone}`}>
              {messages[verdict.kind].text}
            </p>
          )}
          {verdict?.kind === 'order' && (
            <p className="text-sm font-medium text-hanko">
              That was stroke {verdict.got}, but stroke {verdict.expected} comes first. Order is part
              of the kanji.
            </p>
          )}
          {complete && (
            <p className="text-sm font-medium text-matcha">
              You wrote 日. In the app, that grade feeds your review schedule: kanji you can read but
              not write stay in rotation.
            </p>
          )}
        </div>
        <button onClick={reset} className="mt-2 rounded-xl bg-paper px-4 py-2 text-sm text-ink-soft hover:text-ink">
          Start over
        </button>
      </div>
    </div>
  );
}

/* ---------------------------- confusables mode --------------------------- */

function Confusables() {
  const pairs: Array<{ k: KanjiStrokes; hl: string }> = [
    { k: mi, hl: '#3E5C9A' },
    { k: sue, hl: '#E4573D' }
  ];
  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-10">
      <div className="flex gap-4">
        {pairs.map(({ k, hl }) => (
          <div key={k.char} className="text-center">
            <svg viewBox={KANJI_VIEWBOX} className="h-44 w-44 rounded-2xl bg-paper md:h-52 md:w-52">
              <Grid />
              {k.strokes.map((d, i) => {
                const diff = CONFUSABLE_DIFF_STROKES.includes(i);
                return (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke={diff ? hl : 'var(--ink)'}
                    strokeOpacity={diff ? 1 : 0.35}
                    strokeWidth={diff ? 6 : 5}
                    strokeLinecap="round"
                  >
                    {diff && (
                      <animate
                        attributeName="stroke-opacity"
                        values="1;0.55;1"
                        dur="1.6s"
                        repeatCount="indefinite"
                      />
                    )}
                  </path>
                );
              })}
            </svg>
            <p className="mt-2 font-brand text-xl">
              {k.char} <span className="text-sm text-ink-soft">{k.reading}</span>
            </p>
            <p className="text-xs text-ink-soft">{k.meaning}</p>
          </div>
        ))}
      </div>
      <div className="max-w-xs text-center md:text-left">
        <p className="font-brand text-2xl">Spot the difference</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          These two haunt every learner. The only difference is the top two strokes:{' '}
          <span className="font-medium text-aiiro">未 has the short stroke on top</span> (not yet
          grown),{' '}
          <span className="font-medium text-hanko">末 has the long stroke on top</span> (the far end
          of a branch). mynichi shows every look-alike pair side by side with the differing strokes
          highlighted, right in the dictionary entry.
        </p>
      </div>
    </div>
  );
}

function Grid() {
  return (
    <g stroke="var(--ink)" strokeOpacity={0.08} strokeDasharray="3 4">
      <line x1="54.5" y1="4" x2="54.5" y2="105" />
      <line x1="4" y1="54.5" x2="105" y2="54.5" />
    </g>
  );
}

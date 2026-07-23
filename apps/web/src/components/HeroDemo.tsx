import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../lib/motion';

/**
 * Auto-playing demo reel in a phone frame for the hero: capture -> understand
 * -> keep, looping like a gif. Pure CSS/React (no video asset), driven by the
 * same 巻きで example the shipped pipeline is verified against.
 */

const TYPED = '納期ちょっと巻きで';
const SCENE_MS = 4200;
const SCENES = 3;

function TabBar({ active }: { active: number }) {
  const tabs = ['訳', '帳', '辞', '話'];
  return (
    <div className="flex justify-around border-t border-ink/10 px-2 py-2">
      {tabs.map((t, i) => (
        <span
          key={t}
          className={`font-brand text-base ${i === active ? 'text-hanko' : 'text-ink-soft/60'}`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function SceneTranslate({ progress }: { progress: number }) {
  // progress 0..1 within the scene: type first, then reveal the result
  const chars = Math.min(TYPED.length, Math.ceil(progress * 2 * TYPED.length));
  const showResult = progress > 0.55;
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 p-4">
        <p className="text-[10px] uppercase tracking-widest text-ink-soft">Translate · 翻訳</p>
        <div className="rounded-xl bg-paper-shade p-3">
          <p className={`min-h-6 font-brand text-lg ${chars < TYPED.length ? 'caret' : ''}`}>
            {TYPED.slice(0, chars)}
          </p>
        </div>
        <div
          className={`space-y-2 transition-all duration-500 ${
            showResult ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
        >
          <p className="font-brand text-xl leading-relaxed">
            <ruby>
              納期<rt>のうき</rt>
            </ruby>
            ちょっと
            <ruby>
              巻<rt>ま</rt>
            </ruby>
            きで
          </p>
          <div className="rounded-xl bg-aiiro/10 p-3 text-xs leading-relaxed">
            <span className="font-medium text-aiiro">What it means: </span>
            they want it <span className="font-semibold">earlier</span>, not later. 巻きで =
            ahead of schedule.
          </div>
        </div>
      </div>
      <TabBar active={0} />
    </div>
  );
}

function SceneSave({ progress }: { progress: number }) {
  const saved = progress > 0.4;
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 p-4">
        <p className="text-[10px] uppercase tracking-widest text-ink-soft">Lists · リスト</p>
        <p className="font-brand text-lg">
          Work <span className="text-xs text-ink-soft">仕事</span>
        </p>
        <div className="rounded-xl bg-paper-shade p-3">
          <p className="font-brand text-lg">
            <ruby>
              巻<rt>ま</rt>
            </ruby>
            きで
          </p>
          <p className="mt-1 text-xs text-ink-soft">ahead of schedule (slang)</p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-xl bg-matcha/15 p-3 text-xs transition-all duration-500 ${
            saved ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-matcha text-[10px] text-white">
            ✓
          </span>
          Saved. Review scheduled for tomorrow.
        </div>
      </div>
      <TabBar active={1} />
    </div>
  );
}

function SceneReview({ progress }: { progress: number }) {
  const flipped = progress > 0.45;
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 p-4">
        <p className="text-[10px] uppercase tracking-widest text-ink-soft">Review · 復習</p>
        <div className="rounded-xl bg-paper-shade p-4 text-center">
          <p className="font-brand text-3xl">巻きで</p>
          <div
            className={`transition-all duration-500 ${
              flipped ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
            }`}
          >
            <p className="mt-2 text-sm text-ink-soft">まきで</p>
            <p className="mt-1 text-xs">ahead of schedule</p>
          </div>
        </div>
        <div
          className={`flex justify-center gap-2 transition-opacity duration-500 ${
            flipped ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {['Again', 'Good', 'Easy'].map((g, i) => (
            <span
              key={g}
              className={`rounded-full px-3 py-1 text-[10px] ${
                i === 1 ? 'bg-matcha text-white' : 'bg-paper-shade text-ink-soft'
              }`}
            >
              {g}
            </span>
          ))}
        </div>
        <p className="text-center text-[10px] text-ink-soft">
          You will meet this word again. Ready this time.
        </p>
      </div>
      <TabBar active={1} />
    </div>
  );
}

export function HeroDemo() {
  const [tick, setTick] = useState(0);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setTick((v) => v + 1), 150);
    return () => clearInterval(t);
  }, [reduced]);

  const elapsed = tick * 150;
  const scene = reduced ? 0 : Math.floor(elapsed / SCENE_MS) % SCENES;
  const progress = reduced ? 1 : (elapsed % SCENE_MS) / SCENE_MS;

  const scenes = [
    <SceneTranslate key="t" progress={progress} />,
    <SceneSave key="s" progress={progress} />,
    <SceneReview key="r" progress={progress} />
  ];

  return (
    <div className="relative mx-auto w-[260px] md:w-[290px]">
      <div className="relative h-[540px] w-full rounded-[2.8rem] bg-ink p-3 shadow-2xl shadow-ink/30 md:h-[600px]">
        <div className="absolute left-1/2 top-5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" />
        <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] bg-paper pt-8">
          {scenes.map((s, i) => (
            <div
              key={i}
              className={`absolute inset-0 pt-8 transition-opacity duration-500 ${
                i === scene ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              aria-hidden={i !== scene}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
        {Array.from({ length: SCENES }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i === scene ? 'bg-hanko' : 'bg-ink/15'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

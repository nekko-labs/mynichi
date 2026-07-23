import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min';
import { prefersReducedMotion } from '../lib/motion';
import { HeroDemo } from './HeroDemo';
import { Marquee } from './Marquee';

const LIGHT = {
  highlightColor: 0xf2b441,
  midtoneColor: 0xf2a7b8,
  lowlightColor: 0x3e5c9a,
  baseColor: 0xfaf7f0
};
const DARK = {
  highlightColor: 0x3e5c9a,
  midtoneColor: 0xe4573d,
  lowlightColor: 0x221f27,
  baseColor: 0x17161a
};

/** Ink-wash fog (Vanta + three.js) behind the hero, tinted per color scheme. */
function useVantaFog() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!el.current || prefersReducedMotion()) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    let effect: { destroy: () => void } | null = null;
    const mount = () => {
      effect?.destroy();
      effect = FOG({
        el: el.current!,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        blurFactor: 0.55,
        speed: 1.1,
        zoom: 0.6,
        ...(mq.matches ? DARK : LIGHT)
      });
    };
    mount();
    mq.addEventListener('change', mount);
    return () => {
      mq.removeEventListener('change', mount);
      effect?.destroy();
    };
  }, []);
  return el;
}

const ROTATING = [
  'the letter from city hall',
  'the word your coworker used',
  'the sign at the clinic',
  'the menu with no photos',
  'the call you keep postponing'
];

/** The brand wordmark morphing between its English and Japanese selves. */
const BRAND_STATES = [
  { pre: 'My ', jp: false, word: 'Nichi' },
  { pre: 'My ', jp: true, word: '毎日' },
  { pre: '', jp: false, word: 'MaiNichi' },
  { pre: '', jp: true, word: '毎日' }
];

function RotatingBrand() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % BRAND_STATES.length), 2200);
    return () => clearInterval(t);
  }, []);
  const s = BRAND_STATES[idx];
  return (
    <p className="font-brand text-2xl md:text-3xl" aria-label="mynichi">
      <span key={idx} className="word-swap inline-block">
        {s.pre && <span className="text-ink-soft">{s.pre}</span>}
        <span className={s.jp ? 'text-hanko' : 'text-ink'}>{s.word}</span>
      </span>
    </p>
  );
}

export function Hero() {
  const vantaRef = useVantaFog();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % ROTATING.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden">
      <div ref={vantaRef} className="absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-paper" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 pt-28 pb-10 md:pt-32 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        <div className="max-w-xl lg:justify-self-end">
          <RotatingBrand />
          <h1 className="mt-4 font-brand text-5xl leading-[1.1] md:text-7xl">
            Your day is
            <br />
            the curriculum.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            mynichi is Japanese for people{' '}
            <em className="not-italic font-medium text-ink">living</em> in Japan. Capture{' '}
            <span key={idx} className="inline-block font-medium text-hanko">
              {ROTATING[idx]}
            </span>
            , understand it, and actually keep it. No lessons. No streaks. No owl.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#download"
              className="rounded-full bg-hanko px-6 py-3 font-medium text-white shadow-lg shadow-hanko/25 transition-transform hover:scale-105"
            >
              Get mynichi for iPhone
            </a>
            <a
              href="/app/"
              className="rounded-full bg-paper/80 px-6 py-3 font-medium backdrop-blur transition-transform hover:scale-105"
            >
              Try it in your browser
            </a>
          </div>
          <p className="mt-4 text-xs text-ink-soft">
            Free forever for daily capture. No account needed to start.
          </p>
        </div>

        <div className="justify-self-center lg:justify-self-start">
          <HeroDemo />
        </div>
      </div>

      <div className="relative">
        <Marquee />
      </div>
    </section>
  );
}

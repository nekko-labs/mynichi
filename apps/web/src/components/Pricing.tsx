import { useState } from 'react';

export function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl bg-paper-shade p-8 paper-grain relative">
        <h3 className="font-brand text-2xl">Free</h3>
        <p className="mt-1 text-sm text-ink-soft">Daily capture, forever</p>
        <p className="mt-4 font-brand text-4xl">¥0</p>
        <ul className="mt-6 space-y-2.5 text-sm">
          {[
            'Photo + paste translate with the practical layer',
            'Practice lists with 5-second enriched capture',
            'Full offline dictionary: draw, radicals, confusables',
            'Spaced repetition incl. stroke-order writing practice',
            'On-device AI practice (iPhone 15 Pro or newer)',
            'Local-first: your data lives on your phone'
          ].map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-matcha">○</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative rounded-3xl bg-ink p-8 text-paper">
        <div className="flex items-center justify-between">
          <h3 className="font-brand text-2xl">Premium</h3>
          <div className="flex rounded-full bg-paper/10 p-1 text-xs">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-3 py-1 ${!yearly ? 'bg-paper text-ink' : ''}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-3 py-1 ${yearly ? 'bg-paper text-ink' : ''}`}
            >
              Yearly
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-paper/60">When you want the best model everywhere</p>
        <p className="mt-4 font-brand text-4xl">
          ${yearly ? 14 : 20}
          <span className="text-base text-paper/60"> /month{yearly ? ', billed yearly' : ''}</span>
        </p>
        <ul className="mt-6 space-y-2.5 text-sm">
          {[
            'Everything in Free',
            'Frontier cloud model for translation and AI practice',
            'Same privacy promise: no training on your data, voice never stored',
            'Cloud sync across iPhone, iPad, and web'
          ].map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-yuzu">○</span>
              {f}
            </li>
          ))}
        </ul>
        <a
          href="#download"
          className="mt-8 inline-block rounded-full bg-hanko px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
        >
          Start free, upgrade whenever
        </a>
      </div>
    </div>
  );
}

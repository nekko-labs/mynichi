import { useState } from 'react';
import { competitors, type CompetitorId } from '../data/comparisons';
import { CompareTable } from './CompareTable';

/** Landing-page comparison: tab per competitor, five signature rows, link to the full page. */
export function CompareSection() {
  const [active, setActive] = useState<CompetitorId>('duolingo');
  const comp = competitors.find((c) => c.id === active)!;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {competitors.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              c.id === active ? 'bg-ink text-paper' : 'bg-paper-shade text-ink-soft hover:text-ink'
            }`}
          >
            vs {c.name}
          </button>
        ))}
      </div>
      <p className="mt-5 max-w-2xl font-brand text-xl">{comp.tagline}</p>
      <div className="mt-4">
        <CompareTable only={comp.id} rows={comp.highlightRows} />
      </div>
      <a
        href={`/vs/${comp.id}`}
        className="mt-4 inline-block text-sm font-medium text-aiiro underline-offset-4 hover:underline"
      >
        Read the honest, full mynichi vs {comp.name} comparison →
      </a>
    </div>
  );
}

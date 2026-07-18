import { competitors, type CompetitorId } from '../data/comparisons';
import { BrushHeading } from '../components/BrushHeading';
import { CompareTable, prettyName } from '../components/CompareTable';
import { DownloadSection } from '../components/DownloadSection';
import { Footer } from '../components/Footer';
import { Nav } from '../components/Nav';
import { useLenis, useReveals } from '../lib/motion';

export function Versus({ competitorId }: { competitorId: CompetitorId }) {
  useLenis();
  useReveals();
  const comp = competitors.find((c) => c.id === competitorId)!;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-6 pt-36 pb-16">
        <p className="text-sm font-medium uppercase tracking-widest text-ink-soft">
          Honest comparison · 比較
        </p>
        <BrushHeading as="h1" accent="hanko" className="mt-2">
          mynichi vs {comp.name}
        </BrushHeading>
        <p className="mt-6 max-w-2xl font-brand text-2xl leading-snug">{comp.tagline}</p>

        <div className="reveal mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-paper-shade p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-matcha">
              Where {comp.name} shines
            </p>
            <p className="mt-2 leading-relaxed">{comp.goodAt}</p>
          </div>
          <div className="rounded-3xl bg-paper-shade p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-hanko">
              Where life in Japan needs more
            </p>
            <p className="mt-2 leading-relaxed">{comp.but}</p>
          </div>
        </div>

        <div className="reveal mt-12">
          <h2 className="font-brand text-2xl">Feature by feature</h2>
          <div className="mt-4">
            <CompareTable only={comp.id} />
          </div>
        </div>

        <div className="reveal mt-12 rounded-3xl border-2 border-ink/10 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Our honest take</p>
          <p className="mt-2 max-w-3xl font-brand text-xl leading-relaxed">{comp.verdict}</p>
        </div>

        <div className="reveal mt-10 flex flex-wrap gap-3 text-sm">
          {competitors
            .filter((c) => c.id !== comp.id)
            .map((c) => (
              <a
                key={c.id}
                href={`/vs/${c.id}`}
                className="rounded-full bg-paper-shade px-4 py-2 text-ink-soft hover:text-ink"
              >
                mynichi vs {prettyName(c.id)} →
              </a>
            ))}
          <a href="/#demos" className="rounded-full bg-paper-shade px-4 py-2 text-ink-soft hover:text-ink">
            ← Try the live demos
          </a>
        </div>

        <div className="reveal mt-16">
          <DownloadSection />
        </div>
      </main>
      <Footer />
    </>
  );
}

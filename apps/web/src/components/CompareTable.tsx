import { compareRows, type CompareCell, type CompetitorId } from '../data/comparisons';

function Cell({ cell }: { cell: CompareCell }) {
  const glyph = cell.support === 'yes' ? '○' : cell.support === 'partial' ? '△' : '✕';
  const tone =
    cell.support === 'yes'
      ? 'text-matcha'
      : cell.support === 'partial'
        ? 'text-yuzu'
        : 'text-ink-soft/50';
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-lg font-bold ${tone}`} aria-label={cell.support}>
        {glyph}
      </span>
      {cell.note && <span className="text-center text-[11px] leading-tight text-ink-soft">{cell.note}</span>}
    </div>
  );
}

/**
 * The comparison table. `only` renders a single competitor column (vs pages);
 * omit it for the full landing-page table. Marks follow the Japanese
 * convention: ○ yes, △ partial, ✕ no.
 */
export function CompareTable({
  only,
  rows = compareRows.map((_, i) => i)
}: {
  only?: CompetitorId;
  rows?: number[];
}) {
  const columns: Array<{ id: CompetitorId; name: string }> = only
    ? [{ id: only, name: prettyName(only) }]
    : [
        { id: 'duolingo', name: 'Duolingo' },
        { id: 'anki', name: 'Anki' },
        { id: 'google-translate', name: 'G. Translate' },
        { id: 'jisho', name: 'Jisho' }
      ];

  return (
    <div className="overflow-x-auto rounded-3xl bg-paper-shade p-2 md:p-4">
      <table className="w-full min-w-[560px] border-separate border-spacing-y-1">
        <thead>
          <tr className="text-sm">
            <th className="w-1/3 p-3 text-left font-medium text-ink-soft">Living in Japan needs</th>
            <th className="rounded-t-2xl bg-paper p-3 font-brand text-lg">
              my<span className="text-hanko">日</span>
            </th>
            {columns.map((c) => (
              <th key={c.id} className="p-3 font-medium text-ink-soft">
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((ri) => {
            const row = compareRows[ri];
            return (
              <tr key={row.feature} className="align-top">
                <td className="rounded-l-2xl bg-paper/40 p-3 text-sm">
                  <p className="font-medium">{row.feature}</p>
                  {row.detail && <p className="mt-0.5 text-xs text-ink-soft">{row.detail}</p>}
                </td>
                <td className="bg-paper p-3">
                  <Cell cell={row.mynichi} />
                </td>
                {columns.map((c) => (
                  <td key={c.id} className="rounded-r-2xl bg-paper/40 p-3">
                    <Cell cell={row.cells[c.id]} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="p-3 text-xs text-ink-soft">○ built in · △ partly, or with effort · ✕ not there</p>
    </div>
  );
}

export function prettyName(id: CompetitorId): string {
  return id === 'google-translate'
    ? 'Google Translate'
    : id.charAt(0).toUpperCase() + id.slice(1);
}

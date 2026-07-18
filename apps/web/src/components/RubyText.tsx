import type { RubyPart } from '../data/translations';

/** Renders one segment (word) as proper ruby text with furigana. */
export function RubySegment({ parts, className = '' }: { parts: RubyPart[]; className?: string }) {
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.r ? (
          <ruby key={i}>
            {p.t}
            <rt>{p.r}</rt>
          </ruby>
        ) : (
          <span key={i}>{p.t}</span>
        )
      )}
    </span>
  );
}

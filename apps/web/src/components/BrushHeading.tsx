import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';

const ACCENTS = {
  hanko: '#E4573D',
  indigo: '#3E5C9A',
  matcha: '#7FA65A',
  yuzu: '#F2B441',
  sakura: '#F2A7B8'
} as const;

export type Accent = keyof typeof ACCENTS;

/**
 * Section heading with a hand-drawn marker underline that paints itself in
 * when scrolled into view. The slightly irregular path is the "sketchbook"
 * answer to a border.
 */
export function BrushHeading({
  children,
  accent = 'hanko',
  as: Tag = 'h2',
  className = ''
}: {
  children: ReactNode;
  accent?: Accent;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  const ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = ref.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    if (prefersReducedMotion()) return;
    path.style.strokeDashoffset = `${len}`;
    const tween = gsap.to(path, {
      strokeDashoffset: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: path, start: 'top 88%', once: true }
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <Tag className={`font-brand text-3xl md:text-5xl leading-tight ${className}`}>
      <span className="relative inline-block">
        {children}
        <svg
          className="absolute -bottom-3 left-0 w-full"
          height="12"
          viewBox="0 0 300 12"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            ref={ref}
            d="M4,8 C60,4 120,10 170,7 C220,4 265,9 296,6"
            fill="none"
            stroke={ACCENTS[accent]}
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </span>
    </Tag>
  );
}

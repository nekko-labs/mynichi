const PHRASES: Array<{ jp: string; en: string }> = [
  { jp: '納期ちょっと巻きで', en: 'deadline, a bit earlier' },
  { jp: '貸切営業', en: 'private event today' },
  { jp: '国民年金保険料', en: 'pension premiums' },
  { jp: '土足厳禁', en: 'no shoes inside' },
  { jp: '順番にお呼びします', en: 'we will call you in order' },
  { jp: '当店はキャッシュレス', en: 'cashless only' },
  { jp: 'ゴミは持ち帰り', en: 'take your trash home' },
  { jp: '振込用紙', en: 'payment slip' },
  { jp: 'ご自由にお取りください', en: 'please take one' },
  { jp: '本日のおすすめ', en: 'today’s special' }
];

/** The Japanese your day actually hands you, drifting past. Hover to pause. */
export function Marquee() {
  const items = [...PHRASES, ...PHRASES];
  return (
    <div
      className="relative overflow-hidden py-6 select-none"
      style={{ maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)' }}
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max gap-10" style={{ '--marquee-duration': '55s' } as React.CSSProperties}>
        {items.map((p, i) => (
          <span key={i} className="flex items-baseline gap-3 whitespace-nowrap">
            <span className="font-brand text-2xl md:text-3xl">{p.jp}</span>
            <span className="text-ink-soft text-sm">{p.en}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

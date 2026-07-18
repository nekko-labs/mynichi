const links = [
  { href: '/#demos', label: 'Try the features' },
  { href: '/#compare', label: 'Compare' },
  { href: '/#privacy', label: 'Privacy' },
  { href: '/#pricing', label: 'Pricing' }
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto mt-3 flex max-w-5xl items-center justify-between rounded-full bg-paper/75 px-5 py-2.5 backdrop-blur-md shadow-[0_2px_16px_rgba(42,39,50,0.08)]">
        <a href="/" className="flex items-baseline gap-1 font-brand text-xl">
          my<span className="text-hanko">日</span>
          <span className="ml-1 hidden text-xs text-ink-soft sm:inline">mynichi</span>
        </a>
        <div className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-ink-soft transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="/#download"
          className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper transition-transform hover:scale-105"
        >
          Get the app
        </a>
      </nav>
    </header>
  );
}

import { useState } from 'react';

/**
 * The real app, embedded live in a phone frame. Not a mockup: the iframe
 * loads the same build that ships at /app.
 */
export function AppEmbed() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex flex-col items-center gap-8 md:flex-row md:justify-center md:gap-14">
      <div className="relative">
        <div className="relative h-[640px] w-[312px] rounded-[3rem] bg-ink p-3 shadow-2xl shadow-ink/30">
          <div className="absolute left-1/2 top-5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" />
          <div className="h-full w-full overflow-hidden rounded-[2.4rem] bg-paper">
            {!loaded && (
              <div className="flex h-full items-center justify-center">
                <p className="font-brand text-2xl text-ink-soft">
                  my<span className="text-hanko">日</span>
                </p>
              </div>
            )}
            <iframe
              src="/app/"
              title="mynichi, running live"
              onLoad={() => setLoaded(true)}
              className={`h-full w-full border-0 ${loaded ? '' : 'hidden'}`}
            />
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-ink-soft">Live. Go on, poke it.</p>
      </div>
      <div className="max-w-sm text-center md:text-left">
        <h3 className="font-brand text-3xl">This is not a mockup</h3>
        <p className="mt-4 leading-relaxed text-ink-soft">
          The phone on the left is running the actual mynichi app, the same code that ships to
          iPhone. Try the translate tab with your own text right here, then take it with you.
        </p>
        <a
          href="/app/"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-medium text-paper transition-transform hover:scale-105"
        >
          Open it full screen
        </a>
      </div>
    </div>
  );
}

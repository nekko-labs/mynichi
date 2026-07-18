/**
 * Where the native app lives. The App Store build is on its way (TASKS.md
 * T53); until the listing is live the badge routes to the TestFlight notify
 * flow so nobody hits a dead link.
 */
const APP_STORE_URL: string | null = null; // set to the real listing URL when T53 ships
const NOTIFY_MAILTO =
  'mailto:hello@nekkolabs.com?subject=mynichi%20iPhone%20beta&body=Tell%20me%20when%20the%20iPhone%20app%20is%20ready%20(or%20invite%20me%20to%20TestFlight).';

export function DownloadSection() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center text-paper">
      <span aria-hidden="true" className="pointer-events-none absolute -right-6 -top-10 select-none font-brand text-[11rem] leading-none text-paper/5">
        日
      </span>
      <h3 className="font-brand text-3xl md:text-4xl">Take mynichi with you</h3>
      <p className="mx-auto mt-3 max-w-md text-paper/70">
        The native iPhone app is where mynichi belongs: camera OCR, kanji drawing, and fully
        offline AI practice in your pocket.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {APP_STORE_URL ? (
          <a
            href={APP_STORE_URL}
            className="flex items-center gap-3 rounded-2xl bg-paper px-6 py-3 text-ink transition-transform hover:scale-105"
          >
            <AppleLogo />
            <span className="text-left leading-tight">
              <span className="block text-[10px] uppercase tracking-wide text-ink-soft">
                Download on the
              </span>
              <span className="block font-medium">App Store</span>
            </span>
          </a>
        ) : (
          <a
            href={NOTIFY_MAILTO}
            className="flex items-center gap-3 rounded-2xl bg-paper px-6 py-3 text-ink transition-transform hover:scale-105"
          >
            <AppleLogo />
            <span className="text-left leading-tight">
              <span className="block text-[10px] uppercase tracking-wide text-ink-soft">
                App Store, very soon
              </span>
              <span className="block font-medium">Get the TestFlight invite</span>
            </span>
          </a>
        )}
        <a
          href="/app/"
          className="rounded-2xl bg-paper/10 px-6 py-4 font-medium text-paper transition-transform hover:scale-105"
        >
          Use the web app today →
        </a>
      </div>
      <p className="mt-6 text-xs text-paper/50">
        iPhone first, Android next. One account, everywhere, once you go premium.
      </p>
    </div>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 384 512" className="h-8 w-8 fill-current" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paper-shade/60">
      <div className="mx-auto max-w-5xl px-6 py-12 text-sm text-ink-soft">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <p className="font-brand text-2xl text-ink">
              my<span className="text-hanko">日</span>
            </p>
            <p className="mt-2">
              Japanese for daily living. Your day is the curriculum.
            </p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-2">
              <p className="font-medium text-ink">mynichi</p>
              <a href="/#demos" className="hover:text-ink">Features</a>
              <a href="/#pricing" className="hover:text-ink">Pricing</a>
              <a href="/app/" className="hover:text-ink">Open the web app</a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium text-ink">Compare</p>
              <a href="/vs/duolingo" className="hover:text-ink">vs Duolingo</a>
              <a href="/vs/anki" className="hover:text-ink">vs Anki</a>
              <a href="/vs/google-translate" className="hover:text-ink">vs Google Translate</a>
              <a href="/vs/jisho" className="hover:text-ink">vs Jisho</a>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-ink/10 pt-6 text-xs leading-relaxed">
          <p>
            Kanji stroke data from{' '}
            <a href="https://kanjivg.tagaini.net" className="underline hover:text-ink">
              KanjiVG
            </a>{' '}
            (CC BY-SA 3.0). Dictionary data in the app from JMdict and KANJIDIC2, property of the{' '}
            <a href="https://www.edrdg.org" className="underline hover:text-ink">
              EDRDG
            </a>
            , used under its licence.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Nekko Labs. Built in Japan, for life in Japan. Product names
            (Duolingo, Anki, Google Translate, Jisho) belong to their owners; comparisons reflect our
            honest reading of publicly available features as of July 2026.
          </p>
        </div>
      </div>
    </footer>
  );
}

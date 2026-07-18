import type { ReactNode } from 'react';
import { useLenis, useReveals } from '../lib/motion';
import { AppEmbed } from '../components/AppEmbed';
import { BrushHeading, type Accent } from '../components/BrushHeading';
import { CompareSection } from '../components/CompareSection';
import { DownloadSection } from '../components/DownloadSection';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { KanjiDemo } from '../components/KanjiDemo';
import { ListsDemo } from '../components/ListsDemo';
import { Nav } from '../components/Nav';
import { PracticeDemo } from '../components/PracticeDemo';
import { Pricing } from '../components/Pricing';
import { TranslateDemo } from '../components/TranslateDemo';

function Section({
  id,
  kicker,
  title,
  accent,
  intro,
  children
}: {
  id?: string;
  kicker: string;
  title: ReactNode;
  accent: Accent;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="reveal mx-auto max-w-5xl scroll-mt-24 px-6 py-16 md:py-24">
      <p className="text-sm font-medium uppercase tracking-widest text-ink-soft">{kicker}</p>
      <BrushHeading accent={accent} className="mt-2">
        {title}
      </BrushHeading>
      {intro && <p className="mt-6 max-w-2xl leading-relaxed text-ink-soft">{intro}</p>}
      <div className="mt-10">{children}</div>
    </section>
  );
}

export function Landing() {
  useLenis();
  useReveals();

  return (
    <>
      <Nav />
      <main>
        <Hero />

        <div id="demos" className="scroll-mt-16" />

        <Section
          kicker="Translate · 翻訳"
          title="The scary letter, defused"
          accent="indigo"
          intro="Snap a photo of any document and get four layers back: the original with furigana, romaji, the literal translation, and the one that matters: what it actually means and what you should do. These are real outputs from our pipeline. Try the work-chat one; most translator apps get it exactly backwards."
        >
          <TranslateDemo />
        </Section>

        <Section
          kicker="Lists · リスト"
          title="Catch words as life throws them"
          accent="matcha"
          intro="No decks to build, no chapters to follow. Hear a word, save it in five seconds, and mynichi fills in the rest. Then spaced repetition keeps it, and for kanji, your hand is part of the review."
        >
          <ListsDemo />
        </Section>

        <Section
          kicker="Dictionary · 辞書"
          title="The kanji you can't type"
          accent="yuzu"
          intro="Draw it, build it from radicals, or search by meaning. This demo runs on the same KanjiVG stroke data as the app. Try drawing 日 yourself: the per-stroke judgment is the real thing."
        >
          <KanjiDemo />
        </Section>

        <Section
          id="privacy"
          kicker="AI Practice · 会話"
          title="The judgment-free room"
          accent="sakura"
          intro="Tomorrow you have to call the dentist. Tonight, rehearse it with an AI character that has infinite patience and no opinions about your accent."
        >
          <PracticeDemo />
        </Section>

        <Section
          kicker="Live · 実物"
          title="Don't take our word for it"
          accent="hanko"
        >
          <AppEmbed />
        </Section>

        <Section
          id="compare"
          kicker="Compare · 比較"
          title="Honest comparisons"
          accent="indigo"
          intro="Every app here is good at what it was built for. None of them were built for the letter in your mailbox. Marks follow the Japanese convention: ○ yes, △ sort of, ✕ no."
        >
          <CompareSection />
        </Section>

        <Section
          id="pricing"
          kicker="Pricing · 料金"
          title="Free where it counts"
          accent="matcha"
          intro="Daily capture is free forever, offline, no account. Premium exists for one honest reason: the best cloud model and sync cost us money."
        >
          <Pricing />
        </Section>

        <section id="download" className="reveal mx-auto max-w-5xl scroll-mt-24 px-6 py-16 md:py-24">
          <DownloadSection />
        </section>
      </main>
      <Footer />
    </>
  );
}

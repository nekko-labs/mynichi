import { FeatureScreen } from '@/components/feature-screen';
import { accents } from '@/theme/tokens';

export default function DictionaryScreen() {
  return (
    <FeatureScreen
      accent={accents.dictionary}
      kanji="辞書"
      reading="じしょ"
      title="Dictionary"
      tagline="Draw the kanji you can't type. Build it from radicals. Untangle the look-alikes."
      chips={['Draw the kanji', 'Radical picker', 'Romaji & English lookup', 'Stroke order', 'Confusables, highlighted']}
    />
  );
}

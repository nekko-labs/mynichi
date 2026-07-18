import { FeatureScreen } from '@/components/feature-screen';
import { accents } from '@/theme/tokens';

export default function ListsScreen() {
  return (
    <FeatureScreen
      accent={accents.lists}
      kanji="単語帳"
      reading="たんごちょう"
      title="Practice lists"
      tagline="Not 2,000 random words. The ones your day handed you, captured in five seconds."
      chips={['Life categories', 'Work / health / real estate', 'Quick capture', 'Auto reading & meaning', 'Spaced repetition']}
    />
  );
}

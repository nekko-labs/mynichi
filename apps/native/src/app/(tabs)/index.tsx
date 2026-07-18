import { FeatureScreen } from '@/components/feature-screen';
import { accents } from '@/theme/tokens';

export default function TranslateScreen() {
  return (
    <FeatureScreen
      accent={accents.translate}
      kanji="翻訳"
      reading="ほんやく"
      title="Translate"
      tagline="Snap the scary letter. See the kanji, furigana, pronunciation, and what it actually means."
      chips={['Photo & camera OCR', 'Furigana + romaji', 'Literal translation', 'Practical translation', 'Save words to lists']}
    />
  );
}

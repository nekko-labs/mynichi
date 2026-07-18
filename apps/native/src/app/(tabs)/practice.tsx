import { FeatureScreen } from '@/components/feature-screen';
import { accents } from '@/theme/tokens';

export default function PracticeScreen() {
  return (
    <FeatureScreen
      accent={accents.practice}
      kanji="会話"
      reading="かいわ"
      title="AI practice"
      tagline="Too embarrassed to practice in front of another person? This is the judgment-free room."
      chips={['Scenario roleplay', 'Voice or text', 'Use your study lists', 'Offline on-device model', 'No-training cloud model']}
    />
  );
}

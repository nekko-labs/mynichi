import { FeatureScreen } from '@/components/feature-screen';
import { palette } from '@/theme/tokens';

export default function SettingsScreen() {
  return (
    <FeatureScreen
      accent={palette.hanko}
      kanji="設定"
      reading="せってい"
      title="Settings"
      tagline="Your app, in your language."
      chips={['English', 'Deutsch', '中文', 'Español', 'Português', 'Français', 'Italiano', 'Tagalog', 'ไทย', '한국어']}
    />
  );
}

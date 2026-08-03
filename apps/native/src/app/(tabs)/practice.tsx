import { Screen } from '@/components/screen';
import { Conversation } from '@/components/practice/conversation';
import { ModeChoice } from '@/components/practice/mode-choice';
import { ScenarioSetup } from '@/components/practice/scenario-setup';
import { usePractice } from '@/state/practice';
import { colors } from '../../theme/tokens.css';

// Practice is three stages on one route: choose where the conversation lives,
// set the scene, then talk. State lives in state/practice; each stage is its
// own component under components/practice.
export default function PracticeScreen() {
  const practice = usePractice();

  return (
    <Screen reading="かいわ" kanji="会話" title="Practice" accent={colors.sakura}>
      {practice.mode === null ? (
        <ModeChoice onChoose={practice.setMode} />
      ) : !practice.session ? (
        <ScenarioSetup practice={practice} />
      ) : (
        <Conversation practice={practice} />
      )}
    </Screen>
  );
}

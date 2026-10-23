import { Text, VStack } from '@expo/ui/swift-ui';
import { font, lineLimit, minimumScaleFactor, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import { dailyWordTimeline, type DailyWord, type PracticeList } from '@mynichi/core';

// Runs in the widget extension's bare JS context: props, environment, and
// literals only. Nothing from module scope reaches this function (see
// pathtraveled's live-trip-activity.tsx for the long version of why).
const DailyWordWidget = (props: DailyWord, env: WidgetEnvironment) => {
  'widget';
  const url = 'mynichi://list/' + props.listId;
  if (env.widgetFamily === 'accessoryInline') {
    return <Text modifiers={[widgetURL(url)]}>{props.text + '  ' + props.reading}</Text>;
  }
  return (
    <VStack alignment="leading" spacing={1} modifiers={[widgetURL(url)]}>
      <Text modifiers={[font({ size: 22, weight: 'bold' }), lineLimit(1), minimumScaleFactor(0.6)]}>
        {props.text}
      </Text>
      <Text modifiers={[font({ size: 12 }), lineLimit(1)]}>{props.reading}</Text>
      <Text modifiers={[font({ size: 12 }), lineLimit(1), minimumScaleFactor(0.8)]}>
        {props.meaning}
      </Text>
    </VStack>
  );
};

const widget = createWidget<DailyWord>('DailyWord', DailyWordWidget);

export function pushDailyWord(lists: PracticeList[]) {
  widget.updateTimeline(dailyWordTimeline(lists, new Date()));
}

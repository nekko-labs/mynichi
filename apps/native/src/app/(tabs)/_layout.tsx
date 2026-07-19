import { Tabs } from 'expo-router';

import { TabBar, TAB_META } from '@/components/tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' }
      }}
    >
      {Object.entries(TAB_META).map(([name, meta]) => (
        <Tabs.Screen key={name} name={name} options={{ title: meta.title }} />
      ))}
    </Tabs>
  );
}

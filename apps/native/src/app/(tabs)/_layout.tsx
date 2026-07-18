import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme, type ColorValue } from 'react-native';

import { accents, fonts, palette } from '@/theme/tokens';

type IconName = keyof typeof Ionicons.glyphMap;

function icon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color as string} size={size} />
  );
}

export default function TabsLayout() {
  const dark = useColorScheme() === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: dark ? palette.inkSoftOnDark : palette.inkSoft,
        tabBarStyle: {
          backgroundColor: dark ? palette.paperDark : palette.paper,
          borderTopWidth: 0,
          elevation: 0
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 11
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Translate',
          tabBarActiveTintColor: accents.translate,
          tabBarIcon: icon('camera-outline')
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Lists',
          tabBarActiveTintColor: accents.lists,
          tabBarIcon: icon('albums-outline')
        }}
      />
      <Tabs.Screen
        name="dictionary"
        options={{
          title: 'Dictionary',
          tabBarActiveTintColor: accents.dictionary,
          tabBarIcon: icon('book-outline')
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarActiveTintColor: accents.practice,
          tabBarIcon: icon('chatbubbles-outline')
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarActiveTintColor: palette.hanko,
          tabBarIcon: icon('settings-outline')
        }}
      />
    </Tabs>
  );
}

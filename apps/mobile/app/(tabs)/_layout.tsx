import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { COLORS } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#141c30',
          borderTopColor: 'rgba(255,255,255,.1)',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: 'rgba(255,255,255,.4)',
      }}
    >
      <Tabs.Screen name="index" options={{ title: '首页' }} />
      <Tabs.Screen name="stats" options={{ title: '统计' }} />
      <Tabs.Screen name="retreats" options={{ title: '共修' }} />
      <Tabs.Screen name="friends" options={{ title: '善友' }} />
    </Tabs>
  );
}

import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';

import { TabBar } from '@/shared/ui/TabBar';

function renderTabBar(props: BottomTabBarProps) {
  return <TabBar {...props} />;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  initialRouteName: 'trips',
};

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      <Tabs.Screen name="trips" options={{ title: '여행방' }} />
      <Tabs.Screen name="fx/index" options={{ title: '환율 관리' }} />
      <Tabs.Screen name="my/index" options={{ title: '마이' }} />
      <Tabs.Screen name="settings/index" options={{ title: '설정' }} />
    </Tabs>
  );
}

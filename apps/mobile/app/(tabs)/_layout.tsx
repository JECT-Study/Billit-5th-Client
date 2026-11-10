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
      <Tabs.Screen name="trips" options={{ title: '여행 관리' }} />
      <Tabs.Screen name="quick-entry" options={{ title: '빠른 입력' }} />
      <Tabs.Screen name="settlements" options={{ title: '정산 내역' }} />
      <Tabs.Screen
        name="my"
        options={{ title: '마이', popToTopOnBlur: true }}
      />
    </Tabs>
  );
}

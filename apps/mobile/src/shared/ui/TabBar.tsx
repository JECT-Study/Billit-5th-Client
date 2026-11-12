import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MyTabIcon from '@/assets/images/tabIcons/my.svg';
import QuickEntryTabIcon from '@/assets/images/tabIcons/quick-entry.svg';
import SettlementsTabIcon from '@/assets/images/tabIcons/settlements.svg';
import TripsTabIcon from '@/assets/images/tabIcons/trips.svg';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

const DISABLED_TAB_ROUTES = ['quick-entry'] as const;

const TAB_ITEMS = {
  trips: {
    label: '여행 관리',
    Icon: TripsTabIcon,
  },
  'quick-entry': {
    label: '빠른 입력',
    Icon: QuickEntryTabIcon,
  },
  settlements: {
    label: '정산 내역',
    Icon: SettlementsTabIcon,
  },
  my: {
    label: '마이',
    Icon: MyTabIcon,
  },
} as const;

type TabRouteName = keyof typeof TAB_ITEMS;

function isTabRouteName(name: string): name is TabRouteName {
  return Object.prototype.hasOwnProperty.call(TAB_ITEMS, name);
}

function isDisabledTabRoute(name: TabRouteName) {
  return (DISABLED_TAB_ROUTES as readonly string[]).includes(name);
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      className="bg-surface-default w-full flex-row items-center pt-8"
      style={{ paddingBottom: Math.max(safeAreaInsets.bottom, 20) }}
    >
      {state.routes.map((route, index) => {
        if (!isTabRouteName(route.name)) {
          return null;
        }

        const isDisabled = isDisabledTabRoute(route.name);
        const isSelected = !isDisabled && state.index === index;
        const tabItem = TAB_ITEMS[route.name];
        const TabIcon = tabItem.Icon;

        function handlePressTab() {
          if (isDisabled) {
            return;
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (isSelected || event.defaultPrevented) {
            return;
          }

          navigation.navigate(route.name, route.params);
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={
              isDisabled ? { disabled: true } : { selected: isSelected }
            }
            accessibilityLabel={tabItem.label}
            onPress={handlePressTab}
            className="min-w-0 flex-1 items-center justify-center gap-10 p-8"
          >
            <TabIcon
              width={24}
              height={24}
              color={
                isSelected ? COLORS['icon-default'] : COLORS['icon-inactive']
              }
              accessible={false}
            />
            <Text
              numberOfLines={1}
              className={`text-label-1 text-center font-semibold ${
                isSelected ? 'text-primary' : 'text-placeholder'
              }`}
            >
              {tabItem.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

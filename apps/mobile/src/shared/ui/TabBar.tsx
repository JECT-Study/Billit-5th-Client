import type { BottomTabBarProps } from 'expo-router/tabs';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DISABLED_TAB_ROUTES = ['quick-entry'] as const;

const TAB_ITEMS = {
  trips: {
    label: '여행 관리',
    icon: require('@/assets/images/tabIcons/trips.svg'),
  },
  'quick-entry': {
    label: '빠른 입력',
    icon: require('@/assets/images/tabIcons/quick-entry.svg'),
  },
  settlements: {
    label: '정산 내역',
    icon: require('@/assets/images/tabIcons/settlements.svg'),
  },
  my: {
    label: '마이',
    icon: require('@/assets/images/tabIcons/my.svg'),
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
      className="bg-canvas w-full flex-row items-center pt-2"
      style={{ paddingBottom: Math.max(safeAreaInsets.bottom, 20) }}
    >
      {state.routes.map((route, index) => {
        if (!isTabRouteName(route.name)) {
          return null;
        }

        const isDisabled = isDisabledTabRoute(route.name);
        const isSelected = !isDisabled && state.index === index;
        const tabItem = TAB_ITEMS[route.name];

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
            className="min-w-0 flex-1 items-center justify-center gap-2.5 p-2"
          >
            <Image
              source={tabItem.icon}
              className={`h-6 w-6 ${
                isSelected ? 'text-gray-008' : 'text-gray-004'
              }`}
              contentFit="contain"
              accessible={false}
            />
            <Text
              numberOfLines={1}
              className={`text-center text-sm font-semibold tracking-[0.203px] ${
                isSelected ? 'text-gray-008' : 'text-gray-004'
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

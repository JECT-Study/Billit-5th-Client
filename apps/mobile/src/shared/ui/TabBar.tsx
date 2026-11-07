import type { BottomTabBarProps } from 'expo-router/tabs';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GRAY_004, GRAY_008, SCREEN_BACKGROUND_COLOR } from './colors';

const TAB_ICON_SIZE = 24;

const TAB_ITEMS = {
  trips: {
    label: '여행방',
    icon: require('@/assets/images/tabIcons/trips.svg'),
  },
  'fx/index': {
    label: '환율 관리',
    icon: require('@/assets/images/tabIcons/fx.svg'),
  },
  'my/index': {
    label: '마이',
    icon: require('@/assets/images/tabIcons/my.svg'),
  },
  'settings/index': {
    label: '설정',
    icon: require('@/assets/images/tabIcons/settings.svg'),
  },
} as const;

type TabRouteName = keyof typeof TAB_ITEMS;

function isTabRouteName(name: string): name is TabRouteName {
  return Object.prototype.hasOwnProperty.call(TAB_ITEMS, name);
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: SCREEN_BACKGROUND_COLOR,
        paddingBottom: Math.max(safeAreaInsets.bottom, 20),
      }}
    >
      {state.routes.map((route, index) => {
        if (!isTabRouteName(route.name)) {
          return null;
        }

        const isSelected = state.index === index;
        const color = isSelected ? GRAY_008 : GRAY_004;
        const tabItem = TAB_ITEMS[route.name];

        function handlePressTab() {
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
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={tabItem.label}
            onPress={handlePressTab}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
              gap: 4,
            }}
          >
            <Image
              source={tabItem.icon}
              style={{ width: TAB_ICON_SIZE, height: TAB_ICON_SIZE }}
              tintColor={color}
              contentFit="contain"
              accessible={false}
            />
            <Text
              numberOfLines={1}
              style={{
                color,
                fontSize: 12,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              {tabItem.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

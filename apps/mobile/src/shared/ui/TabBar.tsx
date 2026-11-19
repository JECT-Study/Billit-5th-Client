import type { BottomTabBarProps } from 'expo-router/tabs';
import type { FC } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import MyTabIcon from '@/assets/images/tabIcons/my.svg';
import QuickEntryTabIcon from '@/assets/images/tabIcons/quick-entry.svg';
import TripsTabIcon from '@/assets/images/tabIcons/trips.svg';
import { ReceiptFillIcon, ReceiptIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

const DISABLED_TAB_ROUTES = ['quick-entry'] as const;

type TabGlyphProps = {
  color: string;
  selected: boolean;
};

function svgGlyph(
  Icon: FC<SvgProps>,
  width: number,
  height: number,
): FC<TabGlyphProps> {
  function TabGlyph({ color }: TabGlyphProps) {
    return (
      <Icon width={width} height={height} color={color} accessible={false} />
    );
  }

  return TabGlyph;
}

function SettlementGlyph({ color, selected }: TabGlyphProps) {
  const Icon = selected ? ReceiptFillIcon : ReceiptIcon;

  return <Icon size={24} color={color} accessible={false} />;
}

const TAB_ITEMS = {
  trips: {
    label: '여행 관리',
    Icon: svgGlyph(TripsTabIcon, 24, 24),
  },
  'quick-entry': {
    label: '빠른 입력',
    Icon: svgGlyph(QuickEntryTabIcon, 20, 17),
  },
  settlements: {
    label: '정산 내역',
    Icon: SettlementGlyph,
  },
  my: {
    label: '마이',
    Icon: svgGlyph(MyTabIcon, 22.6, 22.6),
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
      className="bg-surface-default w-full flex-row items-center justify-center gap-12 px-24 pt-8"
      style={{ paddingBottom: Math.max(safeAreaInsets.bottom, 24) }}
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
            className="w-[73px] shrink-0 items-center justify-center gap-10 p-8"
          >
            <View className="h-24 w-24 items-center justify-center">
              <TabIcon
                color={
                  isSelected ? COLORS['icon-default'] : COLORS['icon-inactive']
                }
                selected={isSelected}
              />
            </View>
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

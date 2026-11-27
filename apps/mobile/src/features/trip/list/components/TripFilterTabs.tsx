import { Pressable, View } from 'react-native';

import {
  TRIP_FILTER_OPTIONS,
  type TripFilterOption,
} from '@/features/trip/list/tripListDisplay';
import type { TripListFilter } from '@/features/trip/list/tripListSchema';
import { Text } from '@/shared/ui/Text';

type TripFilterTabsProps = {
  value: TripListFilter | undefined;
  onChange: (filter: TripListFilter | undefined) => void;
};

// 전체 여행방 / 초대중 / 예정 / 종료
export function TripFilterTabs({ value, onChange }: TripFilterTabsProps) {
  function handlePress(option: TripFilterOption) {
    onChange(option.filter);
  }

  return (
    <View className="bg-gray-1 rounded-12 flex-row items-center justify-center gap-6 px-4 py-6">
      {TRIP_FILTER_OPTIONS.map((option) => {
        const isSelected = option.filter === value;
        return (
          <Pressable
            key={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => handlePress(option)}
            className={`w-[72px] items-center justify-center py-6 ${
              isSelected ? 'rounded-8 bg-white' : 'rounded-6'
            }`}
          >
            <Text
              className={`text-caption-1 font-semibold ${
                isSelected ? 'text-primary' : 'text-gray-7'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

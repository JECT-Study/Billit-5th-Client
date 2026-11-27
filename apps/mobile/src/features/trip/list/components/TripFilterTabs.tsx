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

// Figma: Segment (3658:47695)
// 시안은 틀 너비 326에 항목 72 고정. 기기 너비가 달라도 양 끝 여백이 같도록 항목이 너비를 나눠 갖는다.
// 전체 여행방 / 초대중 / 예정 / 종료
export function TripFilterTabs({ value, onChange }: TripFilterTabsProps) {
  function handlePress(option: TripFilterOption) {
    onChange(option.filter);
  }

  return (
    // 양 끝 여백 10 = 시안의 틀 여백 4 + 가운데 정렬로 남는 6
    <View className="bg-gray-1 rounded-12 flex-row items-center gap-6 px-10 py-6">
      {TRIP_FILTER_OPTIONS.map((option) => {
        const isSelected = option.filter === value;
        return (
          <Pressable
            key={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => handlePress(option)}
            className={`flex-1 items-center justify-center py-6 ${
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

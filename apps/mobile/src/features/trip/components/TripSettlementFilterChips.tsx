import { Pressable, View } from 'react-native';

import {
  TRIP_SETTLEMENT_FILTER_OPTIONS,
  type TripSettlementStatus,
} from '@/features/trip/tripSettlementFilter';
import { Text } from '@/shared/ui/Text';

type TripSettlementFilterChipsProps = {
  value: TripSettlementStatus | undefined;
  onChange: (status: TripSettlementStatus | undefined) => void;
};

export function TripSettlementFilterChips({
  value,
  onChange,
}: TripSettlementFilterChipsProps) {
  return (
    <View className="flex-row gap-6">
      {TRIP_SETTLEMENT_FILTER_OPTIONS.map((option) => {
        const isSelected = option.status === value;

        function handlePress() {
          onChange(option.status);
        }

        return (
          <Pressable
            key={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={handlePress}
            className={`rounded-60 px-10 py-6 ${isSelected ? 'bg-gray-8' : 'bg-gray-1'}`}
          >
            <Text
              className={`text-label-1 font-semibold ${isSelected ? 'text-white' : 'text-gray-6'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
